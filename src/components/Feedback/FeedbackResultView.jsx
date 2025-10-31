// src/components/Feedback/FeedbackResultView.jsx
import styles from './FeedbackResultView.module.scss';
import { useState } from 'react';
import FeedbackScoreCard from './FeedbackScoreCard';
import FeedbackDetailSection from './FeedbackDetailSection';
import FeedbackAlternatives from './FeedbackAlternatives';
import FeedbackDetailModal from './FeedbackDetailModal';

/**
 * 피드백 결과 뷰
 */
const FeedbackResultView = (props) => {
    const { feedback, onChooseAlternative, onClose } = props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAlternativeKey, setSelectedAlternativeKey] = useState(null);

    // 백엔드 응답 필드명 매핑
    const overallScore = feedback.totalScore || feedback.overallScore;
    const grade = feedback.scoreGrade || feedback.grade;

    // ✅ 수정: 백엔드 응답 구조에 맞게 데이터 추출
    const speechRateScore = feedback.speechRateScore;
    const fillerWordsScore = feedback.fillerWordsScore;
    const politenessScore = feedback.politenessScore;
    const clarityScore = feedback.clarityScore;

    // ✅ 수정: 실제 백엔드 응답 필드들
    const improvementPoints = feedback.improvementPoints;
    const overallAnalysis = feedback.overallAnalysis;
    const sentenceAnalyses = feedback.sentenceAnalyses;
    const conversationImprovement = feedback.conversationImprovement;
    const originalTranscript = feedback.originalTranscript;

    // ✅ 수정: chosenAlternative 우선
    const chosenAlternative = feedback.chosenAlternative;

    // alternatives 객체 생성
    const alternatives = {
        alternativeA: feedback.alternativeA,
        alternativeB: feedback.alternativeB,
        alternativeC: feedback.alternativeC,
    };

    // 자세히 보기 핸들러
    const handleViewDetail = (alternativeKey) => {
        setSelectedAlternativeKey(alternativeKey);
        setIsModalOpen(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAlternativeKey(null);
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
                {/* 점수 카드 - 세부 점수 추가 전달 */}
                <FeedbackScoreCard
                    overallScore={overallScore}
                    grade={grade}
                    speechRateScore={speechRateScore}
                    fillerWordsScore={fillerWordsScore}
                    politenessScore={politenessScore}
                    clarityScore={clarityScore}
                />

                {/* 상세 피드백 - 백엔드 응답 구조에 맞게 수정 */}
                <FeedbackDetailSection
                    originalTranscript={originalTranscript}
                    improvementPoints={improvementPoints}
                    overallAnalysis={overallAnalysis}
                    sentenceAnalyses={sentenceAnalyses}
                    conversationImprovement={conversationImprovement}
                />

                {/* 개선안 */}
                {alternatives && (
                    <FeedbackAlternatives
                        alternatives={alternatives}
                        chosenAlternative={chosenAlternative}
                        onChoose={onChooseAlternative}
                        onViewDetail={handleViewDetail}
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

            {/* 상세 피드백 모달 */}
            {isModalOpen && (
                <FeedbackDetailModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    overallScore={overallScore}
                    grade={grade}
                    speechRateScore={speechRateScore}
                    fillerWordsScore={fillerWordsScore}
                    politenessScore={politenessScore}
                    clarityScore={clarityScore}
                    originalTranscript={originalTranscript}
                    improvementPoints={improvementPoints}
                    overallAnalysis={overallAnalysis}
                    sentenceAnalyses={sentenceAnalyses}
                    conversationImprovement={conversationImprovement}
                    selectedAlternative={selectedAlternativeKey}
                    alternativeContent={alternatives[`alternative${selectedAlternativeKey}`]}
                />
            )}
        </div>
    );
};

export default FeedbackResultView;