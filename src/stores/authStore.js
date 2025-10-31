// src/stores/authStore.js

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { setAccessTokenGetter } from '@/services/tokenManager';
import * as authService from '@/services/authService';
import * as userService from '@/services/userService';
import apiClient from '@/services/apiClient';

const initialState = {
    user: null,
    accessToken: null,
    status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
    error: null,
    isInitialized: false,
};

export const useAuthStore = create(
    devtools(
        immer((set, get) => ({
            ...initialState,

            initializeAuth: async () => {
                try {
                    // refresh 토큰(쿠키)으로 새 accessToken 발급 시도
                    const refreshResp = await apiClient.post('/users/refresh');
                    const newAccessToken = refreshResp.data?.data?.accessToken;

                    if (!newAccessToken) {
                        throw new Error('No access token in refresh response');
                    }

                    set({ accessToken: newAccessToken });

                    const userProfile = await userService.getMyProfile();

                    set({
                        status: 'authenticated',
                        user: userProfile,
                        isInitialized: true,
                    });

                } catch (error) {
                    console.error('인증 초기화 실패:', error);

                    // 401 에러는 정상 (로그아웃 상태)
                    set({
                        status: 'unauthenticated',
                        user: null,
                        isInitialized: true,
                    });
                }
            },

            login: async (credentials) => {
                set({ status: 'loading', error: null });
                try {
                    const resp = await authService.login(credentials);

                    // 토큰을 메모리(Zustand store)에만 저장
                    set({ accessToken: resp.accessToken });
                    await get().fetchUser();
                } catch (error) {
                    set({ status: 'unauthenticated', error: error.response?.data || error });
                    throw error;
                }
            },

            exchangeCode: async (code) => {
                set({ status: 'loading', error: null });
                try {
                    const resp = await authService.exchangeToken(code);

                    // 토큰을 메모리(Zustand store)에만 저장
                    set({ accessToken: resp.accessToken });
                    await get().fetchUser();
                } catch (error) {
                    set({ status: 'unauthenticated', error: error.response?.data || error });
                    throw error;
                }
            },

            completeSocialSignup: async (payload) => {
                set({ status: 'loading', error: null });
                try {
                    const resp = await authService.completeSocialSignup(payload);

                    // 토큰을 메모리(Zustand store)에만 저장
                    set({ accessToken: resp.accessToken });
                    await get().fetchUser();
                } catch (error) {
                    set({ status: 'unauthenticated', error: error.response?.data || error });
                    throw error;
                }
            },

            logout: async () => {
                get().clearAuth();
                try {
                    await authService.logout();
                } catch (error) {
                    console.warn('Logout API failed:', error);
                }
            },

            fetchUser: async () => {
                try {
                    const me = await userService.getMyProfile();
                    set({ user: me, status: 'authenticated', error: null });
                } catch (error) {
                    get().clearAuth(error.response?.data);
                }
            },

            setAccessToken: (token) => set({ accessToken: token }),

            clearAuth: (error = null) => set({
                ...initialState,
                status: 'unauthenticated',
                error,
                isInitialized: get().isInitialized
            }),

            forceLogout: () => {
                set({
                    ...initialState,
                    status: 'unauthenticated',
                    isInitialized: true
                });
            },

            clearError: () => set({ error: null }),
        })),
        { name: 'auth-store' }
    )
);

setAccessTokenGetter(() => useAuthStore.getState().accessToken);

export const useIsAuthenticated = () => useAuthStore((s) => s.status === 'authenticated');
export const useAuthUser = () => useAuthStore((s) => s.user);
