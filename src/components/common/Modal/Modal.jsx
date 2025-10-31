// src/components/common/Modal/Modal.jsx
import styles from './Modal.module.scss';
import { useEffect } from 'react';
import FeedbackResultView from '@/components/Feedback/FeedbackResultView';

const Modal = ({ isOpen, type, data, onClose }) => {
    // ESC 키로 닫기
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modal} onClick={onClose}>
            <div className={styles.modal__content} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modal__close} onClick={onClose}>
                    ✕
                </button>

                {type === 'feedbackDetail' && data && (
                    <FeedbackResultView
                        feedback={data}
                        onChooseAlternative={() => {}} // 히스토리에서는 선택 불가
                        onClose={onClose}
                    />
                )}
            </div>
        </div>
    );
};

export default Modal;
