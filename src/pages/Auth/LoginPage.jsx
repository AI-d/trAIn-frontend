// src/pages/Auth/LoginPage.jsx
import styles from './LoginPage.module.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoginForm from '@/components/Auth/LoginForm';
import SocialButtonGroup from '@/components/Auth/SocialButtonGroup';
import { API_BASE_URL } from '@/services/apiClient';
import AuthLogo from '@/components/common/AuthLogo';

/**
 * 로그인 페이지
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인된 사용자는 리다이렉트
  useEffect(() => {
    if (isInitialized && status === 'authenticated') {
      const next = searchParams.get('next');
      navigate(next || '/scenarios', { replace: true });
    }
  }, [isInitialized, status, navigate, searchParams]);

  // 로컬 로그인 제출
  const handleSubmit = async (credentials) => {
    try {
      setIsSubmitting(true);
      setError('');

      await login(credentials);

      // 성공 → 시나리오 목록으로 이동
      navigate('/scenarios', { replace: true });

    } catch (err) {
      console.error('로그인 실패:', err);
      const errorData = err.response?.data;
      setError(errorData?.detail || errorData?.message || '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 소셜 로그인
  const handleSocialLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  return (
    <div className={styles['login-page']}>
      <div className={styles['login-page__container']}>
        {/* 로고 */}
        <AuthLogo />

        {/* 타이틀 */}
        <div className={styles['login-page__header']}>
          <h1 className={styles['login-page__title']}>로그인</h1>
          <p className={styles['login-page__subtitle']}>
            Dialogym에 오신 것을 환영합니다.
          </p>
        </div>

        {/* 로컬 로그인 폼 */}
        <div className={styles['login-page__form']}>
          <LoginForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        </div>

        {/* 구분선 */}
        <div className={styles['login-page__divider']}>
          <span className={styles['login-page__divider-text']}>또는</span>
        </div>

        {/* 소셜 로그인 */}
        <div className={styles['login-page__social']}>
          <SocialButtonGroup onSocialLogin={handleSocialLogin} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
