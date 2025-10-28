// src/components/common/Modal/ModalContent/FeedbackResultContent.jsx
// import styles from './FeedbackResultContent.module.scss';
import React from 'react';

/**
 * 피드백 결과를 표시하는 모달 콘텐츠
 *
 * @param {object} data - { sessionId, overallScore, grade, aiGeneratedFeedback, suggestions }
 * @param {function} onNext - 다음 단계(개선안 선택) 핸들러
 */
const FeedbackResultContent = ({ data, onNext }) => {
    const { overallScore, grade, aiGeneratedFeedback, suggestions } = data || {};

    // 점수에 따른 등급 클래스
    const getScoreClass = (score) => {
        if (score >= 90) return 'feedback-result__score--excellent';
        if (score >= 70) return 'feedback-result__score--good';
        if (score >= 50) return 'feedback-result__score--average';
        return 'feedback-result__score--poor';
    };

    return (
        <div className="feedback-result">
            {/* 점수 표시 */}
            <div className="feedback-result__score-section">
                <div className={`feedback-result__score ${getScoreClass(overallScore)}`}>
                    <span className="feedback-result__score-value">{overallScore}점</span>
                    <span className="feedback-result__score-grade">({grade})</span>
                </div>
            </div>

            {/* AI 피드백 */}
            <div className="feedback-result__feedback-section">
                <h3 className="feedback-result__section-title">AI 피드백</h3>
                <p className="feedback-result__feedback-text">
                    {aiGeneratedFeedback}
                </p>
            </div>

            {/* 개선 제안 */}
            {suggestions && suggestions.length > 0 && (
                <div className="feedback-result__suggestions-section">
                    <h4 className="feedback-result__section-subtitle">개선 제안</h4>
                    <div className="feedback-result__suggestions">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="feedback-result__suggestion-item">
                                <strong className="feedback-result__suggestion-category">
                                    {suggestion.category}:
                                </strong>
                                <span className="feedback-result__suggestion-content">
                  {suggestion.content}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 다음 버튼 */}
            <button className="feedback-result__next-button" onClick={onNext}>
                개선 방향 선택하기
            </button>
        </div>
    );
};

export default FeedbackResultContent;