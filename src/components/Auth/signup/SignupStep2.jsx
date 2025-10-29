// src/components/Auth/signup/SignupStep2.jsx
// import styles from './SignupStep2.module.scss';
import React, {useState} from 'react';
import TextInput from '@/components/common/inputs/TextInput';
import PasswordInput from '@/components/common/inputs/PasswordInput';
import DateInput from '@/components/common/inputs/DateInput';
import Select from '@/components/common/inputs/Select';
import {getErrorMessage, JOB_TYPE_OPTIONS,} from '@/utils/validation';

/**
 * 로컬 회원가입 Step 2 - 정보 입력
 *
 * @param {object} formData - 폼 데이터
 * @param {function} onFormChange - 폼 데이터 변경 핸들러
 * @param {function} onPrev - 이전 단계 핸들러
 * @param {function} onSubmit - 제출 핸들러
 * @param {boolean} isSubmitting - 제출 중 여부
 */
const SignupStep2 = ({formData, onFormChange, onPrev, onSubmit, isSubmitting}) => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // 입력 변경
    const handleChange = (e) => {
        const {name, value} = e.target;
        onFormChange({...formData, [name]: value});

        // jobType이 OTHER가 아니면 jobDetail 초기화
        if (name === 'jobType' && value !== 'OTHER') {
            onFormChange({...formData, [name]: value, jobDetail: ''});
        }

        // 실시간 검증
        if (touched[name]) {
            validateField(name, value);
        }
    };

    // 필드 블러
    const handleBlur = (name) => {
        setTouched({...touched, [name]: true});
        validateField(name, formData[name]);
    };

    // 개별 필드 검증
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'email':
                error = getErrorMessage.email(value);
                break;
            case 'password':
                error = getErrorMessage.password(value);
                break;
            case 'passwordConfirm':
                error = getErrorMessage.passwordConfirm(formData.password, value);
                break;
            case 'name':
                error = getErrorMessage.name(value);
                break;
            case 'birthDate':
                error = getErrorMessage.birthDate(value);
                break;
            case 'jobType':
                error = getErrorMessage.jobType(value);
                break;
            case 'jobDetail':
                if (formData.jobType === 'OTHER') {
                    error = getErrorMessage.jobDetail(value);
                }
                break;
            default:
                break;
        }

        setErrors({...errors, [name]: error});
        return error === '';
    };

    // 폼 검증
    const validateForm = () => {
        const newErrors = {};

        newErrors.email = getErrorMessage.email(formData.email);
        newErrors.password = getErrorMessage.password(formData.password);
        newErrors.passwordConfirm = getErrorMessage.passwordConfirm(formData.password, formData.passwordConfirm);
        newErrors.name = getErrorMessage.name(formData.name);
        newErrors.birthDate = getErrorMessage.birthDate(formData.birthDate);
        newErrors.jobType = getErrorMessage.jobType(formData.jobType);

        if (formData.jobType === 'OTHER') {
            newErrors.jobDetail = getErrorMessage.jobDetail(formData.jobDetail);
        }

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    // 제출
    const handleSubmit = (e) => {
        e.preventDefault();

        // 모든 필드 터치
        setTouched({
            email: true,
            password: true,
            passwordConfirm: true,
            name: true,
            birthDate: true,
            jobType: true,
            jobDetail: true,
        });

        if (validateForm()) {
            onSubmit();
        }
    };

    return (
        <div className="signup-step2">
            {/* 타이틀 */}
            <div className="signup-step2__header">
                <h2 className="signup-step2__title">회원 정보 입력</h2>
                <p className="signup-step2__subtitle">
                    회원가입을 위한 정보를 입력해주세요.
                </p>
            </div>

            {/* 폼 */}
            <form className="signup-step2__form" onSubmit={handleSubmit}>
                {/* 이메일 */}
                <TextInput
                    name="email"
                    label="이메일"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="example@email.com"
                    required
                    error={touched.email ? errors.email : ''}
                />

                {/* 비밀번호 */}
                <PasswordInput
                    name="password"
                    label="비밀번호"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="영문, 숫자, 특수문자 포함 8-20자"
                    required
                    error={touched.password ? errors.password : ''}
                />

                {/* 비밀번호 확인 */}
                <PasswordInput
                    name="passwordConfirm"
                    label="비밀번호 확인"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    onBlur={() => handleBlur('passwordConfirm')}
                    placeholder="비밀번호를 한 번 더 입력하세요"
                    required
                    error={touched.passwordConfirm ? errors.passwordConfirm : ''}
                />

                {/* 이름 */}
                <TextInput
                    name="name"
                    label="이름"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    placeholder="홍길동"
                    required
                    error={touched.name ? errors.name : ''}
                />

                {/* 생년월일 */}
                <DateInput
                    name="birthDate"
                    label="생년월일"
                    value={formData.birthDate}
                    onChange={handleChange}
                    onBlur={() => handleBlur('birthDate')}
                    required
                    error={touched.birthDate ? errors.birthDate : ''}
                    max={new Date().toISOString().split('T')[0]}
                />

                {/* 직업 */}
                <Select
                    name="jobType"
                    label="직업"
                    value={formData.jobType}
                    onChange={handleChange}
                    onBlur={() => handleBlur('jobType')}
                    options={JOB_TYPE_OPTIONS}
                    placeholder="직업을 선택하세요"
                    required
                    error={touched.jobType ? errors.jobType : ''}
                />

                {/* 직업 상세 */}
                {formData.jobType === 'OTHER' && (
                    <TextInput
                        name="jobDetail"
                        label="직업 상세"
                        value={formData.jobDetail}
                        onChange={handleChange}
                        onBlur={() => handleBlur('jobDetail')}
                        placeholder="직업을 입력해주세요"
                        required
                        error={touched.jobDetail ? errors.jobDetail : ''}
                    />
                )}

                {/* 버튼 */}
                <div className="signup-step2__actions">
                    <button
                        type="button"
                        className="signup-step2__prev-button"
                        onClick={onPrev}
                        disabled={isSubmitting}
                    >
                        이전
                    </button>

                    <button
                        type="submit"
                        className="signup-step2__submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '가입 중...' : '회원가입'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignupStep2;