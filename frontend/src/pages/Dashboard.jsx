import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  Calendar,
  Compass,
  Clock,
  LogOut,
  Search,
  TrendingUp,
  Settings,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const savedTrips = [
    {
      id: 1,
      city: "Tokyo",
      country: "Japan",
      days: 5,
      type: "Solo",
      budget: 1250,
      status: "Completed",
      img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      city: "Paris",
      country: "France",
      days: 3,
      type: "Couple",
      budget: 980,
      status: "Upcoming",
      img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <Compass size={24} />
          </div>
          <span className="font-bold text-2xl text-slate-900">Voyexa</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">
            <TrendingUp size={18} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl font-medium transition-all duration-300 hover:translate-x-1">
            <Clock size={18} /> My Trips
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl font-medium">
            <Settings size={18} /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 px-4 lg:px-12 py-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <div className="relative w-96 hidden md:block">
            <Search
              className="absolute left-4 top-3 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search itineraries..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none"
            />
          </div>
          <button
            onClick={() => navigate("/create-trip")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Plus size={20} /> Plan New Trip
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative mb-12 p-12 rounded-[3rem] overflow-hidden bg-slate-950 text-white shadow-2xl border border-white/10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
          <div className="relative z-10">
            <span className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              Voyexa AI Intelligence
            </span>
            <h1 className="text-5xl font-black tracking-tight mb-4 text-white">
              Your world, <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent italic">
                optimized.
              </span>
            </h1>
            <p className="text-slate-400 max-w-md text-lg leading-relaxed font-medium">
              AI-driven itineraries for travelers who value time as much as the
              destination.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {savedTrips.map((trip) => (
            <div
              key={trip.id}
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 hover:border-indigo-200 hover:shadow-2xl transition-all cursor-pointer"
            >
              <div className="h-52 overflow-hidden relative">
                <img
                  src={trip.img}
                  alt={trip.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-slate-900">
                  {trip.type}
                </div>
              </div>
              <div className="p-7">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {trip.city}
                  </h3>
                  <div className="text-indigo-600 font-black text-xl">
                    ${trip.budget}
                  </div>
                </div>
                <p className="text-slate-500 text-sm flex items-center gap-1 mb-6 font-medium">
                  <MapPin size={14} /> {trip.country}
                </p>
                <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Calendar size={16} className="text-indigo-600" />{" "}
                    {trip.days} Days
                  </div>
                  <div className="text-[11px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg uppercase tracking-tighter">
                    Verified
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div
            onClick={() => navigate("/create-trip")}
            className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center group hover:bg-white hover:border-indigo-300 transition-all cursor-pointer min-h-[380px]"
          >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-90 transition-all duration-500">
              <Plus size={32} />
            </div>
            <h4 className="text-slate-900 font-bold mt-6 text-lg">
              New Adventure
            </h4>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
