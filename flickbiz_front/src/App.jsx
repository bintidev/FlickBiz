import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import MoviesPage from "./pages/MoviesPage";
import SeriesPage from "./pages/SeriesPage";
import AppLayout from "./components/layout/AppLayout";
import MovieDetailPage from "./pages/MovieDetailPage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import ReviewsPage from "./pages/ReviewsPage";
import ProfilePage from "./pages/ProfilePage";

// Creamos una instancia de QueryClient con estrategias de sincronización activa
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Sincroniza si el usuario cambia de pestaña y vuelve
      staleTime: 1000 * 5,        // Los datos se consideran "frescos" durante 5 segundos
      refetchInterval: 10000,     // ¡Mágia de fondo! Polling cada 10 segundos para todos los usuarios
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/series/:id" element={<SeriesDetailPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}