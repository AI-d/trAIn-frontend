// src/routes/router-config.jsx
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout.jsx";

// pages
import WelcomePage from "@/pages/Welcome/WelcomePage.jsx";
import LoginPage from "@/pages/Auth/LoginPage.jsx";
import SignupPage from "@/pages/Auth/SignupPage.jsx";
import EmailVerificationPage from "@/pages/Auth/EmailVerificationPage.jsx";
import EmailVerificationCompletePage from "@/pages/Auth/EmailVerificationCompletePage.jsx";
import CallbackPage from "@/pages/Auth/CallbackPage.jsx";
import SocialSignupPage from "@/pages/Auth/SocialSignupPage.jsx";
import MyProfilePage from "@/pages/User/MyProfilePage.jsx";
import ScenarioListPage from "@/pages/Scenario/ScenarioListPage.jsx";
import DialoguePage from "@/pages/Dialogue/DialoguePage.jsx";
import CreateScenarioPage from "@/pages/Scenario/CreateScenarioPage.jsx";
import FeedbackGenerationPage from "@/pages/Feedback/FeedbackGenerationPage.jsx";

// guards & hooks
import { ProtectedRoute } from "@/routes/ProtectedRoute.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <div>에러가 발생했습니다. 잠시 후 다시 시도해주세요.</div>,
    children: [
      // 루트는 웰컴으로
      { index: true, element: <WelcomePage /> },

      // Public Routes (인증 불필요)
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      { path: "email-verification", element: <EmailVerificationPage /> },
      { path: "email-verification-complete", element: <EmailVerificationCompletePage /> },
      { path: "callback", element: <CallbackPage /> },
      { path: "login/oauth2/code/:provider", element: <CallbackPage /> },
      { path: "social-signup", element: <SocialSignupPage /> },

      // Protected Routes (인증 필수)
      {
        element: <ProtectedRoute />,
        children: [
          { path: "scenarios", element: <ScenarioListPage /> },
          { path: "dialogue", element: <DialoguePage /> },
          { path: "create", element: <CreateScenarioPage /> },
          { path: "feedback/:sessionId", element: <FeedbackGenerationPage /> },
          { path: "my-profile", element: <MyProfilePage /> },
        ],
      },

      // Fallback
      { path: "*", element: <WelcomePage /> },
    ],
  },
]);

export default router;
