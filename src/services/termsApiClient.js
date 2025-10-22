// src/services/termsApiClient.js

import apiClient from '@/services/apiClient';
import {unwrap} from '@/services/normalize';

/**
 * @fileoverview 약관 관련 API
 * @description JSDoc 가이드라인('jsdoc-guide.md')을 준수하여 수정.
 */

/**
 * 현재 활성화된 모든 약관 목록을 조회합니다.
 * (GET /api/v1/terms)
 *
 * @async
 * @returns {Promise<import('./types').TermsResponseDto[]>} 활성 약관 목록 DTO 배열
 * @throws {Error} API 호출 실패 시
 * @see {TermsController#getActiveTerms}
 */
export async function getActiveTerms() {
    const {data} = await apiClient.get('/terms');
    return unwrap(data).data; // TermsResponseDto[]
}

/**
 * 현재 로그인한 사용자의 약관 동의 내역을 조회합니다.
 * (GET /api/v1/terms/consent)
 *
 * @async
 * @returns {Promise<import('./types').UserConsentResponseDto[]>} 사용자 약관 동의 DTO 배열
 * @throws {Error} API 호출 실패 시
 * @see {TermsController#getMyConsents}
 */
export async function getMyConsents() {
    const {data} = await apiClient.get('/terms/consent');
    return unwrap(data).data; // UserConsentResponseDto[]
}

/**
 * 사용자의 약관 동의(주로 마케팅 등 선택 약관) 상태를 변경합니다.
 * (PUT /api/v1/terms/consent)
 *
 * @async
 * @param {import('./types').ConsentUpdateRequestDto} payload - 변경할 약관 동의 정보
 * @returns {Promise<string>} 성공 메시지
 * @throws {Error} API 호출 실패 시
 * @see {TermsController#updateMyConsents}
 */
export async function updateMyConsents(payload) {
    const {data} = await apiClient.put('/terms/consent', payload);
    return unwrap(data).message; // "약관 동의 상태가 변경되었습니다."
}