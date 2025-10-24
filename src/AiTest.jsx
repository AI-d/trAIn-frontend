import React, { useEffect, useRef, useState } from 'react';
import apiClient from "@/services/apiClient.js";

const AiRealtimeTest = () => {
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);
    const audioCtxRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const isSpeakingRef = useRef(false);

    const initRealtimeConnection = async () => {
        try {

            const response = await apiClient.post('/realtime/session', {
                model: "gpt-4o-realtime-preview-2024-10-01",
                voice: "alloy",
                sttModel: "whisper-1"
            });
            const data = response.data
            console.log(data);
            const ephemeralKey = data.data.client_secret.value;

            console.log("ephemeral key 발급 완료:", ephemeralKey);

            // ---------------------------
            // 1. RTCPeerConnection 생성
            // ---------------------------
            pcRef.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            // 내 오디오 가져오기
            const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = localStream;
            localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

            // remote track 수신
            pcRef.current.ontrack = (event) => {
                const audioCtx = audioCtxRef.current || new AudioContext();
                audioCtxRef.current = audioCtx;

                const source = audioCtx.createMediaStreamSource(event.streams[0]);
                source.connect(audioCtx.destination);
            };

            // ICE candidate 이벤트
            pcRef.current.onicecandidate = async (event) => {
                if (!event.candidate) return;
                // GPT Realtime WebRTC는 candidate를 SDP에 포함하면 자동 처리되므로 별도 전송 필요 없음
            };

            // ---------------------------
            // 2. Offer 생성
            // ---------------------------
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);

            // ---------------------------
            // 3. GPT Realtime WebRTC 서버에 Offer 전송
            // ---------------------------
            const realtimeUrl = `https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
            const sdpResponse = await fetch(realtimeUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${ephemeralKey}`,
                    "Content-Type": "application/sdp"
                },
                body: offer.sdp
            });
            const answerSdp = await sdpResponse.text();
            await pcRef.current.setRemoteDescription({ type: "answer", sdp: answerSdp });

            setConnected(true);
            console.log("WebRTC 연결 완료");
        } catch (err) {
            console.error("Realtime 연결 실패:", err);
            setConnected(false);
        }
    };

    const handleSpeakToggle = () => {
        if (!connected) return;
        setIsSpeaking(!isSpeaking);
        isSpeakingRef.current = !isSpeakingRef.current;
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>GPT Realtime 테스트</h2>
            <button onClick={initRealtimeConnection} disabled={connected}>연결</button>
            <button onClick={handleSpeakToggle} disabled={!connected}>
                {isSpeaking ? "말하는 중" : "눌러서 말하기"}
            </button>
            <div>상태: {connected ? "연결됨" : "연결 안됨"}</div>
        </div>
    );
};

export default AiRealtimeTest;
