import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import AdminMembers from "./pages/AdminMembers";


const router = createBrowserRouter([
  // 🔓 Public routes (NO RootLayout)
  {
    path: "/",
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },

  // 🔐 App routes (WITH RootLayout)
  {
    element: <RootLayout />,
    children: [
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
        path: "admin/members",
        element: (
          <ProtectedRoute>
            <AdminMembers />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
