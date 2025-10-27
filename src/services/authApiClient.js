// src/services/authApiClient.js

import apiClient from '@/services/apiClient';
import {unwrap} from '@/services/normalize';

/**
 * @fileoverview 인증 관련 API 모듈
 */

/**
 * 로컬 회원가입
 * @param {import('./types').SignupRequestDto} payload
 * @returns {Promise<import('./types').SignupResponseDto>}
 */
export async function signup(payload) {
    const {data} = await apiClient.post('/users/signup', payload);
    return unwrap(data).data;
}

/**
 * 로컬 로그인
 * @param {{ email:string, password:string }} payload
 * @returns {Promise<import('./types').LoginResponseDto>}
 */
export async function login(payload) {
    const {data} = await apiClient.post('/users/login', payload);
    return unwrap(data).data; // { accessToken, ... }
}

/**
 * 로그아웃 (서버가 RT 쿠키 삭제)
 * @returns {Promise<string>} message
 */
export async function logout() {
    const {data} = await apiClient.post('/users/logout');
    return unwrap(data).message; // "성공적으로 로그아웃되었습니다."
}

/**
 * 일회용 코드 → AccessToken 교환 (소셜 기존회원)
 * @param {string} code
 * @returns {Promise<{ accessToken:string }>}
 */
export async function exchangeToken(code) {
    const {data} = await apiClient.post('/users/token/exchange', {code});
    return unwrap(data).data; // { accessToken }
}

/**
 * 이메일 인증 확인
 * @param {{ email:string, verificationCode:string, emailVerificationToken:string }} payload
 * @returns {Promise<import('./types').EmailVerificationResponseDto>}
 */
export async function verifyEmail(payload) {
    const {data} = await apiClient.post('/verification/email', payload);
    return unwrap(data).data;
}

/**
 * 이메일 인증 코드 재발송
 * @param {string} email
 * @returns {Promise<string>} message
 */
export async function resendVerificationEmail(email) {
    const {data} = await apiClient.post('/verification/email/resend', {email});
    return unwrap(data).message; // "인증 이메일이 재발송되었습니다."
}

/**
 * 소셜 신규회원 가입 완료
 * @param {import('./types').SocialSignupCompleteRequestDto} payload
 * @returns {Promise<import('./types').LoginResponseDto>}
 */
export async function completeSocialSignup(payload) {
    const {data} = await apiClient.post('/verification/social/complete', payload);
    return unwrap(data).data; // { accessToken, ... }
}