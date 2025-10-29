// src/components/Welcome/WelcomeHeader.jsx
// import styles from './WelcomeHeader.module.scss';
import React from 'react';

const WelcomeHeader = ({onSignupClick, isAuthenticated, onLogout}) => {
    return (
        <header className="welcome-header">
            <div className="welcome-header__container">
                <div className="welcome-header__logo">
                    <h1>Dialogym</h1>
                </div>

                <nav className="welcome-header__nav">
                    {/* 로그인 상태에 따라 다른 버튼 표시 */}
                    {!isAuthenticated ? (
                        <button
                            className="welcome-header__signup-button"
                            onClick={onSignupClick}
                        >
                            회원가입
                        </button>
                    ) : (
                        <button
                            className="welcome-header__logout-button"
                            onClick={onLogout}
                        >
                            로그아웃
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default WelcomeHeader;