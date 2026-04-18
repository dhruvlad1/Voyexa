import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

function AppShell() {
  const location = useLocation();
  const { theme } = useTheme();
  const hideBackground = location.pathname === "/flight-loading";
  const appBackground = theme === "light" ? "bg-blue-100" : "bg-[#020617]";

  return (
    <div className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300 ${appBackground}`}>
      <ThemeToggle />
      {!hideBackground && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <FloatingLines
            linesGradient={
              theme === "light"
                ? ["#93c5fd", "#60a5fa", "#818cf8", "#2563eb"]
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
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/flight-loading" element={<FlightLoadingPage />} />
          <Route path="/itinerary-result" element={<ItineraryResult />} />
          <Route path="/my-trips" element={<MyTrips />} />
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
