// src/services/apiClient.js

import axios from 'axios';
import { getAccessToken } from '@/services/tokenManager';
import { unwrap } from '@/services/normalize';

/**
 * @fileoverview Axios 인스턴스 & 인터셉터 (401→RTR 자동 처리)
 * @note
 *  - Refresh는 HttpOnly 쿠키로 처리되므로 withCredentials=true 필수
 *  - 응답 데이터는 unwrap을 통해 래퍼/원형 혼재 대응
 */

function getBackendBaseUrl() {
    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    if (backendDomain && backendDomain.trim()) return backendDomain;

    const useDynamicHost = import.meta.env.VITE_USE_DYNAMIC_HOST === 'true';
    if (useDynamicHost) {
        const { hostname, protocol } = window.location;
        const backendPort = import.meta.env.VITE_BACKEND_PORT || '9090';
        return `${protocol}//${hostname}:${backendPort}`;
    }
    const backendPort = import.meta.env.VITE_BACKEND_PORT || '9090';
    return `http://localhost:${backendPort}`;
}

export const API_BASE_URL = getBackendBaseUrl();
export const API_ENDPOINT = `${API_BASE_URL}/api/v1`;

const apiClient = axios.create({
    baseURL: API_ENDPOINT,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000, // 필요 시 업로드 전용 별도 인스턴스 권장 (30~60초)
});

/** Request: Authorization 주입 */
apiClient.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();
        if (accessToken) {
            config.headers = config.headers || {}; // 엣지 방어
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/** 401 → Refresh Queue */
let isRefreshing = false;
/** @type {{ resolve:(t:string)=>void, reject:(e:any)=>void }[]} */
let refreshQueue = [];

function resolveQueue(newToken) {
    refreshQueue.forEach((p) => p.resolve(newToken));
    refreshQueue = [];
}
function rejectQueue(err) {
    refreshQueue.forEach((p) => p.reject(err));
    refreshQueue = [];
}

/** Response: 401 처리 & RTR */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 네트워크 오류/타 상태, 혹은 이미 재시도한 요청은 그대로 throw
        if (!error.response || error.response.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // refresh 자기 자신 401이면 세션 초기화 & 로그인 페이지로
        if (originalRequest.url?.endsWith('/users/refresh')) {
            try {
                const { useAuthStore } = await import('@/stores/authStore');
                useAuthStore.getState().clearAuth();
            } finally {
                const next = encodeURIComponent(window.location.pathname + window.location.search);
                window.location.href = `/auth/login?next=${next}`;
            }
            return Promise.reject(error);
        }

        // 이미 refresh 진행 중이면 큐에 대기
        if (isRefreshing) {
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

        // 첫 401 케이스: refresh 시도
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshResp = await apiClient.post('/users/refresh'); // 쿠키기반, 바디 불필요
            const normalized = unwrap(refreshResp.data);
            const newAccessToken = normalized?.data?.accessToken || normalized?.data;

            if (!newAccessToken) throw new Error('No access token in refresh response.');

            // store 반영
            const { useAuthStore } = await import('@/stores/authStore');
            useAuthStore.getState().setAccessToken(newAccessToken);

            // 대기중 요청들 처리
            resolveQueue(newAccessToken);

            // 원요청 재시도
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
        } catch (refreshErr) {
            rejectQueue(refreshErr);
            try {
                const { useAuthStore } = await import('@/stores/authStore');
                useAuthStore.getState().clearAuth();
            } finally {
                const next = encodeURIComponent(window.location.pathname + window.location.search);
                window.location.href = `/auth/login?next=${next}`;
            }
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;
