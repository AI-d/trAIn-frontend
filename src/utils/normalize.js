// src/services/normalize.js

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
    // 래퍼: { success, data, message, errorCode, timestamp... }
    if (
        respData &&
        Object.prototype.hasOwnProperty.call(respData, 'success') &&
        Object.prototype.hasOwnProperty.call(respData, 'data')
    ) {
        return {
            success: !!respData.success,
            data: respData.data ?? null,
            message: respData.message,
            errorCode: respData.errorCode,
        };
    }
    // 원형 DTO: 그대로 data로 간주
    return { success: true, data: respData ?? null };
}
