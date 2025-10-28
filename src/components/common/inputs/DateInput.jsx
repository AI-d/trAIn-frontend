// src/components/common/inputs/DateInput.jsx
// import styles from './DateInput.module.scss';
import React from 'react';

/**
 * 날짜 입력 컴포넌트 (YYYY-MM-DD 형식)
 *
 * @param {string} name - input name 속성
 * @param {string} label - 입력 필드 라벨
 * @param {string} value - 입력 값 (YYYY-MM-DD)
 * @param {function} onChange - 값 변경 핸들러
 * @param {boolean} required - 필수 입력 여부
 * @param {string} error - 에러 메시지
 * @param {boolean} disabled - 비활성화 여부
 * @param {string} min - 최소 날짜 (YYYY-MM-DD)
 * @param {string} max - 최대 날짜 (YYYY-MM-DD)
 */
const DateInput = ({
                       name,
                       label,
                       value,
                       onChange,
                       required = false,
                       error,
                       disabled = false,
                       min,
                       max,
                   }) => {
    return (
        <div className="date-input">
            {/* 라벨 */}
            {label && (
                <label htmlFor={name} className="date-input__label">
                    {label}
                    {required && <span className="date-input__required">*</span>}
                </label>
            )}

            {/* 날짜 입력 필드 */}
            <input
                id={name}
                name={name}
                type="date"
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                min={min}
                max={max}
                className={`date-input__field ${error ? 'date-input__field--error' : ''}`}
            />

            {/* 에러 메시지 */}
            {error && (
                <span className="date-input__error">{error}</span>
            )}
        </div>
    );
};

export default DateInput;