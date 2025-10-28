// src/components/Welcome/WelcomeHero.jsx
// import styles from './WelcomeHero.module.scss';
import React from 'react';

/**
 * Welcome 페이지 메인 히어로 섹션
 * 로고, 타이틀, 태그라인 표시
 */
const WelcomeHero = () => {
    return (
        <section className="welcome-hero">
            {/* 로고 아이콘 */}
            <div className="welcome-hero__logo">
                <div className="welcome-hero__logo-icon">D</div>
            </div>

            {/* 타이틀 */}
            <h1 className="welcome-hero__title">Dialogym</h1>

            {/* 태그라인 */}
            <p className="welcome-hero__tagline">
                AI와 함께하는 대화 훈련 플랫폼
            </p>
        </section>
    );
};

export default WelcomeHero;