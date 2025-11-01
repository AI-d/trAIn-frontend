// src/services/apiClient.js

import axios from 'axios';
import { getAccessToken } from '@/services/tokenManager';
import { unwrap } from '@/utils/normalize';

function getBackendBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (baseUrl && baseUrl.trim()) return baseUrl;

  const useDynamicHost = import.meta.env.VITE_USE_DYNAMIC_HOST === 'true';
  const backendPort = import.meta.env.VITE_BACKEND_PORT || '9090';

  if (useDynamicHost) {
    const { hostname, protocol } = window.location;
    return `${protocol}//${hostname}:${backendPort}`;
  }
  return `http://localhost:${backendPort}`;
}

export const API_BASE_URL = getBackendBaseUrl();
export const API_ENDPOINT = `${API_BASE_URL}/api/v1`;

const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshQueue = [];
let refreshPromise = null; // 진행 중인 refresh Promise 저장

function resolveQueue(newToken) {
  refreshQueue.forEach((p) => p.resolve(newToken));
  refreshQueue = [];
}

function rejectQueue(err) {
  refreshQueue.forEach((p) => p.reject(err));
  refreshQueue = [];
}

// 로그아웃 시 refresh 상태 초기화
export function resetRefreshState() {
  isRefreshing = false;
  refreshQueue = [];
  refreshPromise = null;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !error.response ||
      originalRequest._retry ||
      error.response.status !== 401 ||
      !error.response.data
    ) {
      return Promise.reject(error);
    }

    const errorCode = error.response.data.error;
    const isRefreshUrl = originalRequest.url?.endsWith('/users/refresh');

    // refresh URL의 401은 정상 응답으로 처리
    // 로그아웃 상태, 회원가입 전 신규 방문자, refresh 토큰 만료 등 앱 초기화 시 발생하는 401은 예외가 아님
    if (isRefreshUrl) {
      // validateStatus로 처리하는 호출자를 위해 에러 대신 response 반환
      if (originalRequest.validateStatus) {
        return Promise.resolve(error.response);
      }

      // validateStatus가 없는 일반 호출의 경우만 forceLogout
      try {
        const { useAuthStore } = await import('@/stores/authStore');
        useAuthStore.getState().forceLogout();
      } catch (err) {
        console.error('Failed to import authStore:', err);
      }
      return Promise.reject(error);
    }

    if (errorCode === 'AUTH_001') {
      console.log('🔒 액세스 토큰 만료 감지 (401 AUTH_001)');

      if (isRefreshing && refreshPromise) {
        console.log('⏳ 이미 토큰 갱신 중 - 기존 Promise 재사용');
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // refresh 로직을 Promise로 저장하여 재사용
      refreshPromise = (async () => {
        try {
          console.log('🔄 액세스 토큰 재발급 시작...');
          const refreshResp = await apiClient.post('/users/refresh');
          const normalized = unwrap(refreshResp.data);
          const newAccessToken = normalized?.data?.accessToken || normalized?.data;

          if (!newAccessToken) throw new Error('No access token in refresh response.');

          console.log('✅ 액세스 토큰 재발급 성공:', newAccessToken.substring(0, 20) + '...');

          // 메모리(Zustand store)에만 새 토큰 저장
          const { useAuthStore } = await import('@/stores/authStore');
          const authStore = useAuthStore.getState();
          authStore.setAccessToken(newAccessToken);

          // refresh 성공 후 사용자 정보도 자동 갱신
          await authStore.fetchUser();

          resolveQueue(newAccessToken);

          return newAccessToken;
        } catch (refreshErr) {
          console.error('❌ 액세스 토큰 재발급 실패:', refreshErr);
          rejectQueue(refreshErr);

          // refresh 실패 시 로그아웃 처리
          try {
            const { useAuthStore } = await import('@/stores/authStore');
            useAuthStore.getState().forceLogout();
          } catch (err) {
            console.error('Failed to force logout:', err);
          }

          throw refreshErr;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      try {
        const newAccessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
