// src/components/Auth/signup/SignupStep1.jsx
import styles from './SignupStep1.module.scss';
import React, {useState} from 'react';
import TermsList from './terms/TermsList';
import Modal from '@/components/common/Modal/Modal';
import {validateRequiredTerms} from '@/utils/validation';
import ErrorMessage from '@/components/common/ErrorMessage';

/**
 * 회원가입 Step 1 - 약관 동의
 * 로컬 회원가입, 소셜 회원가입 모두 사용
 *
 * @param {Array} consents - 약관 동의 상태
 * @param {function} onConsentsChange - 약관 동의 변경 핸들러
 * @param {function} onNext - 다음 단계로 이동 핸들러
 */
const SignupStep1 = ({consents, onConsentsChange, onNext}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [error, setError] = useState('');

    // 필수 약관 동의 여부 확인
    const isRequiredTermsAgreed = validateRequiredTerms(consents);

    // 약관 상세 보기
    const handleViewDetail = (term) => {
        setSelectedTerm(term);
        setModalOpen(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedTerm(null);
    };

    // 다음 단계로
    const handleNext = () => {
        // 필수 약관 검증
        if (!isRequiredTermsAgreed) {
            setError('필수 약관에 모두 동의해주세요.');
            return;
        }

        setError('');
        onNext();
    };

    return (
        <div className={styles['signup-step1']}>
            {/* 타이틀 */}
            <div className={styles['signup-step1__header']}>
                <h2 className={styles['signup-step1__title']}>약관 동의</h2>
                <p className={styles['signup-step1__subtitle']}>
                    서비스 이용을 위해 약관에 동의해주세요.
                </p>
            </div>

            {/* 약관 목록 */}
            <div className={styles['signup-step1__content']}>
                <TermsList
                    consents={consents}
                    onConsentsChange={onConsentsChange}
                    onViewDetail={handleViewDetail}
                />
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div className={styles['signup-step1__error']}>
                    <ErrorMessage message={error} type="error"/>
                </div>
            )}

            {/* 다음 버튼 */}
            <div className={styles['signup-step1__actions']}>
                <button
                    type="button"
                    className={styles['signup-step1__next-button']}
                    onClick={handleNext}
                    disabled={!isRequiredTermsAgreed}
                >
                    다음
                </button>
            </div>

            {/* 약관 상세 모달 */}
            <Modal
                isOpen={modalOpen}
                type="terms"
                data={{
                    title: selectedTerm?.title,
                    content: selectedTerm?.content,
                }}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default SignupStep1;