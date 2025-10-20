import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";

const AiTest = () => {
    const pcRef = useRef(null);
    const wsRef = useRef(null);      // 시그널링 WS
    const audioWs = useRef(null);    // 오디오 WS
    const localStreamRef = useRef(null); // localStream 저장용
    const [connected, setConnected] = useState(false);

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
                        sampleRate: 48000
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

                // 상대 스트림 표시
                pcRef.current.ontrack = (e) => {
                    console.log("Remote track 수신");
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
                const audioContext = new AudioContext({ sampleRate: 48000 });
                const source = audioContext.createMediaStreamSource(localStream);

                try {
                    await audioContext.audioWorklet.addModule('/audio-processor.js');
                    console.log("AudioWorklet 모듈 로드 완료");

                    const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');

                    workletNode.port.onmessage = (event) => {
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

    const closeConnection = () => {
        console.log("연결 종료 시작...");

        wsRef.current?.close();
        audioWs.current?.close();
        pcRef.current?.close();

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        setConnected(false);
        console.log("연결 해제 완료");
    };

    useEffect(() => {
        return () => {
            closeConnection();
        };
    }, []);

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            padding: "20px",
            fontFamily: "Arial, sans-serif"
        }}>
            <div style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                padding: "15px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px"
            }}>
                <button
                    onClick={initConnection}
                    disabled={connected}
                    style={{
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        backgroundColor: connected ? "#ccc" : "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: connected ? "not-allowed" : "pointer"
                    }}
                >
                    🚀 연결
                </button>
                <button
                    onClick={closeConnection}
                    disabled={!connected}
                    style={{
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        backgroundColor: !connected ? "#ccc" : "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: !connected ? "not-allowed" : "pointer"
                    }}
                >
                    🛑 해제
                </button>
                <div style={{
                    marginLeft: "20px",
                    fontSize: "18px",
                    fontWeight: "bold"
                }}>
                    {connected ? (
                        <span style={{ color: "#4CAF50" }}>● 연결됨</span>
                    ) : (
                        <span style={{ color: "#999" }}>○ 연결 안됨</span>
                    )}
                </div>
            </div>

            <div style={{
                display: "flex",
                gap: "20px",
                padding: "20px",
                backgroundColor: "#fff",
                border: "2px solid #ddd",
                borderRadius: "8px"
            }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>🎤 내 오디오</h3>
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>🤖 AI 응답</h3>
                </div>
            </div>

            <div style={{
                padding: "15px",
                backgroundColor: "#e3f2fd",
                border: "2px solid #2196F3",
                borderRadius: "8px"
            }}>
                <h3 style={{ margin: "0 0 10px 0" }}>💡 사용 방법</h3>
                <ol style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>서버 로그를 열어두고 시작하세요</li>
                    <li>"🚀 연결" 버튼을 클릭하세요</li>
                    <li>브라우저 콘솔(F12)을 열어서 로그를 확인하세요</li>
                    <li>서버 로그에서 "GPT 세션 생성 시작" 메시지를 확인하세요</li>
                    <li>마이크 권한을 허용하세요</li>
                </ol>
            </div>

            <div style={{
                padding: "15px",
                backgroundColor: "#fff3cd",
                border: "2px solid #ffc107",
                borderRadius: "8px",
                fontSize: "14px"
            }}>
                <h3 style={{ margin: "0 0 10px 0" }}>⚠️ 체크리스트</h3>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>✅ DB에 scenarioId=1 시나리오가 있는지 확인</li>
                    <li>✅ public/audio-processor.js 파일이 있는지 확인</li>
                    <li>✅ 서버가 9090 포트에서 실행 중인지 확인</li>
                    <li>✅ OpenAI API 키가 설정되어 있는지 확인</li>
                    <li>✅ HTTPS 또는 localhost에서 실행 중인지 확인</li>
                </ul>
            </div>
        </div>
    );
};

export default AiTest;