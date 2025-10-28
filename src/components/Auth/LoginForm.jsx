// src/components/Auth/LoginForm.jsx

import {useState} from 'react';
import {TextInput} from './common/TextInput.jsx';
import {PasswordInput} from './common/PasswordInput.jsx';

export function LoginForm({onSubmit, loading = false, error}) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요';
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
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__fields">
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
            </div>

            {error && (
                <div className="login-form__error">
                    {error}
                </div>
            )}

            <button
                className={`login-form__submit ${loading ? 'login-form__submit--loading' : ''}`}
                type="submit"
                disabled={loading}
            >
                {loading ? (
                    <div className="login-form__spinner"/>
                ) : (
                    '로그인'
                )}
            </button>
        </form>
    );
}
