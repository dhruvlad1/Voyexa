import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Compass, Clock, Plane, Sparkles, ChevronRight } from "lucide-react";
import FloatingLines from "../components/FloatingLines";

const MyTrips = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTrips = async () => {
            const rawUserId = localStorage.getItem("voyexa_user_id");
            const userId = rawUserId ? Number(rawUserId) : null;

            if (!userId || Number.isNaN(userId)) {
                setError("Please log in to view your trips.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/api/trips/user/${userId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch trips from server.");
                }
                const data = await response.json();
                setTrips(data);
            } catch (err) {
                setError("Unable to load your trips at the moment.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrips();
    }, []);

    const handleViewTrip = (trip) => {
        if (trip.status === "PENDING" || !trip.itineraryJson) {
            navigate("/create-trip", {
                state: {
                    editingTrip: true,
                    tripId: trip.id,
                    prefilledConfig: {
                        origin: trip.origin,
                        destination: trip.destination,
                        startDate: trip.startDate,
                        endDate: trip.endDate,
                        flexibility: trip.dateFlexibility || "Exact dates",
                        travelers: trip.travelGroupType ? trip.travelGroupType.charAt(0).toUpperCase() + trip.travelGroupType.slice(1) : "Solo",
                        adultCount: trip.adultCount || 1,
                        childCount: trip.childCount || 0,
                        budget: trip.budget || "Moderate",
                        accommodationType: trip.accommodationPreference || "Any",
                        travelPace: trip.tripPace || "Balanced",
                        interests: trip.interests || [],
                        otherInterests: trip.otherInterest ? trip.otherInterest.split(", ").filter(Boolean) : []
                    }
                }
            });
            return;
        }
        navigate("/itinerary-result", {
            state: {
                tripId: trip.id,
                itineraryJson: typeof trip.itineraryJson === 'string' ? trip.itineraryJson : JSON.stringify(trip.itineraryJson)
            }
        });
    };

    return (
        <div className="relative min-h-screen w-full bg-slate-950 text-slate-200 overflow-x-hidden">
            <div className="fixed inset-0 z-0">
                <FloatingLines />
                <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            </div>

            <div className="relative z-10">
                {/* Navbar */}
                <nav className="sticky top-0 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold tracking-tight">Dashboard</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400 text-xs font-bold items-center gap-2">
                             <Compass size={14} /> My Adventures
                        </div>
                    </div>
                </nav>

                <main className="max-w-6xl mx-auto px-6 py-12">
                    <header className="mb-12">
                        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">My Trips</h1>
                        <p className="text-slate-400 text-lg font-medium max-w-xl">
                            All your AI-generated travel itineraries in one place. Relive your past journeys or get ready for upcoming adventures.
                        </p>
                    </header>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading Trips</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center backdrop-blur-md">
                            <h2 className="text-xl font-bold text-red-400 mb-2">Oops!</h2>
                            <p className="text-red-300">{error}</p>
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-all"
                            >
                                Go Back
                            </button>
                        </div>
                    ) : trips.length === 0 ? (
                        <div className="bg-[#0a0f1d]/60 border border-white/10 p-12 rounded-[3rem] text-center backdrop-blur-md flex flex-col items-center justify-center py-24">
                             <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-slate-500 mb-6">
                                 <Plane size={48} />
                             </div>
                             <h2 className="text-3xl font-black text-white mb-4">No trips yet</h2>
                             <p className="text-slate-400 font-medium mb-8 max-w-md">
                                 You haven't generated any itineraries yet. Let's build your first AI-curated adventure!
                             </p>
                             <button 
                                 onClick={() => navigate('/create-trip')}
                                 className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-indigo-500/20 transition-all hover:scale-105"
                             >
                                 <Sparkles size={20} /> Build Itinerary
                             </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trips.map((trip) => (
                                <div 
                                    key={trip.id} 
                                    className="group bg-[#0a0f1d]/80 backdrop-blur-md border border-white/10 hover:border-indigo-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col cursor-pointer"
                                    onClick={() => handleViewTrip(trip)}
                                >
                                    <div className="p-8 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="bg-indigo-500/10 p-3 rounded-2xl text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                <MapPin size={24} />
                                            </div>
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${trip.status === 'COMPLETE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {trip.status || 'PENDING'}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-indigo-300 transition-colors">
                                            {trip.destination}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-semibold flex items-center gap-2 mb-6">
                                            From {trip.origin}
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3 rounded-xl">
                                                <Calendar size={16} className="text-indigo-400" />
                                                <span className="text-sm font-medium">{trip.startDate} to {trip.endDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between group-hover:bg-indigo-600/10 transition-colors">
                                         <span className="text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">View Details</span>
                                         <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                             <ChevronRight size={16} />
                                         </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MyTrips;
