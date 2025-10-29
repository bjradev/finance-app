import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/app/store/authStore";
import { PrivateRoute } from "./privateRoute";
import { Spinner } from "@/shared/components/ui/spinner";

// Lazy load páginas para mejorar performance del bundle inicial
const LoginPage = lazy(() =>
  import("@/features/auth/pages/loginPage").then((m) => ({
    default: m.LoginPage,
  }))
);
const SignupPage = lazy(() =>
  import("@/features/auth/pages/signupPage").then((m) => ({
    default: m.SignupPage,
  }))
);
const DashboardPage = lazy(() =>
  import("@/features/dashboard/pages/dashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);

// Componente de carga para Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-screen">
    <Spinner className="h-8 w-8" />
  </div>
);

export const AppRouter = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <LoginPage />
            </Suspense>
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <SignupPage />
            </Suspense>
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
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />
      </Route>
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
