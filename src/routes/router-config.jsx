import {createBrowserRouter} from "react-router-dom";
import AppLayout from "../layouts/AppLayout.jsx";
import AiTest from "../AiTest.jsx";
import ScenarioListPage from "@/pages/Scenario/ScenarioListPage.jsx";
import DialoguePage from "@/pages/Dialogue/DialoguePage.jsx";
import CreateScenarioPage from "@/pages/Scenario/CreateScenarioPage.jsx";

// 라우터 설정
export const router = createBrowserRouter([
    {
        path: '/',
        errorElement: <div>에러가 발생했습니다. 잠시 후 다시 시도해주세요.</div>,
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <ScenarioListPage />
            },
            // 추가적인 라우트는 여기에 정의
            {
                path: '/dialogue',
                element: <DialoguePage />
            },
            {
              path: '/create',
              element: <CreateScenarioPage />
            },
        ]
    }

]
);

export default router;