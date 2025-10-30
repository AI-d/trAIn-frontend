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
 * @returns {Promise<import('./types').FeedbackResponseDto[]>}
 */
export async function getAllFeedbackHistory(userId) {
    const { data } = await apiClient.get(`/feedbacks/users/${userId}/history/all`);
    return unwrap(data).data;
}

/**
 * 특정 시나리오의 피드백 목록 조회
 * @param {number} userId - 사용자 ID
 * @param {number} scenarioId - 시나리오 ID
 * @param {Object} params - 페이징 파라미터
 * @param {number} [params.page=0] - 페이지 번호
 * @param {number} [params.size=10] - 페이지 크기
 * @param {string} [params.sort='createdAt,desc'] - 정렬 조건
 * @returns {Promise<import('./types').FeedbackHistoryPageResponseDto>}
 */
export async function getFeedbacksByScenario(userId, scenarioId, params = {}) {
    const {
        page = 0,
        size = 10,
        sort = 'createdAt,desc'
    } = params;

    const { data } = await apiClient.get(`/feedbacks/users/${userId}/scenarios/${scenarioId}`, {
        params: { page, size, sort }
    });
    return unwrap(data).data;
}

/**
 * 점수 등급별 피드백 조회
 * @param {number} userId - 사용자 ID
 * @param {'A'|'B'|'C'|'D'|'F'} grade - 점수 등급
 * @param {Object} params - 페이징 파라미터
 * @param {number} [params.page=0] - 페이지 번호
 * @param {number} [params.size=10] - 페이지 크기
 * @param {string} [params.sort='createdAt,desc'] - 정렬 조건
 * @returns {Promise<import('./types').FeedbackHistoryPageResponseDto>}
 */
export async function getFeedbacksByGrade(userId, grade, params = {}) {
    const {
        page = 0,
        size = 10,
        sort = 'createdAt,desc'
    } = params;

    const { data } = await apiClient.get(`/feedbacks/users/${userId}/grades/${grade}`, {
        params: { page, size, sort }
    });
    return unwrap(data).data;
}

/**
 * 최근 피드백 조회 (최신 N개)
 * @param {number} userId - 사용자 ID
 * @param {number} [limit=5] - 조회할 개수
 * @returns {Promise<import('./types').FeedbackResponseDto[]>}
 */
export async function getRecentFeedbacks(userId, limit = 5) {
    const { data } = await apiClient.get(`/feedbacks/users/${userId}/recent`, {
        params: { limit }
    });
    return unwrap(data).data;
}

/**
 * 피드백 삭제
 * @param {string} sessionId - 대화 세션 ID
 * @returns {Promise<string>} message
 */
export async function deleteFeedback(sessionId) {
    const { data } = await apiClient.delete(`/feedbacks/${sessionId}`);
    return unwrap(data).message; // "피드백이 삭제되었습니다."
}

/**
 * 개선 현황 조회 (진전도 분석)
 * @param {number} userId - 사용자 ID
 * @param {Object} params - 조회 옵션
 * @param {string} [params.period='month'] - 조회 기간 ('week', 'month', 'quarter', 'year')
 * @param {number} [params.scenarioId] - 특정 시나리오만 조회 (선택사항)
 * @returns {Promise<import('./types').ImprovementProgressResponseDto>}
 */
export async function getImprovementProgress(userId, params = {}) {
    const {
        period = 'month',
        scenarioId
    } = params;

    const queryParams = { period };
    if (scenarioId) {
        queryParams.scenarioId = scenarioId;
    }

    const { data } = await apiClient.get(`/feedbacks/users/${userId}/progress`, {
        params: queryParams
    });
    return unwrap(data).data;
}

/**
 * 약점 분석 조회
 * @param {number} userId - 사용자 ID
 * @param {Object} params - 조회 옵션
 * @param {number} [params.limit=10] - 상위 약점 개수
 * @param {string} [params.category] - 카테고리 필터 ('WORK', 'SOCIAL', 'ACADEMIC' 등)
 * @returns {Promise<import('./types').WeaknessAnalysisResponseDto>}
 */
export async function getWeaknessAnalysis(userId, params = {}) {
    const {
        limit = 10,
        category
    } = params;

    const queryParams = { limit };
    if (category) {
        queryParams.category = category;
    }

    const { data } = await apiClient.get(`/feedbacks/users/${userId}/weakness`, {
        params: queryParams
    });
    return unwrap(data).data;
}