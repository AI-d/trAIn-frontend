// src/pages/User/PasswordChangePage.jsx

import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PasswordChangeForm} from '@/components/User/PasswordChangeForm';
import * as userService from '@/services/userService';

export function PasswordChangePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handlePasswordChange = async (formData) => {
        setLoading(true);
        setError('');

        try {
            await userService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                newPasswordConfirm: formData.newPasswordConfirm
            });

            setSuccess(true);

            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/profile');
    };

    if (success) {
        return (
            <div className="password-change-page">
                <div className="password-change-page__success">
                    <div className="success-icon">✓</div>
                    <h2>비밀번호가 성공적으로 변경되었습니다</h2>
                    <p>잠시 후 프로필 페이지로 이동합니다...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="password-change-page">
            <header className="password-change-page__header">
                <button
                    className="password-change-page__back-btn"
                    onClick={handleBack}
                    type="button"
                >
                    ← 뒤로
                </button>
                <h1 className="password-change-page__title">비밀번호 변경</h1>
            </header>

            <main className="password-change-page__main">
                <div className="password-change-page__container">
                    <div className="password-change-page__content">
                        <div className="password-change-page__info">
                            <h2>새로운 비밀번호를 설정해주세요</h2>
                            <p>보안을 위해 현재 비밀번호를 먼저 확인합니다</p>
                        </div>

                        <PasswordChangeForm
                            onSubmit={handlePasswordChange}
                            loading={loading}
                            error={error}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
