import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute><LandingPage /></PublicRoute>
      } />
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />
    </Routes>
  );
}