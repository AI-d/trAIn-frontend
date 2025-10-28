import {useCallback, useEffect, useRef, useState} from "react";
import apiClient from "@/services/apiClient.js";

/**
 * GPT Realtime + WebSocket 통합 Hook
 *
 * 역할:
 * 1. WebRTC P2P로 GPT와 음성 통신
 * 2. WebSocket으로 백엔드에 대화 내역 실시간 전송
 * 3. 재연결 시 대화 내역 복구
 * 4. 사용자: PTT (수동), AI: VAD (자동)
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

    // 발화 시간 관련
    const userSpeakingStartRef = useRef(null);
    const aiSpeakingStartRef = useRef(null);
    const lastUserSpeakingTimeRef = useRef(null);
    const lastAiSpeakingTimeRef = useRef(null);

    // PTT 관련
    const [isPttActive, setIsPttActive] = useState(false);
    const [vadStatus, setVadStatus] = useState('idle');
    const pttTimerRef = useRef(null);

    // AI 음성 분석 관련
    const audioContextRef = useRef(null);
    const aiAudioAnalyserRef = useRef(null);
    const aiSilenceCheckIntervalRef = useRef(null);

    // PTT 설정
    const PTT_MAX_DURATION = 30000;

    // 상태 관리
    const [connected, setConnected] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [transcripts, setTranscripts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [userSpeaking, setUserSpeaking] = useState(false);
    const [reconnecting, setReconnecting] = useState(false);
    const [isInitialGreeting, setIsInitialGreeting] = useState(true);

    const transcriptsRef = useRef(transcripts);

    const MIN_USER_SPEECH_DURATION = 200;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 2000;

    /**
     * WebRTC + WebSocket 통합 연결
     */
    const initRealtimeConnection = async () => {
        setLoading(true);
        setIsInitialGreeting(true);
        try {
            const sessionResponse = await apiClient.post('/sessions', {scenarioId, userId});
            const newSessionId = sessionResponse.data.data.sessionId;
            setSessionId(newSessionId);

            const ephemeralResponse = await apiClient.post('/realtime/session', {
                sessionId: newSessionId,
                model: "gpt-4o-realtime-preview-2024-10-01",
                voice: "alloy",
                sttModel: "whisper-1",
                language: "ko"
            });
            if (!ephemeralResponse.data.success) throw new Error(ephemeralResponse.data.message || "Ephemeral Key 발급 실패");
            const ephemeralKey = ephemeralResponse.data.data.client_secret.value;
            console.log('Ephemeral Key 발급 완료');

            initWebSocket(newSessionId, false);
            await initWebRtc(ephemeralKey, newSessionId);

        } catch (err) {
            console.error("Realtime 연결 실패:", err);
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
            reconnectAttemptsRef.current = 0;

            if(isReconnection) {
                console.log("재연결 시도 - 대화 내역 복구 요청");
                wsRef.current.send(JSON.stringify({
                    type: "SESSION_RECONNECT",
                    sessionId: sessionId,
                    timestamp: new Date().toISOString()
                }));
                setReconnecting(false);
            } else {
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

        const timeInfo = speaker === 'user' ? lastUserSpeakingTimeRef.current : lastAiSpeakingTimeRef.current;

        wsRef.current.send(JSON.stringify({
            type: "TRANSCRIPT",
            speaker: speaker.toUpperCase(),
            text: text,
            startTimeMs: timeInfo?.startMs || Date.now(),
            endTimeMs: timeInfo?.endMs || Date.now(),
            timestamp: new Date().toISOString()
        }));

        console.log(`대화 내용 전송: ${speaker} - ${text.substring(0, 50)}...`);
    }, []);

    /**
     * AI 음성 침묵 감지
     */
    const startAiVadCheck = useCallback(() => {
        if (!aiAudioAnalyserRef.current) {
            console.log("⚠️ VAD 시작 실패: analyser 없음");
            return;
        }

        // 이미 실행 중이면 중복 방지
        if (aiSilenceCheckIntervalRef.current) {
            console.log("⚠️ VAD 이미 실행 중");
            return;
        }

        const analyser = aiAudioAnalyserRef.current;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let silenceCount = 0;
        const SILENCE_THRESHOLD = 5;
        const SILENCE_CHECKS = 5;

        const checkSilence = () => {
            // aiSpeaking 체크 제거! 무조건 끝까지 분석

            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

            if (average < SILENCE_THRESHOLD) {
                silenceCount++;
                console.log(`🔇 침묵 ${silenceCount}/${SILENCE_CHECKS} (레벨: ${average.toFixed(1)})`);

                if (silenceCount >= SILENCE_CHECKS) {
                    console.log("✅ AI 발화 종료 (침묵 감지)");
                    setAiSpeaking(false);
                    setVadStatus('idle');
                    clearInterval(aiSilenceCheckIntervalRef.current);
                    aiSilenceCheckIntervalRef.current = null;
                }
            } else {
                if (silenceCount > 0) {
                    console.log(`🔊 음성 재개 (레벨: ${average.toFixed(1)})`);
                }
                silenceCount = 0;
            }
        };

        aiSilenceCheckIntervalRef.current = setInterval(checkSilence, 200);
        console.log("🎤 AI VAD 체크 시작");

    }, []);

    /**
     * webRtc 연결 초기화
     */
    const initWebRtc = async (ephemeralKey, sessionId) => {

        // 1. peerConnection 설정
        pcRef.current = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                {
                    urls: "turn:openrelay.metered.ca:80",
                    username: "openrelayproject",
                    credential: "openrelayproject"
                }
            ]
        });

        // 2. DataChannel 설정
        dataChannelRef.current = pcRef.current.createDataChannel('oai-events');

        dataChannelRef.current.onopen = () => {
            console.log("✅ Data Channel 열림");
            setIsInitialGreeting(true); // ✅ 최초 인사 시작
            setConnected(true); // ✅ 여기서 connected!

            // AI가 먼저 인사하도록 response.create 전송
            dataChannelRef.current.send(JSON.stringify({
                type: "response.create",
                response: {
                    modalities: ["audio","text"]
                }
            }));
        };

        dataChannelRef.current.onmessage = (event) => {
            console.log("메시지 받음! 원본:", event.data?.substring(0, 100));

            try {
                const data = JSON.parse(event.data);

                // AI 발화 시작
                if (data.type === "output_audio_buffer.started") {
                    console.log("🤖 AI 발화 시작");
                    setAiSpeaking(true);
                    aiSpeakingStartRef.current = Date.now();
                }

                // AI 발화 종료 - VAD 시작
                if (data.type === "output_audio_buffer.stopped") {
                    console.log("🔊 오디오 버퍼 정지 - VAD 시작");
                    startAiVadCheck();
                }

                // AI 텍스트 응답
                if (data.type === "response.audio_transcript.done") {
                    // ✅ 최초 인사 완료
                    setIsInitialGreeting(false);

                    const transcript = {
                        speaker: 'ai',
                        text: data.transcript,
                        timestamp: aiSpeakingStartRef.current
                            ? new Date(aiSpeakingStartRef.current).toISOString()
                            : new Date().toISOString()
                    }

                    setTranscripts(prev => {
                        const filtered = prev.filter(t => !t.isTemp);
                        const updated = [...filtered, transcript];

                        return updated.sort((a, b) => {
                            const timeDiff = new Date(a.timestamp) - new Date(b.timestamp);
                            if (Math.abs(timeDiff) < 1000) {
                                if (a.speaker === 'user') return -1;
                                if (b.speaker === 'user') return 1;
                            }
                            return timeDiff;
                        });
                    });

                    sendTranscript('ai', data.transcript);
                }

                // 사용자 STT 완료
                if (data.type === 'conversation.item.input_audio_transcription.completed') {
                    const transcript = {
                        speaker: 'user',
                        text: data.transcript,
                        timestamp: userSpeakingStartRef.current
                            ? new Date(userSpeakingStartRef.current).toISOString()
                            : new Date().toISOString()
                    }

                    setTranscripts(prev => {
                        const filtered = prev.filter(t => !t.isTemp);
                        const updated = [...filtered, transcript];

                        return updated.sort((a, b) => {
                            const timeDiff = new Date(a.timestamp) - new Date(b.timestamp);
                            if (Math.abs(timeDiff) < 1000) {
                                if (a.speaker === 'user') return -1;
                                if (b.speaker === 'user') return 1;
                            }
                            return timeDiff;
                        });
                    });

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
                noiseSuppression: false,
                autoGainControl: false,
                sampleRate: 16000,
                channelCount: 1
            }
        });
        localStreamRef.current = localStream;

        localStream.getTracks().forEach(track => {
            track.enabled = false;
            pcRef.current.addTrack(track, localStream);
            console.log("마이크 초기 상태: 비활성화");
        });

        // 4. AI 오디오 스트림 설정 (핵심!)
        pcRef.current.ontrack = (event) => {
            console.log("🎵 ontrack 이벤트!");

            if (!event.streams || event.streams.length === 0) return;
            const remoteStream = event.streams[0];
            if (remoteStream.getAudioTracks().length === 0) return;

            // 1. audio 태그로 재생 (필수!)
            if (audioTagRef.current) {
                audioTagRef.current.srcObject = remoteStream;
                audioTagRef.current.autoplay = true;
                audioTagRef.current.play()
                    .then(() => console.log("오디오 재생 시작!"))
                    .catch(err => console.error("재생 실패:", err));
            }

            //  2. AudioContext로 분석 (VAD용)
            try {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                    console.log("AudioContext 생성");
                }

                const source = audioContextRef.current.createMediaStreamSource(remoteStream);
                const analyser = audioContextRef.current.createAnalyser();
                analyser.fftSize = 2048;
                analyser.smoothingTimeConstant = 0.8;

                source.connect(analyser);

                aiAudioAnalyserRef.current = analyser;
                console.log("AI VAD 분석기 초기화 완료!");
            } catch (err) {
                console.error(" AudioContext 설정 실패:", err);
            }
        };

        // 5. 연결 상태 모니터링
        pcRef.current.oniceconnectionstatechange = () => console.log("ICE 상태:", pcRef.current.iceConnectionState);
        pcRef.current.onconnectionstatechange = () => {
            console.log("연결 상태:", pcRef.current.connectionState);
            if (pcRef.current.connectionState === 'disconnected' || pcRef.current.connectionState === 'failed') {
                handleEndSession();
            }
        };

        // 6. SDP Offer/Answer
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
     * 마이크 트랙 제어
     */
    const enableMicroPhone = useCallback(() => {
        if(!localStreamRef.current) return;
        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = true;
        })
        console.log("마이크 활성화");
    }, []);

    const disableMicroPhone = useCallback(() => {
        if(!localStreamRef.current) return;
        localStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = false;
        })
        console.log("마이크 비활성화");
    }, []);

    /**
     * PTT 시작
     */
    const startPushToTalk = useCallback(() => {
        if(!connected || aiSpeaking || isInitialGreeting) {
            console.log("PTT 시작 불가: 미연결 또는 AI 발화 중 또는 최초 인사 중");
            return;
        }

        console.log("🎤 PTT 시작");
        enableMicroPhone();
        setIsPttActive(true);
        setUserSpeaking(true);
        setVadStatus('listening');

        pttTimerRef.current = setTimeout(() => {
            console.log("⏰ PTT 30초 타임아웃");
            stopPushToTalk('timeout');
        }, PTT_MAX_DURATION);
    }, [connected, aiSpeaking, isInitialGreeting, enableMicroPhone]);

    /**
     * PTT 종료
     */
    const stopPushToTalk = useCallback((reason = 'manual') => {
        if(!isPttActive) {
            console.log("PTT 이미 비활성화");
            return;
        }

        console.log(`🛑 PTT 종료: ${reason}`);

        if(pttTimerRef.current) {
            clearTimeout(pttTimerRef.current);
            pttTimerRef.current = null;
        }

        disableMicroPhone();
        setIsPttActive(false);
        setUserSpeaking(false);
        setVadStatus('processing');

        // 1. 컨텍스트 전송
        sendCurrentContext();

        // 2. 오디오 커밋
        commitAudioBuffer(reason);

        // 3. 응답 요청
        dataChannelRef.current.send(JSON.stringify({
            type: 'response.create',
            response: { modalities: ["audio","text"] }
        }));

    }, [isPttActive, disableMicroPhone]);

    /**
     * 오디오 버퍼 전송
     */
    const commitAudioBuffer = useCallback((source = 'unknown') => {
        console.log(`📤 오디오 처리 시작: ${source}`);

        if(!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
            console.log("DataChannel 닫힘");
            setVadStatus('idle');
            return;
        }

        // 발화 길이 확인
        const startMs = userSpeakingStartRef.current;
        const duration = startMs ? Date.now() - startMs : 0;

        if(duration <  MIN_USER_SPEECH_DURATION) {
            console.log(`짧은 발화: ${duration}ms - 전송 생략`);
            setVadStatus('idle');
            return;
        }

        try {
            setTranscripts(prev => [...prev, {
                speaker: 'user',
                text: '처리 중...',
                timestamp: userSpeakingStartRef.current
                    ? new Date(userSpeakingStartRef.current).toISOString()
                    : new Date().toISOString(),
                isTemp: true
            }]);

            dataChannelRef.current.send(JSON.stringify({
                type: 'input_audio_buffer.commit'
            }));

            dataChannelRef.current.send(JSON.stringify({
                type: 'response.create',
                response: { modalities: ["audio", "text"] }
            }));

            console.log("✅ 오디오 전송 완료");

        } catch (err) {
            console.log("❌ 오디오 전송 실패: ", err);
            setVadStatus('idle');
        }

    }, []);

    /**
     * 사용자 발화 토글
     */
    const handleUserToggle = useCallback(() => {
        if (isPttActive) {
            stopPushToTalk('manual');
        } else {
            startPushToTalk();
        }
    }, [isPttActive, startPushToTalk, stopPushToTalk]);

    /**
     * 대화 컨텍스트 전송
     */
    const sendCurrentContext = useCallback(() => {

        if(!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
            console.log("DataChannel 아직 열리지 않음");
            return;
        }

        const currentTranscripts = transcriptsRef.current?.filter(t => !t.isTemp) || [];

        if(currentTranscripts.length === 0) {
            console.log("보낼 컨텍스트 없음");
            return;
        }

        const gptMessages = currentTranscripts
            .map(t => ({
                role: t.speaker === 'user' ? 'user' : 'model',
                content: t.text
            }));

        try {
            dataChannelRef.current.send(JSON.stringify({
                type: "conversation.item.create",
                messages: gptMessages
            }));
            console.log(`[컨텍스트 전송] ${gptMessages.length}개 턴`);
        } catch(err) {
            console.error("컨텍스트 전송 실패:", err);
        }
    }, []);

    /**
     * 세션 종료
     */
    const handleEndSession = async () => {
        if (loading) return;
        setLoading(true);
        try {
            if(isPttActive) {
                setIsPttActive(false);
            }

            if (!sessionId) {
                cleanupConnection();
                return;
            }

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
    const cleanupConnection = useCallback(async () => {

        // AI VAD 정리
        if (aiSilenceCheckIntervalRef.current) {
            clearInterval(aiSilenceCheckIntervalRef.current);
            aiSilenceCheckIntervalRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        aiAudioAnalyserRef.current = null;

        // PTT 타이머 정리
        if (pttTimerRef.current) {
            clearTimeout(pttTimerRef.current);
            pttTimerRef.current = null;
        }

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
        setIsPttActive(false);
        setVadStatus('idle');
        setIsInitialGreeting(true); // ✅ 추가
        reconnectAttemptsRef.current = 0;

        console.log("🧹 연결 정리 완료");

    }, []);

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
        return () => cleanupConnection();
    }, [cleanupConnection]);

    // 사용자 발화 시간 측정
    useEffect(() => {
        if(userSpeaking) {
            userSpeakingStartRef.current = Date.now();
            console.log("👤 사용자 발화 시작");
        } else if(userSpeakingStartRef.current) {
            const startMs = userSpeakingStartRef.current;
            const endMs = Date.now();
            const duration = endMs - startMs;

            console.log(`👤 사용자 발화 종료: ${(duration/1000).toFixed(1)}초`);

            lastUserSpeakingTimeRef.current = {
                startMs, endMs, duration
            }

            userSpeakingStartRef.current = null;
        }
    }, [userSpeaking]);

    // AI 발화 시간 측정
    useEffect(() => {
        if(aiSpeaking) {
            aiSpeakingStartRef.current = Date.now();
            console.log("🤖 AI 발화 시작");
        } else if(aiSpeakingStartRef.current) {
            const startMs = aiSpeakingStartRef.current;
            const endMs = Date.now();
            const duration = endMs - startMs;

            console.log(`🤖 AI 발화 종료: ${(duration/1000).toFixed(1)}초`);

            lastAiSpeakingTimeRef.current = {
                startMs, endMs, duration
            }

            aiSpeakingStartRef.current = null;
        }
    }, [aiSpeaking]);

    useEffect(() => {
        transcriptsRef.current = transcripts;
    }, [transcripts]);

    return {
        connected,
        wsConnected,
        sessionId,
        transcripts,
        loading,
        aiSpeaking,
        userSpeaking,
        reconnecting,
        isInitialGreeting,

        isPttActive,
        vadStatus,

        initRealtimeConnection,
        handleUserToggle,
        handleEndSession,

        startPushToTalk,
        stopPushToTalk,

        audioTagRef,

        lastUserSpeakingTime: lastUserSpeakingTimeRef.current,
        lastAiSpeakingTime: lastAiSpeakingTimeRef.current,
    };
}