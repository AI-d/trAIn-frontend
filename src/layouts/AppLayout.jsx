import React from 'react';
import {Outlet} from "react-router-dom";
import AppHeader from "../components/Header/AppHeader.jsx";

const AppLayout = () => {
    return (
        <>
            <AppHeader />
            {/* 실제로 바뀌는 동적인 부분 */}
            <Outlet />
        </>
    );
};

export default AppLayout;