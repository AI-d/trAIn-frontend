import React, { useEffect, useRef, useState } from 'react';

const AiTest = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);
    const wsRef = useRef(null);      // 시그널링 WS
    const audioWs = useRef(null);    // 오디오 WS
    const [connected, setConnected] = useState(false);

    const initConnection = async () => {
        // ---------------------------
        // 1. 시그널링 WebSocket 연결
        // ---------------------------
        wsRef.current = new WebSocket("ws://localhost:9090/ws/signaling/postman-test-session-123");

        wsRef.current.onopen = async () => {
            console.log("시그널링 WS 연결됨");
            setConnected(true);

            // ---------------------------
            // 2. RTCPeerConnection 생성
            // ---------------------------
            pcRef.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            // 내 오디오 가져오기
            const localStream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                video: false
            });

            // Audio 트랙 WebRTC에 추가
            localStream.getTracks().forEach((track) => pcRef.current.addTrack(track, localStream));
            localVideoRef.current.srcObject = localStream;

            // ICE Candidate 서버 전송
            pcRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    wsRef.current.send(JSON.stringify({ type: "ICE_CANDIDATE", candidate: event.candidate }));
                }
            };

            // 상대 스트림 표시
            pcRef.current.ontrack = (event) => {
                remoteVideoRef.current.srcObject = event.streams[0];
            };

            // Offer 생성 및 전송
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);
            wsRef.current.send(JSON.stringify({ type: "OFFER", sdp: offer.sdp }));
            console.log("Offer 전송 완료");

            // ---------------------------
            // 3. 오디오 WS 연결 (시그널링 이후)
            // ---------------------------
            audioWs.current = new WebSocket("ws://localhost:9090/ws/audio/postman-test-session-123");
            audioWs.current.binaryType = "arraybuffer";

            audioWs.current.onopen = () => {
                console.log("오디오 WS 연결됨");

                // 시나리오 ID 전송
                const scenarioId = 1;
                audioWs.current.send(JSON.stringify({
                    type: "SESSION_INIT",
                    scenarioId: scenarioId
                }));
                console.log("SESSION_INIT 전송, 시나리오 ID:", scenarioId);

                // AudioContext & AudioWorklet 설정
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(localStream);
                audioContext.audioWorklet.addModule('/audio-processor.js').then(() => {
                    const workletNode = new AudioWorkletNode(audioContext, 'audio-processor');
                    workletNode.port.onmessage = (event) => {
                        const float32Array = new Float32Array(event.data);
                        const data = new Int16Array(float32Array.length);
                        for (let i = 0; i < float32Array.length; i++) {
                            data[i] = Math.max(-1, Math.min(1, float32Array[i])) * 32767;
                        }
                        if (audioWs.current && audioWs.current.readyState === WebSocket.OPEN) {
                            audioWs.current.send(data.buffer);
                        }
                    };
                    source.connect(workletNode);
                });
            };

            audioWs.current.onclose = () => {
                console.log("오디오 WS 종료");
            };
        };

        // ---------------------------
        // 4. 시그널링 메시지 처리
        // ---------------------------
        wsRef.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "ANSWER") {
                await pcRef.current.setRemoteDescription({
                    type: 'answer',
                    sdp: data.sdp,
                });
                console.log("Remote description 설정 완료");
            } else if (data.type === "candidate") {
                await pcRef.current.addIceCandidate(data.candidate);
            }
        };

        // ---------------------------
        // 5. 시그널링 종료 처리
        // ---------------------------
        wsRef.current.onclose = () => {
            console.log("시그널링 WS 종료");
            setConnected(false);

            // 오디오 WS도 함께 종료
            audioWs.current?.close();
            pcRef.current?.close();
        };
    };

    const closeConnection = () => {
        wsRef.current?.close();
        audioWs.current?.close();
        pcRef.current?.close();
        setConnected(false);
        console.log("연결 해제 완료");
    };

    useEffect(() => {
        return () => {
            closeConnection();
        };
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
                <button onClick={initConnection} disabled={connected}>연결</button>
                <button onClick={closeConnection} disabled={!connected}>해제</button>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
                <video ref={localVideoRef} autoPlay muted playsInline width="300" />
                <video ref={remoteVideoRef} autoPlay playsInline width="300" />
            </div>
        </div>
    );
};

export default AiTest;
