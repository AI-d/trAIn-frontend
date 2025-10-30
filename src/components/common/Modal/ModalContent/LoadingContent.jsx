// src/components/common/Modal/ModalContent/LoadingContent.jsx
// import styles from './LoadingContent.module.scss';
import React from 'react';

/**
 * 로딩 상태를 표시하는 모달 콘텐츠
 *
 * @param {object} data - { title: string, content: string }
 */
const LoadingContent = ({ data }) => {
    const { title, content } = data || {};

    return (
        <div className="loading-content">
            {/* 스피너 */}
            <div className="loading-content__spinner" />

            {/* 타이틀 */}
            <h3 className="loading-content__title">
                {title || 'Loading...'}
            </h3>

            {/* 설명 */}
            {content && (
                <p className="loading-content__description">
                    {content}
                </p>
            )}
        </div>
    );
};

export default LoadingContent;