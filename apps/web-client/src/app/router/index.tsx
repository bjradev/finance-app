import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/app/store/authStore";
import { PrivateRoute } from "./privateRoute";

import { LoginPage } from "@/features/auth";
import { SignupPage } from "@/features/auth";
import { DashboardPage } from "@/features/dashboard/";

export const AppRouter = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupPage />
          )
        }
      />
      {/* Rutas protegidas */}
      <Route
        element={
          <PrivateRoute>
            <Outlet />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
