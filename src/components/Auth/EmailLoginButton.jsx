// src/components/Auth/EmailLoginButton.jsx
import styles from './EmailLoginButton.module.scss';
import React from 'react';

/**
 * 이메일 로그인 버튼 컴포넌트
 *
 * @param {function} onClick - 버튼 클릭 핸들러
 */
const EmailLoginButton = ({onClick}) => {
    return (
        <button
            className={`${styles['email-login-button']} email-login-button`}
            onClick={onClick}
            type="button"
        >
            <svg
                className={`${styles['email-login-button__icon']} email-login-button__icon`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M3.33333 3.33325H16.6667C17.5833 3.33325 18.3333 4.08325 18.3333 4.99992V14.9999C18.3333 15.9166 17.5833 16.6666 16.6667 16.6666H3.33333C2.41667 16.6666 1.66667 15.9166 1.66667 14.9999V4.99992C1.66667 4.08325 2.41667 3.33325 3.33333 3.33325Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M18.3333 5L10 10.8333L1.66667 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span className={`${styles['email-login-button__text']} email-login-button__text`}>이메일 로그인</span>
        </button>
    );
};

export default EmailLoginButton;