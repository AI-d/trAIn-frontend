import {useCallback, useRef, useState} from "react";
import axios from "axios";
import apiClient from "@/services/apiClient.js";

/**
 * GPT Realtime + WebSocket 통합 Hook
 *
 * 역할:
 * 1. WebRTC P2P로 GPT와 음성 통신
 * 2. WebSocket으로 백엔드에 대화 내역 실시간 전송
 * 3. 재연결 시 대화 내역 복구
 *
 * @param {number} scenarioId - 시나리오 ID
 * @param {number} userId - 사용자 ID
 * @returns {Object} 세션 상태 및 제어 함수
 *
 */
export const useRealtimeSession = (scenarioId, userId) => {

    // webRtc 관련
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const dataChannelRef = useRef(null);
    const audioTagRef = useRef(null);

    // webSocket 관련
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);

    // 상태 관리
    const [connected, setConnected] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);

    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 2000;

    /**
     * WebRTC + WebSocket 통합 연결
     */
    const initRealtimeConnection = async () => {
        setLoading(true);
        try {

            // 1. 백엔드에 세션 생성 요청
            const sessionResponse = await apiClient.post('/sessions', { scenarioId, userId: 1 });
            const newSessionId = sessionResponse.data.data.sessionId;
            setSessionId(newSessionId);

            // 2. gpt-realtime webRtc 연결 임시 키 발급
            const ephemeralResponse = await apiClient.post('/realtime/session', {
                sessionId: newSessionId,
                model: "gpt-4o-realtime-preview-2024-10-01",
                voice: "alloy",
                sttModel: "whisper-1"
            });
            if (!ephemeralResponse.data.success) throw new Error(ephemeralResponse.data.message || "Ephemeral Key 발급 실패");
            const ephemeralKey = ephemeralResponse.data.data.client_secret.value;
            console.log('Ephemeral Key 발급 완료');

            // 3. webSocket 연결
            // 4. webRtc 연결
            await initWebRtc(ephemeralKey, newSessionId);

        } catch (err) {
            console.error("Realtime 연결 실패:", err);
            // 연결 정리
        } finally {
            setLoading(false);
        }


    }

    /**
     * webSocket 연결 초기화
     */
    const initWebSocket = () => {

    }

    /**
     * webRtc 연결 초기화
     */
    const initWebRtc = async (ephemeralKey, sessionId) => {

        // 1. peerConnection 설정
        pcRef.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

        // 2. DataChannel 설정
        dataChannelRef.current = pcRef.current.createDataChannel('oai-events');
        dataChannelRef.current.onopen = () => {
            console.log("Data Channel 열림");
            dataChannelRef.current.send(JSON.stringify({ type: "response.create", response: { modalities: ["audio","text"] } }));
        };

        dataChannelRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "response.audio_buffer.started") setAiSpeaking(true);
                if (data.type === "response.audio.done") setAiSpeaking(false);
                if (data.type === "response.audio_transcript.done") {
                    const transcript = {
                        speaker: 'ai',
                        text: data.transcript,
                        timestamp: new Date().toISOString()
                    }
                    setTranscripts(prev => [...prev, transcript]);

                    // webSocket 으로 실시간 전송
                }
                if (data.type === 'conversation.item.input_audio_transcription.completed') {
                    const transcripts = {
                        speaker: 'user',
                        text: data.transcript,
                        timestamp: new Date().toISOString()
                    }
                    setTranscripts(prev => [...prev, transcripts]);

                    // webSocket 으로 실시간 전송
                }
            } catch (err) {
                console.error("이벤트 파싱 실패:", err);
            }
        };
        dataChannelRef.current.onerror = (err) => console.error("DataChannel 에러:", err);
        dataChannelRef.current.onclose = () => console.log("DataChannel 닫힘");

        // 3. 마이크 스트림 설정
        const localStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 24000,
                channelCount: 1
            }
        });
        localStreamRef.current = localStream;
        localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

        // 4. 원격 오디오 스트림 설정
        pcRef.current.ontrack = (event) => {
            if (!event.streams || event.streams.length === 0) return;
            const remoteStream = event.streams[0];
            if (remoteStream.getAudioTracks().length === 0) return;
            if (audioTagRef.current) {
                audioTagRef.current.srcObject = remoteStream;
                audioTagRef.current.play().catch(err => console.error(err));
            }
        };

        // 5. 연결 상태 모니터링
        pcRef.current.oniceconnectionstatechange = () => console.log("ICE 상태:", pcRef.current.iceConnectionState);
        pcRef.current.onconnectionstatechange = () => {
            console.log("연결 상태:", pcRef.current.connectionState);
            if (pcRef.current.connectionState === 'connected') setConnected(true);
            if (pcRef.current.connectionState === 'disconnected' || pcRef.current.connectionState === 'failed') {
                handleEndSession();
            }
        };

        // 6. sdp offer/answer
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ephemeralKey}`,
                "Content-Type": "application/sdp"
            },
            body: offer.sdp
        });
        if (!sdpResponse.ok) throw new Error(`GPT SDP 교환 실패 (${sdpResponse.status})`);
        const answerSdp = await sdpResponse.text();
        await pcRef.current.setRemoteDescription({ type: "answer", sdp: answerSdp });
        console.log("WebRtc 연결됨");
    }

    /**
     * 세션 종료
     */
    const handleEndSession = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if (!sessionId) { cleanupConnection(); return; }
            await apiClient.post(`${sessionId}/complete`, {sessionId});
            cleanupConnection();
            alert("대화가 종료되었습니다!");
        } catch (err) {
            console.error("세션 종료 실패:", err);
            alert(`세션 종료 중 오류 발생: ${err.message}`);
        } finally {
            cleanupConnection();
            setLoading(false);
        }
    };

    /**
     * 연결 정리
     */
    const cleanupConnection = useCallback(() => {
        // WebRTC 정리
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        if (dataChannelRef.current) {
            dataChannelRef.current.close();
            dataChannelRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        // WebSocket 정리
        if (wsRef.current) {
            wsRef.current.close(1000, 'normal_closure');
            wsRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // 상태 초기화
        setConnected(false);
        setWsConnected(false);
        setSessionId(null);
        setTranscripts([]);
        setAiSpeaking(false);
        setUserSpeaking(false);
        setReconnecting(false);
        reconnectAttemptsRef.current = 0;
    }, []);
}