import React from "react";
import CreateTrip from "./pages/CreateTrip";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/create-trip" element={<CreateTrip />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
