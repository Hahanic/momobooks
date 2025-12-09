import { Navigate, createBrowserRouter } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import AuthPage from "../pages/auth";
import DocumentPage from "../pages/document";
import DashboardPage from "../pages/home/index.tsx";
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
        element: <Navigate to="/home" replace />,
      },
      {
        path: "home",
        element: <DashboardPage />,
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
