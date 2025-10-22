import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import {playAudio} from "openai/helpers/audio";

const AiTest = () => {
    const pcRef = useRef(null);
    const wsRef = useRef(null);      // 시그널링 WS
    const audioWs = useRef(null);    // 오디오 WS
    const localStreamRef = useRef(null); // localStream 저장용
    const [connected, setConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isAiResponding, setIsAiResponding] = useState(false);


    const isSpeakingRef = useRef(false);

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
            console.log("세션 아이디 생성 완료: ", sessionId);

            // ---------------------------
            // 1. 오디오 WS 먼저 연결 (SESSION_INIT 전송용)
            // ---------------------------
            audioWs.current = new WebSocket(`ws://localhost:9090/ws/audio/${sessionId}`);
            audioWs.current.binaryType = "arraybuffer";

            audioWs.current.onopen = () => {
                console.log("오디오 WS 연결됨");

                // SESSION_INIT 전송
                const initMessage = {
                    type: "SESSION_INIT",
                    scenarioId: scenarioId
                };
                console.log("SESSION_INIT 전송:", initMessage);
                audioWs.current.send(JSON.stringify(initMessage));
            };

            audioWs.current.onmessage = (event) => {
                if (event.data instanceof ArrayBuffer) {
                    console.log("GPT 음성 응답 수신:", event.data.byteLength, "bytes");
                    // TODO: 음성 재생
                    playAudio(event.data);
                }
            };

            audioWs.current.onerror = (error) => {
                console.error("오디오 WS 에러:", error);
            };

            audioWs.current.onclose = () => {
                console.log("오디오 WS 종료");
            };

            // ---------------------------
            // 2. 시그널링 WebSocket 연결
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
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 16000
                    },
                    video: false
                });
                console.log("마이크 접근 성공");

                localStreamRef.current = localStream;

                // Audio 트랙 WebRTC에 추가
                localStream.getTracks().forEach((track) => {
                    pcRef.current.addTrack(track, localStream);
                });

                // ICE Candidate 서버 전송
                pcRef.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        console.log("ICE Candidate 전송");
                        wsRef.current.send(JSON.stringify({
                            type: "ICE_CANDIDATE",
                            candidate: event.candidate
                        }));
                    }
                };

                // Offer 생성 및 전송
                const offer = await pcRef.current.createOffer();
                await pcRef.current.setLocalDescription(offer);
                console.log("Offer 전송");
                wsRef.current.send(JSON.stringify({ type: "OFFER", sdp: offer.sdp }));

                // ---------------------------
                // 4. AudioContext & AudioWorklet 설정
                // ---------------------------
                console.log("AudioWorklet 설정 시작...");
                const audioContext = new AudioContext({ sampleRate: 16000 });
                const source = audioContext.createMediaStreamSource(localStream);

                try {
                    await audioContext.audioWorklet.addModule('/audio-processor.js');
                    console.log("AudioWorklet 모듈 로드 완료");

                    const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');

                    workletNode.port.onmessage = (event) => {

                        if(!isSpeakingRef.current) return;

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
                    console.log("AudioWorklet 연결 완료");

                } catch (error) {
                    console.error("AudioWorklet 설정 실패:", error);
                }
            };

            // ---------------------------
            // 5. 시그널링 메시지 처리
            // ---------------------------
            wsRef.current.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                console.log("시그널링 메시지:", data.type);

                if (data.type === "ANSWER") {
                    await pcRef.current.setRemoteDescription({
                        type: 'answer',
                        sdp: data.sdp,
                    });
                    console.log("Remote description 설정 완료");
                } else if (data.type === "ICE_CANDIDATE" && data.candidate) {
                    await pcRef.current.addIceCandidate(data.candidate);
                    console.log("ICE Candidate 추가");
                }
            };

            wsRef.current.onerror = (error) => {
                console.error("시그널링 WS 에러:", error);
            };

            // ---------------------------
            // 6. 시그널링 종료 처리
            // ---------------------------
            wsRef.current.onclose = () => {
                console.log("시그널링 WS 종료");
                setConnected(false);
                audioWs.current?.close();
                pcRef.current?.close();
            };

        } catch (error) {
            console.error("연결 초기화 실패:", error);
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
            console.log("말하기 종료");
            setIsSpeaking(false);
            isSpeakingRef.current = false;

            if (audioWs.current && audioWs.current.readyState === WebSocket.OPEN) {
                audioWs.current.send(JSON.stringify({ type: "speech.end" }));
                console.log("speech.end 전송 완료");
                setIsAiResponding(true);
            }
        }
    };

    const closeConnection = () => {
        console.log("연결 종료 시작...");

        wsRef.current?.close();
        audioWs.current?.close();
        pcRef.current?.close();

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        setConnected(false);
        setIsSpeaking(false);
        setIsAiResponding(false);

        console.log("연결 해제 완료");
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

            {/* 탭으로 말하기 */}
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
                        cursor: connected ? "pointer" : "not-allowed",
                    }}
                >
                    {isSpeaking
                        ? "🗣 말하는 중"
                        : isAiResponding
                            ? "🤖 응답 중"
                            : "🎤 눌러서 말하기"}
                </button>
            </div>
        </div>
    );
};

export default AiTest;