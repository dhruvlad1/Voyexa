import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, Clock, Info, ArrowLeft,
    Hotel, Sparkles, Sunrise, Sun, Sunset,
    Lightbulb, Share2, Download, Check, RefreshCw, X, CheckCircle, GripVertical, Copy
} from 'lucide-react';
import FloatingLines from '../components/FloatingLines';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ItineraryResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { tripId, itineraryJson } = location.state || {};
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isInjectingImages, setIsInjectingImages] = useState(false);

    // Alternative activities state
    const [alternatives, setAlternatives] = useState({});
    const [loadingAlts, setLoadingAlts] = useState(null);
    const [showAlternativesModal, setShowAlternativesModal] = useState(false);
    const [currentModalAlt, setCurrentModalAlt] = useState(null);
    const [selectedIndices, setSelectedIndices] = useState({});

    // Drag and drop state
    const [isDragging, setIsDragging] = useState(false);

    // Fork trip state
    const [showForkModal, setShowForkModal] = useState(false);
    const [forkName, setForkName] = useState('');
    const [isForkingSaving, setIsForkingSaving] = useState(false);

    // Share state
    const [shareLink, setShareLink] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isSharingLoading, setIsSharingLoading] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { distance: 8 }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

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
     * Draggable Day Component
     */
    const DraggableDay = ({ day }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging: isSortableDragging,
        } = useSortable({ id: day.dayNumber.toString() });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isSortableDragging ? 0.5 : 1,
        };

        return (
            <div ref={setNodeRef} style={style} className="flex flex-col lg:flex-row gap-12">
                {/* Day Indicator with Drag Handle */}
                <div className="lg:w-48 shrink-0">
                    <div className="lg:sticky lg:top-32">
                        <div className="flex items-center gap-2 mb-4">
                            <button
                                {...attributes}
                                {...listeners}
                                className="p-2 hover:bg-blue-500/20 rounded-lg transition cursor-grab active:cursor-grabbing"
                                title="Drag to reorder days"
                            >
                                <GripVertical size={20} className="text-blue-400" />
                            </button>
                            <div className="text-7xl font-black text-white/60 leading-none">0{day.dayNumber}</div>
                        </div>
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
                    <ActivityCard section="Morning" data={day.morning} icon={Sunrise} colorClass="bg-amber-500" dayNumber={day.dayNumber} timeSlot="morning" />
                    <ActivityCard section="Afternoon" data={day.afternoon} icon={Sun} colorClass="bg-sky-400" dayNumber={day.dayNumber} timeSlot="afternoon" />
                    <ActivityCard section="Evening" data={day.evening} icon={Sunset} colorClass="bg-indigo-500" dayNumber={day.dayNumber} timeSlot="evening" />

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
        );
    };

    /**
     * Share Modal Component
     */
    const ShareModal = () => {
        if (!showShareModal) return null;

        return (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md shadow-2xl">
                    <div className="border-b border-white/10 p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Share2 size={24} className="text-blue-400" />
                            Share Trip
                        </h2>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {!shareLink ? (
                            <>
                                <p className="text-sm text-slate-400">
                                    Create a shareable link for this trip. Anyone with the link can view it.
                                </p>
                                <button
                                    onClick={handleCreateShareLink}
                                    disabled={isSharingLoading}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                                >
                                    {isSharingLoading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Creating link...
                                        </>
                                    ) : (
                                        <>
                                            <Share2 size={16} />
                                            Create Share Link
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-slate-400 mb-2">Share Link Created!</p>
                                <div className="bg-slate-800 border border-white/10 rounded-lg p-3 break-all text-xs text-slate-300">
                                    {shareLink}
                                </div>
                                <button
                                    onClick={handleCopyShareLink}
                                    className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                                >
                                    📋 Copy Link
                                </button>
                                <button
                                    onClick={() => window.open(shareLink, '_blank')}
                                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition"
                                >
                                    🔗 Open Link
                                </button>
                            </>
                        )}
                    </div>

                    <div className="border-t border-white/5 p-6">
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Fork Modal Component
     */
    const ForkModal = () => {
        if (!showForkModal) return null;

        return (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md shadow-2xl">
                    <div className="border-b border-white/10 p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Copy size={24} className="text-purple-400" />
                            Create Trip Variation
                        </h2>
                        <button
                            onClick={() => setShowForkModal(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Variation Name
                            </label>
                            <input
                                type="text"
                                value={forkName}
                                onChange={(e) => setForkName(e.target.value)}
                                placeholder="e.g., 'Budget Version', 'Adventure Mix'"
                                className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleForkTrip()}
                            />
                        </div>
                        <p className="text-xs text-slate-400">
                            This creates an independent copy of your trip that you can modify without affecting the original.
                        </p>
                    </div>

                    <div className="border-t border-white/5 p-6 flex gap-3">
                        <button
                            onClick={() => setShowForkModal(false)}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleForkTrip}
                            disabled={isForkingSaving || !forkName.trim()}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {isForkingSaving ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Copy size={16} />
                                    Create Variation
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Alternatives Modal Component
     */
    const AlternativesModal = () => {
        if (!showAlternativesModal || !currentModalAlt) return null;

        const { alternatives: alts, originalActivity, isCached, dayNumber, timeSlot } = currentModalAlt;

        return (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    {/* Header */}
                    <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Alternative Activities</h2>
                            <p className="text-sm text-slate-400 mt-1">Day {dayNumber} - {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}</p>
                            {isCached && <span className="inline-block mt-2 text-xs font-bold px-2 py-1 bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 rounded">📦 Cached Result</span>}
                        </div>
                        <button
                            onClick={() => setShowAlternativesModal(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Original Activity */}
                    <div className="p-6 border-b border-white/5 bg-slate-800/30">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Current Selection</h3>
                        <div className="bg-slate-900 border border-white/10 rounded-lg p-4">
                            <h4 className="text-lg font-bold text-white mb-1">{originalActivity?.title}</h4>
                            <p className="text-sm text-slate-300 mb-3">{originalActivity?.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <MapPin size={14} />
                                {originalActivity?.location}
                            </div>
                        </div>
                    </div>

                    {/* Alternatives */}
                    <div className="p-6 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">✨ Suggested Alternatives</h3>

                        {alts && Array.isArray(alts) && alts.length > 0 ? (
                            alts.map((alt, idx) => {
                                const altActivity = alt.activity || alt;
                                return (
                                    <div
                                        key={idx}
                                        className="bg-gradient-to-br from-slate-800/50 to-slate-900 border border-blue-500/30 rounded-lg p-5 hover:border-blue-500/60 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="text-lg font-bold text-white">{altActivity?.title}</h4>
                                                <p className="text-sm text-slate-300 mt-2">{altActivity?.description}</p>
                                            </div>
                                            <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full whitespace-nowrap">
                                                Option {idx + 1}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                            <MapPin size={14} />
                                            {altActivity?.location}
                                        </div>

                                        <button
                                            onClick={() => handleApplyAlternative(dayNumber, timeSlot, idx)}
                                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} />
                                            Select This Activity
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400">No alternatives available</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/5 p-6 bg-slate-800/20 flex gap-3">
                        <button
                            onClick={() => setShowAlternativesModal(false)}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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

    /**
     * Handle getting alternatives for a specific activity
     */
    const handleGetAlternatives = async (dayNumber, timeSlot, currentActivity) => {
        const key = `${dayNumber}-${timeSlot}`;

        // Return if already cached in state
        if (alternatives[key]) {
            setCurrentModalAlt({ dayNumber, timeSlot, ...alternatives[key] });
            setShowAlternativesModal(true);
            return;
        }

        setLoadingAlts(key);
        try {
            const response = await fetch(`http://localhost:8080/api/trips/${tripId}/alternatives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination: itineraryData.accommodationAdvice ? itineraryData.accommodationAdvice.split(' ')[0] : 'destination',
                    budget: 'moderate', // This should come from trip data
                    currentActivity: currentActivity,
                    dayNumber: dayNumber,
                    timeSlot: timeSlot,
                    numberOfAlternatives: 2,
                    interests: 'travel,culture,food',
                    travelPace: 'balanced',
                    tripSummary: itineraryData.tripSummary
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAlternatives(prev => ({ ...prev, [key]: data }));
            setCurrentModalAlt({ dayNumber, timeSlot, ...data });
            setShowAlternativesModal(true);
        } catch (error) {
            console.error('Error fetching alternatives:', error);
            alert('Failed to fetch alternatives. Please try again.');
        } finally {
            setLoadingAlts(null);
        }
    };

    /**
     * Handle applying a selected alternative
     */
    const handleApplyAlternative = async (dayNumber, timeSlot, selectedIndex) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/trips/${tripId}/apply-alternative?dayNumber=${dayNumber}&timeSlot=${timeSlot}&selectedIndex=${selectedIndex}`,
                { method: 'PUT' }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Update local itinerary with the selected alternative
            const key = `${dayNumber}-${timeSlot}`;
            const selectedAlt = alternatives[key]?.alternatives[selectedIndex];

            if (selectedAlt) {
                setItineraryData(prev => {
                    const updated = JSON.parse(JSON.stringify(prev));
                    const dayIndex = dayNumber - 1;
                    if (updated.itinerary[dayIndex]) {
                        updated.itinerary[dayIndex][timeSlot].activity = selectedAlt.activity || selectedAlt;
                    }
                    return updated;
                });

                setSelectedIndices(prev => ({ ...prev, [key]: selectedIndex }));
            }

            setShowAlternativesModal(false);
            alert('Activity updated successfully!');
        } catch (error) {
            console.error('Error applying alternative:', error);
            alert('Failed to apply alternative. Please try again.');
        }
    };

    /**
     * Handle drag and drop reordering
     */
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setIsDragging(false);

        if (over && active.id !== over.id) {
            const activeIndex = itineraryData.itinerary.findIndex(day => day.dayNumber === parseInt(active.id));
            const overIndex = itineraryData.itinerary.findIndex(day => day.dayNumber === parseInt(over.id));

            if (activeIndex !== -1 && overIndex !== -1) {
                const newItinerary = arrayMove(itineraryData.itinerary, activeIndex, overIndex);

                // Update day numbers to reflect new order
                const reorderedItinerary = newItinerary.map((day, idx) => ({
                    ...day,
                    dayNumber: idx + 1
                }));

                const updatedData = { ...itineraryData, itinerary: reorderedItinerary };
                setItineraryData(updatedData);

                // Save to backend
                try {
                    const response = await fetch(`http://localhost:8080/api/trips/${tripId}/reorder`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            dayOrder: reorderedItinerary.map(d => d.dayNumber),
                            itineraryJson: updatedData
                        })
                    });

                    if (!response.ok) {
                        alert('Failed to save reorder. Changes are local only.');
                    }
                } catch (error) {
                    console.error('Error saving reorder:', error);
                }
            }
        }
    };

    /**
     * Handle forking a trip
     */
    const handleForkTrip = async () => {
        if (!forkName.trim()) {
            alert('Please enter a variation name');
            return;
        }

        setIsForkingSaving(true);
        try {
            const response = await fetch(`http://localhost:8080/api/trips/${tripId}/fork`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    variationName: forkName,
                    itineraryJson: itineraryData
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fork trip');
            }

            const data = await response.json();
            alert(`✅ Trip variation "${forkName}" created! Trip ID: ${data.tripId}`);
            setShowForkModal(false);
            setForkName('');
        } catch (error) {
            console.error('Error forking trip:', error);
            alert('Failed to create trip variation. Please try again.');
        } finally {
            setIsForkingSaving(false);
        }
    };

    /**
     * Handle creating a share link
     */
    const handleCreateShareLink = async () => {
        setIsSharingLoading(true);
        try {
            // Get userId from localStorage or pass it
            const userId = localStorage.getItem('userId') || 1;
            const response = await fetch(`http://localhost:8080/api/trips/${tripId}/share?userId=${userId}`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to create share link');
            }

            const data = await response.json();
            setShareLink(data.shareUrl);
        } catch (error) {
            console.error('Error creating share link:', error);
            alert('Failed to create share link. Please try again.');
        } finally {
            setIsSharingLoading(false);
        }
    };

    /**
     * Copy share link to clipboard
     */
    const handleCopyShareLink = () => {
        navigator.clipboard.writeText(shareLink);
        alert('✅ Share link copied to clipboard!');
    };

    const ActivityCard = ({ section, data, icon: Icon, colorClass, dayNumber, timeSlot }) => {
        if (!data || !data.activity) return null;

        const key = `${dayNumber}-${timeSlot}`;
        const isSelected = selectedIndices[key] !== undefined;

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
                            {isSelected && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 ml-auto flex items-center gap-1"><CheckCircle size={12} /> Updated</span>}
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors tracking-tight">
                            {data.activity.title}
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4 font-medium">
                            {data.activity.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400 mb-4">
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

                        {/* Get Alternatives Button */}
                        <button
                            onClick={() => handleGetAlternatives(dayNumber, timeSlot, data.activity)}
                            disabled={loadingAlts === key}
                            className="w-full px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 flex items-center justify-center gap-2 border border-blue-400/30 bg-blue-400/10 hover:bg-blue-400/20 text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingAlts === key ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-blue-300/40 border-t-blue-300 rounded-full animate-spin" />
                                    Finding alternatives...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={14} />
                                    Get Alternatives
                                </>
                            )}
                        </button>
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
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-slate-300"
                            title="Share this trip"
                        >
                            <Share2 size={18} />
                        </button>
                        <button
                            onClick={() => setShowForkModal(true)}
                            className="px-4 py-2 rounded-lg font-bold text-sm transition bg-purple-700 hover:bg-purple-600 border border-white/10 text-white flex items-center gap-2"
                            title="Create a variation of this trip"
                        >
                            <Copy size={16} /> Fork
                        </button>
                        <button
                            onClick={() => navigate('/my-trips')}
                            className="px-4 py-2 rounded-lg font-bold text-sm transition bg-slate-700 hover:bg-slate-600 border border-white/10 text-slate-200"
                        >
                            My Trips
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

                    {/* Timeline with Drag and Drop */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={itineraryData.itinerary.map(day => day.dayNumber.toString())}>
                            <div className="space-y-24">
                                {itineraryData.itinerary.map((day) => (
                                    <DraggableDay key={day.dayNumber} day={day} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </main>

                {/* Alternatives Modal */}
                <AlternativesModal />

                {/* Share Modal */}
                <ShareModal />

                {/* Fork Modal */}
                <ForkModal />
            </div>
        </div>
    );
};

export default ItineraryResult;