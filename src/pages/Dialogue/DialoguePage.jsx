import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useRealtimeSession } from "@/hooks/useRealtimeSession.js";
import styles from "./DialoguePage.module.scss";
import toast from "react-hot-toast";
import { FiMic, FiMicOff, FiX } from "react-icons/fi";

const DialoguePage = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    // 시나리오 정보
    const scenarioId = location.state?.scenarioId;
    const title = location.state?.scenarioTitle;

    // 유저 정보 (추후 authStore에서 가져오게 수정)
    const userId = 1;

    // 리액트 커스텀 훅
    const {
        connected,
        wsConnected,
        transcripts,
        loading,
        aiSpeaking,
        isPttActive,
        isInitialGreeting,
        sttError,
        initRealtimeConnection,
        handleUserToggle,
        handleEndSession,
        audioTagRef,
    } = useRealtimeSession(scenarioId || null, userId);

    // 페이지 진입 시 자동 연결
    useEffect(() => {
        let isCancelled = false;

        if (!scenarioId) {
            toast.error('시나리오 정보가 없습니다.\n시나리오 화면으로 이동합니다.', {
                duration: 2000,
            });

            const timer = setTimeout(() => {
                if (!isCancelled) {
                    navigate('/');
                }
            }, 2000);

            return () => {
                isCancelled = true;
                clearTimeout(timer);
            };
        }

        console.log('🚀 대화 페이지 진입 - 연결 시작:', scenarioId);

        const connectingToast = toast.loading('연결 중...');

        initRealtimeConnection()
            .then(() => {
                if (!isCancelled) {
                    toast.success('연결되었습니다!', { id: connectingToast });
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    toast.error('연결에 실패했습니다.\n다시 시도해주세요.', { id: connectingToast });
                    console.error('❌ 연결 실패:', error);

                    setTimeout(() => {
                        if (!isCancelled) {
                            navigate('/');
                        }
                    }, 2000);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [scenarioId, initRealtimeConnection, navigate]);


    // 메시지 추가 시 자동 스크롤
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(() => {
        scrollToBottom();
    }, [transcripts])

    // 대화 중도 포기 (X 버튼)
    const handleEndDialogue = async () => {
        const confirmed = window.confirm('대화를 중단하시겠습니까?');

        if (!confirmed) return;

        const endingToast = toast.loading('대화를 종료하는 중...');

        try {
            await handleEndSession();
            toast.success('대화가 종료되었습니다!', { id: endingToast });

            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (error) {
            toast.error('대화 종료 중 오류가 발생했습니다.', { id: endingToast });
            console.error('❌ 세션 종료 실패:', error);
        }
    };

    // 대화 완료 (완료 버튼)
    const handleCompleteDialogue = async () => {
        const confirmed = window.confirm('대화 연습을 완료하시겠습니까?\n피드백을 확인할 수 있습니다.');

        if (!confirmed) return;

        const endingToast = toast.loading('대화를 완료하는 중...');

        try {
            await handleEndSession();
            toast.success('대화 연습이 완료되었습니다!', { id: endingToast });

            setTimeout(() => {
                navigate('/', {
                    state: {
                        completed: true,
                        sessionData: { transcripts, scenarioId }
                    }
                });
            }, 1000);
        } catch (error) {
            toast.error('대화 완료 중 오류가 발생했습니다.', { id: endingToast });
            console.error('❌ 세션 완료 실패:', error);
        }
    };

    // 시간 포맷팅
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const displayHours = hours % 12 || 12;
        return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
    };

    // 연결 상태별 UI 표시
    const getStatusText = () => {
        if (loading) return '연결 중...';
        if (!connected) return 'WebRTC 연결 대기 중...';
        if (!wsConnected) return 'WebSocket 연결 중...';
        if (isInitialGreeting) return 'AI 인사 대기 중...';
        return 'AI와 대화 중';
    };

    const getStatusColor = () => {
        if (loading || !connected || !wsConnected) return '#F59E0B'; // 주황
        if (isInitialGreeting) return '#6B8EE8'; // 블루
        return '#10B981'; // 초록
    };


    return (
        <div className={styles.pageContainer}>
            {/* 숨겨진 오디오 태그 (AI 음성 재생용) */}
            <audio ref={audioTagRef} style={{ display: 'none' }} />

            {/* 헤더 */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.scenarioTitle}>
                        {title}
                    </h1>
                    <p className={styles.scenarioSubtitle}>
                        <span
                            className={styles.statusDot}
                            style={{ backgroundColor: getStatusColor() }}
                        />
                        {getStatusText()}
                    </p>
                </div>
                <button
                    className={styles.closeButton}
                    onClick={handleEndDialogue}
                    disabled={loading}
                >
                    <FiX />
                </button>
            </header>

            {/* 로딩 오버레이 */}
            {(loading || !connected || !wsConnected) && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingContent}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>{getStatusText()}</p>
                        {!connected && <p className={styles.loadingSubtext}>WebRTC 연결 중...</p>}
                        {connected && !wsConnected && <p className={styles.loadingSubtext}>WebSocket 연결 중...</p>}
                    </div>
                </div>
            )}

            {/* 메시지 영역 */}
            <div className={styles.messagesContainer}>
                <div className={styles.messagesList}>
                    {transcripts.map((transcript, index) => (
                        <div
                            key={index}
                            className={`${styles.messageWrapper} ${transcript.speaker === 'user' ? styles.userMessage : styles.aiMessage
                            }`}
                        >
                            <div className={`${styles.messageBubble} ${transcript.isTemp ? styles.tempBubble : ''
                            }`}>
                                <p className={styles.messageText}>
                                    {transcript.text}
                                    {transcript.isTemp && <span className={styles.cursor}></span>}
                                </p>
                                {!transcript.isTemp && (
                                    <span className={styles.messageTime}>
                                        {formatTime(transcript.timestamp)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* AI 발화 중 표시 */}
                    {aiSpeaking && transcripts.filter(t => !t.isTemp).length > 0 && (
                        <div className={`${styles.messageWrapper} ${styles.aiMessage}`}>
                            <div className={`${styles.messageBubble} ${styles.speakingBubble}`}>
                                <div className={styles.speakingIndicator}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* STT 에러 메시지 */}
            {sttError && (
                <div className={styles.sttErrorContainer}>
                    <div className={styles.sttErrorMessage}>
                        {sttError}
                    </div>
                </div>
            )}

            {/* 음성 입력 컨트롤 */}
            <div className={styles.controlPanel}>
                {/* PTT 마이크 버튼 + 타이머 링 */}
                <div className={styles.micContainer}>
                    {/* 타이머 링 (녹음 중일 때만 표시) */}
                    {isPttActive && (
                        <svg className={styles.timerRing} viewBox="0 0 100 100">
                            <circle
                                className={styles.timerCircle}
                                cx="50" cy="50" r="45"
                            />
                        </svg>
                    )}

                    {/* 마이크 버튼 */}
                    <button
                        className={`${styles.micButton} ${
                            isPttActive ? styles.recording : ''
                        } ${aiSpeaking || isInitialGreeting || !connected ? styles.disabled : ''}`}
                        onClick={handleUserToggle}
                        disabled={!connected || aiSpeaking || isInitialGreeting || loading}
                    >
                        {isPttActive ? <FiMicOff size={32} /> : <FiMic size={32} />}
                    </button>
                </div>

                {/* 상태 안내 텍스트 */}
                <p className={styles.statusHint}>
                    {isPttActive
                        ? '말하는 중...'
                        : aiSpeaking
                            ? 'AI 응답 중...'
                            : isInitialGreeting
                                ? 'AI 인사를 기다리는 중...'
                                : '마이크 버튼을 눌러 답변하세요'}
                </p>

                {/* 완료 버튼 */}
                {connected && !isInitialGreeting && (
                    <button
                        className={styles.completeButton}
                        onClick={handleCompleteDialogue}
                        disabled={loading || aiSpeaking || isPttActive}
                    >
                        대화 완료
                    </button>
                )}
            </div>
        </div>
    );
};

export default DialoguePage;