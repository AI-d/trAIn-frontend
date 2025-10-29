// src/components/Auth/signup/SocialSignupStep2.jsx
// import styles from './SocialSignupStep2.module.scss';
import React, {useState} from 'react';
import DateInput from '@/components/common/inputs/DateInput';
import Select from '@/components/common/inputs/Select';
import TextInput from '@/components/common/inputs/TextInput';
import {getErrorMessage, JOB_TYPE_OPTIONS,} from '@/utils/validation';

/**
 * 소셜 회원가입 Step 2 - 추가 정보 입력
 *
 * @param {object} formData - 폼 데이터 { birthDate, jobType, jobDetail }
 * @param {function} onFormChange - 폼 데이터 변경 핸들러
 * @param {function} onPrev - 이전 단계로 이동 핸들러
 * @param {function} onSubmit - 제출 핸들러
 * @param {boolean} isSubmitting - 제출 중 여부
 */
const SocialSignupStep2 = ({formData, onFormChange, onPrev, onSubmit, isSubmitting}) => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // 입력 필드 변경
    const handleChange = (e) => {
        const {name, value} = e.target;
        onFormChange({...formData, [name]: value});

        // jobType이 OTHER가 아니면 jobDetail 초기화
        if (name === 'jobType' && value !== 'OTHER') {
            onFormChange({...formData, [name]: value, jobDetail: ''});
        }

        // 실시간 검증 (이미 터치된 필드만)
        if (touched[name]) {
            validateField(name, value);
        }
    };

    // 필드 블러 처리
    const handleBlur = (name) => {
        setTouched({...touched, [name]: true});
        validateField(name, formData[name]);
    };

    // 개별 필드 검증
    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'birthDate':
                error = getErrorMessage.birthDate(value);
                break;
            case 'jobType':
                error = getErrorMessage.jobType(value);
                break;
            case 'jobDetail':
                // jobType이 OTHER일 때만 검증
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

    // 전체 폼 검증
    const validateForm = () => {
        const newErrors = {};

        newErrors.birthDate = getErrorMessage.birthDate(formData.birthDate);
        newErrors.jobType = getErrorMessage.jobType(formData.jobType);

        // jobType이 OTHER일 때만 jobDetail 검증
        if (formData.jobType === 'OTHER') {
            newErrors.jobDetail = getErrorMessage.jobDetail(formData.jobDetail);
        }

        setErrors(newErrors);

        // 모든 에러가 없으면 true
        return Object.values(newErrors).every(error => error === '');
    };

    // 제출
    const handleSubmit = (e) => {
        e.preventDefault();

        // 모든 필드를 터치 상태로 변경
        setTouched({
            birthDate: true,
            jobType: true,
            jobDetail: true,
        });

        // 전체 검증
        if (validateForm()) {
            onSubmit();
        }
    };

    return (
        <div className="social-signup-step2">
            {/* 타이틀 */}
            <div className="social-signup-step2__header">
                <h2 className="social-signup-step2__title">추가 정보 입력</h2>
                <p className="social-signup-step2__subtitle">
                    서비스 이용을 위해 추가 정보를 입력해주세요.
                </p>
            </div>

            {/* 폼 */}
            <form className="social-signup-step2__form" onSubmit={handleSubmit}>
                {/* 생년월일 */}
                <DateInput
                    name="birthDate"
                    label="생년월일"
                    value={formData.birthDate}
                    onChange={handleChange}
                    onBlur={() => handleBlur('birthDate')}
                    required
                    error={touched.birthDate ? errors.birthDate : ''}
                    max={new Date().toISOString().split('T')[0]} // 오늘 날짜까지만
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

                {/* 직업 상세 (jobType이 OTHER일 때만 표시) */}
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

                {/* 버튼 영역 */}
                <div className="social-signup-step2__actions">
                    {/* 이전 버튼 */}
                    <button
                        type="button"
                        className="social-signup-step2__prev-button"
                        onClick={onPrev}
                        disabled={isSubmitting}
                    >
                        이전
                    </button>

                    {/* 완료 버튼 */}
                    <button
                        type="submit"
                        className="social-signup-step2__submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '가입 중...' : '가입 완료'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SocialSignupStep2;