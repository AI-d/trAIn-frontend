// src/components/User/FeedbackHistory.jsx

import {useEffect, useState} from 'react';
import * as feedbackService from '@/services/feedbackService';

export function FeedbackHistory({userId}) {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        loadFeedbackHistory();
    }, [userId]);

    const loadFeedbackHistory = async () => {
        try {
            const response = await feedbackService.getFeedbackHistory(userId, {
                page: 0,
                size: 10,
                sort: 'createdAt,desc'
            });
            setFeedbacks(response.content || []);
        } catch (error) {
            console.error('Failed to load feedback history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (feedback) => {
        setSelectedFeedback(feedback);
        setShowDetailModal(true);
    };

    const getGradeColor = (score) => {
        if (score >= 90) return 'grade-excellent';
        if (score >= 70) return 'grade-good';
        if (score >= 50) return 'grade-average';
        return 'grade-poor';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="feedback-history">
                <h3>피드백 히스토리</h3>
                <div className="feedback-history__loading">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="feedback-history">
            <h3 className="feedback-history__title">피드백 히스토리</h3>

            {feedbacks.length === 0 ? (
                <div className="feedback-history__empty">
                    <p>아직 피드백이 없습니다</p>
                </div>
            ) : (
                <div className="feedback-history__list">
                    {feedbacks.map(feedback => (
                        <div key={feedback.sessionId} className="feedback-history-item">
                            <div className="feedback-history-item__content">
                                <div className="feedback-history-item__header">
                                    <h4 className="feedback-history-item__scenario">
                                        {feedback.scenarioTitle || '대화 연습'}
                                    </h4>
                                    <span className="feedback-history-item__date">
                    {formatDate(feedback.createdAt)}
                  </span>
                                </div>

                                <div className="feedback-history-item__score">
                  <span className={`score-badge ${getGradeColor(feedback.overallScore)}`}>
                    {feedback.overallScore}점
                  </span>
                                    <span className="feedback-history-item__grade">
                    ({feedback.grade})
                  </span>
                                </div>
                            </div>

                            <button
                                className="feedback-history-item__view-btn"
                                onClick={() => handleViewDetail(feedback)}
                                type="button"
                            >
                                상세보기
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showDetailModal && selectedFeedback && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h3>피드백 상세</h3>
                            <button
                                type="button"
                                className="modal__close"
                                onClick={() => setShowDetailModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal__content">
                            <div className="feedback-detail">
                                <div className="feedback-detail__score">
                  <span className={`score-badge ${getGradeColor(selectedFeedback.overallScore)}`}>
                    {selectedFeedback.overallScore}점 ({selectedFeedback.grade})
                  </span>
                                </div>

                                <div className="feedback-detail__section">
                                    <h4>피드백 내용</h4>
                                    <p>{selectedFeedback.aiGeneratedFeedback}</p>
                                </div>

                                {selectedFeedback.suggestions && selectedFeedback.suggestions.length > 0 && (
                                    <div className="feedback-detail__section">
                                        <h4>개선 제안</h4>
                                        <div className="suggestions">
                                            {selectedFeedback.suggestions.map((suggestion, index) => (
                                                <div key={index} className="suggestion-item">
                                                    <strong>{suggestion.category}:</strong> {suggestion.content}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
