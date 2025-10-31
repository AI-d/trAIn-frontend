// src/services/apiClient.js

import axios from 'axios';
import {getAccessToken} from '@/services/tokenManager';
import {unwrap} from '@/utils/normalize';

function getBackendBaseUrl() {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    if (baseUrl && baseUrl.trim()) return baseUrl;

    const useDynamicHost = import.meta.env.VITE_USE_DYNAMIC_HOST === 'true';
    const backendPort = import.meta.env.VITE_BACKEND_PORT || '9090';

    if (useDynamicHost) {
        const {hostname, protocol} = window.location;
        return `${protocol}//${hostname}:${backendPort}`;
    }
    return `http://localhost:${backendPort}`;
}

export const API_BASE_URL = getBackendBaseUrl();
export const API_ENDPOINT = `${API_BASE_URL}/api/v1`;

const apiClient = axios.create({
    baseURL: API_ENDPOINT,
    withCredentials: true,
    headers: {'Content-Type': 'application/json'},
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

function resolveQueue(newToken) {
    refreshQueue.forEach((p) => p.resolve(newToken));
    refreshQueue = [];
}

function rejectQueue(err) {
    refreshQueue.forEach((p) => p.reject(err));
    refreshQueue = [];
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

        if (isRefreshUrl) {
            try {
                const {useAuthStore} = await import('@/stores/authStore');
                useAuthStore.getState().forceLogout();
            } catch (err) {
                console.error('Failed to import authStore:', err);
            }
            return Promise.reject(error);
        }

        if (errorCode === 'AUTH_001') {
            console.log('🔒 액세스 토큰 만료 감지 (401 AUTH_001)');
            
            if (isRefreshing) {
                console.log('⏳ 이미 토큰 갱신 중 - 큐에 대기');
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

            try {
                console.log('🔄 액세스 토큰 재발급 시작...');
                const refreshResp = await apiClient.post('/users/refresh');
                const normalized = unwrap(refreshResp.data);
                const newAccessToken = normalized?.data?.accessToken || normalized?.data;

                if (!newAccessToken) throw new Error('No access token in refresh response.');

                console.log('✅ 액세스 토큰 재발급 성공:', newAccessToken.substring(0, 20) + '...');

                // 메모리(Zustand store)에만 새 토큰 저장
                const {useAuthStore} = await import('@/stores/authStore');
                const authStore = useAuthStore.getState();
                authStore.setAccessToken(newAccessToken);

                // refresh 성공 후 사용자 정보도 자동 갱신
                authStore.fetchUser();

                resolveQueue(newAccessToken);

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshErr) {
                console.error('❌ 액세스 토큰 재발급 실패:', refreshErr);
                rejectQueue(refreshErr);
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;