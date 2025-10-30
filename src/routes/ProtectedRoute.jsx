// src/routes/ProtectedRoute.jsx

import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuthStore} from '@/stores/authStore';

export function ProtectedRoute() {
    const location = useLocation();
    const {isInitialized, status} = useAuthStore();

    if (!isInitialized) {
        return (
            <div className="protected-route-loading">
                <div className="protected-route-loading__spinner"/>
                <p>세션을 확인하는 중...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        const next = encodeURIComponent(location.pathname + location.search + location.hash);
        return <Navigate to={`/login?next=${next}`} replace/>;
    }

    // 이메일 인증 체크는 authenticated 상태에서만
    // (필요시 추후 추가: status === 'authenticated' && user?.emailVerified === false)

    return <Outlet/>;
}