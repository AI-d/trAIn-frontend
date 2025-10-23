// src/services/tokenManager.js

/**
 * @fileoverview AccessToken getter를 store 외부에서 가져오기 위한 얇은 레이어
 * @description apiClient ↔ authStore 간 순환 의존성 방지용.
 *   - setAccessTokenGetter(fn): store에서 현재 AccessToken을 가져오는 함수를 주입
 *   - getAccessToken(): apiClient 인터셉터에서 현재 AccessToken 조회
 */

/** @type {() => (string|null)} */
let tokenGetter = () => null;

/**
 * AccessToken을 조회하는 getter를 주입합니다.
 * @param {() => (string|null)} fn - 현재 AccessToken을 반환하는 함수
 */
export function setAccessTokenGetter(fn) {
    tokenGetter = typeof fn === 'function' ? fn : () => null;
}

/**
 * 현재 AccessToken을 반환합니다.
 * @returns {(string|null)}
 */
export function getAccessToken() {
    return tokenGetter();
}
