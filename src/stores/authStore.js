import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { setAccessTokenGetter } from '@/services/tokenManager';
import * as authApi from '@/services/authApiClient';
import * as userApi from '@/services/userApiClient';

/**
 * @fileoverview 인증 상태(Zustand)
 * @description AccessToken은 메모리에만 보관. RT는 HttpOnly 쿠키(서버)로 관리.
 */

const initialState = {
    user: null,
    accessToken: null,
    status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
    error: null,
};

export const useAuthStore = create(
    devtools(
        immer((set, get) => ({
            ...initialState,

            /** 앱 시작/새로고침 시 세션 복구 (RT로 AT 재발급) */
            initializeAuth: async () => {
                set({ status: 'loading' });
                try {
                    const { default: apiClient } = await import('@/services/apiClient');
                    const { data } = await apiClient.post('/users/refresh'); // 쿠키 기반
                    // unwrap 내부에서 plain/래퍼 모두 대응
                    const { unwrap } = await import('@/services/normalize');
                    const normalized = unwrap(data);
                    const newAccessToken = normalized?.data?.accessToken || normalized?.data;

                    if (!newAccessToken) throw new Error('No access token in refresh response.');

                    set({ accessToken: newAccessToken });
                    await get().fetchUser();
                } catch (error) {
                    get().clearAuth();
                }
            },

            /** 로컬 로그인 */
            login: async (credentials) => {
                set({ status: 'loading', error: null });
                try {
                    const resp = await authApi.login(credentials);
                    set({ accessToken: resp.accessToken });
                    await get().fetchUser();
                } catch (error) {
                    set({ status: 'unauthenticated', error: error.response?.data || error });
                    throw error;
                }
            },

            /** 소셜 기존회원: ?code= → 교환 */
            exchangeCode: async (code) => {
                set({ status: 'loading', error: null });
                try {
                    const resp = await authApi.exchangeToken(code); // { accessToken }
                    set({ accessToken: resp.accessToken });
                    await get().fetchUser();
                } catch (error) {
                    get().clearAuth(error.response?.data);
                }
            },

            /** 소셜 신규회원 완료 */
            completeSocialSignup: async (payload) => {
                set({ status: 'loading', error: null });
                try {
                    const resp = await authApi.completeSocialSignup(payload); // { accessToken, ... }
                    set({ accessToken: resp.accessToken });
                    await get().fetchUser();
                } catch (error) {
                    set({ status: 'unauthenticated', error: error.response?.data || error });
                    throw error;
                }
            },

            /** 로그아웃 (낙관적 업데이트 → 서버 쿠키 삭제 호출) */
            logout: async () => {
                get().clearAuth();
                try {
                    await authApi.logout();
                } catch (error) {
                    console.warn('Logout API failed:', error);
                }
            },

            /** 내 프로필 로드 */
            fetchUser: async () => {
                try {
                    const me = await userApi.getMyProfile();
                    set({ user: me, status: 'authenticated', error: null });
                } catch (error) {
                    get().clearAuth(error.response?.data);
                }
            },

            /** AccessToken 수동 세팅 (인터셉터 갱신 시 사용) */
            setAccessToken: (token) => set({ accessToken: token }),

            /** 인증 초기화 */
            clearAuth: (error = null) => set({ ...initialState, status: 'unauthenticated', error }),

            /** 에러 초기화 */
            clearError: () => set({ error: null }),
        })),
        { name: 'auth-store' }
    )
);

/** apiClient가 현재 AccessToken을 읽을 수 있도록 getter 주입 */
setAccessTokenGetter(() => useAuthStore.getState().accessToken);

/** 선택형 셀렉터 */
export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated');
export const useAuthUser = () => useAuthStore((s) => s.user);
