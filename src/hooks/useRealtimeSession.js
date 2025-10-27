import {useCallback, useEffect, useRef, useState} from "react";
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

    // 오디오 관련
    const audioContextRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);

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
            const sessionResponse = await apiClient.post('/sessions', {scenarioId, userId});
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
            initWebSocket(newSessionId, false);

            // 4. webRtc 연결
            await initWebRtc(ephemeralKey, newSessionId);

        } catch (err) {
            console.error("Realtime 연결 실패:", err);
            // 연결 정리
            cleanupConnection();

        } finally {
            setLoading(false);
        }

    }

    /**
     * webSocket 연결 초기화
     */
    const initWebSocket = useCallback((sessionId, isReconnection = false) => {
        if(wsRef.current?.readyState === WebSocket.OPEN) {
            console.log("webSocket 이미 연결 됨");
            return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:9090/ws/transcript/${sessionId}`;

        console.log('webSocket 연결 시도: ', wsUrl);
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log("webSocket 연결 성공");
            setWsConnected(true);
            // 재시도 횟수
            reconnectAttemptsRef.current = 0;

            // 재연결
            if(isReconnection) {
                console.log("재연결 시도 - 대화 내역 복구 요청");
                wsRef.current.send(JSON.stringify({
                    type: "SESSION_RECONNECT",
                    sessionId: sessionId,
                    timestamp: new Date().toISOString()
                }));
                setReconnecting(false);
            } else {
                // 신규 연결 시 세션 초기화
                wsRef.current.send(JSON.stringify({
                    type: "SESSION_INIT",
                    sessionId: sessionId,
                    scenarioId: scenarioId,
                    timestamp: new Date().toISOString()
                }));
            }
        };

        wsRef.current.onmessage = (e) => {
            try {
                const message = JSON.parse(e.data);
                handleWebSocketMessage(message);
            } catch (err) {
                console.log("webSocket 메세지 파싱 실패: ", err);
            }
        };

        wsRef.current.onerror = (err) => {
            console.error("webSocket 에러:", err);
        }

        wsRef.current.onclose = (e) => {
            console.log("webSocket 종료: ", e.code, e.reason);
            setWsConnected(false);

            // 정상 종료(1000)가 아니면서 재연결 시도 횟수가 5회 미만이면 재연결 시도
            if(e.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                attemptReconnect(sessionId);
            }
        };

    }, [scenarioId]);

    /**
     * webSocket 메세지 처리
     */
    const handleWebSocketMessage = useCallback((message) => {

        console.log("webSocket 메세지 수신: ", message.type);
        switch (message.type) {
            case 'SESSION_RECOVERY':
                handleSessionRecovery(message);
                break;

            // 백엔드 저장 확인 메세지
            case 'user.transcript':
                console.log("사용자 발화 저장 완료: ", message.text);
                break;

            case 'ai.transcript':
                console.log("AI 발화 저장 완료: ", message.text);
                break;

            case 'ERROR':
                console.log('webSocket 에러 발생: ', message.message);
                break;

            default:
                console.log('알 수 없는 메세지 타입: ', message.type);

        }

    }, []);

    /**
     * 세션 재연결 및 대화 내역 복구
     */
    const handleSessionRecovery = useCallback((message) => {

        console.log("세션 복구 메세지: ", message);

        if(!message.success) {
            console.log("세션 복구 실패: ", message.errorMessage);
            return;
        }

        // 대화 내역 복원
        if(message.transcripts && message.transcripts.length > 0) {
            const recovered = message.transcripts.map(item => ({
                speaker: item.speaker.toLowerCase(),
                text: item.text,
                timestamp: item.timestamp
            }));

            setTranscripts(recovered);
            console.log(`대화 내역 복구 완료: ${recovered.length} 개 메세지`);
        } else {
            console.log("복구할 대화 내역 없음");
        }

    }, []);

    /**
     * webSocket 재연결 시도
     */
    const attemptReconnect = useCallback((sessionId) => {

        reconnectAttemptsRef.current++;
        const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current - 1);

        console.log(`재연결 시도 ${reconnectAttemptsRef.current} / ${MAX_RECONNECT_ATTEMPTS} (${delay}ms 후)`);
        setReconnecting(true);

        reconnectTimeoutRef.current = setTimeout(() => {
            initWebSocket(sessionId, true);
        }, delay);

    }, [initWebSocket]);

    /**
     * 백엔드로 대화 내용 전송
     */
    const sendTranscript = useCallback((speaker, text) => {

        if(!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.log("webSocket 연결 안됨 - 대화 내용 전송 실패");
            return;
        }

        wsRef.current.send(JSON.stringify({
            type: "TRANSCRIPT",
            speaker: speaker.toUpperCase(), // USER 또는 AI
            text: text,
            timestamp: new Date().toISOString()
        }));

        console.log(`대화 내용 전송: ${speaker} - ${text.substring(0, 50)}...`);

    }, []);

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
                if (data.type === "response.audio.done") {
                    console.log("GPT 오디오 스트림 완료");
                    setTimeout(() => {
                        setAiSpeaking(false);
                        console.log("AI 발화 종료");
                    }, 500);
                }
                if (data.type === "response.audio_transcript.done") {
                    const transcript = {
                        speaker: 'ai',
                        text: data.transcript,
                        timestamp: new Date().toISOString()
                    }
                    setTranscripts(prev => [...prev, transcript]);

                    // webSocket 으로 실시간 전송
                    sendTranscript('ai', data.transcript);
                }
                if (data.type === 'conversation.item.input_audio_transcription.completed') {
                    const transcripts = {
                        speaker: 'user',
                        text: data.transcript,
                        timestamp: new Date().toISOString()
                    }
                    setTranscripts(prev => [...prev, transcripts]);

                    // webSocket 으로 실시간 전송
                    sendTranscript('user', data.transcript);
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
                channelCount: 1,

                googEchoCancellation: true,
                googNoiseSuppression: true,
                googAutoGainControl: true,
                googHighpassFilter: true
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

                // 오디오 끝까지 재생 보장
                audioTagRef.current.onended = () => {
                    console.log("오디오 재생 완료");
                };

                audioTagRef.current.onpause = () => {
                    console.log(" 오디오 일시정지됨");
                };

                audioTagRef.current.onerror = (err) => {
                    console.error("오디오 재생 에러:", err);
                };

                // autoplay 명시적 설정
                audioTagRef.current.autoplay = true;
                audioTagRef.current.play()
                    .then(() => console.log("오디오 재생 시작"))
                    .catch(err => console.error("재생 실패:", err));
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
    };

    /**
     * 사용자 발화 토글
     */
    const handleUserToggle = useCallback(() => {

        if(!connected || aiSpeaking) return;

        if(!userSpeaking) {
            setUserSpeaking(true);
            console.log("사용자 발화 시작");
        } else {
            setUserSpeaking(false);
            console.log("사용자 발화 종료");

            if(dataChannelRef.current?.readyState === "open") {
                dataChannelRef.current.send(JSON.stringify({
                    type: "input_audio_buffer.commit"
                }));
                dataChannelRef.current.send(JSON.stringify({
                    type: "response.create",
                    response: {
                        modalities: ["audio", "text"]
                    }
                }));
            }
        }

    }, [connected, aiSpeaking, userSpeaking]);


    /**
     * 세션 종료
     */
    const handleEndSession = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if (!sessionId) { cleanupConnection(); return; }
            await apiClient.put(`sessions/${sessionId}/complete`, {sessionId});
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

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => cleanupConnection();
    }, [cleanupConnection]);

    return {
        // 상태
        connected,
        wsConnected,
        sessionId,
        transcripts,
        loading,
        aiSpeaking,
        userSpeaking,
        reconnecting,

        // 함수
        initRealtimeConnection,
        handleUserToggle,
        handleEndSession,

        // Refs (audio 태그용)
        audioTagRef
    };
}