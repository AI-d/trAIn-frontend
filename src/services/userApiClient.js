// src/services/userApiClient.js

import apiClient from '@/services/apiClient';
import {unwrap} from '@/services/normalize';

/**
 * @fileoverview 사용자 프로필 API
 * @description JSDoc 가이드라인('jsdoc-guide.md')을 준수하여 수정.
 */

/**
 * 현재 로그인한 사용자의 프로필 정보를 조회합니다.
 * (GET /api/v1/users/profile)
 *
 * @async
 * @returns {Promise<import('./types').UserProfileResponseDto>} 사용자 프로필 DTO
 * @throws {Error} API 호출 실패 시
 * @see {UserController#getMyProfile}
 */
export async function getMyProfile() {
    const {data} = await apiClient.get('/users/profile');
    return unwrap(data).data; // UserProfileResponseDto
}

/**
 * 현재 로그인한 사용자의 프로필 정보를 수정합니다.
 * (PUT /api/v1/users/profile)
 *
 * @async
 * @param {import('./types').ProfileUpdateRequestDto} payload - 수정할 프로필 정보
 * @returns {Promise<import('./types').UserProfileResponseDto>} 업데이트된 사용자 프로필 DTO
 * @throws {Error} API 호출 실패 시
 * @see {UserController#updateMyProfile}
 */
export async function updateMyProfile(payload) {
    const {data} = await apiClient.put('/users/profile', payload);
    return unwrap(data).data; // 업데이트된 UserProfileResponseDto
}

/**
 * 현재 로그인한 사용자의 비밀번호를 변경합니다.
 * (PUT /api/v1/users/password)
 *
 * @async
 * @param {import('./types').PasswordChangeRequestDto} payload - 변경할 비밀번호 정보
 * @returns {Promise<string>} 성공 메시지
 * @throws {Error} API 호출 실패 시
 * @see {UserController#changePassword}
 */
export async function changePassword(payload) {
    const {data} = await apiClient.put('/users/password', payload);
    return unwrap(data).message; // "비밀번호가 성공적으로 변경되었습니다."
}