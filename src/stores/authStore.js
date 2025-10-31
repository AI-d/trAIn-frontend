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
                    // localStorage에서 accessToken 확인
                    const storedAccessToken = localStorage.getItem('accessToken');

                    if (storedAccessToken) {
                        // accessToken이 있으면 store에 설정하고 사용자 정보 가져오기 시도
                        set({ accessToken: storedAccessToken });

                        try {
                            const userProfile = await userService.getMyProfile();
                            set({
                                status: 'authenticated',
                                user: userProfile,
                                isInitialized: true,
                            });
                            return;
                        } catch (error) {
                            // accessToken이 만료되었을 수 있음 - 아래 refresh 로직으로 진행
                            console.log('저장된 accessToken 만료, refresh 시도');
                        }
                    }

                    // accessToken이 없거나 만료된 경우, refresh 시도 (쿠키 기반)
                    const refreshResp = await apiClient.post('/users/refresh');
                    const newAccessToken = refreshResp.data?.data?.accessToken;

                    if (!newAccessToken) {
                        throw new Error('No access token in refresh response');
                    }

                    localStorage.setItem('accessToken', newAccessToken);
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
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

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

                    // 토큰 저장
                    localStorage.setItem('accessToken', resp.accessToken);
                    if (resp.refreshToken) {
                        localStorage.setItem('refreshToken', resp.refreshToken);
                    }

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

                    // 토큰 저장
                    localStorage.setItem('accessToken', resp.accessToken);
                    if (resp.refreshToken) {
                        localStorage.setItem('refreshToken', resp.refreshToken);
                    }

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

                    // 토큰 저장
                    localStorage.setItem('accessToken', resp.accessToken);
                    if (resp.refreshToken) {
                        localStorage.setItem('refreshToken', resp.refreshToken);
                    }

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
