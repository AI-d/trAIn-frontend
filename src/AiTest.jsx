import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";

const AiTest = () => {
    const pcRef = useRef(null);
    const wsRef = useRef(null);
    const audioWs = useRef(null);
    const localStreamRef = useRef(null);
    const audioContextRef = useRef(null);

    // 오디오 재생 큐
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const nextStartTimeRef = useRef(0);

    const [connected, setConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isAiResponding, setIsAiResponding] = useState(false);
    const isSpeakingRef = useRef(false);

    /**
     * 오디오 청크를 큐에 추가하고 재생
     */
    const playAudioQueue = async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) {
            return;
        }

        isPlayingRef.current = true;
        const audioContext = audioContextRef.current;

        if (!audioContext) {
            console.error("AudioContext가 없습니다");
            isPlayingRef.current = false;
            return;
        }

        try {
            while (audioQueueRef.current.length > 0) {
                const arrayBuffer = audioQueueRef.current.shift();

                // Int16 PCM을 Float32로 변환
                const int16Array = new Int16Array(arrayBuffer);
                const float32Array = new Float32Array(int16Array.length);

                for (let i = 0; i < int16Array.length; i++) {
                    float32Array[i] = int16Array[i] / 32768.0;
                }

                // AudioBuffer 생성
                const audioBuffer = audioContext.createBuffer(
                    1,  // mono
                    float32Array.length,
                    48000  // sample rate
                );

                audioBuffer.getChannelData(0).set(float32Array);

                // 재생 시간 계산 (끊김 없이 연속 재생)
                const currentTime = audioContext.currentTime;
                const startTime = Math.max(currentTime, nextStartTimeRef.current);

                // 재생
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start(startTime);

                // 다음 청크 시작 시간 계산
                nextStartTimeRef.current = startTime + audioBuffer.duration;

                console.log(`🔊 오디오 재생: ${arrayBuffer.byteLength} bytes, 시작: ${startTime.toFixed(3)}s`);

                // 재생 완료 대기
                await new Promise(resolve => {
                    source.onended = resolve;
                });
            }

            console.log("✅ 오디오 재생 완료");
            setIsAiResponding(false);

        } catch (error) {
            console.error("❌ 오디오 재생 실패:", error);
        } finally {
            isPlayingRef.current = false;
        }
    };

    const initConnection = async () => {
        const scenarioId = 1;
        const userId = 1;

        try {
            console.log("세션 생성 요청 중...");
            const response = await axios.post("http://localhost:9090/api/sessions", {
                userId: userId,
                scenarioId: scenarioId
            });

            const sessionId = response.data.data.sessionId;
            console.log("✅ 세션 아이디 생성 완료:", sessionId);

            // AudioContext 생성 (한 번만)
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext({ sampleRate: 48000 });
                console.log("✅ AudioContext 생성 완료");
            }

            // ---------------------------
            // 1. 오디오 WS 연결
            // ---------------------------
            audioWs.current = new WebSocket(`ws://localhost:9090/ws/audio/${sessionId}`);
            audioWs.current.binaryType = "arraybuffer";

            audioWs.current.onopen = () => {
                console.log("✅ 오디오 WS 연결됨");

                // SESSION_INIT 전송
                const initMessage = {
                    type: "SESSION_INIT",
                    scenarioId: scenarioId
                };
                console.log("📤 SESSION_INIT 전송:", initMessage);
                audioWs.current.send(JSON.stringify(initMessage));
            };

            audioWs.current.onmessage = (event) => {
                if (event.data instanceof ArrayBuffer) {
                    console.log("📥 GPT 음성 응답 수신:", event.data.byteLength, "bytes");

                    // 큐에 추가하고 재생
                    audioQueueRef.current.push(event.data);
                    playAudioQueue();
                }
            };

            audioWs.current.onerror = (error) => {
                console.error("❌ 오디오 WS 에러:", error);
            };

            audioWs.current.onclose = () => {
                console.log("🔌 오디오 WS 종료");
            };

            // ---------------------------
            // 2. 시그널링 WebSocket 연결
            // ---------------------------
            wsRef.current = new WebSocket(`ws://localhost:9090/ws/signaling/${sessionId}`);

            wsRef.current.onopen = async () => {
                console.log("✅ 시그널링 WS 연결됨");
                setConnected(true);

                // ---------------------------
                // 3. RTCPeerConnection 생성
                // ---------------------------
                pcRef.current = new RTCPeerConnection({
                    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
                });

                // 마이크 접근
                console.log("🎤 마이크 접근 요청...");
                const localStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 48000
                    },
                    video: false
                });
                console.log("✅ 마이크 접근 성공");
                localStreamRef.current = localStream;

                // Audio 트랙 추가
                localStream.getTracks().forEach((track) => {
                    pcRef.current.addTrack(track, localStream);
                });

                // ICE Candidate 처리
                pcRef.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log("📤 ICE Candidate 전송");
                        wsRef.current.send(JSON.stringify({
                            type: "ICE_CANDIDATE",
                            candidate: event.candidate
                        }));
                    }
                };

                // Offer 생성 및 전송
                const offer = await pcRef.current.createOffer();
                await pcRef.current.setLocalDescription(offer);
                console.log("📤 Offer 전송");
                wsRef.current.send(JSON.stringify({ type: "OFFER", sdp: offer.sdp }));

                // ---------------------------
                // 4. AudioWorklet 설정
                // ---------------------------
                console.log("🔧 AudioWorklet 설정 시작...");
                const audioContext = audioContextRef.current;
                const source = audioContext.createMediaStreamSource(localStream);

                try {
                    await audioContext.audioWorklet.addModule('/audio-processor.js');
                    console.log("✅ AudioWorklet 모듈 로드 완료");

                    const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');

                    workletNode.port.onmessage = (event) => {
                        if (!isSpeakingRef.current) return;

                        // Float32 -> Int16 변환
                        const float32Array = new Float32Array(event.data);
                        const int16Array = new Int16Array(float32Array.length);

                        for (let i = 0; i < float32Array.length; i++) {
                            const clamped = Math.max(-1, Math.min(1, float32Array[i]));
                            int16Array[i] = clamped * 32767;
                        }

                        // GPT로 음성 전송
                        if (audioWs.current && audioWs.current.readyState === WebSocket.OPEN) {
                            audioWs.current.send(int16Array.buffer);
                        }
                    };

                    source.connect(workletNode);
                    console.log("✅ AudioWorklet 연결 완료");
                } catch (error) {
                    console.error("❌ AudioWorklet 설정 실패:", error);
                }
            };

            // ---------------------------
            // 5. 시그널링 메시지 처리
            // ---------------------------
            wsRef.current.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                console.log("📥 시그널링 메시지:", data.type);

                if (data.type === "ANSWER") {
                    await pcRef.current.setRemoteDescription({
                        type: 'answer',
                        sdp: data.sdp,
                    });
                    console.log("✅ Remote description 설정 완료");
                } else if (data.type === "ICE_CANDIDATE" && data.candidate) {
                    await pcRef.current.addIceCandidate(data.candidate);
                    console.log("✅ ICE Candidate 추가");
                }
            };

            wsRef.current.onerror = (error) => {
                console.error("❌ 시그널링 WS 에러:", error);
            };

            wsRef.current.onclose = () => {
                console.log("🔌 시그널링 WS 종료");
                setConnected(false);
                audioWs.current?.close();
                pcRef.current?.close();
            };

        } catch (error) {
            console.error("❌ 연결 초기화 실패:", error);
            setConnected(false);
        }
    };

    const handleSpeakToggle = () => {
        if (!connected || isAiResponding) return;

        if (!isSpeaking) {
            // 말하기 시작
            console.log("🎙 말하기 시작");
            setIsSpeaking(true);
            isSpeakingRef.current = true;
        } else {
            // 말하기 종료
            console.log("🛑 말하기 종료");
            setIsSpeaking(false);
            isSpeakingRef.current = false;

            if (audioWs.current && audioWs.current.readyState === WebSocket.OPEN) {
                audioWs.current.send(JSON.stringify({ type: "speech.end" }));
                console.log("📤 speech.end 전송 완료");
                setIsAiResponding(true);

                // 오디오 큐 초기화
                audioQueueRef.current = [];
                nextStartTimeRef.current = 0;
            }
        }
    };

    const closeConnection = () => {
        console.log("🔌 연결 종료 시작...");

        // WebSocket 종료
        wsRef.current?.close();
        audioWs.current?.close();

        // RTCPeerConnection 종료
        pcRef.current?.close();

        // 마이크 스트림 종료
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // AudioContext 종료
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // 상태 초기화
        setConnected(false);
        setIsSpeaking(false);
        setIsAiResponding(false);
        isSpeakingRef.current = false;
        isPlayingRef.current = false;
        audioQueueRef.current = [];
        nextStartTimeRef.current = 0;

        console.log("✅ 연결 해제 완료");
    };

    useEffect(() => {
        return () => {
            closeConnection();
        };
    }, []);

    return (
        <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
            <h2>🎧 GPT Realtime 대화 테스트</h2>

            {/* 연결 버튼 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button
                    onClick={initConnection}
                    disabled={connected}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: connected ? "#ccc" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: connected ? "not-allowed" : "pointer"
                    }}
                >
                    🚀 연결
                </button>

                <button
                    onClick={closeConnection}
                    disabled={!connected}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: !connected ? "#ccc" : "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: !connected ? "not-allowed" : "pointer"
                    }}
                >
                    🛑 해제
                </button>

                <span>
                    상태:{" "}
                    {connected ? (
                        <b style={{ color: "green" }}>● 연결됨</b>
                    ) : (
                        <b style={{ color: "gray" }}>○ 연결 안됨</b>
                    )}
                </span>
            </div>

            {/* 말하기 버튼 */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    alignItems: "center",
                    marginTop: 20,
                }}
            >
                <button
                    onClick={handleSpeakToggle}
                    disabled={!connected || isAiResponding}
                    style={{
                        width: 150,
                        height: 150,
                        borderRadius: "50%",
                        fontSize: 20,
                        border: "none",
                        color: "white",
                        backgroundColor: isSpeaking
                            ? "#f44336"
                            : isAiResponding
                                ? "#2196F3"
                                : "#4CAF50",
                        cursor: connected && !isAiResponding ? "pointer" : "not-allowed",
                        transition: "all 0.3s ease"
                    }}
                >
                    {isSpeaking
                        ? "🗣 말하는 중"
                        : isAiResponding
                            ? "🤖 응답 중"
                            : "🎤 눌러서 말하기"}
                </button>

                <p style={{ color: "#666", fontSize: 14 }}>
                    {isSpeaking && "버튼을 다시 눌러 말하기를 종료하세요"}
                    {isAiResponding && "AI가 응답하는 중입니다..."}
                    {!isSpeaking && !isAiResponding && connected && "버튼을 눌러 말하기를 시작하세요"}
                </p>
            </div>
        </div>
    );
};

export default AiTest;
