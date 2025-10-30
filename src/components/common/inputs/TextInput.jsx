// src/components/common/inputs/TextInput.jsx
import styles from './TextInput.module.scss';
import React from 'react';

/**
 * 텍스트 입력 컴포넌트
 *
 * @param {string} name - input name 속성
 * @param {string} label - 입력 필드 라벨
 * @param {string} value - 입력 값
 * @param {function} onChange - 값 변경 핸들러
 * @param {string} placeholder - placeholder 텍스트
 * @param {string} type - input type (기본: text)
 * @param {boolean} required - 필수 입력 여부
 * @param {boolean} readOnly - 읽기 전용 여부
 * @param {string} error - 에러 메시지
 * @param {boolean} disabled - 비활성화 여부
 */
const TextInput = ({
                       name,
                       label,
                       value,
                       onChange,
                       placeholder,
                       type = 'text',
                       required = false,
                       readOnly = false,
                       error,
                       disabled = false,
                   }) => {
    return (
        <div className={styles['text-input']}>
            {/* 라벨 */}
            {label && (
                <label htmlFor={name} className={styles['text-input__label']}>
                    {label}
                    {required && <span className={styles['text-input__required']}>*</span>}
                </label>
            )}

            {/* 입력 필드 */}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                readOnly={readOnly}
                disabled={disabled}
                className={`${styles['text-input__field']} ${error ? styles['text-input__field--error'] : ''} ${readOnly ? styles['text-input__field--readonly'] : ''}`}
            />

            {/* 에러 메시지 */}
            {error && (
                <span className={styles['text-input__error']}>{error}</span>
            )}
        </div>
    );
};

export default TextInput;