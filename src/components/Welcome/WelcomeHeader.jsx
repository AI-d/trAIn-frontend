// src/components/Welcome/WelcomeHeader.jsx
// import styles from './WelcomeHeader.module.scss';
import React from 'react';

/**
 * Welcome 페이지 헤더 컴포넌트
 * 회원가입 버튼만 표시
 *
 * @param {function} onSignupClick - 회원가입 버튼 클릭 핸들러
 */
const WelcomeHeader = ({ onSignupClick }) => {
    return (
        <header className="welcome-header">
            <div className="welcome-header__container">
                {/* 회원가입 버튼 */}
                <button
                    className="welcome-header__signup-btn"
                    onClick={onSignupClick}
                    type="button"
                >
                    회원가입
                </button>
            </div>
        </header>
    );
};

export default WelcomeHeader;