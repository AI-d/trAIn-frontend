// src/components/Feedback/FeedbackResultView.jsx
import styles from './FeedbackResultView.module.scss';
import FeedbackScoreCard from './FeedbackScoreCard';
import FeedbackDetailSection from './FeedbackDetailSection';
import FeedbackAlternatives from './FeedbackAlternatives';

/**
 * 피드백 결과 뷰
 * @param {object} feedback - 피드백 데이터
 * @param {function} onChooseAlternative - 개선안 선택 핸들러
 * @param {function} onClose - 닫기 핸들러
 */
const FeedbackResultView = ({ feedback, onChooseAlternative, onClose }) => {
    // 백엔드 응답 필드명 매핑
    const overallScore = feedback.totalScore || feedback.overallScore;
    const grade = feedback.scoreGrade || feedback.grade;
    const aiGeneratedFeedback = feedback.aiGeneratedFeedback;
    const improvementPoints = feedback.improvementPoints;
    const chosenAlternative = feedback.chosenAlternative || feedback.finalChoice;
    
    // alternatives 객체 생성
    const alternatives = {
        alternativeA: feedback.alternativeA,
        alternativeB: feedback.alternativeB,
        alternativeC: feedback.alternativeC,
    };

    return (
        <div className={styles['result-view']}>
            <div className={styles['result-view__header']}>
                <h2 className={styles['result-view__title']}>대화 피드백</h2>
                <p className={styles['result-view__subtitle']}>
                    AI가 분석한 대화 내용입니다.
                </p>
            </div>

            <div className={styles['result-view__content']}>
                {/* 점수 카드 */}
                <FeedbackScoreCard overallScore={overallScore} grade={grade} />

                {/* 상세 피드백 */}
                <FeedbackDetailSection 
                    aiGeneratedFeedback={aiGeneratedFeedback}
                    improvementPoints={improvementPoints}
                />

                {/* 개선안 */}
                {alternatives && (
                    <FeedbackAlternatives
                        alternatives={alternatives}
                        chosenAlternative={chosenAlternative}
                        onChoose={onChooseAlternative}
                    />
                )}
            </div>

            <div className={styles['result-view__actions']}>
                <button
                    className={styles['result-view__close-button']}
                    onClick={onClose}
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default FeedbackResultView;
