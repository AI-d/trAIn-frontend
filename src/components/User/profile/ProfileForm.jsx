// src/components/User/ProfileForm.jsx

import {useEffect, useState} from 'react';
import {TextInput} from '../Auth/common/TextInput';
import {DateInput} from '../Auth/common/DateInput';
import {Select} from '../Auth/common/Select';

export function ProfileForm({user, onSave, loading = false, error}) {
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        jobType: '',
        jobDetail: ''
    });

    const [errors, setErrors] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    const jobOptions = [
        {value: 'STUDENT', label: '학생'},
        {value: 'EMPLOYEE', label: '직장인'},
        {value: 'FREELANCER', label: '프리랜서'},
        {value: 'ENTREPRENEUR', label: '사업가'},
        {value: 'UNEMPLOYED', label: '구직자'},
        {value: 'OTHER', label: '기타'}
    ];

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                birthDate: user.birthDate || '',
                jobType: user.jobType || '',
                jobDetail: user.jobDetail || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => {
            const newData = {...prev, [name]: value};
            setHasChanges(JSON.stringify(newData) !== JSON.stringify({
                name: user?.name || '',
                birthDate: user?.birthDate || '',
                jobType: user?.jobType || '',
                jobDetail: user?.jobDetail || ''
            }));
            return newData;
        });

        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = '이름을 입력해주세요';
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
        if (validateForm() && onSave) {
            onSave(formData);
        }
    };

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-form__section">
                <h3 className="profile-form__section-title">기본 정보</h3>

                <div className="profile-form__field">
                    <label>이메일</label>
                    <div className="profile-form__readonly">
                        {user?.email}
                    </div>
                </div>

                <TextInput
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="이름"
                    error={errors.name}
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
                <div className="profile-form__error">
                    {error}
                </div>
            )}

            <button
                type="submit"
                className={`profile-form__save-btn ${loading ? 'profile-form__save-btn--loading' : ''}`}
                disabled={loading || !hasChanges}
            >
                {loading ? (
                    <div className="profile-form__spinner"/>
                ) : (
                    '저장하기'
                )}
            </button>
        </form>
    );
}
