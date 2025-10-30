// src/components/common/ErrorMessage.jsx
import styles from './ErrorMessage.module.scss';
import React from 'react';

/**
 * 에러 메시지 표시 컴포넌트
 *
 * @param {string} message - 표시할 에러 메시지
 * @param {string} type - 메시지 타입 ('error' | 'warning' | 'info')
 * @param {function} onClose - 닫기 버튼 핸들러 (선택)
 */
const ErrorMessage = ({ message, type = 'error', onClose }) => {
    if (!message) return null;

    return (
        <div className={`${styles['error-message']} ${styles[`error-message--${type}`]}`}>
            {/* 아이콘 */}
            <div className={styles['error-message__icon']}>
                {type === 'error' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 18.3334C14.6024 18.3334 18.3333 14.6025 18.3333 10.0001C18.3333 5.39771 14.6024 1.66675 10 1.66675C5.39763 1.66675 1.66667 5.39771 1.66667 10.0001C1.66667 14.6025 5.39763 18.3334 10 18.3334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 6.66675V10.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 13.3333H10.0083" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
                {type === 'warning' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.57465 3.21658L1.51632 15.0166C1.37079 15.2736 1.29379 15.5628 1.29215 15.8574C1.29051 16.1519 1.36429 16.4419 1.50703 16.7004C1.64977 16.9589 1.85696 17.1771 2.10923 17.3337C2.3615 17.4903 2.6502 17.5799 2.94965 17.5833H17.066C17.3654 17.5799 17.6541 17.4903 17.9064 17.3337C18.1587 17.1771 18.3658 16.9589 18.5086 16.7004C18.6513 16.4419 18.7251 16.1519 18.7235 15.8574C18.7218 15.5628 18.6448 15.2736 18.4993 15.0166L11.441 3.21658C11.2916 2.96697 11.0818 2.75789 10.8299 2.60973C10.578 2.46157 10.2924 2.37915 10.0013 2.36963C9.71026 2.3801 9.42539 2.4634 9.17396 2.6116C8.92253 2.75979 8.71302 2.96816 8.56465 3.21658H8.57465Z" stroke="currentColor" strokeWidth="1.S" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 7.5V10.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 14.1667H10.0083" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
                {type === 'info' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 18.3334C14.6024 18.3334 18.3333 14.6025 18.3333 10.0001C18.3333 5.39771 14.6024 1.66675 10 1.66675C5.39763 1.66675 1.66667 5.39771 1.66667 10.0001C1.66667 14.6025 5.39763 18.3334 10 18.3334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 13.3334V10.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 6.66675H10.0083" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )}
            </div>

            {/* 메시지 */}
            <span className={styles['error-message__text']}>{message}</span>

            {/* 닫기 버튼 (선택) */}
            {onClose && (
                <button
                    className={styles['error-message__close']}
                    onClick={onClose}
                    aria-label="닫기"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;