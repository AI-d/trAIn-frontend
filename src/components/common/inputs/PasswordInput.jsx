// src/components/common/inputs/PasswordInput.jsx
import styles from './PasswordInput.module.scss';
import { useState } from 'react';

/**
 * 비밀번호 입력 컴포넌트 (표시/숨김 토글 기능)
 *
 * @param {string} name - input name 속성
 * @param {string} label - 입력 필드 라벨
 * @param {string} value - 입력 값
 * @param {function} onChange - 값 변경 핸들러
 * @param {string} placeholder - placeholder 텍스트
 * @param {boolean} required - 필수 입력 여부
 * @param {string} error - 에러 메시지
 * @param {boolean} disabled - 비활성화 여부
 */
const PasswordInput = ({
    name,
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    required = false,
    error,
    disabled = false,
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={styles['password-input']}>
            {/* 라벨 */}
            {label && (
                <label htmlFor={name} className={styles['password-input__label']}>
                    {label}
                    {required && <span className={styles['password-input__required']}>*</span>}
                </label>
            )}

            {/* 입력 필드 + 토글 버튼 */}
            <div className={styles['password-input__wrapper']}>
                <input
                    id={name}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`${styles['password-input__field']} ${error ? styles['password-input__field--error'] : ''}`}
                />

                {/* 표시/숨김 토글 버튼 */}
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={styles['password-input__toggle']}
                    disabled={disabled}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                    {showPassword ? (
                        // 눈 감김 아이콘 (보이는 상태)
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.95 14.95C13.5255 16.0358 11.788 16.632 10 16.6499C4.16667 16.6499 1.66667 9.99992 1.66667 9.99992C2.49575 8.35425 3.64576 6.89285 5.05 5.69159M8.25 3.53325C8.82365 3.39907 9.41092 3.33195 10 3.33325C15.8333 3.33325 18.3333 9.99992 18.3333 9.99992C17.9286 10.8571 17.4405 11.6735 16.875 12.4374M11.7667 11.7666C11.5378 12.0123 11.2617 12.2093 10.9552 12.3459C10.6487 12.4826 10.3178 12.556 9.98234 12.562C9.64685 12.568 9.31363 12.5063 9.00248 12.3805C8.69133 12.2547 8.40842 12.0675 8.17054 11.8296C7.93266 11.5917 7.74546 11.3088 7.61968 10.9977C7.4939 10.6865 7.43217 10.3533 7.43818 10.0178C7.4442 9.68236 7.51785 9.35148 7.65451 9.04497C7.79117 8.73847 7.98815 8.46238 8.23384 8.23342" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M1.66667 1.66675L18.3333 18.3334" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        // 눈 뜬 아이콘 (숨김 상태)
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.66667 9.99992C1.66667 9.99992 4.16667 3.33325 10 3.33325C15.8333 3.33325 18.3333 9.99992 18.3333 9.99992C18.3333 9.99992 15.8333 16.6666 10 16.6666C4.16667 16.6666 1.66667 9.99992 1.66667 9.99992Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 12.4999C11.3807 12.4999 12.5 11.3806 12.5 9.99992C12.5 8.61921 11.3807 7.49992 10 7.49992C8.61929 7.49992 7.5 8.61921 7.5 9.99992C7.5 11.3806 8.61929 12.4999 10 12.4999Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <span className={styles['password-input__error']}>{error}</span>
            )}
        </div>
    );
};

export default PasswordInput;