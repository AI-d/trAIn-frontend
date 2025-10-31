// src/components/User/feedback/FeedbackHistory.jsx
import styles from './FeedbackHistory.module.scss';
import { useEffect, useState, useMemo } from 'react';
import { useAuthUser } from '@/stores/authStore';
import * as feedbackService from '@/services/feedbackService';
import FeedbackCard from './FeedbackCard';
import FeedbackFilter from './FeedbackFilter';
import ErrorMessage from '@/components/common/ErrorMessage';
import FeedbackDetailModal from '@/components/Feedback/FeedbackDetailModal';
import toast from 'react-hot-toast';

/**
 * 피드백 히스토리 컴포넌트
 * 사용자의 피드백 목록을 표시
 */
const FeedbackHistory = () => {
    const user = useAuthUser();

    const [allFeedbacks, setAllFeedbacks] = useState([]); // 전체 피드백 목록 (간략)
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [error, setError] = useState('');

    // 필터/정렬
    const [selectedGrade, setSelectedGrade] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('createdAt,desc');

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 10;

    // 모달
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null); // 상세 피드백

    // 피드백 목록 로딩 (전체 조회)
    useEffect(() => {
        if (!user?.userId) return;

        const fetchFeedbacks = async () => {
            try {
                setLoading(true);
                setError('');

                console.log('피드백 목록 로딩 시작 - userId:', user.userId);

                // 페이징으로 조회 (전체 목록)
                const response = await feedbackService.getFeedbackHistory(
                    user.userId,
                    {
                        page: 0,
                        size: 1000, // 큰 사이즈로 전체 조회
                        sort: sortOrder,
                    }
                );

                console.log('✅ 피드백 목록 로딩 성공:', response);
                setAllFeedbacks(response.content || []);

            } catch (err) {
                console.error('피드백 목록 로딩 실패:', err);
                console.error('에러 상세:', err.response?.data);
                setError(err.response?.data?.message || '피드백 목록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [user?.userId, sortOrder]);

    // 필터링 및 정렬된 피드백 목록 (프론트엔드에서 처리)
    const filteredFeedbacks = useMemo(() => {
        let filtered = [...allFeedbacks];

        // 등급 필터링
        if (selectedGrade !== 'ALL') {
            filtered = filtered.filter(f => f.scoreGrade === selectedGrade);
        }

        // 정렬
        const [sortField, sortDirection] = sortOrder.split(',');
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            // 날짜 처리
            if (sortField === 'createdAt') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [allFeedbacks, selectedGrade, sortOrder]);

    // 현재 페이지의 피드백 목록
    const currentPageFeedbacks = useMemo(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredFeedbacks.slice(startIndex, endIndex);
    }, [filteredFeedbacks, currentPage]);

    // 전체 페이지 수
    const totalPages = Math.ceil(filteredFeedbacks.length / pageSize);

    // 등급 필터 변경
    const handleGradeChange = (grade) => {
        setSelectedGrade(grade);
        setCurrentPage(0); // 첫 페이지로 리셋
    };

    // 정렬 변경
    const handleSortChange = (sort) => {
        setSortOrder(sort);
        setCurrentPage(0); // 첫 페이지로 리셋
    };

    // 페이지 변경
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    // 피드백 상세 보기 - 개별 API 호출
    const handleViewDetail = async (feedbackSummary) => {
        try {
            setLoadingDetail(true);
            setModalOpen(true);
            setSelectedFeedback(null); // 로딩 상태 표시를 위해 null로 초기화

            console.log('📋 피드백 상세 조회 - sessionId:', feedbackSummary.sessionId);

            // 개별 피드백 API 호출 (전체 정보 포함)
            const detailFeedback = await feedbackService.getFeedback(feedbackSummary.sessionId);

            console.log('✅ 피드백 상세 조회 성공:', detailFeedback);
            console.log('📊 상세 데이터 구조:', {
                totalScore: detailFeedback?.totalScore,
                scoreGrade: detailFeedback?.scoreGrade,
                speechRateScore: detailFeedback?.speechRateScore,
                fillerWordsScore: detailFeedback?.fillerWordsScore,
                politenessScore: detailFeedback?.politenessScore,
                clarityScore: detailFeedback?.clarityScore,
                overallAnalysis: detailFeedback?.overallAnalysis,
                sentenceAnalyses: detailFeedback?.sentenceAnalyses,
                conversationImprovement: detailFeedback?.conversationImprovement,
                improvementPoints: detailFeedback?.improvementPoints,
            });

            setSelectedFeedback(detailFeedback);

        } catch (err) {
            console.error('피드백 상세 조회 실패:', err);
            toast.error('피드백 상세 정보를 불러오는데 실패했습니다.');
            setModalOpen(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedFeedback(null);
    };

    // 로딩 중
    if (loading) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p>피드백 목록을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className={styles['feedback-history']}>
            {/* 헤더 */}
            <div className={styles['feedback-history__header']}>
                <h2 className={styles['feedback-history__title']}>피드백 히스토리</h2>
                <p className={styles['feedback-history__subtitle']}>
                    AI가 분석한 대화 피드백을 확인하세요.
                </p>
            </div>

            {/* 필터/정렬 */}
            <FeedbackFilter
                selectedGrade={selectedGrade}
                sortOrder={sortOrder}
                onGradeChange={handleGradeChange}
                onSortChange={handleSortChange}
            />

            {/* 에러 메시지 */}
            {error && (
                <div className={styles['feedback-history__error']}>
                    <ErrorMessage message={error} type="error" />
                </div>
            )}

            {/* 피드백 목록 */}
            <div className={styles['feedback-history__list']}>
                {currentPageFeedbacks.length === 0 ? (
                    <div className={styles['feedback-history__empty']}>
                        {allFeedbacks.length === 0 ? (
                            <>
                                <p>아직 피드백이 없습니다.</p>
                                <p>대화 훈련을 시작해보세요!</p>
                            </>
                        ) : (
                            <p>해당 등급의 피드백이 없습니다.</p>
                        )}
                    </div>
                ) : (
                    currentPageFeedbacks.map(feedback => (
                        <FeedbackCard
                            key={feedback.sessionId}
                            feedback={feedback}
                            onViewDetail={handleViewDetail}
                        />
                    ))
                )}
            </div>

            {/* 피드백 개수 표시 */}
            {filteredFeedbacks.length > 0 && (
                <div className={styles['feedback-history__count']}>
                    총 {filteredFeedbacks.length}개의 피드백
                </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className={styles['feedback-history__pagination']}>
                    <button
                        className={styles['feedback-history__page-button']}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        이전
                    </button>
                    <span className={styles['feedback-history__page-info']}>
                        {currentPage + 1} / {totalPages}
                    </span>
                    <button
                        className={styles['feedback-history__page-button']}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                    >
                        다음
                    </button>
                </div>
            )}

            {/* 피드백 상세 모달 */}
            {modalOpen && selectedFeedback && (
                <FeedbackDetailModal
                    isOpen={modalOpen}
                    onClose={handleCloseModal}
                    overallScore={selectedFeedback.totalScore}
                    grade={selectedFeedback.scoreGrade}
                    aiGeneratedFeedback={selectedFeedback.aiGeneratedFeedback}
                    improvementPoints={selectedFeedback.improvementPoints}
                    selectedAlternative={selectedFeedback.chosenAlternative}
                    alternativeContent={
                        selectedFeedback.chosenAlternative 
                            ? selectedFeedback[`alternative${selectedFeedback.chosenAlternative}`]
                            : null
                    }
                />
            )}
            
            {/* 로딩 중 모달 */}
            {modalOpen && loadingDetail && (
                <div className={styles['feedback-history__loading-modal']}>
                    <div className={styles['feedback-history__loading-content']}>
                        <p>피드백을 불러오는 중...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackHistory;