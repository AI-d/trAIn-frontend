// src/hooks/usePageTitle.js

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from '@/routes/route.config';

export default function usePageTitle() {
    const location = useLocation();

    useEffect(() => {
        const currentRoute = routes.find((r) => r.path === location.pathname);
        if (currentRoute?.title) {
            document.title = currentRoute.title;
        }
    }, [location]);
}
