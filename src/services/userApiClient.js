// src/services/userApiClient.js

import apiClient from '@/services/apiClient';
import { unwrap } from '@/services/normalize';

/**
 * @fileoverview 사용자 프로필 API
 */

export async function getMyProfile() {
    const { data } = await apiClient.get('/users/profile');
    return unwrap(data).data; // UserProfileResponseDto (원형)
}

export async function updateMyProfile(payload) {
    const { data } = await apiClient.put('/users/profile', payload);
    return unwrap(data).data; // 업데이트된 UserProfileResponseDto
}

export async function changePassword(payload) {
    const { data } = await apiClient.put('/users/password', payload);
    return unwrap(data).data; // message 등
}
