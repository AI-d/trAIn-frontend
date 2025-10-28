/*
// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { routes } from '@/routes/route.config';
import usePageTitle from '@/hooks/usePageTitle';

export default function App() {

    usePageTitle();

    return (
        <Routes>
            {routes.map(({ path, element, authRequired }) =>
                authRequired ? (
                    <Route key={path} element={<ProtectedRoute />}>
                        <Route path={path} element={element} />
                    </Route>
                ) : (
                    <Route key={path} path={path} element={element} />
                )
            )}
        </Routes>
    );
}
*/
// src/App.jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WelcomePage from '@/pages/Welcome/WelcomePage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;