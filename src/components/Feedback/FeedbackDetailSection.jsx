// src/components/Feedback/FeedbackDetailSection.jsx
import styles from './FeedbackDetailSection.module.scss';

/**
 * 피드백 상세 섹션
 * @param {string} originalTranscript - 원본 발화 내용
 * @param {Array|string} improvementPoints - 개선 포인트 배열 또는 JSON 문자열
 * @param {Object} overallAnalysis - 전체 대화 흐름 분석
 * @param {Array} sentenceAnalyses - 문장별 세부 분석
 * @param {Object} conversationImprovement - 대화 전체 개선안
 */
const FeedbackDetailSection = ({
                                   originalTranscript,
                                   improvementPoints,
                                   overallAnalysis,
                                   sentenceAnalyses,
                                   conversationImprovement
                               }) => {
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
                {/* 원본 발화 */}
                {originalTranscript && (
                    <div className={styles['detail-section__block']}>
                        <h4 className={styles['detail-section__subtitle']}>
                            📝 원본 발화
                        </h4>
                        <p className={styles['detail-section__text']}>
                            "{originalTranscript}"
                        </p>
                    </div>
                )}

                {/* 전체 대화 흐름 분석 */}
                {overallAnalysis && (
                    <div className={styles['detail-section__block']}>
                        <h4 className={styles['detail-section__subtitle']}>
                            💬 전체 대화 분석
                        </h4>
                        {overallAnalysis.conversationFlow && (
                            <div className={styles['detail-section__item']}>
                                <strong>대화 흐름:</strong>
                                <p>{overallAnalysis.conversationFlow}</p>
                            </div>
                        )}
                        {overallAnalysis.communicationPattern && (
                            <div className={styles['detail-section__item']}>
                                <strong>소통 패턴:</strong>
                                <p>{overallAnalysis.communicationPattern}</p>
                            </div>
                        )}
                        {overallAnalysis.overallImprovements &&
                            overallAnalysis.overallImprovements.length > 0 && (
                                <div className={styles['detail-section__item']}>
                                    <strong>전반적인 개선점:</strong>
                                    <ul className={styles['detail-section__list']}>
                                        {overallAnalysis.overallImprovements.map((improvement, index) => (
                                            <li key={index}>
                                                <strong>{improvement.description}:</strong> {improvement.suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                    </div>
                )}

                {/* 개선 포인트 */}
                {parsedPoints && parsedPoints.length > 0 && (
                    <div className={styles['detail-section__block']}>
                        <h4 className={styles['detail-section__subtitle']}>
                            🎯 개선 포인트
                        </h4>
                        <ul className={styles['detail-section__list']}>
                            {parsedPoints.map((point, index) => (
                                <li key={index} className={styles['detail-section__list-item']}>
                                    <strong>{point.type}:</strong> {point.description}
                                    {point.count && (
                                        <span className={styles['detail-section__count']}>
                                            ({point.count}회)
                                        </span>
                                    )}
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

                {/* 문장별 세부 분석 */}
                {sentenceAnalyses && sentenceAnalyses.length > 0 && (
                    <div className={styles['detail-section__block']}>
                        <h4 className={styles['detail-section__subtitle']}>
                            🔍 문장별 분석
                        </h4>
                        <div className={styles['detail-section__sentences']}>
                            {sentenceAnalyses.map((sentence, index) => (
                                <div key={index} className={styles['detail-section__sentence']}>
                                    <div className={styles['detail-section__sentence-header']}>
                                        <span className={styles['detail-section__sentence-number']}>
                                            문장 {sentence.sequence}
                                        </span>
                                    </div>
                                    <div className={styles['detail-section__sentence-content']}>
                                        <p className={styles['detail-section__sentence-original']}>
                                            <strong>원본:</strong> "{sentence.content}"
                                        </p>
                                        {sentence.issues && sentence.issues.length > 0 && (
                                            <div className={styles['detail-section__issues']}>
                                                <strong>문제점:</strong>
                                                <ul>
                                                    {sentence.issues.map((issue, issueIndex) => (
                                                        <li key={issueIndex}>
                                                            <span className={styles[`detail-section__issue-${issue.impact}`]}>
                                                                [{issue.impact}]
                                                            </span>
                                                            {' '}
                                                            {issue.type}
                                                            {issue.count && ` (${issue.count}회)`}
                                                            : {issue.suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {sentence.improvedVersion && (
                                            <p className={styles['detail-section__sentence-improved']}>
                                                <strong>개선안:</strong> "{sentence.improvedVersion}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 대화 전체 개선안 */}
                {conversationImprovement && (
                    <div className={styles['detail-section__block']}>
                        <h4 className={styles['detail-section__subtitle']}>
                            ✨ 대화 패턴 개선안
                        </h4>
                        {conversationImprovement.currentPattern && (
                            <div className={styles['detail-section__item']}>
                                <strong>현재 패턴:</strong>
                                <p className={styles['detail-section__pattern--current']}>
                                    {conversationImprovement.currentPattern}
                                </p>
                            </div>
                        )}
                        {conversationImprovement.improvedPattern && (
                            <div className={styles['detail-section__item']}>
                                <strong>이상적인 패턴:</strong>
                                <p className={styles['detail-section__pattern--improved']}>
                                    {conversationImprovement.improvedPattern}
                                </p>
                            </div>
                        )}
                        {conversationImprovement.fullImprovedDialogue && (
                            <div className={styles['detail-section__item']}>
                                <strong>개선된 대화 예시:</strong>
                                <p className={styles['detail-section__dialogue']}>
                                    "{conversationImprovement.fullImprovedDialogue}"
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* 데이터가 하나도 없을 때 */}
                {!originalTranscript &&
                    !overallAnalysis &&
                    (!parsedPoints || parsedPoints.length === 0) &&
                    (!sentenceAnalyses || sentenceAnalyses.length === 0) &&
                    !conversationImprovement && (
                        <p className={styles['detail-section__empty']}>
                            피드백 내용이 없습니다.
                        </p>
                    )}
            </div>
        </div>
    );
};

export default FeedbackDetailSection;