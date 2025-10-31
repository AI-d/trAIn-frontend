// src/components/Auth/LoginForm.jsx
import styles from './LoginForm.module.scss';
import {useState} from 'react';
import TextInput from '@/components/common/inputs/TextInput';
import PasswordInput from '@/components/common/inputs/PasswordInput';
import ErrorMessage from '@/components/common/ErrorMessage';
import {getErrorMessage} from '@/utils/validation';

/**
 * 로그인 폼 컴포넌트
 *
 * @param {function} onSubmit - 로그인 제출 핸들러
 * @param {boolean} isSubmitting - 제출 중 여부
 * @param {string} error - 에러 메시지
 */
const LoginForm = ({onSubmit, isSubmitting, error}) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // 입력 변경
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});

        // 실시간 검증 (터치된 필드만)
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

        if (name === 'email') {
            error = getErrorMessage.email(value);
        } else if (name === 'password') {
            if (!value) {
                error = '비밀번호를 입력해주세요.';
            }
        }

        setErrors({...errors, [name]: error});
        return error === '';
    };

    // 폼 검증
    const validateForm = () => {
        const newErrors = {};

        newErrors.email = getErrorMessage.email(formData.email);

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        }

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    // 제출
    const handleSubmit = (e) => {
        e.preventDefault();

        // 모든 필드 터치 처리
        setTouched({
            email: true,
            password: true,
        });

        // 검증
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form className={styles['login-form']} onSubmit={handleSubmit}>
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
                placeholder="비밀번호를 입력하세요"
                required
                error={touched.password ? errors.password : ''}
            />

            {/* 서버 에러 메시지 */}
            {error && (
                <div className={styles['login-form__error']}>
                    <ErrorMessage message={error} type="error"/>
                </div>
            )}

            {/* 로그인 버튼 */}
            <button
                type="submit"
                className={styles['login-form__submit-button']}
                disabled={isSubmitting}
            >
                {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            {/* 회원가입 링크 */}
            <div className={styles['login-form__signup-link']}>
                <span>계정이 없으신가요?</span>
                <a href="/signup" className={styles['login-form__link']}>
                    회원가입
                </a>
            </div>
        </form>
    );
};

export default LoginForm;