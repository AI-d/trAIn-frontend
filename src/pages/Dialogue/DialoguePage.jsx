import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useRealtimeSession } from "@/hooks/useRealtimeSession.js";
import useSessionStore from "@/stores/sessionStore.js";
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

    // 세션 상태 관리
    const { getExistingSession } = useSessionStore();
    
    // 페이지 상태 관리
    const [pageStatus, setPageStatus] = useState('checking'); // 'checking' | 'blocked' | 'connecting'
    const [blockReason, setBlockReason] = useState('');

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

    // 세션 상태 체크
    useEffect(() => {
        if (!scenarioId) {
            setPageStatus('blocked');
            setBlockReason('시나리오 정보가 없습니다.');
            
            toast.error('시나리오 정보가 없습니다.\n시나리오 화면으로 이동합니다.', {
                duration: 2000,
            });

            setTimeout(() => navigate('/'), 2000);
            return;
        }

        // 세션 상태 확인
        const existingSession = getExistingSession(scenarioId, userId);
        if (existingSession) {
            const status = existingSession.status;
            
            if (status === 'completed') {
                setPageStatus('blocked');
                setBlockReason('완료된 시나리오입니다.\n다른 시나리오를 선택해주세요.');
            } else if (status === 'abandoned') {
                setPageStatus('blocked');
                setBlockReason('종료된 대화입니다.\n새로 시작하려면 페이지를 새로고침해주세요.');
            } else if (status === 'in_progress') {
                setPageStatus('blocked');
                setBlockReason('이미 진행 중인 시나리오입니다.\n완료 후 다시 시도해주세요.');
            } else {
                setPageStatus('connecting');
            }
        } else {
            setPageStatus('connecting');
        }
    }, [scenarioId, userId, getExistingSession, navigate]);

    // 연결 시작 (pageStatus가 'connecting'일 때만)
    useEffect(() => {
        if (pageStatus !== 'connecting') return;

        let isCancelled = false;

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
                    toast.error('연결에 실패했습니다.\n다시 시도해주세요.', { id: connectingToast, duration: 3000 });
                    console.error('❌ 연결 실패:', error);

                    setTimeout(() => {
                        if (!isCancelled) {
                            navigate('/');
                        }
                    }, 3000);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [pageStatus, scenarioId, initRealtimeConnection, navigate]);

    // 차단된 페이지 자동 이동
    useEffect(() => {
        if (pageStatus === 'blocked') {
            toast.error(blockReason, { duration: 3000 });
            setTimeout(() => navigate('/'), 3000);
        }
    }, [pageStatus, blockReason, navigate]);


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
            await handleEndSession(false); // 중단으로 처리
            toast.success('대화가 중단되었습니다!', { id: endingToast });

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
            await handleEndSession(true); // 완료로 처리
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
        if (loading) return 'AI 친구를 소환하는 중...';
        if (!connected) return '차원의 문을 여는 중...';
        if (!wsConnected) return '텔레파시 채널 연결 중...';
        if (isInitialGreeting) return 'AI가 인사를 준비하는 중...';
        return 'AI와 대화 중';
    };

    const getStatusColor = () => {
        if (loading || !connected || !wsConnected) return '#F59E0B'; // 주황
        if (isInitialGreeting) return '#6B8EE8'; // 블루
        return '#10B981'; // 초록
    };


    // 차단된 페이지 렌더링
    if (pageStatus === 'blocked') {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.blockedContainer}>
                    <div className={styles.blockedContent}>
                        <h2 className={styles.blockedTitle}></h2>
                        <p className={styles.blockedMessage}>{blockReason}</p>
                        <button 
                            className={styles.goBackButton}
                            onClick={() => navigate('/')}
                        >
                            시나리오 목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 세션 체크 중 렌더링
    if (pageStatus === 'checking') {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingContent}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>세션 확인 중...</p>
                    </div>
                </div>
            </div>
        );
    }

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
                        {!connected && <p className={styles.loadingSubtext}></p>}
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