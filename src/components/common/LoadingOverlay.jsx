// src/components/common/LoadingOverlay.jsx
import styles from './LoadingOverlay.module.scss';
import React from 'react';

/**
 * 로딩 오버레이 컴포넌트
 * 페이지 전체 또는 특정 영역에 로딩 상태를 표시
 *
 * @param {boolean} fullscreen - 전체 화면 로딩 여부 (기본: false)
 * @param {string} message - 로딩 메시지 (선택)
 * @param {string} size - 스피너 크기 ('small' | 'medium' | 'large', 기본: 'medium')
 */
const LoadingOverlay = ({ fullscreen = false, message, size = 'medium' }) => {
    return (
        <div className={`${styles['loading-overlay']} ${fullscreen ? styles['loading-overlay--fullscreen'] : ''}`}>
            <div className={styles['loading-overlay__content']}>
                {/* 스피너 */}
                <div className={`${styles['loading-overlay__spinner']} ${styles[`loading-overlay__spinner--${size}`]}`} />

                {/* 메시지 */}
                {message && (
                    <p className={styles['loading-overlay__message']}>{message}</p>
                )}
            </div>
        </div>
    );
};

export default LoadingOverlay;