// src/components/common/Modal/ModalContent/FeedbackDetailContent.jsx
// import styles from './FeedbackDetailContent.module.scss';
import React from 'react';

/**
 * 피드백 상세 정보를 표시하는 모달 콘텐츠
 *
 * @param {object} data - { sessionId, overallScore, grade, aiGeneratedFeedback, suggestions, chosenAlternative }
 */
const FeedbackDetailContent = ({ data }) => {
    const {
        overallScore,
        grade,
        aiGeneratedFeedback,
        suggestions,
        chosenAlternative,
    } = data || {};

    // 점수에 따른 등급 클래스
    const getScoreClass = (score) => {
        if (score >= 90) return 'feedback-detail__score--excellent';
        if (score >= 70) return 'feedback-detail__score--good';
        if (score >= 50) return 'feedback-detail__score--average';
        return 'feedback-detail__score--poor';
    };

    return (
        <div className="feedback-detail">
            {/* 헤더 */}
            <div className="feedback-detail__header">
                <h2 className="feedback-detail__title">피드백 상세</h2>
                <div className={`feedback-detail__score ${getScoreClass(overallScore)}`}>
                    <span className="feedback-detail__score-value">{overallScore}점</span>
                    <span className="feedback-detail__score-grade">({grade})</span>
                </div>
            </div>

            {/* AI 피드백 */}
            <div className="feedback-detail__section">
                <h3 className="feedback-detail__section-title">AI 피드백</h3>
                <p className="feedback-detail__feedback-text">{aiGeneratedFeedback}</p>
            </div>

            {/* 개선 제안 */}
            {suggestions && suggestions.length > 0 && (
                <div className="feedback-detail__section">
                    <h4 className="feedback-detail__section-subtitle">개선 제안</h4>
                    <div className="feedback-detail__suggestions">
                        {suggestions.map((suggestion, index) => (
                            <div key={index} className="feedback-detail__suggestion-item">
                                <strong className="feedback-detail__suggestion-category">
                                    {suggestion.category}:
                                </strong>
                                <span className="feedback-detail__suggestion-content">
                  {suggestion.content}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 선택한 개선안 */}
            {chosenAlternative && (
                <div className="feedback-detail__section feedback-detail__section--highlight">
                    <h4 className="feedback-detail__section-subtitle">선택한 개선 방향</h4>
                    <div className="feedback-detail__chosen-alternative">
                        <span className="feedback-detail__chosen-label">선택: {chosenAlternative}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackDetailContent;