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
import LandingPage from "./pages/LandingPage";

function AppShell() {
  const location = useLocation();
  const hideBackground = location.pathname === "/flight-loading";

  return (
    <div className="relative min-h-screen w-full bg-[#020617] overflow-hidden">
      {!hideBackground && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <FloatingLines
            linesGradient={["#4f46e5", "#9333ea", "#2563eb", "#ffffff"]}
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
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;
