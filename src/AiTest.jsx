import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";

const AiTest = () => {
    const MAX_QUEUE_SIZE = 50;

    const pcRef = useRef(null);
    const wsRef = useRef(null);      // 시그널링 WS
    const audioWs = useRef(null);    // 오디오 WS
    const localStreamRef = useRef(null); // localStream 저장용
    const audioCtxRef = useRef(null);    // AudioContext
    const [connected, setConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isAiResponding, setIsAiResponding] = useState(false);

    const isSpeakingRef = useRef(false);
    const gptAudioQueue = useRef([]);
    const isPlayingRef = useRef(false);

    // gpt 대화 로그 상태 추가
    const [gptMessages, setGptMessages] = useState([]);

    const initConnection = async () => {
        const scenarioId = 1;
        const userId = 1;

        try {
            console.log("세션 생성 요청 중...");
            const response = await axios.post("http://localhost:9090/api/sessions", {
                userId,
                scenarioId
            });

            const sessionId = response.data.data.sessionId;
            console.log("세션 아이디 생성 완료: ", sessionId);

            // ---------------------------
            // 1. 오디오 WS 연결
            // ---------------------------
            audioWs.current = new WebSocket(`ws://localhost:9090/ws/audio/${sessionId}`);
            audioWs.current.binaryType = "arraybuffer";

            audioWs.current.onopen = () => {
                console.log("오디오 WS 연결됨");

                audioWs.current.send(JSON.stringify({
                    type: "SESSION_INIT",
                    scenarioId
                }));
            };

            audioWs.current.onmessage = (event) => {
                if (!(event.data instanceof ArrayBuffer)) return;

                if(gptAudioQueue.current.length >= MAX_QUEUE_SIZE) {
                    console.log("오디오 큐 한계 도달, 오래된 데이터 제거");
                    gptAudioQueue.current.shift();
                }

                // 큐에 저장
                gptAudioQueue.current.push(event.data);

                // 화면용 메시지 추가 (간단히 "GPT 음성 수신" 표시)
                setGptMessages(prev => [...prev, `GPT 음성 ${event.data.byteLength} bytes 수신`]);

                playQueue();
            };

            audioWs.current.onerror = (err) => console.error("오디오 WS 에러:", err);
            audioWs.current.onclose = () => console.log("오디오 WS 종료");

            // ---------------------------
            // 2. 시그널링 WS 연결
            // ---------------------------
            wsRef.current = new WebSocket(`ws://localhost:9090/ws/signaling/${sessionId}`);

            wsRef.current.onopen = async () => {
                console.log("시그널링 WS 연결됨");
                setConnected(true);

                // ---------------------------
                // 3. RTCPeerConnection 생성
                // ---------------------------
                pcRef.current = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                });

                // 내 오디오 가져오기
                console.log("마이크 접근 요청...");
                const localStream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000 },
                    video: false
                });
                console.log("마이크 접근 성공");
                localStreamRef.current = localStream;
                localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

                pcRef.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        wsRef.current.send(JSON.stringify({ type: "ICE_CANDIDATE", candidate: event.candidate }));
                    }
                };

                const offer = await pcRef.current.createOffer();
                await pcRef.current.setLocalDescription(offer);
                wsRef.current.send(JSON.stringify({ type: "OFFER", sdp: offer.sdp }));

                // ---------------------------
                // 4. AudioWorklet 설정
                // ---------------------------
                const audioCtx = new AudioContext({ sampleRate: 16000 });
                audioCtxRef.current = audioCtx;
                const source = audioCtx.createMediaStreamSource(localStream);

                try {
                    await audioCtx.audioWorklet.addModule('/audio-processor.js');
                    const workletNode = new AudioWorkletNode(audioCtx, 'audio-processor');

                    workletNode.port.onmessage = (event) => {
                        if (!isSpeakingRef.current) return;

                        const float32Array = new Float32Array(event.data);
                        const int16Array = new Int16Array(float32Array.length);

                        for (let i = 0; i < float32Array.length; i++) {
                            int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 32767;
                        }

                        if (audioWs.current && audioWs.current.readyState === WebSocket.OPEN) {
                            audioWs.current.send(int16Array.buffer);
                        }
                    };

                    source.connect(workletNode);
                    console.log("AudioWorklet 연결 완료");
                } catch (err) {
                    console.error("AudioWorklet 설정 실패:", err);
                }
            };

            wsRef.current.onmessage = async (event) => {
                const data = JSON.parse(event.data);

                if (data.type === "ANSWER") {
                    await pcRef.current.setRemoteDescription({ type: "answer", sdp: data.sdp });
                } else if (data.type === "ICE_CANDIDATE" && data.candidate) {
                    await pcRef.current.addIceCandidate(data.candidate);
                }
            };

            wsRef.current.onerror = (err) => console.error("시그널링 WS 에러:", err);
            wsRef.current.onclose = () => {
                console.log("시그널링 WS 종료");
                setConnected(false);
                audioWs.current?.close();
                pcRef.current?.close();
            };
        } catch (err) {
            console.error("연결 초기화 실패:", err);
            setConnected(false);
        }
    };

    // ---------------------------
    // GPT 오디오 큐 재생
    // ---------------------------
    const playQueue = () => {
        if (isPlayingRef.current || gptAudioQueue.current.length === 0) return;

        isPlayingRef.current = true;

        const chunk = gptAudioQueue.current.shift();
        if (!chunk || !audioCtxRef.current) return;
        setIsAiResponding(true);

        const int16Array = new Int16Array(chunk);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) float32Array[i] = int16Array[i] / 32768;

        const buffer = audioCtxRef.current.createBuffer(1, float32Array.length, 24000);
        buffer.copyToChannel(float32Array, 0);

        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);

        source.onended = () => {
            isPlayingRef.current = false;
            if (gptAudioQueue.current.length > 0) {
                playQueue();
            } else {
                setIsAiResponding(false); // 재생 완료 후 말하기 가능
            }
        };

        source.start();
    };

    const handleSpeakToggle = () => {
        if (!connected || isAiResponding) return;

        if (!isSpeaking) {
            setIsSpeaking(true);
            isSpeakingRef.current = true;
        } else {
            setIsSpeaking(false);
            isSpeakingRef.current = false;

            if (audioWs.current && audioWs.current.readyState === WebSocket.OPEN) {
                audioWs.current.send(JSON.stringify({ type: "speech.end" }));
                setIsAiResponding(true); // GPT 응답 대기 상태
            }
        }
    };

    const closeConnection = () => {
        wsRef.current?.close();
        audioWs.current?.close();
        pcRef.current?.close();

        localStreamRef.current?.getTracks().forEach(track => track.stop());

        setConnected(false);
        setIsSpeaking(false);
        setIsAiResponding(false);
        gptAudioQueue.current = [];
    };

    useEffect(() => {
        return () => closeConnection();
    }, []);

    return (
        <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
            <h2>GPT Realtime 대화 테스트</h2>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button onClick={initConnection} disabled={connected} style={{ padding: "10px 20px", backgroundColor: connected ? "#ccc" : "#4CAF50", color: "white", border: "none", borderRadius: 4 }}>연결</button>
                <button onClick={closeConnection} disabled={!connected} style={{ padding: "10px 20px", backgroundColor: !connected ? "#ccc" : "#f44336", color: "white", border: "none", borderRadius: 4 }}>해제</button>
                <span>상태: {connected ? <b style={{ color: "green" }}>● 연결됨</b> : <b style={{ color: "gray" }}>○ 연결 안됨</b>}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 15, alignItems: "center", marginTop: 20 }}>
                <button
                    onClick={handleSpeakToggle}
                    disabled={!connected || isAiResponding}
                    style={{
                        width: 150, height: 150, borderRadius: "50%", fontSize: 20, border: "none", color: "white",
                        backgroundColor: isSpeaking ? "#f44336" : isAiResponding ? "#2196F3" : "#4CAF50",
                        cursor: connected ? "pointer" : "not-allowed"
                    }}
                >
                    {isSpeaking ? "말하는 중" : isAiResponding ? "응답 중" : "눌러서 말하기"}
                </button>
            </div>
        </div>
    );
};

export default AiTest;
