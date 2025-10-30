// src/components/Auth/signup/terms/TermsItem.jsx
import styles from './TermsItem.module.scss';
import React from 'react';

/**
 * 개별 약관 동의 아이템 컴포넌트
 *
 * @param {object} term - 약관 정보 { termsId, title, required }
 * @param {boolean} checked - 체크 여부
 * @param {function} onChange - 체크 변경 핸들러
 * @param {function} onViewDetail - 상세 보기 핸들러
 */
const TermsItem = ({term, checked, onChange, onViewDetail}) => {
    const {termsId, title, required} = term;

    // title에서 (필수) 또는 (선택) 제거
    const cleanTitle = title.replace(/\(필수\)|\(선택\)/g, '').trim();

    return (
        <div className={styles['terms-item']}>
            <label className={styles['terms-item__label']}>
                {/* 체크박스 */}
                <input
                    type="checkbox"
                    className={styles['terms-item__checkbox']}
                    checked={checked}
                    onChange={(e) => onChange(termsId, e.target.checked)}
                />

                {/* 약관 제목 */}
                <span className={styles['terms-item__title']}>
                    {required && <span className={styles['terms-item__required']}>(필수)</span>}
                    {!required && <span className={styles['terms-item__optional']}>(선택)</span>}
                    {cleanTitle}
                </span>
            </label>

            {/* 상세 보기 버튼 */}
            <button
                type="button"
                className={styles['terms-item__detail-button']}
                onClick={() => onViewDetail(term)}
            >
                보기
            </button>
        </div>
    );
};

export default TermsItem;