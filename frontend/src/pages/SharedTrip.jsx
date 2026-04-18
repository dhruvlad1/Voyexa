import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Hotel, Sunrise, Sun, Sunset, Lightbulb, Info, MapPin, Clock } from 'lucide-react';
import FloatingLines from '../components/FloatingLines';

const SharedTrip = () => {
    const { shareToken } = useParams();
    const navigate = useNavigate();
    const [itineraryData, setItineraryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSharedTrip = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/trips/shared/${shareToken}`);
                if (!response.ok) {
                    throw new Error('Trip not found or expired');
                }
                const data = await response.json();
                setItineraryData(data.itineraryJson);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSharedTrip();
    }, [shareToken]);

    if (loading) {
        return (
            <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950">
                <FloatingLines />
                <div className="relative z-10 text-center">
                    <div className="w-12 h-12 border-4 border-blue-400/40 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg font-bold">Loading shared trip...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950">
                <FloatingLines />
                <div className="relative z-10 bg-slate-900 border border-red-500/20 p-8 rounded-2xl text-center max-w-md">
                    <h1 className="text-2xl font-bold text-red-400 mb-4">⚠️ Trip Not Found</h1>
                    <p className="text-slate-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (!itineraryData) {
        return (
            <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950">
                <FloatingLines />
                <div className="relative z-10 bg-slate-900 border border-white/10 p-8 rounded-2xl text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">No Itinerary Found</h1>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 text-white font-bold">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const ActivityCard = ({ section, data, icon: Icon, colorClass }) => {
        if (!data || !data.activity) return null;
        return (
            <div className="relative pl-8 pb-10 border-l-2 border-white/10 last:border-0 last:pb-0">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.6)] ${colorClass} z-10`} />
                <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 group shadow-xl overflow-hidden">
                    {data.activity.imageUrl ? (
                        <div className="w-full h-48 relative overflow-hidden">
                            <img src={data.activity.imageUrl} alt={data.activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                        </div>
                    ) : null}
                    <div className="p-6 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <Icon size={16} className="text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/70">{section}</span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors tracking-tight">
                            {data.activity.title}
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4 font-medium">
                            {data.activity.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400">
                            <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                                <MapPin size={14} className="text-rose-500" />
                                {data.activity.location}
                            </div>
                            {data.estimatedTime && (
                                <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                                    <Clock size={14} />
                                    {data.estimatedTime}
                                </div>
                            )}
                            {data.costTier && (
                                <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                                    {data.costTier}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen w-full bg-slate-950 text-slate-200 overflow-x-hidden">
            <div className="fixed inset-0 z-0">
                <FloatingLines />
                <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />
            </div>

            <div className="relative z-10">
                {/* Navbar */}
                <nav className="sticky top-0 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold tracking-tight">Voyexa - Shared Trip</span>
                    </button>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        🔗 Shared Link
                    </div>
                </nav>

                <main className="max-w-5xl mx-auto px-6 py-12">
                    {/* Hero Header */}
                    <header className="mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                            <Sparkles size={14} /> AI GENERATED JOURNEY
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Shared Itinerary</h1>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-xl">
                                <p className="text-lg text-slate-200 leading-relaxed font-medium italic">
                                    "{itineraryData.tripSummary}"
                                </p>
                            </div>
                            <div className="p-8 rounded-3xl bg-blue-600/10 border border-blue-500/20 backdrop-blur-md flex flex-col justify-center shadow-lg">
                                <div className="flex items-center gap-3 text-blue-400 mb-2">
                                    <Hotel size={24} />
                                    <span className="font-bold text-xs uppercase tracking-widest">Lodging Advice</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                    {itineraryData.accommodationAdvice}
                                </p>
                            </div>
                        </div>
                    </header>

                    {/* Timeline */}
                    <div className="space-y-24">
                        {itineraryData.itinerary.map((day, idx) => (
                            <div key={idx} className="flex flex-col lg:flex-row gap-12">
                                {/* Day Indicator */}
                                <div className="lg:w-48 shrink-0">
                                    <div className="lg:sticky lg:top-32">
                                        <div className="text-7xl font-black text-white/60 mb-2 leading-none">0{day.dayNumber}</div>
                                        <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-4">
                                            📅 {day.date}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{day.themeTitle}</h3>

                                        {day.logistics && (
                                            <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                                                <div className="flex items-center gap-2 mb-2 text-slate-300 font-bold uppercase tracking-wider text-[9px]">
                                                    <Info size={14} /> Logistics
                                                </div>
                                                {day.logistics}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Activities */}
                                <div className="flex-1">
                                    <ActivityCard section="Morning" data={day.morning} icon={Sunrise} colorClass="bg-amber-500" />
                                    <ActivityCard section="Afternoon" data={day.afternoon} icon={Sun} colorClass="bg-sky-400" />
                                    <ActivityCard section="Evening" data={day.evening} icon={Sunset} colorClass="bg-indigo-500" />

                                    {day.travelTip && (
                                        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-600/15 via-slate-900 to-slate-900 border border-blue-500/20 shadow-xl">
                                            <div className="flex items-center gap-3 text-blue-400 font-black text-xs tracking-widest mb-2 uppercase">
                                                <Lightbulb size={18} /> Voyexa Tip
                                            </div>
                                            <p className="text-slate-200 text-sm italic leading-relaxed font-medium">
                                                {day.travelTip}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 text-center">
                        <p className="text-slate-300 mb-4">
                            ✨ This itinerary was created with <span className="font-bold text-blue-400">Voyexa AI</span>
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
                        >
                            Create Your Own Trip
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SharedTrip;

