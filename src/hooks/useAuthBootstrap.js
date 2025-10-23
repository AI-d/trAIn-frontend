// src/hooks/useAuthBootstrap.js

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * @fileoverview 앱 최초 진입 시:
 *  - ?code= 존재 → 교환 → URL 정리
 *  - 아니면 RT→AT 초기화 시도
 */
export function useAuthBootstrap() {
    const exchangeCode = useAuthStore((s) => s.exchangeCode);
    const initializeAuth = useAuthStore((s) => s.initializeAuth);

    useEffect(() => {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        (async () => {
            try {
                if (code) {
                    await exchangeCode(code);
                    // URL에서 code 제거
                    url.searchParams.delete('code');
                    window.history.replaceState({}, '', url.pathname + (url.search ? `?${url.searchParams}` : ''));
                } else {
                    await initializeAuth();
                }
            } catch {
                // 무시: store가 unauthenticated로 알아서 정리
            }
        })();
    }, [exchangeCode, initializeAuth]);
}
