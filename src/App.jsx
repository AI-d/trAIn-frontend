// src/App.jsx
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/router-config";
import { Toaster } from "react-hot-toast";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";

function App() {
    // 최초 진입 시 인증 부트스트랩
    useAuthBootstrap();

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: { background: "#363636", color: "#fff" },
                }}
            />
            <RouterProvider router={router} />
        </>
    );
}

export default App;
