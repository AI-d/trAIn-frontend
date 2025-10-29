// src/utils/validation.js

/**
 * 이메일 형식 검증
 * @param {string} email - 검증할 이메일
 * @returns {boolean} 유효하면 true
 */
export const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * 비밀번호 형식 검증
 * 영문, 숫자, 특수문자 포함 8-20자
 * @param {string} password - 검증할 비밀번호
 * @returns {boolean} 유효하면 true
 */
export const validatePassword = (password) => {
    if (!password) return false;
    // 최소 8자, 최대 20자
    if (password.length < 8 || password.length > 20) return false;

    // 영문, 숫자, 특수문자 각각 최소 1개 포함
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasLetter && hasNumber && hasSpecialChar;
};

/**
 * 비밀번호 확인 검증
 * @param {string} password - 원본 비밀번호
 * @param {string} passwordConfirm - 확인 비밀번호
 * @returns {boolean} 일치하면 true
 */
export const validatePasswordConfirm = (password, passwordConfirm) => {
    if (!password || !passwordConfirm) return false;
    return password === passwordConfirm;
};

/**
 * 이름 검증 (2-50자)
 * @param {string} name - 검증할 이름
 * @returns {boolean} 유효하면 true
 */
export const validateName = (name) => {
    if (!name) return false;
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 50;
};

/**
 * 생년월일 검증 (YYYY-MM-DD)
 * @param {string} birthDate - 검증할 생년월일
 * @returns {boolean} 유효하면 true
 */
export const validateBirthDate = (birthDate) => {
    if (!birthDate) return false;

    // YYYY-MM-DD 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) return false;

    // 실제 날짜인지 검증
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) return false;

    // 미래 날짜 불가
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) return false;

    // 1900년 이후만 허용
    const minDate = new Date('1900-01-01');
    if (date < minDate) return false;

    const minAge = 14;
    const minBirthDate = new Date();
    minBirthDate.setFullYear(minBirthDate.getFullYear() - minAge);
    minBirthDate.setHours(0, 0, 0, 0);

    if (date > minBirthDate) return false;

    return true;
};

/**
 * 직업 타입 검증
 * @param {string} jobType - 검증할 직업 타입
 * @returns {boolean} 유효하면 true
 */
export const validateJobType = (jobType) => {
    if (!jobType) return false;

    const validJobTypes = [
        'STUDENT',
        'EMPLOYEE',
        'SELF_EMPLOYED',
        'FREELANCER',
        'JOB_SEEKER',
        'OTHER'
    ];

    return validJobTypes.includes(jobType);
};

/**
 * 직업 상세 검증 (OTHER 타입일 때만 필수, 2-100자)
 * @param {string} jobDetail - 검증할 직업 상세
 * @returns {boolean} 유효하면 true
 */
export const validateJobDetail = (jobDetail) => {
    if (!jobDetail) return false;
    const trimmedDetail = jobDetail.trim();
    return trimmedDetail.length >= 2 && trimmedDetail.length <= 100;
};

/**
 * 인증 코드 검증 (6자리 숫자)
 * @param {string} code - 검증할 인증 코드
 * @returns {boolean} 유효하면 true
 */
export const validateVerificationCode = (code) => {
    if (!code) return false;
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(code);
};

/**
 * 필수 약관 동의 검증
 * @param {Array} consents - 약관 동의 배열 [{termsId, version, agreed, required}]
 * @returns {boolean} 모든 필수 약관에 동의했으면 true
 */
export const validateRequiredTerms = (consents) => {
    if (!Array.isArray(consents) || consents.length === 0) return false;

    // 필수 약관 필터링
    const requiredTerms = consents.filter(consent => consent.required);

    // 모든 필수 약관이 동의되었는지 확인
    return requiredTerms.every(consent => consent.agreed === true);
};

/**
 * 에러 메시지 생성
 */
export const getErrorMessage = {
    email: (email) => {
        if (!email) return '이메일을 입력해주세요.';
        if (!validateEmail(email)) return '올바른 이메일 형식이 아닙니다.';
        return '';
    },

    password: (password) => {
        if (!password) return '비밀번호를 입력해주세요.';
        if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
        if (password.length > 20) return '비밀번호는 최대 20자까지 입력 가능합니다.';
        if (!/[a-zA-Z]/.test(password)) return '비밀번호에 영문을 포함해주세요.';
        if (!/\d/.test(password)) return '비밀번호에 숫자를 포함해주세요.';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return '비밀번호에 특수문자를 포함해주세요.';
        return '';
    },

    passwordConfirm: (password, passwordConfirm) => {
        if (!passwordConfirm) return '비밀번호 확인을 입력해주세요.';
        if (password !== passwordConfirm) return '비밀번호가 일치하지 않습니다.';
        return '';
    },

    name: (name) => {
        if (!name) return '이름을 입력해주세요.';
        if (name.trim().length < 2) return '이름은 최소 2자 이상이어야 합니다.';
        if (name.trim().length > 50) return '이름은 최대 50자까지 입력 가능합니다.';
        return '';
    },

    birthDate: (birthDate) => {
        if (!birthDate) return '생년월일을 입력해주세요.';

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(birthDate)) return '올바른 생년월일 형식(YYYY-MM-DD)을 입력해주세요.';

        const date = new Date(birthDate);
        if (isNaN(date.getTime())) return '올바른 생년월일을 입력해주세요.';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) return '미래 날짜는 입력할 수 없습니다.';
        
        const minAge = 14;
        const minBirthDate = new Date();
        minBirthDate.setFullYear(minBirthDate.getFullYear() - minAge);
        minBirthDate.setHours(0, 0, 0, 0);

        if (date > minBirthDate) return '만 14세 이상만 가입할 수 있습니다.';

        return '';
    },

    jobType: (jobType) => {
        if (!jobType) return '직업을 선택해주세요.';
        if (!validateJobType(jobType)) return '올바른 직업을 선택해주세요.';
        return '';
    },

    jobDetail: (jobDetail) => {
        if (!jobDetail) return '직업 상세를 입력해주세요.';
        if (jobDetail.trim().length < 2) return '직업 상세는 최소 2자 이상이어야 합니다.';
        if (jobDetail.trim().length > 100) return '직업 상세는 최대 100자까지 입력 가능합니다.';
        return '';
    },

    verificationCode: (code) => {
        if (!code) return '인증 코드를 입력해주세요.';
        if (!validateVerificationCode(code)) return '6자리 숫자를 입력해주세요.';
        return '';
    },

    requiredTerms: (consents) => {
        if (!validateRequiredTerms(consents)) return '필수 약관에 동의해주세요.';
        return '';
    },
};

/**
 * 직업 옵션 목록
 */
export const JOB_TYPE_OPTIONS = [
    {value: 'STUDENT', label: '학생'},
    {value: 'EMPLOYEE', label: '직장인'},
    {value: 'SELF_EMPLOYED', label: '자영업'},
    {value: 'FREELANCER', label: '프리랜서'},
    {value: 'JOB_SEEKER', label: '구직자'},
    {value: 'OTHER', label: '기타'},
];