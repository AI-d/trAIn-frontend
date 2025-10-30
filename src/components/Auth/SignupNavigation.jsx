// src/components/Auth/SignupNavigation.jsx
import styles from './SignupNavigation.module.scss';
import React from 'react';

/**
 * 회원가입 단계 네비게이션 컴포넌트
 *
 * @param {number} currentStep - 현재 단계 (1 or 2)
 */
const SignupNavigation = ({currentStep}) => {
    return (
        <div className={styles['signup-navigation']}>
            <div className={`${styles['signup-navigation__step']} ${currentStep === 1 ? styles['signup-navigation__step--active'] : ''}`}>
                <span className={styles['signup-navigation__step-number']}>1</span>
                <span className={styles['signup-navigation__step-label']}>약관 동의</span>
            </div>

            <div className={styles['signup-navigation__divider']}/>

            <div className={`${styles['signup-navigation__step']} ${currentStep === 2 ? styles['signup-navigation__step--active'] : ''}`}>
                <span className={styles['signup-navigation__step-number']}>2</span>
                <span className={styles['signup-navigation__step-label']}>정보 입력</span>
            </div>
        </div>
    );
};

export default SignupNavigation;