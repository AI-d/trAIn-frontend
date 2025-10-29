// src/components/Auth/signup/terms/AgreeAllCheckbox.jsx
// import styles from './AgreeAllCheckbox.module.scss';
import React from 'react';

/**
 * 전체 동의 체크박스 컴포넌트
 *
 * @param {boolean} allAgreed - 전체 동의 여부
 * @param {function} onToggleAll - 전체 동의 토글 핸들러
 */
const AgreeAllCheckbox = ({allAgreed, onToggleAll}) => {
    return (
        <div className="agree-all-checkbox">
            <label className="agree-all-checkbox__label">
                {/* 전체 동의 체크박스 */}
                <input
                    type="checkbox"
                    className="agree-all-checkbox__checkbox"
                    checked={allAgreed}
                    onChange={(e) => onToggleAll(e.target.checked)}
                />

                {/* 전체 동의 텍스트 */}
                <span className="agree-all-checkbox__text">
          전체 동의
        </span>
            </label>
        </div>
    );
};

export default AgreeAllCheckbox;