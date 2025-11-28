import { Navigate, createBrowserRouter } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import AuthPage from "../pages/auth";
import DashboardPage from "../pages/dashboard";
import DocumentPage from "../pages/document";
import SettingsPage from "../pages/settings";
import ProtectedRoute from "./ProtectedRoute.tsx";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "documents",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "document/:id",
        element: <DocumentPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
