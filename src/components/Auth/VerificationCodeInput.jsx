// src/components/Auth/VerificationCodeInput.jsx

import {useEffect, useRef, useState} from 'react';

export function VerificationCodeInput({
                                          value = '',
                                          onChange,
                                          length = 6,
                                          disabled = false,
                                          error
                                      }) {
    const [codes, setCodes] = useState(Array(length).fill(''));
    const inputRefs = useRef([]);

    useEffect(() => {
        if (value) {
            const newCodes = value.split('').slice(0, length);
            while (newCodes.length < length) {
                newCodes.push('');
            }
            setCodes(newCodes);
        }
    }, [value, length]);

    const handleChange = (index, newValue) => {
        if (!/^\d*$/.test(newValue)) return;

        const newCodes = [...codes];
        newCodes[index] = newValue.slice(-1);
        setCodes(newCodes);

        const fullCode = newCodes.join('');
        if (onChange) {
            onChange(fullCode);
        }

        if (newValue && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !codes[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        const newCodes = pastedData.split('').slice(0, length);

        while (newCodes.length < length) {
            newCodes.push('');
        }

        setCodes(newCodes);

        if (onChange) {
            onChange(newCodes.join(''));
        }

        const nextEmptyIndex = newCodes.findIndex(code => !code);
        const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className="verification-code-input">
            <div
                className={`verification-code-input__container ${error ? 'verification-code-input__container--error' : ''}`}>
                {codes.map((code, index) => (
                    <input
                        key={index}
                        ref={(el) => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={code}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={disabled}
                        className="verification-code-input__field"
                    />
                ))}
            </div>
            {error && (
                <span className="verification-code-input__error">{error}</span>
            )}
        </div>
    );
}
