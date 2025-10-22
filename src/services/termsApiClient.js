// src/services/termsApiClient.js

import apiClient from '@/services/apiClient';
import { unwrap } from '@/services/normalize';

/**
 * @fileoverview 약관 관련 API
 */

export async function getActiveTerms() {
    const { data } = await apiClient.get('/terms');
    return unwrap(data).data; // TermsResponseDto[]
}

export async function getMyConsents() {
    const { data } = await apiClient.get('/terms/consent');
    return unwrap(data).data; // UserConsentResponseDto[]
}

export async function updateMyConsents(payload) {
    const { data } = await apiClient.put('/terms/consent', payload);
    return unwrap(data).data; // message
}
