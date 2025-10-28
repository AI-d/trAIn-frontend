// src/components/Auth/SignupStep2.jsx

import {useState} from 'react';
import {TextInput} from './common/TextInput';
import {PasswordInput} from './common/PasswordInput';
import {DateInput} from './common/DateInput';
import {Select} from './common/Select';

export function SignupStep2({onSubmit, loading = false, error}) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        birthDate: '',
        jobType: '',
        jobDetail: ''
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

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

        if (!formData.name.trim()) {
            newErrors.name = '이름을 입력해주세요';
        }

        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요';
        } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(formData.password)) {
            newErrors.password = '영문, 숫자, 특수문자를 포함한 8-20자로 입력해주세요';
        }

        if (!formData.passwordConfirm) {
            newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
        } else if (formData.password !== formData.passwordConfirm) {
            newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
        }

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm() && onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <div className="signup-step2">
            <h2 className="signup-step2__title">회원 정보 입력</h2>

            <form className="signup-step2__form" onSubmit={handleSubmit}>
                <div className="signup-step2__fields">
                    <TextInput
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="이름"
                        error={errors.name}
                        disabled={loading}
                        required
                    />

                    <TextInput
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="이메일 주소"
                        error={errors.email}
                        disabled={loading}
                        required
                    />

                    <PasswordInput
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="비밀번호"
                        error={errors.password}
                        disabled={loading}
                        required
                    />

                    <PasswordInput
                        name="passwordConfirm"
                        value={formData.passwordConfirm}
                        onChange={handleChange}
                        placeholder="비밀번호 확인"
                        error={errors.passwordConfirm}
                        disabled={loading}
                        required
                    />

                    <DateInput
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        error={errors.birthDate}
                        disabled={loading}
                        required
                    />

                    <Select
                        name="jobType"
                        value={formData.jobType}
                        onChange={handleChange}
                        options={jobOptions}
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
                </div>

                {error && (
                    <div className="signup-step2__error">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className={`signup-step2__submit ${loading ? 'signup-step2__submit--loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <div className="signup-step2__spinner"/>
                    ) : (
                        '가입하기'
                    )}
                </button>
            </form>
        </div>
    );
}
