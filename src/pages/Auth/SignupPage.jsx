// src/pages/Auth/SignupPage.jsx
import styles from './SignupPage.module.scss';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import * as authService from '@/services/authService';
import SignupStep1 from '@/components/Auth/signup/SignupStep1';
import SignupStep2 from '@/components/Auth/signup/SignupStep2';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorMessage from '@/components/common/ErrorMessage';
import AuthLogo from '@/components/common/AuthLogo';

/**
 * 로컬 회원가입 페이지
 *
 * Step 1: 약관 동의
 * Step 2: 정보 입력
 */
const SignupPage = () => {
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1); // 1 or 2
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Step 1: 약관 동의 데이터
    const [consents, setConsents] = useState([]);

    // Step 2: 회원 정보 데이터
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
        birthDate: '',
        jobType: '',
        jobDetail: '',
    });

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
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm, // ← 필수!
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

            // 회원가입 API 호출
            const response = await authService.signup(payload);

            // 성공 → 이메일 인증 페이지로 이동
            navigate('/email-verification', {
                replace: true,
                state: {
                    email: formData.email,
                    emailVerificationToken: response.emailVerificationToken,
                },
            });

        } catch (err) {
            console.error('회원가입 실패:', err);
            const errorData = err.response?.data;

            // 이메일 중복 에러 (USER_002)
            if (errorData?.error === 'USER_002' || errorData?.errorCode === 'USER_002') {
                setError('이미 사용 중인 이메일입니다.');
                setCurrentStep(2); // Step 2로 이동하여 이메일 수정 가능하게
            } else {
                setError(errorData?.detail || errorData?.message || '회원가입에 실패했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles['signup-page']}>
            <div className={styles['signup-page__container']}>
                {/* 로고 */}
                <AuthLogo />

                {/* 타이틀 */}
                <div className={styles['signup-page__header']}>
                    <h1 className={styles['signup-page__title']}>회원가입</h1>
                    <p className={styles['signup-page__subtitle']}>
                        Dialogym과 함께 대화 실력을 향상시켜보세요.
                    </p>
                </div>

                {/* 단계 네비게이션 */}
                <div className={styles['signup-page__progress']}>
                    <div
                        className={`${styles['signup-page__step']} ${currentStep === 1 ? styles['active'] : ''}`}
                    >
                        <span className={styles['signup-page__step-number']}>1</span>
                        <span className={styles['signup-page__step-label']}>약관 동의</span>
                    </div>
                    <div className={styles['signup-page__step-divider']}/>
                    <div
                        className={`${styles['signup-page__step']} ${currentStep === 2 ? styles['active'] : ''}`}
                    >
                        <span className={styles['signup-page__step-number']}>2</span>
                        <span className={styles['signup-page__step-label']}>정보 입력</span>
                    </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <div className={styles['signup-page__error']}>
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

                {/* Step 2: 정보 입력 */}
                {currentStep === 2 && (
                    <SignupStep2
                        formData={formData}
                        onFormChange={setFormData}
                        onPrev={handleStep2Prev}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>

            {/* 전체 화면 로딩 */}
            {isSubmitting && <LoadingOverlay fullscreen message="회원가입을 처리하는 중..."/>}
        </div>
    );
};

export default SignupPage;