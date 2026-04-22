import React, { useState, useEffect, useRef } from "react";
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
  Users,
  ChevronRight,
  Menu,
  ChevronLeft
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import UserProfileModal from "../components/UserProfileModal";
import TravelerProfilesModal from "../components/TravelerProfilesModal";

gsap.registerPlugin(ScrollTrigger);

const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [trendingPlaces, setTrendingPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myTrips, setMyTrips] = useState([]);
  const [tripSearchQuery, setTripSearchQuery] = useState("");
  const [isTripSearchFocused, setIsTripSearchFocused] = useState(false);
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTravelerProfilesModalOpen, setIsTravelerProfilesModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  // Refs for parallax animations
  const heroBgRef = useRef(null);
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const trendingTitleRef = useRef(null);
  const trendingGridRef = useRef(null);
  const trendingContainerRef = useRef(null);
  const lenisRef = useRef(null);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const storedName = localStorage.getItem("voyexa_user_name");
    const storedUserId = localStorage.getItem("voyexa_user_id");
    if (storedUserId && !Number.isNaN(Number(storedUserId))) {
      setUserId(Number(storedUserId));
    }
    if (storedName) {
      setUserName(storedName);
      setUserData({
        name: storedName,
        email: localStorage.getItem("voyexa_user_email") || "",
        phone: localStorage.getItem("voyexa_user_phone") || ""
      });
    }
    
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

  useEffect(() => {
    if (!userId) return;

    const fetchMyTrips = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/trips/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMyTrips(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch trips for search suggestions:", error);
      }
    };

    fetchMyTrips();
  }, [userId]);

  // Initialize Lenis smooth scroll + GSAP parallax
  useEffect(() => {
    if (isLoading) return;

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Connect Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Cleanup previous animations
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Layer 1: Background glow - slowest parallax with scrub (smooth scroll-linked)
    if (heroBgRef.current) {
      gsap.to(heroBgRef.current, {
        scrollTrigger: {
          trigger: heroBgRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1.5,
          markers: false
        },
        y: -200,
        scale: 1.1,
        ease: "none",
        duration: 0
      });
    }

    // Hero section scale effect
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top center",
          end: "center center",
          scrub: 1,
          markers: false
        },
        scale: 1.03,
        ease: "none",
        duration: 0
      });
    }

    // Layer 2: Hero content - fade in and upward movement
    if (heroContentRef.current) {
      gsap.fromTo(
        heroContentRef.current,
        { opacity: 0, y: 80 },
        {
          scrollTrigger: {
            trigger: heroContentRef.current,
            start: "top 75%",
            end: "top 25%",
            markers: false
          },
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out"
        }
      );
    }

    // Layer 3: Trending title - separate animation with delay
    if (trendingTitleRef.current) {
      gsap.fromTo(
        trendingTitleRef.current,
        { opacity: 0, y: 60 },
        {
          scrollTrigger: {
            trigger: trendingTitleRef.current,
            start: "top 75%",
            end: "top 25%",
            markers: false
          },
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.2
        }
      );
    }

    // Layer 4: Trending cards - staggered with scale effect
    if (trendingGridRef.current) {
      const cards = trendingGridRef.current.querySelectorAll("[data-card]");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 100, scale: 0.95 },
        {
          scrollTrigger: {
            trigger: trendingGridRef.current,
            start: "top 70%",
            end: "top 20%",
            markers: false
          },
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power4.out"
        }
      );

      // Hover depth effect on cards
      cards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            scale: 1.05,
            y: -8,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        });
      });
    }

    // Full-Screen Hero Scroll Transition - Simple fade in/out
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          markers: false
        },
        opacity: 0,
        ease: "power2.out"
      });
    }

    if (trendingContainerRef.current) {
      gsap.fromTo(
        trendingContainerRef.current,
        { opacity: 0 },
        {
          scrollTrigger: {
            trigger: heroRef.current,
            start: "center center",
            end: "bottom center",
            scrub: 1,
            markers: false
          },
          opacity: 1,
          ease: "power2.out"
        }
      );
    }

    // Refresh ScrollTrigger after all animations
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      lenis.destroy();
    };
  }, [isLoading, trendingPlaces]);

  const handleTripSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedQuery = tripSearchQuery.trim();
    if (!trimmedQuery) {
      navigate("/my-trips");
      return;
    }
    navigate(`/my-trips?search=${encodeURIComponent(trimmedQuery)}`);
  };

  const normalizedTripSearchQuery = tripSearchQuery.trim().toLowerCase();
  const tripSuggestions = normalizedTripSearchQuery
    ? myTrips
        .filter((trip) => {
          const searchableText = [
            trip.destination,
            trip.origin,
            trip.status,
            trip.startDate,
            trip.endDate
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return searchableText.includes(normalizedTripSearchQuery);
        })
        .slice(0, 6)
    : [];

  const handleSuggestionSelect = (trip) => {
    const suggestionQuery = trip.destination || trip.origin || tripSearchQuery.trim();
    navigate(`/my-trips?search=${encodeURIComponent(suggestionQuery)}`);
  };

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
            <button 
              onClick={() => navigate("/my-trips")}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-semibold group transition-all"
            >
              <Clock size={20} className="group-hover:text-indigo-400" /> My Trips
            </button>
            <button
              onClick={() => setIsTravelerProfilesModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl font-semibold group transition-all"
            >
              <Users size={20} className="group-hover:text-indigo-400" /> My Profiles
            </button>
          </nav>

          <div className="p-6 space-y-3 border-t border-slate-800/50">
            <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold text-slate-300 transition-all group"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-lg text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate">{userName}</span>
            </button>
            <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
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
            className={`flex-1 transition-all duration-500 ease-in-out relative z-10
        ${isSidebarOpen ? "lg:ml-72" : "ml-0"}`}
        >
          {/* HERO SECTION - FULL SCREEN */}
          <div ref={heroRef} className="relative w-full h-screen bg-transparent text-white overflow-hidden will-change-transform flex items-center justify-center px-6 lg:px-12">
            <div 
              ref={heroBgRef}
              className="absolute -top-20 -right-20 w-[40rem] h-[40rem] bg-indigo-600 rounded-full blur-[120px] opacity-50 animate-pulse will-change-transform"
            ></div>
            <div className="absolute bottom-0 -left-20 w-[30rem] h-[30rem] bg-purple-600 rounded-full blur-[120px] opacity-30 animate-pulse will-change-transform" style={{animationDelay: '1s'}}></div>

            <div ref={heroContentRef} className="relative z-10 w-full max-w-6xl will-change-transform p-10 lg:p-16 rounded-[3rem] bg-[#0a0f1d]/60 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-start text-left mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight md:leading-[0.9]">
                Your world, <br />
                <span className="text-indigo-400 italic">optimized.</span>
              </h1>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-medium mb-8 max-w-xl">
                AI-driven itineraries for travelers who value time as much as the destination.
              </p>
            </div>

            {/* Header inside hero */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 lg:px-12 py-8 z-20">
              <form
                onSubmit={handleTripSearchSubmit}
                className={`${!isSidebarOpen ? "ml-16" : "ml-0"} transition-all duration-500 relative w-64 md:w-96 hidden sm:block`}
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search itineraries..."
                    value={tripSearchQuery}
                    onChange={(event) => setTripSearchQuery(event.target.value)}
                    onFocus={() => setIsTripSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsTripSearchFocused(false), 120)}
                    aria-label="Search my trips"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-white placeholder:text-slate-500"
                />
                {isTripSearchFocused && normalizedTripSearchQuery && (
                  <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-[#0a0f1d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40">
                    {tripSuggestions.length > 0 ? (
                      tripSuggestions.map((trip) => (
                        <button
                          key={trip.id}
                          type="button"
                          onMouseDown={() => handleSuggestionSelect(trip)}
                          className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <p className="text-white font-semibold text-sm truncate">
                            {trip.destination || "Untitled trip"}
                          </p>
                          <p className="text-slate-400 text-xs truncate">
                            From {trip.origin || "Unknown"} • {trip.startDate || "Date TBD"}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-400 text-sm">
                        No trips found in your saved trips.
                      </div>
                    )}
                  </div>
                )}
              </form>

              <button
                  onClick={() => navigate("/create-trip")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 md:px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all ml-auto"
              >
                <Plus size={20} /> <span className="hidden xs:inline">Plan New Trip</span>
              </button>
            </div>
          </div>

          {/* TRENDING SECTION */}
          <div ref={trendingContainerRef} className="will-change-transform py-12">
            {/* TRIP GRID TITLE */}
            <div ref={trendingTitleRef} className="flex justify-between items-end mb-8 max-w-7xl mx-auto px-6 lg:px-12 will-change-transform">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Trending in {currentMonth}</h2>
                <p className="text-slate-400 font-medium mt-2">Top 10 hottest destinations picked by AI</p>
              </div>
            </div>

            {/* CARDS GRID */}
            <div ref={trendingGridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 pb-12 max-w-7xl mx-auto px-6 lg:px-12">
            {isLoading ? (
               <div className="col-span-full flex justify-center py-20">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
               </div>
            ) : trendingPlaces.length === 0 ? (
               <div className="col-span-full text-slate-400 py-10">Unable to load trending destinations at this time.</div>
            ) : trendingPlaces.map((place, idx) => (
                <div
                    key={idx}
                    data-card
                    onClick={() => navigate("/create-trip", { state: { prefilledDestination: `${place.city}, ${place.country}` } })}
                    className="group bg-[#0a0f1d]/60 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-indigo-500/40 transition-all duration-500 cursor-pointer will-change-transform"
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
                data-card
                onClick={() => navigate("/create-trip")}
                className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center group hover:bg-white/10 hover:border-indigo-400 transition-all cursor-pointer min-h-[400px] will-change-transform"
            >
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-90 transition-all duration-500 shadow-xl shadow-indigo-500/0 group-hover:shadow-indigo-500/20">
                <Plus size={40} />
              </div>
              <h4 className="text-white font-black mt-8 text-xl tracking-tight uppercase">Create New</h4>
            </div>
          </div>
          </div>
        </main>

        <UserProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
          user={userData}
        />
        <TravelerProfilesModal
          isOpen={isTravelerProfilesModalOpen}
          onClose={() => setIsTravelerProfilesModalOpen(false)}
          userId={userId}
        />
      </div>
  );
};

export default Dashboard;
