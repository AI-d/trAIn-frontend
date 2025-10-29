// src/components/User/feedback/FeedbackHistory.jsx
// import styles from './FeedbackHistory.module.scss';
import React, {useEffect, useState} from 'react';
import {useAuthUser} from '@/stores/authStore';
import * as feedbackService from '@/services/feedbackService';
import FeedbackCard from './FeedbackCard';
import FeedbackFilter from './FeedbackFilter';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorMessage from '@/components/common/ErrorMessage';
import Modal from '@/components/common/Modal/Modal';

/**
 * 피드백 히스토리 컴포넌트
 * 사용자의 피드백 목록을 표시
 */
const FeedbackHistory = () => {
    const user = useAuthUser();

    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 필터/정렬
    const [selectedGrade, setSelectedGrade] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('createdAt,desc');

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    // 모달
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // 피드백 목록 로딩
    useEffect(() => {
        if (!user?.userId) return;

        const fetchFeedbacks = async () => {
            try {
                setLoading(true);
                setError('');

                let response;

                // 등급 필터가 있으면 등급별 조회
                if (selectedGrade !== 'ALL') {
                    response = await feedbackService.getFeedbacksByGrade(
                        user.userId,
                        selectedGrade,
                        {
                            page: currentPage,
                            size: 10,
                            sort: sortOrder,
                        }
                    );
                } else {
                    // 전체 조회
                    response = await feedbackService.getFeedbackHistory(
                        user.userId,
                        {
                            page: currentPage,
                            size: 10,
                            sort: sortOrder,
                        }
                    );
                }

                setFeedbacks(response.content || []);
                setTotalPages(response.totalPages || 0);
                setHasMore(!response.last);

            } catch (err) {
                console.error('피드백 목록 로딩 실패:', err);
                setError('피드백 목록을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, [user?.userId, selectedGrade, sortOrder, currentPage]);

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

    // 피드백 상세 보기
    const handleViewDetail = (feedback) => {
        setSelectedFeedback(feedback);
        setModalOpen(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedFeedback(null);
    };

    // 로딩 중
    if (loading && feedbacks.length === 0) {
        return <LoadingOverlay message="피드백 목록을 불러오는 중..."/>;
    }

    return (
        <div className="feedback-history">
            {/* 헤더 */}
            <div className="feedback-history__header">
                <h2 className="feedback-history__title">피드백 히스토리</h2>
                <p className="feedback-history__subtitle">
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
                <div className="feedback-history__error">
                    <ErrorMessage message={error} type="error"/>
                </div>
            )}

            {/* 피드백 목록 */}
            <div className="feedback-history__list">
                {feedbacks.length === 0 ? (
                    <div className="feedback-history__empty">
                        <p>아직 피드백이 없습니다.</p>
                        <p>대화 훈련을 시작해보세요!</p>
                    </div>
                ) : (
                    feedbacks.map(feedback => (
                        <FeedbackCard
                            key={feedback.sessionId}
                            feedback={feedback}
                            onViewDetail={handleViewDetail}
                        />
                    ))
                )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="feedback-history__pagination">
                    <button
                        className="feedback-history__page-button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                    >
                        이전
                    </button>
                    <span className="feedback-history__page-info">
            {currentPage + 1} / {totalPages}
          </span>
                    <button
                        className="feedback-history__page-button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasMore}
                    >
                        다음
                    </button>
                </div>
            )}

            {/* 피드백 상세 모달 */}
            <Modal
                isOpen={modalOpen}
                type="feedbackDetail"
                data={selectedFeedback}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default FeedbackHistory;