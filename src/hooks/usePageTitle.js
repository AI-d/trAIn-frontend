// src/hooks/usePageTitle.js

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 페이지 경로별 타이틀 매핑
const pageTitles = {
    '/': 'Dialogym - 대화 훈련 플랫폼',
    '/login': 'Dialogym - 로그인',
    '/signup': 'Dialogym - 회원가입',
    '/email-verification': 'Dialogym - 이메일 인증',
    '/social-signup': 'Dialogym - 소셜 회원가입',
    '/callback': 'Dialogym - 로그인 처리 중',
    '/scenarios': 'Dialogym - 시나리오 목록',
    '/dialogue': 'Dialogym - 대화 훈련',
    '/create': 'Dialogym - 시나리오 생성',
    '/my-profile': 'Dialogym - 내 프로필',
    '/feedback': 'Dialogym - 피드백',
};

export default function usePageTitle() {
    const location = useLocation();

    useEffect(() => {
        // 현재 경로에 맞는 타이틀 찾기
        // 동적 경로 처리 (/feedback/:sessionId 등)
        const pathname = location.pathname;
        let title = pageTitles[pathname];
        
        if (!title) {
            // 동적 경로 매칭
            if (pathname.startsWith('/feedback/')) {
                title = 'Dialogym - 피드백';
            } else {
                title = 'Dialogym';
            }
        }
        
        document.title = title;
    }, [location.pathname]);
}
