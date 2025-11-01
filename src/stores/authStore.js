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

// initializeAuth 중복 실행 방지
let isInitializing = false;
let initializePromise = null;

export const useAuthStore = create(
  devtools(
    immer((set, get) => ({
      ...initialState,

      initializeAuth: async () => {
        // 이미 초기화 완료되었으면 스킵
        if (get().isInitialized) {
          return;
        }

        // 이미 초기화 중이면 기존 Promise 반환
        if (isInitializing && initializePromise) {
          return initializePromise;
        }

        isInitializing = true;

        initializePromise = (async () => {
          try {
            // refresh 토큰(쿠키)으로 새 accessToken 발급 시도
            const refreshResp = await apiClient.post('/users/refresh', null, {
              validateStatus: (status) => status >= 200 && status < 600
            });

            // 401이면 로그아웃 상태 (정상)
            if (refreshResp.status === 401) {
              set({
                status: 'unauthenticated',
                user: null,
                isInitialized: true,
              });
              return;
            }

            // 500 등 서버 에러도 로그아웃 상태로 처리
            if (refreshResp.status !== 200) {
              console.warn(`토큰 갱신 실패 (${refreshResp.status}):`, refreshResp.data);
              set({
                status: 'unauthenticated',
                user: null,
                isInitialized: true,
              });
              return;
            }

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

            set({
              status: 'unauthenticated',
              user: null,
              isInitialized: true,
            });
          } finally {
            isInitializing = false;
            initializePromise = null;
          }
        })();

        return initializePromise;
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
        try {
          // 먼저 백엔드에 로그아웃 요청 (리프레시 토큰 무효화)
          await authService.logout();
        } catch (error) {
          console.warn('Logout API failed:', error);
        } finally {
          // 백엔드 호출 성공/실패와 관계없이 프론트엔드 상태 정리
          get().clearAuth();

          // refresh 상태 초기화 (동시성 문제 방지)
          try {
            const { resetRefreshState } = await import('@/services/apiClient');
            resetRefreshState();
          } catch (err) {
            console.error('Failed to reset refresh state:', err);
          }
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
