// src/App.jsx
import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {useAuthBootstrap} from '@/hooks/useAuthBootstrap';
import {ProtectedRoute} from '@/routes/ProtectedRoute';
import usePageTitle from '@/hooks/usePageTitle';

// Pages
import WelcomePage from '@/pages/Welcome/WelcomePage';
import LoginPage from '@/pages/Auth/LoginPage';
import SignupPage from '@/pages/Auth/SignupPage';
import EmailVerificationPage from '@/pages/Auth/EmailVerificationPage';
import CallbackPage from '@/pages/Auth/CallbackPage';
import SocialSignupPage from '@/pages/Auth/SocialSignupPage';
import MyProfilePage from '@/pages/User/MyProfilePage';

// Router 안에서 실행될 컴포넌트 분리
function AppRoutes() {
    // 페이지 타이틀 관리 (BrowserRouter 안에서 호출)
    usePageTitle();

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/signup" element={<SignupPage/>}/>
            <Route path="/email-verification" element={<EmailVerificationPage/>}/>

            {/* OAuth Callback */}
            <Route path="/callback" element={<CallbackPage/>}/>
            <Route path="/login/oauth2/code/:provider" element={<CallbackPage/>}/>

            {/* Social Signup */}
            <Route path="/social-signup" element={<SocialSignupPage/>}/>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute/>}>
                <Route path="/my-profile" element={<MyProfilePage/>}/>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
    );
}

function App() {
    // 앱 최초 진입 시 인증 초기화 (BrowserRouter 밖에서도 가능)
    useAuthBootstrap();

    return (
        <BrowserRouter>
            <AppRoutes/>
        </BrowserRouter>
    );
}

export default App;