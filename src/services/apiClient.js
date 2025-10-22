// src/services/apiClient.js

import axios from 'axios';
import {getAccessToken} from '@/services/tokenManager';
import {unwrap} from '@/services/normalize';

/**
 * @fileoverview Axios 인스턴스 & 인터셉터 (401→RTR 자동 처리)
 * @note
 * - Refresh는 HttpOnly 쿠키로 처리되므로 withCredentials=true 필수
 * - 응답 데이터는 unwrap을 통해 래퍼/원형 혼재 대응
 * - JSDoc은 'jsdoc-guide.md' 문서를 따릅니다.
 */

/**
 * 환경 변수(VITE_*)를 기반으로 백엔드 API의 기본 URL을 결정합니다.
 * VITE_BACKEND_DOMAIN이 최우선으로 사용되며,
 * VITE_USE_DYNAMIC_HOST가 true이면 현재 window.location을 사용합니다.
 *
 * @returns {string} API 기본 URL (e.g., "http://localhost:9090")
 */
function getBackendBaseUrl() {
    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    if (backendDomain && backendDomain.trim()) return backendDomain;

    const useDynamicHost = import.meta.env.VITE_USE_DYNAMIC_HOST === 'true';
    if (useDynamicHost) {
        const {hostname, protocol} = window.location;
        const backendPort = import.meta.env.VITE_BACKEND_PORT || '9090';
        return `${protocol}//${hostname}:${backendPort}`;
    }
    const backendPort = import.meta.env.VITE_BACKEND_PORT || '9090';
    return `http://localhost:${backendPort}`;
}

/** API 서버의 기본 URL (포트 포함) */
export const API_BASE_URL = getBackendBaseUrl();
/** API 요청의 기본 엔드포인트 (버전 포함) */
export const API_ENDPOINT = `${API_BASE_URL}/api/v1`;

/**
 * 프로젝트 전역에서 사용되는 Axios 인스턴스.
 * baseURL, withCredentials, 인터셉터가 사전 설정되어 있습니다.
 */
const apiClient = axios.create({
    baseURL: API_ENDPOINT,
    withCredentials: true,
    headers: {'Content-Type': 'application/json'},
    timeout: 10000, // 필요 시 업로드 전용 별도 인스턴스 권장 (30~60초)
});

/**
 * (Request Interceptor)
 * 모든 API 요청 헤더에 Access Token을 주입합니다.
 *
 * @param {Object} config - Axios 요청 설정 (AxiosRequestConfig)
 * @returns {Object} 수정된 요청 설정
 */
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

/** 토큰 갱신이 진행 중인지 여부를 나타내는 플래그 */
let isRefreshing = false;

/**
 * @typedef {Object} RefreshPromise
 * @property {function(string): void} resolve - 새 토큰으로 요청을 재시도하는 resolve 함수
 * @property {function(*): void} reject - 요청을 실패 처리하는 reject 함수
 */
/**
 * 토큰 갱신을 기다리는 요청 큐
 * @type {Array<RefreshPromise>}
 */
let refreshQueue = [];

/**
 * 토큰 갱신 성공 시, 대기 중인 모든 요청을 새 토큰으로 재시도합니다.
 *
 * @param {string} newToken - 새로 발급된 Access Token
 */
function resolveQueue(newToken) {
    refreshQueue.forEach((p) => p.resolve(newToken));
    refreshQueue = [];
}

/**
 * 토큰 갱신 실패 시, 대기 중인 모든 요청을 실패 처리합니다.
 *
 * @param {*} err - 토큰 갱신 실패 에러
 */
function rejectQueue(err) {
    refreshQueue.forEach((p) => p.reject(err));
    refreshQueue = [];
}

/**
 * (Response Interceptor - Error Handler)
 * API 응답 오류를 처리합니다.
 *
 * JSDoc 가이드라인에 따라 상세 설명은 각 로직 블록에 인라인 주석으로 배치합니다.
 *
 * @async
 * @param {Object} error - Axios 에러 객체 (AxiosError)
 * @returns {Promise<Object>} 성공 시 재시도된 요청의 응답
 * @throws {Object} 처리 불가능한 에러 또는 토큰 갱신 실패 에러
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. 네트워크 오류, 재시도 요청, 401이 아니거나, 에러 DTO가 없는 경우 즉시 reject
        if (
            !error.response ||
            originalRequest._retry ||
            error.response.status !== 401 ||
            !error.response.data
        ) {
            return Promise.reject(error);
        }

        // 2. 백엔드 에러 코드 확인 (GlobalExceptionHandler, JwtAuthenticationEntryPoint 참조)
        const errorCode = error.response.data.error; // ex: "AUTH_001", "AUTH_003"
        const isRefreshUrl = originalRequest.url?.endsWith('/users/refresh');

        // 3. [최종 실패] 토큰 갱신(/users/refresh) 요청 자체가 401인 경우 (RT 만료)
        //    (URL만으로 분기해도 안전합니다.)
        if (isRefreshUrl) {
            try {
                const {useAuthStore} = await import('@/stores/authStore');
                useAuthStore.getState().clearAuth();
            } finally {
                const next = encodeURIComponent(window.location.pathname + window.location.search);
                // TODO: '/auth/login' 경로는 TJ님의 라우터 설정에 맞게 수정이 필요할 수 있습니다.
                window.location.href = `/auth/login?next=${next}`;
            }
            return Promise.reject(error);
        }

        // 4. [갱신 시도] AT 만료로 인한 401(AUTH_001)인 경우
        // 백엔드 분석(JwtAuthenticationEntryPoint) 결과, AT 만료 시 'AUTH_001'이 반환됩니다.
        // 'AUTH_003'(로그인 실패) 등 다른 401은 갱신을 시도하지 않습니다.
        if (errorCode === 'AUTH_001') {
            // 4a. 이미 갱신 중이면 큐에 대기
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

            // 4b. 갱신 시작
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // (백엔드 UserController, AuthService 참조)
                const refreshResp = await apiClient.post('/users/refresh');
                const normalized = unwrap(refreshResp.data);
                // (백엔드 TokenRefreshResponseDto 참조)
                const newAccessToken = normalized?.data?.accessToken || normalized?.data;

                if (!newAccessToken) throw new Error('No access token in refresh response.');

                // store 반영
                const {useAuthStore} = await import('@/stores/authStore');
                useAuthStore.getState().setAccessToken(newAccessToken);

                // 대기중 요청들 처리
                resolveQueue(newAccessToken);

                // 원요청 재시도
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch (refreshErr) {
                // 갱신 중 예외 발생 시 (RT 만료 등), 대기 큐 비우기
                rejectQueue(refreshErr);

                // 갱신 실패 시 로그아웃 처리는 'refreshErr'가 401일 때
                // 이 인터셉터의 '3번' 블록에서 자동으로 처리되므로,
                // 여기서는 에러를 그대로 반환합니다.
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        // 5. 그 외 모든 401 (ex: 'AUTH_003' 로그인 실패)은 즉시 reject
        //    (authStore.login 등의 catch 블록에서 처리할 수 있도록)
        return Promise.reject(error);
    }
);

export default apiClient;