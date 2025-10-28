// src/components/Welcome/WelcomeFooter.jsx
// import styles from './WelcomeFooter.module.scss';
import React from 'react';

/**
 * Welcome 페이지 푸터 컴포넌트
 * 저작권 정보 표시
 */
const WelcomeFooter = () => {
    return (
        <footer className="welcome-footer">
            <p className="welcome-footer__copyright">
                © 2025 Aid. All rights reserved.
            </p>
        </footer>
    );
};

export default WelcomeFooter;