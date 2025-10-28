// src/components/common/Modal/Modal.jsx
// import styles from './Modal.module.scss';
import React from 'react';
import TermsContent from './ModalContent/TermsContent';
import LoadingContent from './ModalContent/LoadingContent';
import FeedbackResultContent from './ModalContent/FeedbackResultContent';
import AlternativeSelectContent from './ModalContent/AlternativeSelectContent';
import FeedbackDetailContent from './ModalContent/FeedbackDetailContent';

/**
 * 통합 모달 컴포넌트
 *
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {string} type - 모달 타입 ('terms' | 'loading' | 'feedbackResult' | 'alternativeSelect' | 'feedbackDetail')
 * @param {object} data - 모달에 전달할 데이터
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {function} onSubmit - 제출 핸들러 (alternativeSelect에서 사용)
 * @param {function} onNext - 다음 단계 핸들러 (feedbackResult에서 사용)
 */
const Modal = ({ isOpen, type, data, onClose, onSubmit, onNext }) => {
    if (!isOpen) return null;

    // 타입에 따라 렌더링할 Content 선택
    const renderContent = () => {
        switch (type) {
            case 'terms':
                return <TermsContent data={data} />;
            case 'loading':
                return <LoadingContent data={data} />;
            case 'feedbackResult':
                return <FeedbackResultContent data={data} onNext={onNext} />;
            case 'alternativeSelect':
                return <AlternativeSelectContent data={data} onSubmit={onSubmit} />;
            case 'feedbackDetail':
                return <FeedbackDetailContent data={data} />;
            default:
                return null;
        }
    };

    // 배경 클릭 시 닫기 (loading 타입은 닫기 방지)
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && type !== 'loading') {
            onClose?.();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className={`modal-content ${type === 'feedbackDetail' ? 'modal-content--wide' : ''}`}>
                {/* 닫기 버튼 (loading 타입은 표시 안 함) */}
                {type !== 'loading' && (
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                )}

                {/* Content 영역 */}
                <div className="modal-body">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Modal;