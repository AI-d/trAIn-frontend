// src/components/Feedback/FeedbackDetailModal.jsx
import styles from './FeedbackDetailModal.module.scss';
import { useEffect } from 'react';

/**
 * 피드백 상세 모달
 */
const FeedbackDetailModal = (props) => {
    const {
        isOpen,
        onClose,
        overallScore,
        grade,
        aiGeneratedFeedback,
        improvementPoints,
        selectedAlternative,
        alternativeContent
    } = props;
    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // 등급별 색상
    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return '#10B981'; // 초록
            case 'B': return '#6B8EE8'; // 파랑
            case 'C': return '#F59E0B'; // 주황
            case 'D': return '#EF4444'; // 빨강
            case 'F': return '#991B1B'; // 진한 빨강
            default: return '#6B7280';
        }
    };

    // improvementPoints 파싱
    let parsedPoints = improvementPoints;
    if (typeof improvementPoints === 'string') {
        try {
            parsedPoints = JSON.parse(improvementPoints);
        } catch (e) {
            console.error('improvementPoints 파싱 실패:', e);
            parsedPoints = [];
        }
    }

    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                <div className={styles['modal__header']}>
                    <h2 className={styles['modal__title']}>대화 피드백</h2>
                    <button
                        className={styles['modal__close-button']}
                        onClick={onClose}
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles['modal__content']}>
                    {/* 점수 섹션 */}
                    <div className={styles['modal__score-section']}>
                        <div className={styles['modal__score-card']}>
                            <div 
                                className={styles['modal__grade']}
                                style={{ color: getGradeColor(grade) }}
                            >
                                {grade}
                            </div>
                            <div className={styles['modal__score']}>
                                {overallScore} <span className={styles['modal__score-max']}>/ 100</span>
                            </div>
                            <div className={styles['modal__score-label']}>총합 점수</div>
                        </div>
                    </div>

                    {/* 상세 피드백 섹션 */}
                    <div className={styles['modal__section']}>
                        <h3 className={styles['modal__section-title']}>상세 피드백</h3>
                        {aiGeneratedFeedback ? (
                            <p className={styles['modal__text']}>{aiGeneratedFeedback}</p>
                        ) : (
                            <p className={styles['modal__text']}>피드백 내용이 없습니다.</p>
                        )}
                    </div>

                    {/* 개선 포인트 섹션 */}
                    {parsedPoints && parsedPoints.length > 0 && (
                        <div className={styles['modal__section']}>
                            <h3 className={styles['modal__section-title']}>개선 포인트</h3>
                            <ul className={styles['modal__list']}>
                                {parsedPoints.map((point, index) => (
                                    <li key={index} className={styles['modal__list-item']}>
                                        <strong>{point.type}:</strong> {point.description}
                                        {point.suggestion && (
                                            <div className={styles['modal__suggestion']}>
                                                💡 {point.suggestion}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 선택된 개선안 섹션 */}
                    {selectedAlternative && alternativeContent && (
                        <div className={styles['modal__section']}>
                            <h3 className={styles['modal__section-title']}>
                                개선안 {selectedAlternative} 선택
                            </h3>
                            <p className={styles['modal__text']}>{alternativeContent}</p>
                        </div>
                    )}
                </div>

                <div className={styles['modal__footer']}>
                    <button
                        className={styles['modal__confirm-button']}
                        onClick={onClose}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackDetailModal;
