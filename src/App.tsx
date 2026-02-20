import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./app/layouts/AppLayout";
import AuthLayout from "./app/layouts/AuthLayout";
import RequireAuth from "./app/routes/RequireAuth";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ProjectPage from "./pages/ProjectPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <LandingPage />
            </AppLayout>
          }
        />

        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </RequireAuth>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <RequireAuth>
              <AppLayout>
                <ProjectPage />
              </AppLayout>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
