// src/components/Feedback/FeedbackScoreCard.jsx
import styles from './FeedbackScoreCard.module.scss';

/**
 * 피드백 점수 카드
 * @param {number} overallScore - 전체 점수
 * @param {string} grade - 등급 (A, B, C, D, F)
 */
const FeedbackScoreCard = ({ overallScore, grade }) => {
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

    return (
        <div className={styles['score-card']}>
            <div className={styles['score-card__content']}>
                <div 
                    className={styles['score-card__grade']}
                    style={{ color: getGradeColor(grade) }}
                >
                    {grade}
                </div>
                <div className={styles['score-card__score']}>
                    <span className={styles['score-card__score-value']}>{overallScore}</span>
                    <span className={styles['score-card__score-max']}>/ 100</span>
                </div>
                <p className={styles['score-card__label']}>종합 점수</p>
            </div>
        </div>
    );
};

export default FeedbackScoreCard;
