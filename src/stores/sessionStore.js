import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 시나리오 기반 세션 상태 관리 store
 */
const useSessionStore = create(
    persist(
        (set, get) => ({

            // 시나리오별 세션 관리
            // key: "scenario_{scenarioId}_user_{userId}"
            // value: { sessionId, status, scenarioId, userId, createdAt, lastActivity }
            sessions: {},

            // 세션 키 생성
            getSessionKey: (scenarioId, userId) => {
                return `scenario_${scenarioId}_user_${userId}`;
            },

            // 기존 세션 확인
            getExistingSession: (scenarioId, userId) => {
                const key = get().getSessionKey(scenarioId, userId);
                return get().sessions[key] || null;
            },

            // 세션 시작/생성
            startSession: (sessionId, scenarioId, userId) => {
                const key = get().getSessionKey(scenarioId, userId);
                const now = new Date().toISOString();
                
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [key]: {
                            sessionId,
                            status: 'ongoing',
                            scenarioId,
                            userId,
                            createdAt: now,
                            lastActivity: now
                        }
                    }
                }));
            },

            // 세션 재개
            resumeSession: (scenarioId, userId) => {
                const key = get().getSessionKey(scenarioId, userId);
                const now = new Date().toISOString();
                
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [key]: {
                            ...state.sessions[key],
                            status: 'ongoing',
                            lastActivity: now
                        }
                    }
                }));
            },

            // 세션 완료
            completeSession: (scenarioId, userId) => {
                const key = get().getSessionKey(scenarioId, userId);
                const now = new Date().toISOString();
                
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [key]: {
                            ...state.sessions[key],
                            status: 'completed',
                            lastActivity: now
                        }
                    }
                }));
            },

            // 세션 중단
            abandonSession: (scenarioId, userId) => {
                const key = get().getSessionKey(scenarioId, userId);
                const now = new Date().toISOString();
                
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [key]: {
                            ...state.sessions[key],
                            status: 'abandoned',
                            lastActivity: now
                        }
                    }
                }));
            },

            // 세션 실패 (재시도 가능)
            failSession: (scenarioId, userId, errorMessage) => {
                const key = get().getSessionKey(scenarioId, userId);
                const now = new Date().toISOString();
                
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [key]: {
                            ...state.sessions[key],
                            status: 'failed',
                            errorMessage: errorMessage || '연결 실패',
                            lastActivity: now
                        }
                    }
                }));
            },

            // 세션 상태 확인
            getSessionStatus: (scenarioId, userId) => {
                const session = get().getExistingSession(scenarioId, userId);
                return session?.status || null;
            },

            // 세션 완료 여부 확인
            isSessionCompleted: (scenarioId, userId) => {
                return get().getSessionStatus(scenarioId, userId) === 'completed';
            },

            // 세션 진행 중 여부 확인
            isSessionInProgress: (scenarioId, userId) => {
                return get().getSessionStatus(scenarioId, userId) === 'ongoing';
            },

            // 세션 실패 여부 확인
            isSessionFailed: (scenarioId, userId) => {
                return get().getSessionStatus(scenarioId, userId) === 'failed';
            },

            // 활동 시간 업데이트
            updateLastActivity: (scenarioId, userId) => {
                const key = get().getSessionKey(scenarioId, userId);
                const now = new Date().toISOString();
                
                set((state) => ({
                    sessions: {
                        ...state.sessions,
                        [key]: {
                            ...state.sessions[key],
                            lastActivity: now
                        }
                    }
                }));
            },

            // 오래된 세션 정리 (1일 이상)
            clearOldSessions: () => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 1);
                
                set((state) => {
                    const filteredSessions = {};
                    Object.entries(state.sessions).forEach(([key, session]) => {
                        const lastActivity = new Date(session.lastActivity);
                        if (lastActivity > sevenDaysAgo) {
                            filteredSessions[key] = session;
                        }
                    });
                    return { sessions: filteredSessions };
                });
            },
        }),
        {
            name: 'session-storage',
        }
    )
);
export default useSessionStore;