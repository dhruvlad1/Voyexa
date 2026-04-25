import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    MapPinned,
    Wallet,
    Sparkles,
    ChevronRight,
    Calendar,
    User,
    Heart,
    Users2,
    Ship,
    Plus,
    Minus,
    X
} from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const LocationAutocomplete = ({
    icon: Icon,
    title,
    subtitle,
    placeholder,
    value,
    onChange,
    onNext,
    onBack,
    nextLabel = "Continue",
    nextDisabled = false,
    showBackButton = true,
    themeColor = "indigo"
}) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!value || value.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            searchPlaces(value);
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    const searchPlaces = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API}/api/trips/places/search?query=${encodeURIComponent(query)}`
            );
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error("Error searching places:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (place) => {
        onChange(place.description || place.name || "");
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const getThemeClasses = () => {
        if (themeColor === "indigo") {
            return {
                iconBg: "bg-indigo-600",
                iconText: "text-white",
                shadow: "shadow-indigo-500/20",
                btnHover: "hover:bg-indigo-700",
                btnBg: "bg-indigo-600"
            };
        }

        return {
            iconBg: "bg-white/10",
            iconText: "text-indigo-400",
            shadow: "shadow-indigo-500/20",
            btnHover: "hover:bg-indigo-700",
            btnBg: "bg-indigo-600"
        };
    };

    const theme = getThemeClasses();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div
                className={`${theme.iconBg} w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${theme.iconText} mb-8 ${themeColor === "indigo" ? "shadow-lg shadow-indigo-500/20" : ""
                    }`}
            >
                <Icon size={32} />
            </div>
            <h1 className="text-4xl font-black text-white mb-2">{title}</h1>
            <p className="text-slate-400 mb-10 font-medium">{subtitle}</p>

            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-xl outline-none focus:border-indigo-500 text-white placeholder:text-slate-600 transition-all"
                    value={value}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />

                {loading && showSuggestions && (
                    <div className="absolute right-6 top-6">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b2c] border border-white/10 rounded-2xl shadow-2xl z-20 max-h-72 overflow-y-auto">
                        {suggestions.map((place, index) => (
                            <button
                                key={index}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelect(place);
                                }}
                                className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 flex flex-col"
                            >
                                <span className="font-bold text-white">
                                    {place.description || place.name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={`flex gap-4 mt-12 ${showBackButton ? "" : "flex-col"}`}>
                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                    >
                        Back
                    </button>
                )}
                <button
                    disabled={nextDisabled || !value}
                    onClick={onNext}
                    className={`${showBackButton ? "flex-[2]" : "w-full"} ${theme.btnBg} text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 ${theme.btnHover} transition-all shadow-xl ${theme.shadow} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {nextLabel} <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

// ── Multi-destination picker ──────────────────────────────────────────────────
const MultiDestinationInput = ({ destinations, onAdd, onRemove, onNext, onBack }) => {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const MAX_DESTINATIONS = 8;

    useEffect(() => {
        if (!inputValue || inputValue.length < 2) {
            setSuggestions([]);
            return;
        }
        const timer = setTimeout(() => searchPlaces(inputValue), 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const searchPlaces = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API}/api/trips/places/search?query=${encodeURIComponent(query)}`
            );
            if (response.ok) setSuggestions(await response.json());
        } catch (e) {
            console.error("Error searching places:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (place) => {
        const name = place.description || place.name || "";
        if (name && !destinations.includes(name) && destinations.length < MAX_DESTINATIONS) {
            onAdd(name);
        }
        setInputValue("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim()) {
            const val = inputValue.trim();
            if (!destinations.includes(val) && destinations.length < MAX_DESTINATIONS) {
                onAdd(val);
            }
            setInputValue("");
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="bg-indigo-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-500/20">
                <MapPin size={32} />
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Target Locations</h1>
            <p className="text-slate-400 mb-8 font-medium">
                Add one or more places — the AI will plan a seamless multi-city journey.
            </p>

            {/* Added destination tags */}
            {destinations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {destinations.map((dest, idx) => (
                        <span
                            key={idx}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-xl font-semibold text-sm"
                        >
                            <MapPin size={13} />
                            {dest}
                            <button
                                type="button"
                                onClick={() => onRemove(idx)}
                                className="ml-1 text-indigo-400 hover:text-white transition-colors"
                            >
                                <X size={13} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search input */}
            {destinations.length < MAX_DESTINATIONS && (
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder={destinations.length === 0 ? "e.g. Paris, Zurich, Tokyo" : "Add another destination…"}
                        className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl text-xl outline-none focus:border-indigo-500 text-white placeholder:text-slate-600 transition-all"
                        value={inputValue}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={handleKeyDown}
                    />

                    {loading && showSuggestions && (
                        <div className="absolute right-6 top-6">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b2c] border border-white/10 rounded-2xl shadow-2xl z-20 max-h-72 overflow-y-auto">
                            {suggestions.map((place, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); handleSelect(place); }}
                                    className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors border-b border-white/5 flex items-center gap-3"
                                >
                                    <MapPin size={14} className="text-indigo-400 shrink-0" />
                                    <span className="font-bold text-white">{place.description || place.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {destinations.length >= MAX_DESTINATIONS && (
                <p className="text-xs text-amber-400 font-semibold mb-4">Maximum of {MAX_DESTINATIONS} destinations reached.</p>
            )}

            <p className="text-xs text-slate-500 mb-10">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-xs">Enter</kbd> or select a suggestion to add a place.
            </p>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                >
                    Back
                </button>
                <button
                    disabled={destinations.length === 0}
                    onClick={onNext}
                    className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

const CreateTrip = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [step, setStep] = useState(1);
    const [apiError, setApiError] = useState("");
    const [travelerProfiles, setTravelerProfiles] = useState([]);
    const [selectedProfileIds, setSelectedProfileIds] = useState([]);
    const [profilesLoading, setProfilesLoading] = useState(false);

    const [tripConfig, setTripConfig] = useState({
        origin: "",
        destination: "",      // joined string sent to backend
        destinations: [],     // array of individual places (UI state)
        startDate: "",
        endDate: "",
        flexibility: "Exact dates", // Mapped from dateFlexibility
        travelers: "Solo",
        travelerCount: 1, // Mapped from adultCount/childCount
        budget: "Moderate",
        accommodationType: "Any", // Mapped from accommodationPreference
        travelPace: "Balanced",
        interests: [],
        otherInterests: [], // Mapped from otherInterest
        // --- Internal component state below, not sent to API ---
        adultCount: 1,
        childCount: 0,
    });

    useEffect(() => {
        if (state?.prefilledDestination) {
            setTripConfig(prev => ({
                ...prev,
                destination: state.prefilledDestination,
                destinations: [state.prefilledDestination]
            }));
        }

        if (state?.editingTrip && state?.prefilledConfig) {
            const cfg = state.prefilledConfig;
            setTripConfig(prev => ({
                ...prev,
                ...cfg,
                destinations: cfg.destination ? cfg.destination.split(' → ').map(s => s.trim()).filter(Boolean) : []
            }));
            setStep(6);
        }
    }, [state]);

    useEffect(() => {
        const rawUserId = localStorage.getItem("voyexa_user_id");
        const userId = rawUserId ? Number(rawUserId) : null;
        if (!userId || Number.isNaN(userId)) return;

        const fetchProfiles = async () => {
            setProfilesLoading(true);
            try {
                const response = await fetch(`${API}/api/traveler-profiles/user/${userId}`);
                if (!response.ok) {
                    throw new Error("Unable to load traveler profiles.");
                }
                const data = await response.json();
                setTravelerProfiles(Array.isArray(data) ? data : []);
            } catch (error) {
                setTravelerProfiles([]);
            } finally {
                setProfilesLoading(false);
            }
        };

        fetchProfiles();
    }, []);

    // Calculate month constraints for trending destinations
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    const maxDateConstrained = state?.prefilledDestination ? lastDayOfMonth : undefined;

    const travelerOptions = [
        { id: "Solo", label: "Solo Traveler", icon: <User size={20} /> },
        { id: "Couple", label: "Couple", icon: <Heart size={20} /> },
        { id: "Family", label: "Family", icon: <Users2 size={20} /> },
        { id: "Friends", label: "Friends", icon: <Ship size={20} /> }
    ];

    const dateFlexibilityOptions = [
        "Exact dates",
        "±1 day",
        "±3 days",
        "Flexible month"
    ];

    const interestOptions = [
        "Sightseeing",
        "Adventure",
        "Food",
        "Nightlife",
        "Nature",
        "Shopping",
        "Culture",
        "Others"
    ];

    const accommodationOptions = ["Hotel", "Hostel", "Airbnb", "Any"];
    const tripPaceOptions = ["Relaxed", "Balanced", "Packed"];

    const updateCounter = (field, delta, min = 0, max = 20) => {
        const current = tripConfig[field] ?? 0;
        const next = current + delta;
        if (next >= min && next <= max) {
            setTripConfig({ ...tripConfig, [field]: next });
        }
    };

    const toggleInterest = (interest) => {
        const selected = tripConfig.interests.includes(interest);
        const updatedInterests = selected
            ? tripConfig.interests.filter((item) => item !== interest)
            : [...tripConfig.interests, interest];

        setTripConfig({
            ...tripConfig,
            interests: updatedInterests,
            otherInterests: interest === "Others" && !selected ? tripConfig.otherInterests : [],
        });
    };

    const getTotalTravelers = () => {
        if (tripConfig.travelers === "Solo") return 1;
        if (tripConfig.travelers === "Couple") return 2;
        return tripConfig.adultCount + tripConfig.childCount;
    };

    useEffect(() => {
        setTripConfig(prev => ({ ...prev, travelerCount: getTotalTravelers() }));
    }, [tripConfig.travelers, tripConfig.adultCount, tripConfig.childCount]);


    const canContinueFromInterests =
        tripConfig.interests.length > 0 &&
        (!tripConfig.interests.includes("Others") ||
            (tripConfig.otherInterests.length > 0 && tripConfig.otherInterests.every(i => i.trim() !== "")));


    const handleBuildItinerary = () => {
        setApiError("");

        const rawUserId = localStorage.getItem("voyexa_user_id");
        const userId = rawUserId ? Number(rawUserId) : null;
        if (!userId || Number.isNaN(userId)) {
            setApiError("Please log in again before building an itinerary.");
            return;
        }

        const otherInterestsArray = Array.isArray(tripConfig.otherInterests)
            ? tripConfig.otherInterests
            : (tripConfig.otherInterests ? tripConfig.otherInterests.split(',').map(s => s.trim()) : []);

        // Join multiple destinations into a single string for the backend/AI
        const destinationString = tripConfig.destinations.length > 0
            ? tripConfig.destinations.join(' → ')
            : tripConfig.destination;

        const payload = {
            tripId: state?.editingTrip ? state.tripId : null,
            userId,
            origin: tripConfig.origin,
            destination: destinationString,
            startDate: tripConfig.startDate,
            endDate: tripConfig.endDate,
            flexibility: tripConfig.flexibility,
            travelers: tripConfig.travelers,
            travelerCount: tripConfig.travelerCount,
            adultCount: tripConfig.adultCount,
            childCount: tripConfig.childCount,
            budget: tripConfig.budget,
            accommodationType: tripConfig.accommodationType,
            travelPace: tripConfig.travelPace,
            interests: tripConfig.interests.filter(i => i !== "Others"),
            otherInterests: otherInterestsArray,
            selectedProfileIds,
            promptMetadata: {
                promptVersion: "2.0",
                responseFormat: "json",
                strictJsonOnly: true,
                locale: "en-US",
                currency: "USD",
                notes: "Web client request"
            }
        };

        navigate("/flight-loading", {
            state: {
                payload
            }
        });
    };

    const toggleProfileSelection = (profileId) => {
        setSelectedProfileIds((prev) =>
            prev.includes(profileId)
                ? prev.filter((id) => id !== profileId)
                : [...prev, profileId]
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center py-16 px-6 relative overflow-hidden bg-transparent">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-2xl flex justify-between items-center mb-12 relative z-10">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
                >
                    <ArrowLeft size={20} /> Dashboard
                </button>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= i ? "bg-indigo-500 w-14" : "bg-white/10"}`}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full max-w-2xl bg-[#0a0f1d]/80 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border border-white/10 relative z-10 flex flex-col items-start">
                {step === 1 && (
                    <LocationAutocomplete
                        icon={MapPinned}
                        title="Starting Point"
                        subtitle="Where are you beginning your journey from?"
                        placeholder="Current City or Airport"
                        value={tripConfig.origin}
                        onChange={(val) => setTripConfig({ ...tripConfig, origin: val })}
                        onNext={() => setStep(2)}
                        nextLabel="Set Destination"
                        showBackButton={false}
                        themeColor="default"
                    />
                )}

                {step === 2 && (
                    <MultiDestinationInput
                        destinations={tripConfig.destinations}
                        onAdd={(place) =>
                            setTripConfig(prev => ({
                                ...prev,
                                destinations: [...prev.destinations, place]
                            }))
                        }
                        onRemove={(idx) =>
                            setTripConfig(prev => ({
                                ...prev,
                                destinations: prev.destinations.filter((_, i) => i !== idx)
                            }))
                        }
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                    />
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
                            <Calendar size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-10">Trip Logistics</h1>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                    Departure
                                </label>
                                <input
                                    type="date"
                                    min={minDate}
                                    max={maxDateConstrained}
                                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold text-white outline-none focus:border-indigo-500 transition-all color-scheme-dark"
                                    value={tripConfig.startDate}
                                    onChange={(e) =>
                                        setTripConfig({ ...tripConfig, startDate: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                    Return
                                </label>
                                <input
                                    type="date"
                                    min={tripConfig.startDate || minDate}
                                    max={maxDateConstrained}
                                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold text-white outline-none focus:border-indigo-500 transition-all color-scheme-dark"
                                    value={tripConfig.endDate}
                                    onChange={(e) =>
                                        setTripConfig({ ...tripConfig, endDate: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                Date flexibility
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {dateFlexibilityOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() =>
                                            setTripConfig({ ...tripConfig, flexibility: option })
                                        }
                                        className={`p-4 rounded-2xl border-2 font-bold text-left transition-all ${tripConfig.flexibility === option
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                Who is traveling?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {travelerOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() =>
                                            setTripConfig((prev) => ({ ...prev, travelers: opt.id }))
                                        }
                                        className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center gap-4 ${tripConfig.travelers === opt.id
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(tripConfig.travelers === "Family" ||
                            tripConfig.travelers === "Friends") && (
                                <div className="animate-in fade-in zoom-in duration-300 p-6 bg-white/5 border border-white/10 rounded-2xl mb-6 space-y-5">
                                    <div className="text-white font-bold">Traveler Count</div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-semibold">Adults</h4>
                                            <p className="text-xs text-slate-500">Age 13+</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => updateCounter("adultCount", -1, 1, 20)}
                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="text-2xl font-black text-white w-8 text-center">
                                                {tripConfig.adultCount}
                                            </span>
                                            <button
                                                onClick={() => updateCounter("adultCount", 1, 1, 20)}
                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-semibold">Children</h4>
                                            <p className="text-xs text-slate-500">Age 0-12</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => updateCounter("childCount", -1, 0, 20)}
                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="text-2xl font-black text-white w-8 text-center">
                                                {tripConfig.childCount}
                                            </span>
                                            <button
                                                onClick={() => updateCounter("childCount", 1, 0, 20)}
                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className="mb-10 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <p className="text-sm text-indigo-300 font-semibold">
                                Total Travelers: {tripConfig.travelerCount}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Back
                            </button>
                            <button
                                disabled={!tripConfig.startDate || !tripConfig.endDate}
                                onClick={() => setStep(4)}
                                className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black disabled:opacity-30 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
                            <Sparkles size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">
                            Interests / Preferences
                        </h1>
                        <p className="text-slate-400 mb-10 font-medium">
                            Pick one or more things you want in this trip.
                        </p>

                        <div className="mb-8 p-5 rounded-2xl border border-white/10 bg-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                                    Traveler Profiles
                                </h3>
                                <span className="text-xs text-indigo-300 font-semibold">
                                    {selectedProfileIds.length} selected
                                </span>
                            </div>
                            {profilesLoading ? (
                                <p className="text-sm text-slate-500">Loading profiles...</p>
                            ) : travelerProfiles.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No saved profiles found. Add profiles from Dashboard sidebar (Traveler Profiles).
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {travelerProfiles.map((profile) => {
                                        const isSelected = selectedProfileIds.includes(profile.id);
                                        return (
                                            <button
                                                key={profile.id}
                                                type="button"
                                                onClick={() => toggleProfileSelection(profile.id)}
                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                    isSelected
                                                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-300"
                                                        : "border-white/10 bg-white/5 text-slate-400 hover:border-indigo-400/40"
                                                }`}
                                            >
                                                <div className="font-bold">{profile.name}</div>
                                                <div className="text-xs opacity-80 mt-1">
                                                    {profile.relation || "relation"} • {profile.mobilityLevel || "mobility"}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-3">
                                Selected profiles are included in itinerary generation so their preferences are considered.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {interestOptions.map((interest) => {
                                const isSelected = tripConfig.interests.includes(interest);
                                return (
                                    <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className={`p-4 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between ${isSelected
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        <span>{interest}</span>
                                        <span
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${isSelected
                                                    ? "border-indigo-400 bg-indigo-500/30 text-indigo-300"
                                                    : "border-slate-500/50 text-transparent"
                                                }`}
                                        >
                                            ✓
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {tripConfig.interests.includes("Others") && (
                            <div className="mb-10">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 block mb-3">
                                    Other interests (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. photography, wellness, live music"
                                    value={tripConfig.otherInterests.join(', ')}
                                    onChange={(e) =>
                                        setTripConfig({ ...tripConfig, otherInterests: e.target.value.split(',').map(s => s.trim()) })
                                    }
                                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-base text-white outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-all"
                                />
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Back
                            </button>
                            <button
                                disabled={!canContinueFromInterests}
                                onClick={() => setStep(5)}
                                className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black disabled:opacity-30 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
                            <Sparkles size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">Travel Preferences</h1>
                        <p className="text-slate-400 mb-10 font-medium">
                            Choose your stay style and pace.
                        </p>

                        <div className="space-y-4 mb-8">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                Accommodation preference
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {accommodationOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() =>
                                            setTripConfig({
                                                ...tripConfig,
                                                accommodationType: option
                                            })
                                        }
                                        className={`p-4 rounded-2xl border-2 font-bold text-left transition-all ${tripConfig.accommodationType === option
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                Pace of trip
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {tripPaceOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setTripConfig({ ...tripConfig, travelPace: option })}
                                        className={`p-4 rounded-2xl border-2 font-bold text-center transition-all ${tripConfig.travelPace === option
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(4)}
                                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(6)}
                                className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className="bg-amber-500/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-amber-500 mb-8 border border-amber-500/20">
                            <Wallet size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-10">Budget Profile</h1>
                        <div className="grid grid-cols-1 gap-4 mb-12">
                            {["Cheap", "Moderate", "Luxury"].map((b) => (
                                <button
                                    key={b}
                                    onClick={() => setTripConfig({ ...tripConfig, budget: b })}
                                    className={`p-6 rounded-2xl border-2 font-black text-left transition-all flex justify-between items-center ${tripConfig.budget === b
                                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                            : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                        }`}
                                >
                                    {b} {tripConfig.budget === b && <Sparkles size={18} />}
                                </button>
                            ))}
                        </div>

                        {apiError && (
                            <div className="w-full mb-4 text-red-200 bg-red-900/30 p-3 rounded-xl text-sm font-bold border border-red-500/20">
                                {apiError}
                            </div>
                        )}

                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setStep(5)}
                                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleBuildItinerary}
                                className="flex-[2] bg-indigo-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/40"
                            >
                                <Sparkles size={24} /> BUILD ITINERARY
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style
                dangerouslySetInnerHTML={{ __html: ".color-scheme-dark { color-scheme: dark; }" }}
            />
        </div>
    );
};
/*
            });

            if (!response.ok) {
                const responseText = await response.text();
                try {
                    const errorJson = JSON.parse(responseText);
                    setApiError(errorJson.error || "An unknown API error occurred.");
                } catch (e) {
                    setApiError(`Server returned an error: ${response.status} ${response.statusText}`);
                }
                return;
            }

            const data = await response.json();
            setPendingNavigationData({
                tripId: data.tripId,
                itineraryJson: data.itineraryJson
            });

        } catch (e) {
            setApiError("Network error: Unable to connect to the AI service.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLoaderComplete = useCallback(() => {
        if (!pendingNavigationData) return;

        navigate("/itinerary-result", {
            state: pendingNavigationData
        });
        setPendingNavigationData(null);
    }, [navigate, pendingNavigationData]);

    return (
        <div className="min-h-screen flex flex-col items-center py-16 px-6 relative overflow-hidden bg-transparent">
            <FlightLoader
                source={tripConfig.origin || "Mumbai"}
                destination={tripConfig.destination || "Paris"}
                loading={isGenerating}
                onComplete={handleLoaderComplete}
            />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-2xl flex justify-between items-center mb-12 relative z-10">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold"
                >
                    <ArrowLeft size={20} /> Dashboard
                </button>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= i ? "bg-indigo-500 w-14" : "bg-white/10"}`}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full max-w-2xl bg-[#0a0f1d]/80 backdrop-blur-2xl rounded-[3rem] p-12 shadow-2xl border border-white/10 relative z-10 flex flex-col items-start">
                {step === 1 && (
                    <LocationAutocomplete
                        icon={MapPinned}
                        title="Starting Point"
                        subtitle="Where are you beginning your journey from?"
                        placeholder="Current City or Airport"
                        value={tripConfig.origin}
                        onChange={(val) => setTripConfig({ ...tripConfig, origin: val })}
                        onNext={() => setStep(2)}
                        nextLabel="Set Destination"
                        showBackButton={false}
                        themeColor="default"
                    />
                )}

                {step === 2 && (
                    <LocationAutocomplete
                        icon={MapPin}
                        title="Target Location"
                        subtitle="Where should the AI build your itinerary?"
                        placeholder="e.g. Paris, Zurich, Tokyo"
                        value={tripConfig.destination}
                        onChange={(val) =>
                            setTripConfig({ ...tripConfig, destination: val })
                        }
                        onNext={() => setStep(3)}
                        onBack={() => setStep(1)}
                        themeColor="indigo"
                    />
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
                            <Calendar size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-10">Trip Logistics</h1>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                    Departure
                                </label>
                                <input
                                    type="date"
                                    min={minDate}
                                    max={maxDateConstrained}
                                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold text-white outline-none focus:border-indigo-500 transition-all color-scheme-dark"
                                    value={tripConfig.startDate}
                                    onChange={(e) =>
                                        setTripConfig({ ...tripConfig, startDate: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                    Return
                                </label>
                                <input
                                    type="date"
                                    min={tripConfig.startDate || minDate}
                                    max={maxDateConstrained}
                                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-bold text-white outline-none focus:border-indigo-500 transition-all color-scheme-dark"
                                    value={tripConfig.endDate}
                                    onChange={(e) =>
                                        setTripConfig({ ...tripConfig, endDate: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                Date flexibility
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {dateFlexibilityOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() =>
                                            setTripConfig({ ...tripConfig, flexibility: option })
                                        }
                                        className={`p-4 rounded-2xl border-2 font-bold text-left transition-all ${tripConfig.flexibility === option
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                Who is traveling?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {travelerOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() =>
                                            setTripConfig((prev) => ({ ...prev, travelers: opt.id }))
                                        }
                                        className={`p-5 rounded-2xl border-2 font-bold text-left transition-all flex items-center gap-4 ${tripConfig.travelers === opt.id
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {(tripConfig.travelers === "Family" ||
                            tripConfig.travelers === "Friends") && (
                                <div className="animate-in fade-in zoom-in duration-300 p-6 bg-white/5 border border-white/10 rounded-2xl mb-6 space-y-5">
                                    <div className="text-white font-bold">Traveler Count</div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-semibold">Adults</h4>
                                            <p className="text-xs text-slate-500">Age 13+</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => updateCounter("adultCount", -1, 1, 20)}
                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="text-2xl font-black text-white w-8 text-center">
                                                {tripConfig.adultCount}
                                            </span>
                                            <button
                                                onClick={() => updateCounter("adultCount", 1, 1, 20)}
                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-semibold">Children</h4>
                                            <p className="text-xs text-slate-500">Age 0-12</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => updateCounter("childCount", -1, 0, 20)}
                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                            >
                                                <Minus size={18} />
                                            </button>
                                            <span className="text-2xl font-black text-white w-8 text-center">
                                                {tripConfig.childCount}
                                            </span>
                                            <button
                                                onClick={() => updateCounter("childCount", 1, 0, 20)}
                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-indigo-600 transition-all"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className="mb-10 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <p className="text-sm text-indigo-300 font-semibold">
                                Total Travelers: {tripConfig.travelerCount}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Back
                            </button>
                            <button
                                disabled={!tripConfig.startDate || !tripConfig.endDate}
                                onClick={() => setStep(4)}
                                className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black disabled:opacity-30 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
                            <Sparkles size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">
                            Interests / Preferences
                        </h1>
                        <p className="text-slate-400 mb-10 font-medium">
                            Pick one or more things you want in this trip.
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {interestOptions.map((interest) => {
                                const isSelected = tripConfig.interests.includes(interest);
                                return (
                                    <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className={`p-4 rounded-2xl border-2 font-bold text-left transition-all flex items-center justify-between ${isSelected
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        <span>{interest}</span>
                                        <span
                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${isSelected
                                                    ? "border-indigo-400 bg-indigo-500/30 text-indigo-300"
                                                    : "border-slate-500/50 text-transparent"
                                                }`}
                                        >
                                            ✓
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {tripConfig.interests.includes("Others") && (
                            <div className="mb-10">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1 block mb-3">
                                    Other interests (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. photography, wellness, live music"
                                    value={tripConfig.otherInterests.join(', ')}
                                    onChange={(e) =>
                                        setTripConfig({ ...tripConfig, otherInterests: e.target.value.split(',').map(s => s.trim()) })
                                    }
                                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-base text-white outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-all"
                                />
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Back
                            </button>
                            <button
                                disabled={!canContinueFromInterests}
                                onClick={() => setStep(5)}
                                className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black disabled:opacity-30 transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className="bg-white/10 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-indigo-400 mb-8">
                            <Sparkles size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">Travel Preferences</h1>
                        <p className="text-slate-400 mb-10 font-medium">
                            Choose your stay style and pace.
                        </p>

                        <div className="space-y-4 mb-8">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                Accommodation preference
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {accommodationOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() =>
                                            setTripConfig({
                                                ...tripConfig,
                                                accommodationType: option
                                            })
                                        }
                                        className={`p-4 rounded-2xl border-2 font-bold text-left transition-all ${tripConfig.accommodationType === option
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 mb-10">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                                Pace of trip
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {tripPaceOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => setTripConfig({ ...tripConfig, travelPace: option })}
                                        className={`p-4 rounded-2xl border-2 font-bold text-center transition-all ${tripConfig.travelPace === option
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(4)}
                                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(6)}
                                className="flex-[2] bg-white text-slate-950 py-5 rounded-2xl font-black transition-all"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                        <div className="bg-amber-500/20 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-amber-500 mb-8 border border-amber-500/20">
                            <Wallet size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-10">Budget Profile</h1>
                        <div className="grid grid-cols-1 gap-4 mb-12">
                            {["Cheap", "Moderate", "Luxury"].map((b) => (
                                <button
                                    key={b}
                                    onClick={() => setTripConfig({ ...tripConfig, budget: b })}
                                    className={`p-6 rounded-2xl border-2 font-black text-left transition-all flex justify-between items-center ${tripConfig.budget === b
                                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                            : "border-white/5 bg-white/5 text-slate-500 hover:border-white/10"
                                        }`}
                                >
                                    {b} {tripConfig.budget === b && <Sparkles size={18} />}
                                </button>
                            ))}
                        </div>

                        {apiError && (
                            <div className="w-full mb-4 text-red-200 bg-red-900/30 p-3 rounded-xl text-sm font-bold border border-red-500/20">
                                {apiError}
                            </div>
                        )}

                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setStep(5)}
                                className="flex-1 py-5 rounded-2xl font-bold text-slate-400 hover:text-white transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleBuildItinerary}
                                disabled={isGenerating}
                                className="flex-[2] bg-indigo-600 text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                        <span>GENERATING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={24} /> BUILD ITINERARY
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style
                dangerouslySetInnerHTML={{ __html: ".color-scheme-dark { color-scheme: dark; }" }}
            />
        </div>
    );
};

*/
export default CreateTrip;
