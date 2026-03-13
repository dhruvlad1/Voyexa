import React, { useState } from "react";
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
              className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? "bg-indigo-600 w-16" : "bg-slate-200"}`}
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
            <input
              type="text"
              placeholder="e.g. Zurich, Switzerland"
              className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl text-xl outline-none focus:border-indigo-600 transition-all font-medium"
              onChange={(e) =>
                setTripConfig({ ...tripConfig, destination: e.target.value })
              }
            />
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
                  onChange={(e) =>
                    setTripConfig({ ...tripConfig, travelers: e.target.value })
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
                  onClick={() => setTripConfig({ ...tripConfig, budget: b })}
                  className={`p-6 rounded-2xl border-2 font-black text-left transition-all flex justify-between items-center ${tripConfig.budget === b ? "border-indigo-600 bg-indigo-50/50 text-indigo-600" : "border-slate-100 text-slate-400"}`}
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
