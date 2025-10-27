import React from 'react';
import {useRealtimeSession} from "@/hooks/useRealtimeSession.js";

/**
 * GPT Realtime + WebSocket 통합 테스트 컴포넌트
 *
 * 변경사항:
 * 1. WebSocket 추가: 백엔드와 실시간 통신
 * 2. 대화 내역 저장: 모든 transcript를 백엔드 DB에 실시간 저장
 * 3. 재연결 복구: 연결 끊김 시 자동 재연결 + 대화 내역 복구
 */
const AiRealtimeTest = () => {

    const scenarioId = 1;
    const userId = 1;

    const {
        connected,
        wsConnected,
        transcripts,
        loading,
        aiSpeaking,
        userSpeaking,
        reconnecting,
        initRealtimeConnection,
        handleUserToggle,
        handleEndSession,
        audioTagRef

    } = useRealtimeSession(scenarioId, userId)

    return (
        <div style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
            <h2>GPT Realtime 테스트 (WebSocket 통합)</h2>

            {/* 연결 상태 표시 */}
            <div style={{
                marginBottom: 20,
                padding: 10,
                background: '#f5f5f5',
                borderRadius: 5
            }}>
                <div style={{ display: 'flex', gap: 20 }}>
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
                        cursor: connected || loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '연결 중...' : (connected ? '연결됨' : '연결 시작')}
                </button>

                <button
                    onClick={handleEndSession}
                    disabled={!connected || loading || aiSpeaking}
                    style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        cursor: !connected || loading || aiSpeaking ? 'not-allowed' : 'pointer'
                    }}
                >
                    대화 종료
                </button>
            </div>

            {/* 말하기 버튼 */}
            <div style={{ marginBottom: 20 }}>
                <button
                    onClick={handleUserToggle}
                    disabled={aiSpeaking || !connected}
                    style={{
                        padding: '15px 30px',
                        fontSize: '16px',
                        background: aiSpeaking ? '#ccc' : (userSpeaking ? '#ff9800' : '#4caf50'),
                        color: '#fff',
                        border: 'none',
                        borderRadius: 5,
                        cursor: aiSpeaking || !connected ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    {aiSpeaking ? 'AI 말하는 중...' : (userSpeaking ? '🎤 말하는 중 (클릭해서 종료)' : '🎤 말하기')}
                </button>

                {aiSpeaking && (
                    <div style={{ marginTop: 10, color: '#666' }}>
                        AI가 응답 중입니다. 잠시만 기다려주세요...
                    </div>
                )}
            </div>

            {/* 대화 내역 */}
            <div>
                <h3>
                    대화 내역 ({transcripts.length})
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
                            대화를 시작하려면 "연결 시작" 버튼을 눌러주세요
                        </div>
                    ) : (
                        transcripts.map((t, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: 15,
                                    padding: 12,
                                    background: t.speaker === 'user' ? '#e3f2fd' : '#f5f5f5',
                                    borderRadius: 5,
                                    borderLeft: `4px solid ${t.speaker === 'user' ? '#2196f3' : '#4caf50'}`
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
            `}</style>
        </div>
    );
};

export default AiRealtimeTest;
