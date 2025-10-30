// src/components/Auth/VerificationCodeInput.jsx
import styles from './VerificationCodeInput.module.scss';
import {useEffect, useRef, useState} from 'react';

const VerificationCodeInput = ({value, onChange, disabled, error}) => {
    // value가 없으면 빈 배열 6개로 초기화
    const [codes, setCodes] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    // value prop 변경 시 codes 업데이트
    useEffect(() => {
        if (value && value.length <= 6) {
            const newCodes = value.split('');
            // 6자리로 패딩
            while (newCodes.length < 6) {
                newCodes.push('');
            }
            setCodes(newCodes);
        } else if (!value) {
            setCodes(['', '', '', '', '', '']);
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
        const pastedCodes = pastedData.replace(/\D/g, '').slice(0, 6).split('');

        if (pastedCodes.length > 0) {
            const newCodes = ['', '', '', '', '', ''];
            pastedCodes.forEach((code, idx) => {
                if (idx < 6) {
                    newCodes[idx] = code;
                }
            });
            setCodes(newCodes);
            onChange(newCodes.join(''));

            // 마지막 입력된 칸으로 포커스 이동
            const lastIndex = Math.min(pastedCodes.length - 1, 5);
            setTimeout(() => {
                inputRefs.current[lastIndex]?.focus();
            }, 0);
        }
    };

    return (
        <div className={styles['verification-code-input']}>
            <div className={styles['verification-code-input__fields']}>
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
                        className={`${styles['verification-code-input__field']} ${
                            error ? styles['verification-code-input__field--error'] : ''
                        }`}
                    />
                ))}
            </div>

            {/* 에러 메시지 */}
            {error && (
                <span className={styles['verification-code-input__error']}>{error}</span>
            )}
        </div>
    );
};

export default VerificationCodeInput;