// src/components/Auth/SocialButtonGroup.jsx
// import styles from './SocialButtonGroup.module.scss';
import React from 'react';
import SocialButton from './SocialButton';

/**
 * 소셜 로그인 버튼 그룹 컴포넌트
 * Google, Kakao, Naver 버튼을 표시
 *
 * @param {function} onSocialLogin - 소셜 로그인 핸들러 (provider를 인자로 받음)
 */
const SocialButtonGroup = ({ onSocialLogin }) => {
    const handleSocialLogin = (provider) => {
        // 소셜 로그인 처리
        if (onSocialLogin) {
            onSocialLogin(provider);
        } else {
            // 기본 동작: OAuth2 엔드포인트로 리디렉트
            window.location.href = `/oauth2/authorization/${provider}`;
        }
    };

    return (
        <div className="social-button-group">
            <SocialButton provider="google" onClick={handleSocialLogin} />
            <SocialButton provider="kakao" onClick={handleSocialLogin} />
            <SocialButton provider="naver" onClick={handleSocialLogin} />
        </div>
    );
};

export default SocialButtonGroup;