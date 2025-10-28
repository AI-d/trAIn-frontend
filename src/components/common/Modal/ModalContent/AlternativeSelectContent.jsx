// src/components/common/Modal/ModalContent/AlternativeSelectContent.jsx
// import styles from './AlternativeSelectContent.module.scss';
import React, { useState } from 'react';

/**
 * 개선안 선택 UI를 표시하는 모달 콘텐츠
 *
 * @param {object} data - { alternatives: Array<{ label, content }> }
 * @param {function} onSubmit - 선택 완료 핸들러
 */
const AlternativeSelectContent = ({ data, onSubmit }) => {
    const { alternatives } = data || {};
    const [selectedChoice, setSelectedChoice] = useState(null);

    const handleChoiceSelect = (label) => {
        setSelectedChoice(label);
    };

    const handleSubmit = () => {
        if (selectedChoice) {
            onSubmit(selectedChoice);
        }
    };

    return (
        <div className="alternative-select">
            {/* 타이틀 */}
            <h3 className="alternative-select__title">
                어떤 개선 방향이 가장 도움이 될까요?
            </h3>

            {/* 선택지 */}
            <div className="alternative-select__options">
                {alternatives?.map((alt) => (
                    <button
                        key={alt.label}
                        className={`alternative-select__option ${
                            selectedChoice === alt.label ? 'alternative-select__option--selected' : ''
                        }`}
                        onClick={() => handleChoiceSelect(alt.label)}
                    >
                        <span className="alternative-select__option-label">{alt.label}</span>
                        <p className="alternative-select__option-content">{alt.content}</p>
                    </button>
                ))}
            </div>

            {/* 제출 버튼 */}
            <button
                className="alternative-select__submit"
                onClick={handleSubmit}
                disabled={!selectedChoice}
            >
                선택 완료
            </button>
        </div>
    );
};

export default AlternativeSelectContent;