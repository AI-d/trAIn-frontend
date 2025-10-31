// src/services/feedbackService.js

import apiClient from '@/services/apiClient';
import { unwrap } from '@/utils/normalize';

/**
 * @fileoverview 피드백 관련 API 모듈
 */

/**
 * AI 피드백 생성
 * @param {string} sessionId - 대화 세션 ID
 * @returns {Promise<import('./types').FeedbackResponseDto>}
 */
export async function generateFeedback(sessionId) {
    const { data } = await apiClient.post(`/feedbacks/sessions/${sessionId}`, {}, {
        timeout: 60000 // AI 피드백 생성은 시간이 오래 걸릴 수 있으므로 60초로 설정
    });
    return unwrap(data).data;
}

/**
 * 피드백 조회 (개별)
 * @param {string} sessionId - 대화 세션 ID
 * @returns {Promise<import('./types').FeedbackResponseDto>}
 */
export async function getFeedback(sessionId) {
    const { data } = await apiClient.get(`/feedbacks/${sessionId}`);
    return unwrap(data).data;
}

/**
 * 개선안 선택
 * @param {string} sessionId - 대화 세션 ID
 * @param {'A'|'B'|'C'} choice - 선택한 개선안 (A, B, C 중 하나)
 * @returns {Promise<import('./types').FeedbackResponseDto>}
 */
export async function chooseFeedbackAlternative(sessionId, choice) {
    const { data } = await apiClient.put(`/feedbacks/${sessionId}/choice`, {
        chosenAlternative: choice
    });
    return unwrap(data).data;
}

/**
 * 사용자별 피드백 통계 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<import('./types').FeedbackStatsResponseDto>}
 */
export async function getFeedbackStats(userId) {
    const { data } = await apiClient.get(`/feedbacks/users/${userId}/stats`);
    return unwrap(data).data;
}

/**
 * 사용자별 피드백 히스토리 조회 (페이징)
 * @param {number} userId - 사용자 ID
 * @param {Object} params - 페이징 파라미터
 * @param {number} [params.page=0] - 페이지 번호 (0부터 시작)
 * @param {number} [params.size=10] - 페이지 크기
 * @param {string} [params.sort='createdAt,desc'] - 정렬 조건
 * @returns {Promise<import('./types').FeedbackHistoryPageResponseDto>}
 */
export async function getFeedbackHistory(userId, params = {}) {
    const {
        page = 0,
        size = 10,
        sort = 'createdAt,desc'
    } = params;

    const { data } = await apiClient.get(`/feedbacks/users/${userId}/history`, {
        params: { page, size, sort }
    });
    return unwrap(data).data;
}

/**
 * 사용자별 전체 피드백 히스토리 조회 (페이징 없음)
 * @param {number} userId - 사용자 ID
 * @returns {Promise<import('./types').FeedbackHistoryResponseDto[]>}
 */
export async function getAllFeedbackHistory(userId) {
    const { data } = await apiClient.get(`/feedbacks/users/${userId}/history/all`);
    return unwrap(data).data;
}