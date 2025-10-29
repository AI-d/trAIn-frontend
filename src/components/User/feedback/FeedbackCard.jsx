// src/components/User/feedback/FeedbackCard.jsx
// import styles from './FeedbackCard.module.scss';
import React from 'react';

/**
 * 개별 피드백 카드 컴포넌트
 *
 * @param {object} feedback - 피드백 데이터
 * @param {function} onViewDetail - 상세 보기 핸들러
 */
const FeedbackCard = ({feedback, onViewDetail}) => {
    const {
        sessionId,
        overallScore,
        grade,
        aiGeneratedFeedback,
        createdAt,
    } = feedback;

    // 점수에 따른 등급 클래스
    const getScoreClass = (score) => {
        if (score >= 90) return 'feedback-card__score--excellent'; // A
        if (score >= 70) return 'feedback-card__score--good';      // B
        if (score >= 50) return 'feedback-card__score--average';   // C
        return 'feedback-card__score--poor';                       // D, F
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // 피드백 요약 (첫 100자만)
    const getFeedbackSummary = (text) => {
        if (!text) return '피드백 내용이 없습니다.';
        return text.length > 100 ? `${text.substring(0, 100)}...` : text;
    };

    return (
        <div className="feedback-card">
            {/* 헤더: 점수 + 등급 */}
            <div className="feedback-card__header">
                <div className={`feedback-card__score ${getScoreClass(overallScore)}`}>
                    <span className="feedback-card__score-value">{overallScore}점</span>
                    <span className="feedback-card__score-grade">({grade})</span>
                </div>
                <span className="feedback-card__date">{formatDate(createdAt)}</span>
            </div>

            {/* 피드백 요약 */}
            <div className="feedback-card__content">
                <p className="feedback-card__summary">
                    {getFeedbackSummary(aiGeneratedFeedback)}
                </p>
            </div>

            {/* 상세 보기 버튼 */}
            <div className="feedback-card__footer">
                <button
                    className="feedback-card__detail-button"
                    onClick={() => onViewDetail(feedback)}
                >
                    상세 보기
                </button>
            </div>
        </div>
    );
};

export default FeedbackCard;