import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, Clock, Info, ArrowLeft,
    Hotel, Sparkles, Sunrise, Sun, Sunset,
    Lightbulb, Share2, Download, Check
} from 'lucide-react';
import FloatingLines from '../components/FloatingLines';

const ItineraryResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { tripId, itineraryJson } = location.state || {};
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isInjectingImages, setIsInjectingImages] = useState(false);

    const [itineraryData, setItineraryData] = useState(() => {
        try {
            return itineraryJson ? JSON.parse(itineraryJson) : null;
        } catch (e) {
            console.error("Parsing error", e);
            return null;
        }
    });

    useEffect(() => {
        if (!itineraryData || !itineraryData.itinerary) return;

        let needsImages = false;
        for (const day of itineraryData.itinerary) {
            for (const period of ['morning', 'afternoon', 'evening']) {
                const activity = day[period]?.activity;
                if (activity && activity.imageUrl === undefined) {
                    needsImages = true;
                    break;
                }
            }
            if (needsImages) break;
        }

        if (needsImages) {
            setIsInjectingImages(true);
            fetch('http://localhost:8080/api/trips/inject-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itineraryData)
            })
            .then(res => res.json())
            .then(data => {
                setItineraryData(data);
                setIsInjectingImages(false);
            })
            .catch(err => {
                console.error("Failed to inject images", err);
                setIsInjectingImages(false);
            });
        }
    }, [itineraryJson]);

    if (!itineraryData) {
        return (
            <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950">
                <FloatingLines />
                <div className="relative z-10 bg-slate-900 border border-white/10 p-8 rounded-2xl text-center text-white">
                    <h1 className="text-2xl font-bold mb-4">No Data Found</h1>
                    <button onClick={() => navigate('/create-trip')} className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-500">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    /**
     * Deep-clones the parsed itinerary and strips all imageUrl fields before
     * sending to the backend — keeps the DB row lightweight.
     */
    const stripImages = (data) => {
        const clone = JSON.parse(JSON.stringify(data));
        if (Array.isArray(clone.itinerary)) {
            clone.itinerary.forEach(day => {
                ['morning', 'afternoon', 'evening'].forEach(period => {
                    if (day[period]?.activity?.imageUrl !== undefined) {
                        delete day[period].activity.imageUrl;
                    }
                });
            });
        }
        return clone;
    };

    const handleSaveTrip = async () => {
        if (!tripId) {
            alert('Unable to save: trip ID is missing. Please generate the itinerary again.');
            return;
        }
        setIsSaving(true);
        try {
            const pruned = stripImages(itineraryData);
            const response = await fetch(`http://localhost:8080/api/trips/${tripId}/itinerary`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pruned)
            });
            if (response.ok) {
                setIsSaved(true);
                alert('Trip saved! You can now view it in the My Trips page of your dashboard.');
            } else {
                alert('Something went wrong while saving. Please try again.');
            }
        } catch (e) {
            alert('Network error: Unable to reach the server. Please check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

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
                    ) : isInjectingImages ? (
                        <div className="w-full h-48 relative overflow-hidden bg-white/5 animate-pulse flex items-center justify-center">
                            <span className="text-white/20 font-bold uppercase tracking-widest text-xs flex gap-2 items-center">
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></span>
                                Generating Visuals...
                            </span>
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
                    <button onClick={() => navigate('/create-trip')} className="flex items-center gap-2 text-slate-400 hover:text-white transition group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold tracking-tight">Voyexa Planner</span>
                    </button>
                    <div className="flex gap-3">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-slate-300">
                            <Share2 size={18} />
                        </button>
                        <button
                            onClick={handleSaveTrip}
                            disabled={isSaving || isSaved}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition shadow-lg disabled:cursor-not-allowed ${isSaved
                                    ? 'bg-emerald-600 shadow-emerald-900/40 opacity-80'
                                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'
                                }`}
                        >
                            {isSaving ? (
                                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                            ) : isSaved ? (
                                <><Check size={18} /> Saved!</>
                            ) : (
                                <><Download size={18} /> Save Trip</>
                            )}
                        </button>
                    </div>
                </nav>

                <main className="max-w-5xl mx-auto px-6 py-12">
                    {/* Hero Header */}
                    <header className="mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                            <Sparkles size={14} /> AI GENERATED JOURNEY
                        </div>
                        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter">Your Custom Itinerary</h1>

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
                                            <Calendar size={14} /> {day.date}
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

                                {/* Morning/Afternoon/Evening Cards */}
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
                </main>
            </div>
        </div>
    );
};

export default ItineraryResult;