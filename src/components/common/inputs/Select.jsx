// src/components/common/inputs/Select.jsx
import styles from './Select.module.scss';
import React from 'react';

/**
 * 선택 입력 컴포넌트 (드롭다운)
 *
 * @param {string} name - select name 속성
 * @param {string} label - 입력 필드 라벨
 * @param {string} value - 선택된 값
 * @param {function} onChange - 값 변경 핸들러
 * @param {Array} options - 선택 옵션 배열 [{ value, label }]
 * @param {string} placeholder - 기본 선택 메시지
 * @param {boolean} required - 필수 입력 여부
 * @param {string} error - 에러 메시지
 * @param {boolean} disabled - 비활성화 여부
 */
const Select = ({
                    name,
                    label,
                    value,
                    onChange,
                    options = [],
                    placeholder = '선택하세요',
                    required = false,
                    error,
                    disabled = false,
                }) => {
    return (
        <div className={styles['select']}>
            {/* 라벨 */}
            {label && (
                <label htmlFor={name} className={styles['select__label']}>
                    {label}
                    {required && <span className={styles['select__required']}>*</span>}
                </label>
            )}

            {/* 선택 필드 */}
            <div className={styles['select__wrapper']}>
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    className={`${styles['select__field']} ${error ? styles['select__field--error'] : ''}`}
                >
                    {/* 기본 옵션 (placeholder) */}
                    <option value="" disabled>
                        {placeholder}
                    </option>

                    {/* 옵션 목록 */}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* 화살표 아이콘 */}
                <svg
                    className={styles['select__icon']}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <span className={styles['select__error']}>{error}</span>
            )}
        </div>
    );
};

export default Select;