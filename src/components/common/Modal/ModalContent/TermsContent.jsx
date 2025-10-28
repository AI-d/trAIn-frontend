// src/components/common/Modal/ModalContent/TermsContent.jsx
// import styles from './TermsContent.module.scss';
import React from 'react';

/**
 * 약관 상세 내용을 표시하는 모달 콘텐츠
 *
 * @param {object} data - { title: string, content: string (HTML) }
 */
const TermsContent = ({ data }) => {
    const { title, content } = data || {};

    return (
        <div className="terms-content">
            {/* 타이틀 */}
            <h2 className="terms-content__title">
                {title || '약관 상세'}
            </h2>

            {/* 약관 내용 (HTML) */}
            <div
                className="terms-content__body"
                dangerouslySetInnerHTML={{ __html: content || '<p>약관 내용을 불러오는 중...</p>' }}
            />
        </div>
    );
};

export default TermsContent;