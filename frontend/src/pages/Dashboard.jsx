import React, { useState, useEffect } from "react";
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
  ChevronRight,
  Menu,
  ChevronLeft
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [trendingPlaces, setTrendingPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/dashboard/trending");
        if (res.ok) {
          const data = await res.json();
          setTrendingPlaces(data);
        }
      } catch (err) {
        console.error("Failed to fetch trending places:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
      <div className="min-h-screen bg-transparent relative flex">

        {/* 1. FIXED SIDEBAR */}
        <aside
            className={`fixed left-0 top-0 h-full bg-[#0a0f1d]/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-50 transition-all duration-500 ease-in-out
        ${isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"}`}
        >
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                <Compass size={24} />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">Voyexa</span>
            </div>
            {/* Close Icon */}
            <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-4">
              Main Menu
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20">
              <TrendingUp size={20} /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-semibold group transition-all">
              <Clock size={20} className="group-hover:text-indigo-400" /> My Trips
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-semibold group transition-all">
              <Settings size={20} className="group-hover:text-indigo-400" /> Settings
            </button>
          </nav>

          <div className="p-6 border-t border-slate-800/50">
            <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl font-bold group transition-all"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </aside>

        {/* 2. OPEN SIDEBAR ICON (Only visible when sidebar is closed) */}
        {!isSidebarOpen && (
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="fixed left-6 top-8 z-[60] p-3 bg-[#0a0f1d]/90 backdrop-blur-md border border-white/10 text-white rounded-2xl hover:bg-indigo-600 hover:border-indigo-500 transition-all shadow-2xl animate-in fade-in zoom-in duration-300"
            >
              <Menu size={24} />
            </button>
        )}

        {/* 3. MAIN CONTENT AREA */}
        <main
            className={`flex-1 transition-all duration-500 ease-in-out px-6 lg:px-12 py-8 relative z-10
        ${isSidebarOpen ? "lg:ml-72" : "ml-0"}`}
        >
          <header className="flex justify-between items-center mb-10">
            {/* Spacer for when sidebar is closed so search doesn't overlap Menu icon */}
            <div className={`${!isSidebarOpen ? "ml-16" : "ml-0"} transition-all duration-500 relative w-64 md:w-96 hidden sm:block`}>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                  type="text"
                  placeholder="Search itineraries..."
                  className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-white placeholder:text-slate-500"
              />
            </div>

            <button
                onClick={() => navigate("/create-trip")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 md:px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all ml-auto"
            >
              <Plus size={20} /> <span className="hidden xs:inline">Plan New Trip</span>
            </button>
          </header>

          {/* HERO SECTION */}
          <div className="relative mb-12 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-slate-950/40 text-white shadow-2xl border border-white/5 backdrop-blur-md">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>

            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight md:leading-[0.9]">
                Your world, <br />
                <span className="text-indigo-400 italic">optimized.</span>
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed font-medium mb-8">
                AI-driven itineraries for travelers who value time as much as the destination.
              </p>
              <button className="flex items-center gap-2 text-white font-bold hover:text-indigo-400 transition-colors">
                View Analytics <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* TRIP GRID */}
          <div className="flex justify-between items-end mb-8 mt-12">
            <div>
               <h2 className="text-3xl font-black text-white tracking-tight">Trending in {currentMonth}</h2>
               <p className="text-slate-400 font-medium mt-2">Top 10 hottest destinations picked by AI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pb-12">
            {isLoading ? (
               <div className="col-span-full flex justify-center py-20">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
               </div>
            ) : trendingPlaces.length === 0 ? (
               <div className="col-span-full text-slate-400 py-10">Unable to load trending destinations at this time.</div>
            ) : trendingPlaces.map((place, idx) => (
                <div
                    key={idx}
                    onClick={() => navigate("/create-trip", { state: { prefilledDestination: `${place.city}, ${place.country}` } })}
                    className="group bg-[#0a0f1d]/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-indigo-500/40 transition-all duration-500 cursor-pointer"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img src={place.imageUrl} alt={place.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-4 right-4 px-4 py-1.5 bg-[#0a0f1d]/80 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest text-white uppercase">#{idx + 1}</div>
                  </div>
                  <div className="p-8 flex flex-col h-[calc(100%-14rem)]">
                    <div>
                      <div className="flex justify-between items-start mb-2 text-white">
                        <h3 className="text-2xl font-black">{place.city}</h3>
                        <div className="text-emerald-400 font-black text-xl">~${place.budget}</div>
                      </div>
                      <p className="text-slate-400 text-sm flex items-center gap-1 mb-4 font-semibold font-mono">
                        <MapPin size={14} className="text-indigo-400" /> {place.country}
                      </p>
                      <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        Plan this trip <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
            ))}

            {/* ADD NEW CARD */}
            <div
                onClick={() => navigate("/create-trip")}
                className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center group hover:bg-white/10 hover:border-indigo-400 transition-all cursor-pointer min-h-[400px]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-90 transition-all duration-500 shadow-xl shadow-indigo-500/0 group-hover:shadow-indigo-500/20">
                <Plus size={40} />
              </div>
              <h4 className="text-white font-black mt-8 text-xl tracking-tight uppercase">Create New</h4>
            </div>
          </div>
        </main>
      </div>
  );
};

export default Dashboard;