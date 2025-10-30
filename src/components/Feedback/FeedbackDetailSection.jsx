// src/components/Feedback/FeedbackDetailSection.jsx
import styles from './FeedbackDetailSection.module.scss';

/**
 * 피드백 상세 섹션
 * @param {string} aiGeneratedFeedback - AI 생성 피드백
 * @param {Array} improvementPoints - 개선 포인트 배열
 */
const FeedbackDetailSection = ({ aiGeneratedFeedback, improvementPoints }) => {
    // improvementPoints가 문자열이면 파싱
    let parsedPoints = improvementPoints;
    if (typeof improvementPoints === 'string') {
        try {
            parsedPoints = JSON.parse(improvementPoints);
        } catch (e) {
            console.error('improvementPoints 파싱 실패:', e);
            parsedPoints = [];
        }
    }

    return (
        <div className={styles['detail-section']}>
            <h3 className={styles['detail-section__title']}>상세 피드백</h3>
            <div className={styles['detail-section__content']}>
                {aiGeneratedFeedback && (
                    <p className={styles['detail-section__text']}>
                        {aiGeneratedFeedback}
                    </p>
                )}

                {parsedPoints && parsedPoints.length > 0 && (
                    <div className={styles['detail-section__improvements']}>
                        <h4 className={styles['detail-section__subtitle']}>개선 포인트</h4>
                        <ul className={styles['detail-section__list']}>
                            {parsedPoints.map((point, index) => (
                                <li key={index} className={styles['detail-section__list-item']}>
                                    <strong>{point.type}:</strong> {point.description}
                                    {point.suggestion && (
                                        <div className={styles['detail-section__suggestion']}>
                                            💡 {point.suggestion}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!aiGeneratedFeedback && (!parsedPoints || parsedPoints.length === 0) && (
                    <p className={styles['detail-section__text']}>
                        피드백 내용이 없습니다.
                    </p>
                )}
            </div>
        </div>
    );
};

export default FeedbackDetailSection;
