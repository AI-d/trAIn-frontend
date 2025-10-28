// src/components/Auth/common/SignupErrorModal.jsx

export function SignupErrorModal({
                                     isOpen = false,
                                     error,
                                     onClose,
                                     onRetry,
                                     onNavigate
                                 }) {
    if (!isOpen || !error) return null;

    const getErrorContent = () => {
        if (typeof error === 'string') {
            return {
                title: '오류 발생',
                message: error,
                actionType: 'close'
            };
        }

        const errorCode = error.error || error.errorCode;

        switch (errorCode) {
            case 'USER_001':
                return {
                    title: '중복된 이메일',
                    message: '이미 가입된 이메일 주소입니다.',
                    actionType: 'navigate',
                    actionText: '로그인하러 가기',
                    actionTarget: '/login'
                };

            case 'AUTH_002':
                return {
                    title: '인증 토큰 만료',
                    message: '인증 시간이 만료되었습니다. 다시 시도해주세요.',
                    actionType: 'navigate',
                    actionText: '처음부터 다시',
                    actionTarget: '/signup'
                };

            case 'AUTH_004':
                return {
                    title: '잘못된 인증코드',
                    message: '인증코드가 올바르지 않습니다. 다시 확인해주세요.',
                    actionType: 'retry'
                };

            default:
                return {
                    title: '오류 발생',
                    message: error.message || '알 수 없는 오류가 발생했습니다.',
                    actionType: 'close'
                };
        }
    };

    const errorContent = getErrorContent();

    const handleAction = () => {
        switch (errorContent.actionType) {
            case 'retry':
                if (onRetry) onRetry();
                break;
            case 'navigate':
                if (onNavigate) onNavigate(errorContent.actionTarget);
                break;
            default:
                onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="signup-error-modal" onClick={(e) => e.stopPropagation()}>
                <div className="signup-error-modal__header">
                    <div className="signup-error-modal__icon">⚠️</div>
                    <h3 className="signup-error-modal__title">{errorContent.title}</h3>
                    <button
                        type="button"
                        className="signup-error-modal__close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="signup-error-modal__content">
                    <p className="signup-error-modal__message">
                        {errorContent.message}
                    </p>
                </div>

                <div className="signup-error-modal__actions">
                    {errorContent.actionType !== 'close' && (
                        <button
                            type="button"
                            className="signup-error-modal__action-btn signup-error-modal__action-btn--primary"
                            onClick={handleAction}
                        >
                            {errorContent.actionText || '다시 시도'}
                        </button>
                    )}
                    <button
                        type="button"
                        className="signup-error-modal__action-btn signup-error-modal__action-btn--secondary"
                        onClick={onClose}
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
