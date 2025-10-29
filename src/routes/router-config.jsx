import {createBrowserRouter} from "react-router-dom";
import AppLayout from "../layouts/AppLayout.jsx";
import AiTest from "../AiTest.jsx";
import ScenarioListPage from "@/pages/Scenario/ScenarioListPage.jsx";

// 라우터 설정
export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <ScenarioListPage />,
            },
            // 추가적인 라우트는 여기에 정의
        ],
    },
]
);

export default router;