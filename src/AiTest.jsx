import React, { useEffect, useRef, useState } from 'react';
import apiClient from "@/services/apiClient.js";

const AiRealtimeTest = () => {
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const dataChannelRef = useRef(null);
    const audioTagRef = useRef(null);

    const [connected, setConnected] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);

    const [scenarioId] = useState(1);

    const initRealtimeConnection = async () => {
        setLoading(true);
        try {
            const sessionResponse = await apiClient.post('/sessions', { scenarioId, userId: 1 });
            const newSessionId = sessionResponse.data.data.sessionId;
            setSessionId(newSessionId);

            const ephemeralResponse = await apiClient.post('/realtime/session', {
                sessionId: newSessionId,
                model: "gpt-4o-realtime-preview-2024-10-01",
                voice: "alloy",
                sttModel: "whisper-1"
            });
            if (!ephemeralResponse.data.success) throw new Error(ephemeralResponse.data.message || "Ephemeral Key 발급 실패");
            const ephemeralKey = ephemeralResponse.data.data.client_secret.value;

            pcRef.current = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

            // DataChannel 하나로 통합
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
                        setTranscripts(prev => [...prev, { speaker: 'ai', text: data.transcript, timestamp: new Date().toISOString() }]);
                    }
                    if (data.type === 'conversation.item.input_audio_transcription.completed') {
                        setTranscripts(prev => [...prev, { speaker: 'user', text: data.transcript, timestamp: new Date().toISOString() }]);
                    }
                } catch (err) {
                    console.error("이벤트 파싱 실패:", err);
                }
            };
            dataChannelRef.current.onerror = (err) => console.error("DataChannel 에러:", err);
            dataChannelRef.current.onclose = () => console.log("DataChannel 닫힘");

            const localStream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 24000, channelCount: 1 }
            });
            localStreamRef.current = localStream;
            localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

            pcRef.current.ontrack = (event) => {
                if (!event.streams || event.streams.length === 0) return;
                const remoteStream = event.streams[0];
                if (remoteStream.getAudioTracks().length === 0) return;
                if (audioTagRef.current) {
                    audioTagRef.current.srcObject = remoteStream;
                    audioTagRef.current.play().catch(err => console.error(err));
                }
            };

            pcRef.current.oniceconnectionstatechange = () => console.log("ICE 상태:", pcRef.current.iceConnectionState);
            pcRef.current.onconnectionstatechange = () => {
                console.log("연결 상태:", pcRef.current.connectionState);
                if (pcRef.current.connectionState === 'connected') setConnected(true);
                if (pcRef.current.connectionState === 'disconnected' || pcRef.current.connectionState === 'failed') handleEndSession();
            };

            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);

            const sdpResponse = await fetch(`https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${ephemeralKey}`, "Content-Type": "application/sdp" },
                body: offer.sdp
            });
            if (!sdpResponse.ok) throw new Error(`GPT SDP 교환 실패 (${sdpResponse.status})`);
            const answerSdp = await sdpResponse.text();
            await pcRef.current.setRemoteDescription({ type: "answer", sdp: answerSdp });

        } catch (err) {
            console.error("Realtime 연결 실패:", err);
            alert(`연결 실패: ${err.message}`);
            cleanupConnection();
        } finally {
            setLoading(false);
        }
    };

    const handleUserToggle = () => {
        if (!connected || aiSpeaking) return;
        if (!userSpeaking) {
            setUserSpeaking(true);
            console.log("사용자 발화 시작");
        } else {
            setUserSpeaking(false);
            console.log("사용자 발화 종료");
            if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
                dataChannelRef.current.send(JSON.stringify({ type: "input_audio_buffer.commit" }));

                // 이 부분을 추가하여 AI에게 응답을 생성하라고 요청
                dataChannelRef.current.send(JSON.stringify({ type: "response.create" }));
            }
        }
    };

    const handleEndSession = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if (!sessionId) { cleanupConnection(); return; }
            await apiClient.post(`${sessionId}/complete`, { sessionId });
            cleanupConnection();
            alert("대화가 저장되었습니다!");
        } catch (err) {
            console.error("세션 종료 실패:", err);
            cleanupConnection();
            alert(`세션 종료 중 오류 발생: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const cleanupConnection = () => {
        if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
        if (dataChannelRef.current) { dataChannelRef.current.close(); dataChannelRef.current = null; }
        if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(track => track.stop()); localStreamRef.current = null; }
        setConnected(false); setSessionId(null); setTranscripts([]); setAiSpeaking(false); setUserSpeaking(false);
    };

    useEffect(() => () => cleanupConnection(), []);
    useEffect(() => { if (connected) console.log("연결 완료!"); }, [connected]);

    return (
        <div style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
            <h2>GPT Realtime 테스트</h2>

            <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
                <button onClick={initRealtimeConnection} disabled={connected || loading}>
                    {loading ? '연결 중...' : (connected ? '연결됨' : '연결 시작')}
                </button>
                <button onClick={handleEndSession} disabled={!connected || loading || aiSpeaking}>
                    대화 종료
                </button>
            </div>

            <div style={{ marginBottom: 20 }}>
                <button
                    onClick={handleUserToggle}
                    disabled={aiSpeaking || !connected}
                    style={{ padding: '10px 20px', background: aiSpeaking ? '#ccc' : '#4caf50', color: '#fff', border: 'none', cursor: aiSpeaking || !connected ? 'not-allowed' : 'pointer' }}
                >
                    {userSpeaking ? '말하는 중...' : '말하기'}
                </button>
            </div>

            <div>
                <h3>대화 내역 ({transcripts.length})</h3>
                <div style={{ minHeight: 200, maxHeight: 400, overflowY: 'auto', border: '1px solid #ddd', padding: 10 }}>
                    {transcripts.map((t,i)=>(
                        <div key={i} style={{ marginBottom: 10 }}>
                            <strong>{t.speaker==='user'?'사용자':'AI'}:</strong> {t.text}
                        </div>
                    ))}
                </div>
            </div>

            <audio ref={audioTagRef} autoPlay playsInline></audio>
        </div>
    );
};

export default AiRealtimeTest;
