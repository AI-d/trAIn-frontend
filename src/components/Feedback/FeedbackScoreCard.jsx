// src/components/Feedback/FeedbackScoreCard.jsx
import styles from './FeedbackScoreCard.module.scss';

/**
 * 피드백 점수 카드
 * @param {number} overallScore - 전체 점수
 * @param {string} grade - 등급 (A, B, C, D, F)
 * @param {number} speechRateScore - 발화속도 점수 (0-25)
 * @param {number} fillerWordsScore - 추임새 점수 (0-25)
 * @param {number} politenessScore - 공손도 점수 (0-25)
 * @param {number} clarityScore - 명료성 점수 (0-25)
 */
const FeedbackScoreCard = ({
                               overallScore,
                               grade,
                               speechRateScore,
                               fillerWordsScore,
                               politenessScore,
                               clarityScore
                           }) => {
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

    const detailScores = [
        { label: '발화속도', score: speechRateScore, max: 25 },
        { label: '추임새', score: fillerWordsScore, max: 25 },
        { label: '공손도', score: politenessScore, max: 25 },
        { label: '명료성', score: clarityScore, max: 25 },
    ];

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

            {/* 세부 점수 표시 */}
            {(speechRateScore !== undefined || fillerWordsScore !== undefined ||
                politenessScore !== undefined || clarityScore !== undefined) && (
                <div className={styles['score-card__details']}>
                    <h4 className={styles['score-card__details-title']}>세부 점수</h4>
                    <div className={styles['score-card__details-grid']}>
                        {detailScores.map((item, index) => (
                            item.score !== undefined && (
                                <div key={index} className={styles['score-card__detail-item']}>
                                    <div className={styles['score-card__detail-label']}>
                                        {item.label}
                                    </div>
                                    <div className={styles['score-card__detail-score']}>
                                        <span className={styles['score-card__detail-value']}>
                                            {item.score}
                                        </span>
                                        <span className={styles['score-card__detail-max']}>
                                            / {item.max}
                                        </span>
                                    </div>
                                    {/* 프로그레스 바 */}
                                    <div className={styles['score-card__progress-bar']}>
                                        <div
                                            className={styles['score-card__progress-fill']}
                                            style={{
                                                width: `${(item.score / item.max) * 100}%`,
                                                backgroundColor: getGradeColor(grade)
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackScoreCard;