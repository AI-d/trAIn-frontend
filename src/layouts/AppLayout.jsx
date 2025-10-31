import {Outlet, useLocation} from "react-router-dom";
import usePageTitle from '@/hooks/usePageTitle';
import AppHeader from "../components/Header/AppHeader.jsx";

const AppLayout = () => {
    const location = useLocation();
    usePageTitle();

    // 헤더를 숨길 페이지 목록
    const hideHeaderPaths = [
        '/',
        '/login',
        '/signup',
        '/email-verification',
        '/callback',
        '/social-signup',
        '/dialogue',
    ];

    // 현재 경로가 헤더를 숨겨야 하는지 확인
    const shouldHideHeader = hideHeaderPaths.some(path => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    });

    return (
        <>
            {!shouldHideHeader && <AppHeader />}
            {/* 실제로 바뀌는 동적인 부분 */}
            <Outlet />
        </>
    );
};

export default AppLayout;