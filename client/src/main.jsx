import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import RootLayout from "./layout/RootLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import EventDetail from "./pages/EventDetail";
import CreateEventPage from "./pages/CreateEventPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SearchResults from "./pages/SearchResults";
import EditEventPage from "./pages/EditEventPage";
import Admin from "./pages/Admin";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "discover",
        element: <Discover />,
      },
      {
        path: "events/:id",
        element: <EventDetail />,
      },
      {
        path: "events/:id/edit",
        element: (
          <ProtectedRoute>
            <EditEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "search",
        element: (
          <ProtectedRoute>
            <SearchResults />
          </ProtectedRoute>
        ),
      },
      {
        path: "create-event",
        element: (
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/members",
        element: (
          <ProtectedRoute>
            <Navigate to="/admin?tab=members" replace />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/events",
        element: (
          <ProtectedRoute>
            <Navigate to="/admin?tab=events" replace />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
