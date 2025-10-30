// src/components/User/PasswordChangeForm.jsx

import {useState} from 'react';
import {PasswordInput} from '../Auth/common/PasswordInput';

export function PasswordChangeForm({onSubmit, loading = false, error}) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
    });

    const [errors, setErrors] = useState({});

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

        if (!formData.currentPassword) {
            newErrors.currentPassword = '현재 비밀번호를 입력해주세요';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = '새 비밀번호를 입력해주세요';
        } else if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/.test(formData.newPassword)) {
            newErrors.newPassword = '영문, 숫자, 특수문자를 포함한 8-20자로 입력해주세요';
        }

        if (!formData.newPasswordConfirm) {
            newErrors.newPasswordConfirm = '새 비밀번호 확인을 입력해주세요';
        } else if (formData.newPassword !== formData.newPasswordConfirm) {
            newErrors.newPasswordConfirm = '새 비밀번호가 일치하지 않습니다';
        }

        if (formData.currentPassword === formData.newPassword) {
            newErrors.newPassword = '현재 비밀번호와 새 비밀번호가 같습니다';
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
        <form className="password-change-form" onSubmit={handleSubmit}>
            <div className="password-change-form__fields">
                <PasswordInput
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="현재 비밀번호"
                    error={errors.currentPassword}
                    disabled={loading}
                    required
                />

                <PasswordInput
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="새 비밀번호"
                    error={errors.newPassword}
                    disabled={loading}
                    required
                />

                <PasswordInput
                    name="newPasswordConfirm"
                    value={formData.newPasswordConfirm}
                    onChange={handleChange}
                    placeholder="새 비밀번호 확인"
                    error={errors.newPasswordConfirm}
                    disabled={loading}
                    required
                />
            </div>

            <div className="password-change-form__hint">
                <p>비밀번호는 영문, 숫자, 특수문자를 포함한 8-20자로 설정해주세요</p>
            </div>

            {error && (
                <div className="password-change-form__error">
                    {error}
                </div>
            )}

            <button
                type="submit"
                className={`password-change-form__submit ${loading ? 'password-change-form__submit--loading' : ''}`}
                disabled={loading}
            >
                {loading ? (
                    <div className="password-change-form__spinner"/>
                ) : (
                    '비밀번호 변경'
                )}
            </button>
        </form>
    );
}
