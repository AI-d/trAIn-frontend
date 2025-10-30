// src/components/User/feedback/FeedbackCard.jsx
import styles from './FeedbackCard.module.scss';

/**
 * 피드백 카드 컴포넌트
 */
const FeedbackCard = ({ feedback, onViewDetail }) => {
    const {
        scenarioTitle,
        totalScore,
        scoreGrade,
        createdAt,
        chosenAlternative,
    } = feedback;

    // 등급별 색상
    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return '#10B981';
            case 'B': return '#6B8EE8';
            case 'C': return '#F59E0B';
            case 'D': return '#EF4444';
            case 'F': return '#991B1B';
            default: return '#6B7280';
        }
    };

    // 날짜 포맷
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className={styles.card} onClick={() => onViewDetail(feedback)}>
            <div className={styles.card__header}>
                <h3 className={styles.card__title}>{scenarioTitle}</h3>
                <div 
                    className={styles.card__grade}
                    style={{ color: getGradeColor(scoreGrade) }}
                >
                    {scoreGrade}
                </div>
            </div>

            <div className={styles.card__body}>
                <div className={styles.card__score}>
                    <span className={styles.card__score_label}>점수</span>
                    <span className={styles.card__score_value}>{totalScore}점</span>
                </div>

                {chosenAlternative && (
                    <div className={styles.card__choice}>
                        <span className={styles.card__choice_badge}>
                            개선안 {chosenAlternative} 선택
                        </span>
                    </div>
                )}
            </div>

            <div className={styles.card__footer}>
                <span className={styles.card__date}>{formatDate(createdAt)}</span>
                <button className={styles.card__button}>자세히 보기</button>
            </div>
        </div>
    );
};

export default FeedbackCard;
