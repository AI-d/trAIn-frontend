// src/pages/Auth/SignupPage.jsx

import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {SignupStep1} from '@/components/Auth/SignupStep1';
import {SignupStep2} from '@/components/Auth/SignupStep2';
import {SignupNavigation} from '@/components/Auth/SignupNavigation';
import * as authService from '@/services/authService';

export function SignupPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailVerificationToken, setEmailVerificationToken] = useState('');

    const handleSignInClick = () => {
        navigate('/login');
    };

    const handleStep1Change = (newConsents) => {
        setConsents(newConsents);
    };

    const canGoToStep2 = () => {
        return consents.filter(c => c.required).every(c => c.agreed);
    };

    const handleNext = () => {
        if (currentStep === 1 && canGoToStep2()) {
            setCurrentStep(2);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStep2Submit = async (formData) => {
        setLoading(true);
        setError('');

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.passwordConfirm,
                birthDate: formData.birthDate,
                jobType: formData.jobType,
                jobDetail: formData.jobType === 'OTHER' ? formData.jobDetail : null,
                consents: consents
            };

            const response = await authService.signup(payload);

            if (response.emailVerificationToken) {
                setEmailVerificationToken(response.emailVerificationToken);

                sessionStorage.setItem('emailVerificationToken', response.emailVerificationToken);
                sessionStorage.setItem('signupEmail', formData.email);

                navigate('/verify-email');
            }
        } catch (err) {
            setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <header className="signup-page__header">
                <div className="signup-page__logo">
                    <span className="signup-page__logo-text">Dialogym</span>
                </div>
                <button
                    className="signup-page__signin-btn"
                    onClick={handleSignInClick}
                    type="button"
                >
                    로그인
                </button>
            </header>

            <main className="signup-page__main">
                <div className="signup-page__container">
                    <SignupNavigation
                        currentStep={currentStep}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        canGoNext={canGoToStep2()}
                        loading={loading}
                    />

                    {currentStep === 1 && (
                        <SignupStep1
                            value={consents}
                            onChange={handleStep1Change}
                        />
                    )}

                    {currentStep === 2 && (
                        <SignupStep2
                            onSubmit={handleStep2Submit}
                            loading={loading}
                            error={error}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
