// src/pages/Auth/SocialSignupCompletePage.jsx
// import styles from './SocialSignupCompletePage.module.scss';
import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';
import SignupStep1 from '@/components/Auth/signup/SignupStep1';
import SocialSignupStep2 from '@/components/Auth/signup/SocialSignupStep2';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorMessage from '@/components/common/ErrorMessage';

/**
 * 소셜 신규 회원 가입 완료 페이지
 *
 * Step 1: 약관 동의
 * Step 2: 추가 정보 입력 (이름, 생년월일, 직업)
 */
const SocialSignupCompletePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const completeSocialSignup = useAuthStore((s) => s.completeSocialSignup);

    const [currentStep, setCurrentStep] = useState(1); // 1 or 2
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // socialTempToken
    const [socialTempToken, setSocialTempToken] = useState('');

    // Step 1: 약관 동의 데이터
    const [consents, setConsents] = useState([]);

    // Step 2: 추가 정보 데이터
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        jobType: '',
        jobDetail: '',
    });

    // URL에서 token 추출
    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setError('유효하지 않은 접근입니다.');
            setTimeout(() => {
                navigate('/', {replace: true});
            }, 2000);
            return;
        }

        setSocialTempToken(token);
    }, [searchParams, navigate]);

    // Step 1 → Step 2
    const handleStep1Next = () => {
        setCurrentStep(2);
    };

    // Step 2 → Step 1
    const handleStep2Prev = () => {
        setCurrentStep(1);
    };

    // 최종 제출
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError('');

            // payload 구성
            const payload = {
                socialTempToken,
                name: formData.name,
                birthDate: formData.birthDate,
                jobType: formData.jobType,
                jobDetail: formData.jobType === 'OTHER' ? formData.jobDetail : null,
                consents: consents.map(consent => ({
                    termsId: consent.termsId,
                    version: consent.version,
                    agreed: consent.agreed,
                })),
            };

            // 소셜 회원가입 완료 API 호출
            await completeSocialSignup(payload);

            // 성공 → 홈으로 이동
            navigate('/', {replace: true});

        } catch (err) {
            console.error('소셜 회원가입 완료 실패:', err);
            const errorData = err.response?.data;
            setError(errorData?.detail || errorData?.message || '회원가입에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 로딩 중
    if (!socialTempToken && !error) {
        return <LoadingOverlay fullscreen message="페이지를 불러오는 중..."/>;
    }

    return (
        <div className="social-signup-complete-page">
            <div className="social-signup-complete-page__container">
                {/* 진행 단계 표시 */}
                <div className="social-signup-complete-page__progress">
                    <div className={`social-signup-complete-page__step ${currentStep === 1 ? 'active' : ''}`}>
                        <span className="social-signup-complete-page__step-number">1</span>
                        <span className="social-signup-complete-page__step-label">약관 동의</span>
                    </div>
                    <div className="social-signup-complete-page__step-divider"/>
                    <div className={`social-signup-complete-page__step ${currentStep === 2 ? 'active' : ''}`}>
                        <span className="social-signup-complete-page__step-number">2</span>
                        <span className="social-signup-complete-page__step-label">정보 입력</span>
                    </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className="social-signup-complete-page__error">
                        <ErrorMessage message={error} type="error"/>
                    </div>
                )}

                {/* Step 1: 약관 동의 */}
                {currentStep === 1 && (
                    <SignupStep1
                        consents={consents}
                        onConsentsChange={setConsents}
                        onNext={handleStep1Next}
                    />
                )}

                {/* Step 2: 추가 정보 입력 */}
                {currentStep === 2 && (
                    <SocialSignupStep2
                        formData={formData}
                        onFormChange={setFormData}
                        onPrev={handleStep2Prev}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>

            {/* 전체 화면 로딩 */}
            {isSubmitting && <LoadingOverlay fullscreen message="회원가입을 완료하는 중..."/>}
        </div>
    );
};

export default SocialSignupCompletePage;