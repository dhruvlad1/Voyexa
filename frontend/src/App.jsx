import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import ItineraryResult from "./pages/ItineraryResult";
import MyTrips from "./pages/MyTrips";
import SharedTrip from "./pages/SharedTrip";
import FloatingLines from "./components/FloatingLines";

function App() {
  return (
    <Router>
      <div className="relative min-h-screen w-full bg-[#020617] overflow-hidden">
        {/* Background Layer: Fixed so it stays behind while you scroll */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <FloatingLines
            linesGradient={["#4f46e5", "#9333ea", "#2563eb", "#ffffff"]}
            lineCount={8} // More lines for a fuller look
            lineDistance={0.4} // Spread them out
            animationSpeed={0.6} // Elegant, slow movement
            interactive={true} // Responds to your mouse
            parallax={true} // Moves slightly when you move mouse
          />
        </div>

        {/* Content Layer: Elevated via z-10 */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/itinerary-result" element={<ItineraryResult />} />
            <Route path="/my-trips" element={<MyTrips />} />
            <Route path="/share/:shareToken" element={<SharedTrip />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
