// src/components/Auth/VerificationCodeInput.jsx
// import styles from './VerificationCodeInput.module.scss';
import React, {useEffect, useRef, useState} from 'react';

/**
 * 6자리 인증 코드 입력 컴포넌트
 *
 * @param {string} value - 입력된 코드 (6자리 문자열)
 * @param {function} onChange - 코드 변경 핸들러
 * @param {boolean} disabled - 비활성화 여부
 * @param {string} error - 에러 메시지
 */
const VerificationCodeInput = ({value, onChange, disabled, error}) => {
    const [codes, setCodes] = useState(value ? value.split('') : ['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    // value prop 변경 시 codes 업데이트
    useEffect(() => {
        if (value) {
            setCodes(value.split(''));
        }
    }, [value]);

    // 개별 입력 변경
    const handleChange = (index, newValue) => {
        // 숫자만 허용
        if (newValue && !/^\d$/.test(newValue)) return;

        const newCodes = [...codes];
        newCodes[index] = newValue;
        setCodes(newCodes);

        // 부모 컴포넌트에 전체 코드 전달
        onChange(newCodes.join(''));

        // 다음 input으로 포커스 이동
        if (newValue && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // 키 다운 처리 (Backspace)
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (codes[index]) {
                // 현재 칸에 값이 있으면 지우기
                const newCodes = [...codes];
                newCodes[index] = '';
                setCodes(newCodes);
                onChange(newCodes.join(''));
            } else if (index > 0) {
                // 현재 칸이 비어있으면 이전 칸으로 이동 후 지우기
                inputRefs.current[index - 1]?.focus();
                const newCodes = [...codes];
                newCodes[index - 1] = '';
                setCodes(newCodes);
                onChange(newCodes.join(''));
            }
        }
    };

    // 붙여넣기 처리
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const pastedCodes = pastedData.slice(0, 6).split('');

        // 숫자만 필터링
        const filteredCodes = pastedCodes.filter(code => /^\d$/.test(code));

        if (filteredCodes.length > 0) {
            const newCodes = [...codes];
            filteredCodes.forEach((code, idx) => {
                if (idx < 6) {
                    newCodes[idx] = code;
                }
            });
            setCodes(newCodes);
            onChange(newCodes.join(''));

            // 마지막 입력된 칸으로 포커스 이동
            const lastIndex = Math.min(filteredCodes.length, 5);
            inputRefs.current[lastIndex]?.focus();
        }
    };

    return (
        <div className="verification-code-input">
            <div className="verification-code-input__fields">
                {codes.map((code, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={code}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        className={`verification-code-input__field ${
                            error ? 'verification-code-input__field--error' : ''
                        }`}
                    />
                ))}
            </div>

            {/* 에러 메시지 */}
            {error && (
                <span className="verification-code-input__error">{error}</span>
            )}
        </div>
    );
};

export default VerificationCodeInput;