import React from 'react';
import {useRealtimeSession} from "@/hooks/useRealtimeSession.js";

/**
 * GPT Realtime + WebSocket + PTT + VAD 통합 테스트 컴포넌트
 *
 * 변경사항:
 * 1. WebSocket 추가: 백엔드와 실시간 통신
 * 2. 대화 내역 저장: 모든 transcript를 백엔드 DB에 실시간 저장
 * 3. 재연결 복구: 연결 끊김 시 자동 재연결 + 대화 내역 복구
 * 4. PTT + VAD: 버튼 누르고 말하기, 침묵 자동 감지
 */
const AiTest = () => {

    const scenarioId = 2;
    const userId = 1;

    const {
        // 기존 상태
        connected,
        wsConnected,
        transcripts,
        loading,
        aiSpeaking,
        userSpeaking,
        reconnecting,

        // 신규 PTT/VAD 상태
        isPttActive,
        vadStatus,

        // 함수
        initRealtimeConnection,
        handleUserToggle,
        handleEndSession,

        // Refs
        audioTagRef

    } = useRealtimeSession(scenarioId, userId);

    /**
     * PTT 버튼 스타일 (상태에 따라 변경)
     */
    const getPttButtonStyle = () => {
        if (aiSpeaking) {
            return {
                background: '#ccc',
                cursor: 'not-allowed',
                animation: 'none'
            };
        }
        if (isPttActive) {
            if (vadStatus === 'speaking') {
                return {
                    background: '#4caf50',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)'
                };
            }
            if (vadStatus === 'processing') {
                return {
                    background: '#ff9800',
                    cursor: 'wait'
                };
            }
            return {
                background: '#2196f3',
                animation: 'pulse 1.5s ease-in-out infinite',
                boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)'
            };
        }
        return {
            background: '#4caf50',
            cursor: 'pointer'
        };
    };

    /**
     * PTT 버튼 텍스트
     */
    const getPttButtonText = () => {
        if (aiSpeaking) return '🤖 AI 말하는 중...';
        if (isPttActive) {
            if (vadStatus === 'speaking') return '🎤 말하는 중 (자동 감지)';
            if (vadStatus === 'processing') return '⏳ 처리 중...';
            return '👂 듣는 중...';
        }
        return '🔴 눌러서 말하기';
    };

    /**
     * VAD 상태 배지
     */
    const getVadStatusBadge = () => {
        const statusConfig = {
            idle: { color: '#999', text: '대기' },
            listening: { color: '#2196f3', text: '듣는 중' },
            speaking: { color: '#4caf50', text: '말하는 중' },
            processing: { color: '#ff9800', text: '처리 중' }
        };

        const config = statusConfig[vadStatus] || statusConfig.idle;

        return (
            <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: config.color,
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginLeft: '10px'
            }}>
                {config.text}
            </span>
        );
    };

    return (
        <div style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
            <h2>
                GPT Realtime 테스트 (PTT + VAD)
                {isPttActive && getVadStatusBadge()}
            </h2>

            {/* 연결 상태 표시 */}
            <div style={{
                marginBottom: 20,
                padding: 10,
                background: '#f5f5f5',
                borderRadius: 5
            }}>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                        <strong>WebRTC (GPT):</strong>{' '}
                        <span style={{ color: connected ? 'green' : 'red' }}>
                            {connected ? '✓ 연결됨' : '✗ 연결 안됨'}
                        </span>
                    </div>
                    <div>
                        <strong>WebSocket (백엔드):</strong>{' '}
                        <span style={{ color: wsConnected ? 'green' : 'red' }}>
                            {wsConnected ? '✓ 연결됨' : '✗ 연결 안됨'}
                        </span>
                    </div>
                    <div>
                        <strong>PTT:</strong>{' '}
                        <span style={{ color: isPttActive ? 'green' : 'gray' }}>
                            {isPttActive ? '✓ 활성' : '○ 비활성'}
                        </span>
                    </div>
                    <div>
                        <strong>VAD:</strong> {getVadStatusBadge()}
                    </div>
                </div>
            </div>

            {/* 재연결 중 배너 */}
            {reconnecting && (
                <div style={{
                    marginBottom: 20,
                    padding: 15,
                    background: '#ff9800',
                    color: 'white',
                    borderRadius: 5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <div className="spinner" style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>연결 끊김 감지. 재연결 중...</span>
                </div>
            )}

            {/* 제어 버튼 */}
            <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
                <button
                    onClick={initRealtimeConnection}
                    disabled={connected || loading}
                    style={{
                        background: connected ? '#4caf50' : '#2196f3',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: connected || loading ? 'not-allowed' : 'pointer',
                        opacity: connected || loading ? 0.6 : 1
                    }}
                >
                    {loading ? '연결 중...' : (connected ? '✓ 연결됨' : '🚀 연결 시작')}
                </button>

                <button
                    onClick={handleEndSession}
                    disabled={!connected || loading || aiSpeaking}
                    style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: !connected || loading || aiSpeaking ? 'not-allowed' : 'pointer',
                        opacity: !connected || loading || aiSpeaking ? 0.6 : 1
                    }}
                >
                    🛑 대화 종료
                </button>
            </div>

            {/* PTT 버튼 (클릭 토글 방식) */}
            <div style={{ marginBottom: 20 }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10
                }}>
                    {/* 메인 PTT 버튼 */}
                    <button
                        onClick={handleUserToggle}
                        disabled={aiSpeaking || !connected}
                        style={{
                            padding: '20px 40px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: aiSpeaking || !connected ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s',
                            opacity: aiSpeaking || !connected ? 0.6 : 1,
                            userSelect: 'none',
                            ...getPttButtonStyle()
                        }}
                    >
                        {getPttButtonText()}
                    </button>

                    {/* 사용 안내 */}
                    <div style={{
                        fontSize: '14px',
                        color: '#666',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        {isPttActive ? (
                            <span style={{ color: '#ff9800', fontWeight: 'bold' }}>
                                💡 말을 멈추면 자동으로 감지됩니다 (또는 다시 클릭하세요)
                            </span>
                        ) : (
                            '💡 버튼을 클릭하여 시작하세요'
                        )}
                    </div>
                </div>

                {/* AI 말하는 중 표시 */}
                {aiSpeaking && (
                    <div style={{
                        marginTop: 15,
                        padding: 10,
                        background: '#e3f2fd',
                        borderRadius: 5,
                        textAlign: 'center',
                        color: '#1976d2'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <div className="spinner" style={{
                                width: 16,
                                height: 16,
                                border: '2px solid rgba(25, 118, 210, 0.3)',
                                borderTopColor: '#1976d2',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }} />
                            <span>🤖 AI가 응답 중입니다. 잠시만 기다려주세요...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 사용 가이드 */}
            <div style={{
                marginBottom: 20,
                padding: 15,
                background: '#e8f5e9',
                borderRadius: 5,
                border: '1px solid #4caf50'
            }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
                    📖 PTT + VAD 사용 방법
                </h4>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                    <li><strong>1단계:</strong> "연결 시작" 버튼을 클릭하세요</li>
                    <li><strong>2단계:</strong> "눌러서 말하기" 버튼을 클릭하세요</li>
                    <li><strong>3단계:</strong> 말을 하세요</li>
                    <li><strong>4단계:</strong> 말을 멈추면 자동으로 감지되어 전송됩니다</li>
                    <li><strong>팁:</strong> 버튼을 다시 클릭해도 즉시 종료됩니다 (최대 30초)</li>
                </ul>
            </div>

            {/* 대화 내역 */}
            <div>
                <h3>
                    💬 대화 내역 ({transcripts.length})
                    {wsConnected && (
                        <span style={{
                            fontSize: '14px',
                            color: 'green',
                            marginLeft: 10
                        }}>
                            (실시간 저장 중 ✓)
                        </span>
                    )}
                </h3>

                <div style={{
                    minHeight: 300,
                    maxHeight: 500,
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: 5,
                    padding: 15,
                    background: '#fafafa'
                }}>
                    {transcripts.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            color: '#999',
                            padding: 50
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: 20 }}>💬</div>
                            <div>대화를 시작하려면 "연결 시작" 버튼을 눌러주세요</div>
                        </div>
                    ) : (
                        transcripts.map((t, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: 15,
                                    padding: 12,
                                    background: t.speaker === 'user' ? '#e3f2fd' : '#f1f8e9',
                                    borderRadius: 5,
                                    borderLeft: `4px solid ${t.speaker === 'user' ? '#2196f3' : '#4caf50'}`,
                                    opacity: t.isTemp ? 0.6 : 1,
                                    fontStyle: t.isTemp ? 'italic' : 'normal'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: 5
                                }}>
                                    <strong style={{ color: t.speaker === 'user' ? '#1976d2' : '#388e3c' }}>
                                        {t.speaker === 'user' ? '👤 사용자' : '🤖 AI'}
                                    </strong>
                                    <span style={{ fontSize: '12px', color: '#999' }}>
                                        {new Date(t.timestamp).toLocaleTimeString('ko-KR')}
                                    </span>
                                </div>
                                <div style={{ lineHeight: 1.5 }}>
                                    {t.text}
                                    {t.isTemp && (
                                        <span style={{
                                            marginLeft: 10,
                                            fontSize: '12px',
                                            color: '#ff9800'
                                        }}>
                                            ⏳
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {transcripts.length > 0 && (
                    <div style={{
                        marginTop: 10,
                        fontSize: '14px',
                        color: '#666',
                        textAlign: 'right'
                    }}>
                        💾 모든 대화는 자동으로 저장됩니다
                    </div>
                )}
            </div>

            {/* 오디오 재생 */}
            <audio ref={audioTagRef} autoPlay playsInline style={{ display: 'none' }}></audio>

            {/* CSS 애니메이션 */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
                    }
                }
            `}</style>
        </div>
    );
};

export default AiTest;