// src/components/Auth/callback/CallbackStatus.jsx
// import styles from './CallbackStatus.module.scss';
import React from 'react';

/**
 * 소셜 로그인 콜백 상태 표시 컴포넌트
 *
 * @param {string} status - 상태 ('loading' | 'success' | 'error')
 * @param {string} message - 표시할 메시지
 */
const CallbackStatus = ({status, message}) => {
    // 로딩 상태
    if (status === 'loading') {
        return (
            <div className="callback-status callback-status--loading">
                {/* 스피너 */}
                <div className="callback-status__spinner"/>

                {/* 메시지 */}
                <h2 className="callback-status__title">로그인 처리 중...</h2>
                <p className="callback-status__message">
                    {message || '잠시만 기다려주세요.'}
                </p>
            </div>
        );
    }

    // 성공 상태
    if (status === 'success') {
        return (
            <div className="callback-status callback-status--success">
                {/* 성공 아이콘 */}
                <div className="callback-status__icon callback-status__icon--success">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4"/>
                        <path d="M20 32L28 40L44 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </div>

                {/* 메시지 */}
                <h2 className="callback-status__title">로그인 성공!</h2>
                <p className="callback-status__message">
                    {message || '메인 페이지로 이동합니다...'}
                </p>
            </div>
        );
    }

    // 에러 상태
    if (status === 'error') {
        return (
            <div className="callback-status callback-status--error">
                {/* 에러 아이콘 */}
                <div className="callback-status__icon callback-status__icon--error">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="4"/>
                        <path d="M32 20V36" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                        <circle cx="32" cy="44" r="2" fill="currentColor"/>
                    </svg>
                </div>

                {/* 메시지 */}
                <h2 className="callback-status__title">로그인 실패</h2>
                <p className="callback-status__message">
                    {message || '로그인 처리 중 오류가 발생했습니다.'}
                </p>

                {/* 재시도 버튼 */}
                <button
                    className="callback-status__retry-button"
                    onClick={() => window.location.href = '/'}
                >
                    처음으로 돌아가기
                </button>
            </div>
        );
    }

    return null;
};

export default CallbackStatus;