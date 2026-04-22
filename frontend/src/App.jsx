import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import FlightLoadingPage from "./pages/FlightLoadingPage";
import ItineraryResult from "./pages/ItineraryResult";
import MyTrips from "./pages/MyTrips";
import SharedTrip from "./pages/SharedTrip";
import FloatingLines from "./components/FloatingLines";
import ThemeToggle from "./components/ThemeToggle";
import LandingPage from "./pages/LandingPage";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

function isAuthenticated() {
  const rawUserId = localStorage.getItem("voyexa_user_id");
  return rawUserId !== null && !Number.isNaN(Number(rawUserId));
}

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/auth" replace />;
}

function PublicOnlyRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
}

function AppShell() {
  const location = useLocation();
  const { theme } = useTheme();
  const hideBackground = location.pathname === "/flight-loading";
  const isLightTheme = theme === "light";
  const appBackground = isLightTheme ? "bg-sky-200" : "bg-[#020617]";
  const appBackgroundStyle = isLightTheme
    ? {
        background:
          "radial-gradient(circle at 18% 22%, rgba(186,230,253,0.85), transparent 42%), radial-gradient(circle at 80% 18%, rgba(147,197,253,0.7), transparent 44%), radial-gradient(circle at 70% 82%, rgba(125,211,252,0.65), transparent 46%), #cfefff",
      }
    : undefined;

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300 ${appBackground}`}
      style={appBackgroundStyle}
    >
      <ThemeToggle />
      {!hideBackground && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <FloatingLines
            linesGradient={
              theme === "light"
                ? ["#1e3a8a", "#1d4ed8", "#1e40af", "#1e3a8a"]
                : ["#4f46e5", "#9333ea", "#2563eb", "#ffffff"]
            }
            lineCount={8}
            lineDistance={0.4}
            animationSpeed={0.6}
            interactive={true}
            parallax={true}
          />
        </div>
      )}

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
          <Route path="/flight-loading" element={<ProtectedRoute><FlightLoadingPage /></ProtectedRoute>} />
          <Route path="/itinerary-result" element={<ProtectedRoute><ItineraryResult /></ProtectedRoute>} />
          <Route path="/my-trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
          <Route path="/share/:shareToken" element={<SharedTrip />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppShell />
      </Router>
    </ThemeProvider>
  );
}

export default App;
