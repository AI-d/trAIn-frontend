// src/components/Welcome/WelcomeHero.jsx
import styles from './WelcomeHero.module.scss';
import logoSymbol from '@/assets/Dialogym_logo_symbol_bg_removal.png';

/**
 * Welcome 페이지 메인 히어로 섹션
 * 로고, 타이틀, 태그라인 표시
 */
const WelcomeHero = () => {
    return (
        <section className={`${styles['welcome-hero']} welcome-hero`}>
            {/* 로고 아이콘 */}
            <div className={`${styles['welcome-hero__logo']} welcome-hero__logo`}>
                <img 
                    src={logoSymbol} 
                    alt="Dialogym Logo" 
                    className={`${styles['welcome-hero__logo-icon']} welcome-hero__logo-icon`}
                />
            </div>

            {/* 타이틀 */}
            <h1 className={`${styles['welcome-hero__title']} welcome-hero__title`}>Dialogym</h1>

            {/* 태그라인 */}
            <p className={`${styles['welcome-hero__tagline']} welcome-hero__tagline`}>
                AI와 함께하는 대화 훈련 플랫폼
            </p>
        </section>
    );
};

export default WelcomeHero;