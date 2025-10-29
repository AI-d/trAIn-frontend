// src/components/Auth/SocialButton.jsx

import styles from './SocialButton.module.scss';
import React from 'react';

/**
 * 소셜 로그인 버튼 컴포넌트
 *
 * @param {string} provider - 소셜 제공자 ('google' | 'kakao' | 'naver')
 * @param {function} onClick - 버튼 클릭 핸들러
 */

const SocialButton = ({provider, onClick}) => {
    // 제공자별 설정
    const providerConfig = {
        google: {
            text: 'Google 로그인',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M18.1713 8.36788H17.5001V8.33329H10.0001V11.6666H14.7096C14.0226 13.6069 12.1763 15 10.0001 15C7.23885 15 5.00009 12.7612 5.00009 9.99996C5.00009 7.23871 7.23885 4.99996 10.0001 4.99996C11.2746 4.99996 12.4343 5.48079 13.3171 6.26621L15.6738 3.90954C14.1859 2.52204 12.1951 1.66663 10.0001 1.66663C5.39801 1.66663 1.66675 5.39788 1.66675 9.99996C1.66675 14.602 5.39801 18.3333 10.0001 18.3333C14.6022 18.3333 18.3334 14.602 18.3334 9.99996C18.3334 9.44121 18.2759 8.89579 18.1713 8.36788Z"
                        fill="#FFC107"/>
                    <path
                        d="M2.62756 6.12121L5.36548 8.12954C6.10631 6.29537 7.90048 5.00004 10.0005 5.00004C11.2755 5.00004 12.4351 5.48087 13.3176 6.26629L15.6743 3.90962C14.1863 2.52212 12.1955 1.66671 10.0005 1.66671C6.79923 1.66671 4.02339 3.47379 2.62756 6.12121Z"
                        fill="#FF3D00"/>
                    <path
                        d="M10.0002 18.3334C12.1527 18.3334 14.1081 17.5096 15.5869 16.17L13.0077 13.9875C12.1431 14.6452 11.0864 15.0009 10.0002 15C7.83274 15 5.99232 13.6179 5.29857 11.6892L2.58191 13.7829C3.96107 16.4817 6.76149 18.3334 10.0002 18.3334Z"
                        fill="#4CAF50"/>
                    <path
                        d="M18.1713 8.36796H17.5V8.33337H10V11.6667H14.7096C14.3809 12.5902 13.7889 13.3972 13.0067 13.988L13.0079 13.9871L15.587 16.1696C15.4046 16.3355 18.3333 14.1667 18.3333 10C18.3333 9.44129 18.2758 8.89587 18.1713 8.36796Z"
                        fill="#1976D2"/>
                </svg>
            ),
        },
        kakao: {
            text: 'Kakao 로그인',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M10 3.33337C5.95 3.33337 2.66666 5.90004 2.66666 9.08337C2.66666 11.15 4.09999 12.95 6.24999 14.0167L5.39166 17.3667C5.29166 17.7334 5.71666 18.0167 6.03333 17.7834L9.99999 14.8334C14.05 14.8334 17.3333 12.2667 17.3333 9.08337C17.3333 5.90004 14.05 3.33337 10 3.33337Z"
                        fill="currentColor"/>
                </svg>
            ),
        },
        naver: {
            text: 'Naver 로그인',
            icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M13.6167 10.7917L6.08333 2.5H2.5V17.5H6.38333V9.20833L13.9167 17.5H17.5V2.5H13.6167V10.7917Z"
                        fill="currentColor"/>
                </svg>
            ),
        },
    };

    const config = providerConfig[provider];

    if (!config) {
        console.error(`Unknown provider: ${provider}`);
        return null;
    }

    const buttonClasses = `${styles['social-button']} ${styles[`social-button--${provider}`]} social-button social-button--${provider}`;

    return (
        <button
            className={buttonClasses}
            onClick={() => onClick(provider)}
            type="button"
        >
            <span className={`${styles['social-button__icon']} social-button__icon`}>{config.icon}</span>
            <span className={`${styles['social-button__text']} social-button__text`}>{config.text}</span>
        </button>
    );
};


export default SocialButton;