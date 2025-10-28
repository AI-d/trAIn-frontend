// src/pages/Auth/SocialSignupCompletePage.jsx

import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';
import {DateInput} from '@/components/Auth/common/DateInput';
import {Select} from '@/components/Auth/common/Select';
import {TextInput} from '@/components/Auth/common/TextInput';

export function SocialSignupCompletePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {completeSocialSignup} = useAuthStore();

    const [socialToken, setSocialToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        birthDate: '',
        jobType: '',
        jobDetail: '',
        marketingConsent: false
    });

    const [errors, setErrors] = useState({});

    const jobOptions = [
        {value: 'STUDENT', label: '학생'},
        {value: 'EMPLOYEE', label: '직장인'},
        {value: 'FREELANCER', label: '프리랜서'},
        {value: 'ENTREPRENEUR', label: '사업가'},
        {value: 'UNEMPLOYED', label: '구직자'},
        {value: 'OTHER', label: '기타'}
    ];

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            navigate('/login');
            return;
        }

        setSocialToken(token);

        window.history.replaceState({}, document.title, window.location.pathname);
    }, [searchParams, navigate]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.birthDate) {
            newErrors.birthDate = '생년월일을 입력해주세요';
        }

        if (!formData.jobType) {
            newErrors.jobType = '직업을 선택해주세요';
        }

        if (formData.jobType === 'OTHER' && !formData.jobDetail.trim()) {
            newErrors.jobDetail = '직업 상세를 입력해주세요';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const payload = {
                birthDate: formData.birthDate,
                jobType: formData.jobType,
                jobDetail: formData.jobType === 'OTHER' ? formData.jobDetail : null,
                consents: [
                    {
                        termsId: 'MARKETING_CONSENT',
                        version: '1.0',
                        agreed: formData.marketingConsent,
                        required: false
                    }
                ]
            };

            await completeSocialSignup(payload);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || '가입 완료 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (!socialToken) {
        return null;
    }

    return (
        <div className="social-signup-complete-page">
            <header className="social-signup-complete-page__header">
                <div className="social-signup-complete-page__logo">
                    <span>Dialogym</span>
                </div>
            </header>

            <main className="social-signup-complete-page__main">
                <div className="social-signup-complete-page__container">
                    <h1 className="social-signup-complete-page__title">추가 정보 입력</h1>
                    <p className="social-signup-complete-page__subtitle">
                        마지막 단계입니다. 추가 정보를 입력해주세요.
                    </p>

                    <form onSubmit={handleSubmit} className="social-signup-complete-form">
                        <div className="social-signup-complete-form__fields">
                            <DateInput
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                label="생년월일"
                                error={errors.birthDate}
                                disabled={loading}
                                required
                            />

                            <Select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleChange}
                                options={jobOptions}
                                label="직업"
                                placeholder="직업을 선택하세요"
                                error={errors.jobType}
                                disabled={loading}
                                required
                            />

                            {formData.jobType === 'OTHER' && (
                                <TextInput
                                    name="jobDetail"
                                    value={formData.jobDetail}
                                    onChange={handleChange}
                                    placeholder="직업을 입력해주세요"
                                    error={errors.jobDetail}
                                    disabled={loading}
                                    required
                                />
                            )}

                            <div className="social-signup-complete-form__checkbox">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="marketingConsent"
                                        checked={formData.marketingConsent}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                    <span className="checkbox-label__text">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </span>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="social-signup-complete-form__error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`social-signup-complete-form__submit ${loading ? 'social-signup-complete-form__submit--loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="social-signup-complete-form__spinner"/>
                            ) : (
                                '가입 완료'
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
