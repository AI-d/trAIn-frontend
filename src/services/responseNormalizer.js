// src/services/responseNormalizer.js

/**
 * @fileoverview 서버 응답 포맷 정규화 유틸
 * @description 백엔드가 ApiResponse<T> 래퍼와 DTO 원형 응답을 혼재하므로,
 *   항상 { success, data, message, errorCode } 형태로 표준화합니다.
 */

/**
 * ApiResponse<T> 또는 DTO 원형을 표준형으로 정규화합니다.
 * @template T
 * @param {any} respData - axios response.data
 * @returns {{ success: boolean, data: T|null, message?: string, errorCode?: string }}
 */
export function unwrap(respData) {
    // null/undefined 체크
    if (!respData || typeof respData !== 'object') {
        return {success: false, data: null};
    }

    // ApiResponse 래퍼 형태인지 확인
    if ('success' in respData && 'data' in respData) {
        return {
            success: !!respData.success,
            data: respData.data ?? null,
            message: respData.message || null,
            errorCode: respData.errorCode || null,
        };
    }
    // 원형 DTO
    return {success: true, data: respData};
}
