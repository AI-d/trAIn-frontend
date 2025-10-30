// src/hooks/useAuthBootstrap.js
import {useEffect, useRef} from 'react';
import {useAuthStore} from '@/stores/authStore';

/**
 * 앱 최초 진입 시 인증 상태 초기화
 */
export function useAuthBootstrap() {
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    // 한 번만 실행되도록 ref 사용
    const hasInitialized = useRef(false);

    useEffect(() => {
        // 이미 실행했으면 스킵
        if (hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;

        const bootstrap = async () => {
            try {
                await initializeAuth();
            } catch (error) {
                console.error('[useAuthBootstrap] 인증 초기화 실패:', error);
                // 401 에러는 무시 (로그인 안 된 상태)
            }
        };

        bootstrap();
    }, []); // 빈 배열로 한 번만 실행
}