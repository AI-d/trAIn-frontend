import React, {useEffect, useRef} from 'react';

const AiTest = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);
    const wsRef = useRef(null);

    useEffect(() => {
        // WebSocket 연결
        wsRef.current = new WebSocket("ws://localhost:9090/ws/signaling/123");

        wsRef.current.onopen = async () => {
            console.log("WebSocket 연결됨");

            // RTCPeerConnection 생성
            pcRef.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });

            // 내 오디오/비디오 가져오기
            const localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            localStream.getTracks().forEach((track) =>
                pcRef.current.addTrack(track, localStream)
            );
            localVideoRef.current.srcObject = localStream;

            // 4ICE Candidate 서버로 전송
            pcRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    wsRef.current.send(
                        JSON.stringify({ type: "ICE_CANDIDATE", candidate: event.candidate })
                    );
                }
            };

            // 5상대 스트림 표시
            pcRef.current.ontrack = (event) => {
                remoteVideoRef.current.srcObject = event.streams[0];
            };

            // ️Offer 생성 및 전송
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);
            wsRef.current.send(JSON.stringify({ type: "OFFER", sdp: offer.sdp }));
            console.log("Offer 전송 완료");
        };

        // 서버 → 클라이언트 응답 처리
        wsRef.current.onmessage = async (event) => {
            console.log("raw 수신:", event.data);
            const data = JSON.parse(event.data);
            console.log("수신:", data);

            if (data.type === "ANSWER") {
                await pcRef.current.setRemoteDescription({
                    type: data.type.toLowerCase(),
                    sdp: data.sdp,
                });
                console.log("Remote description 설정 완료");
            } else if (data.type === "candidate") {
                await pcRef.current.addIceCandidate(data.candidate);
            }
        };

        return () => {
            wsRef.current?.close();
            pcRef.current?.close();
        };
    }, []);

    return (
        <div style={{ display: "flex", gap: "10px" }}>
            <video ref={localVideoRef} autoPlay muted playsInline width="300" />
            <video ref={remoteVideoRef} autoPlay playsInline width="300" />
        </div>
    );
};

export default AiTest;