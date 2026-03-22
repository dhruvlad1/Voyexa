import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Users,
  Wallet,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const CreateTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tripConfig, setTripConfig] = useState({
    destination: "",
    days: 3,
    travelers: "Solo",
    budget: "Moderate",
  });
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounce place search
  useEffect(() => {
    if (tripConfig.destination.length < 2) {
      setPlaceSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      searchPlaces(tripConfig.destination);
    }, 300);

    return () => clearTimeout(timer);
  }, [tripConfig.destination]);

  const searchPlaces = async (query) => {
    try {
      const response = await fetch(
          `http://localhost:8080/api/trips/places/search?query=${encodeURIComponent(
              query
          )}`
      );
      const data = await response.json();
      setPlaceSuggestions(data);
      setShowSuggestions(data.length > 0);
      setLoading(false);
    } catch (error) {
      console.error("Error searching places:", error);
      setShowSuggestions(false);
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place) => {
    setTripConfig({
      ...tripConfig,
      destination: place.displayName,
    });
    setShowSuggestions(false);
    setPlaceSuggestions([]);
  };

  return (
      <div className="min-h-screen flex flex-col items-center py-16 px-6 relative overflow-hidden">
        {/* Aurora Blurs */}
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-2xl flex justify-between items-center mb-12 relative z-10">
          <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold"
          >
            <ArrowLeft size={20} /> Dashboard
          </button>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                        step >= i ? "bg-indigo-600 w-16" : "bg-slate-200"
                    }`}
                />
            ))}
          </div>
        </div>

        <div className="w-full max-w-2xl bg-white/70 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border border-white/80 relative z-10">
          {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-indigo-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-100">
                  <MapPin size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">
                  Target Location
                </h1>
                <p className="text-slate-500 mb-10 font-medium">
                  Where should the AI build your itinerary?
                </p>
                <div className="relative">
                  <input
                      type="text"
                      placeholder="e.g. Paris, Zurich, Tokyo"
                      className="w-full p-6 bg-white/50 border-2 border-slate-100 rounded-2xl text-xl outline-none focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all duration-300 font-medium"
                      value={tripConfig.destination}
                      onChange={(e) =>
                          setTripConfig({
                            ...tripConfig,
                            destination: e.target.value,
                          })
                      }
                      onFocus={() => placeSuggestions.length > 0 && setShowSuggestions(true)}
                  />

                  {/* Autocomplete Dropdown */}
                  {showSuggestions && placeSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-xl z-20 max-h-72 overflow-y-auto">
                        {placeSuggestions.map((place, index) => (
                            <button
                                key={index}
                                onClick={() => handlePlaceSelect(place)}
                                className="w-full text-left px-6 py-4 hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-b-0 flex flex-col"
                            >
                      <span className="font-bold text-slate-900">
                        {place.displayName}
                      </span>
                              {place.description && (
                                  <span className="text-xs text-slate-500">
                          {place.description}
                        </span>
                              )}
                            </button>
                        ))}
                      </div>
                  )}

                  {loading && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-xl z-20 px-6 py-4">
                        <span className="text-slate-500 animate-pulse">Searching places worldwide...</span>
                      </div>
                  )}
                </div>

                <button
                    disabled={!tripConfig.destination}
                    onClick={() => setStep(2)}
                    className="w-full mt-12 bg-slate-950 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 shadow-xl"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
          )}

          {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-slate-900 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-8">
                  <Users size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-10">
                  Trip Logistics
                </h1>
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Days
                    </label>
                    <input
                        type="number"
                        value={tripConfig.days}
                        min="1"
                        max="30"
                        className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-xl font-bold"
                        onChange={(e) =>
                            setTripConfig({ ...tripConfig, days: e.target.value })
                        }
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Group
                    </label>
                    <select
                        className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl text-xl font-bold outline-none appearance-none"
                        value={tripConfig.travelers}
                        onChange={(e) =>
                            setTripConfig({
                              ...tripConfig,
                              travelers: e.target.value,
                            })
                        }
                    >
                      <option>Solo</option>
                      <option>Couple</option>
                      <option>Family</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                      onClick={() => setStep(3)}
                      className="flex-[2] bg-slate-950 text-white py-5 rounded-2xl font-bold"
                  >
                    Continue
                  </button>
                </div>
              </div>
          )}

          {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-amber-500 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-8 shadow-lg shadow-amber-100">
                  <Wallet size={32} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-10">
                  Budget Profile
                </h1>
                <div className="grid grid-cols-1 gap-4 mb-12">
                  {["Cheap", "Moderate", "Luxury"].map((b) => (
                      <button
                          key={b}
                          onClick={() =>
                              setTripConfig({ ...tripConfig, budget: b })
                          }
                          className={`p-6 rounded-2xl border-2 font-black text-left transition-all flex justify-between items-center ${
                              tripConfig.budget === b
                                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-600"
                                  : "border-slate-100 text-slate-400"
                          }`}
                      >
                        {b} {tripConfig.budget === b && <Sparkles size={18} />}
                      </button>
                  ))}
                </div>
                <button className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                  <Sparkles size={24} /> BUILD ITINERARY
                </button>
              </div>
          )}
        </div>
      </div>
  );
};

export default CreateTrip;
