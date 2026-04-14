import React, { useEffect, useRef } from "react";
import { X, Mail, Phone, User, Calendar, MapPin, ShieldCheck, LogOut } from "lucide-react";
import gsap from "gsap";

const UserProfileModal = ({ isOpen, onClose, user }) => {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      
      const tl = gsap.timeline();
      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      })
      .fromTo(contentRef.current, 
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.2"
      );
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose
    });
    tl.to(contentRef.current, {
      scale: 0.9,
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: "power2.in"
    })
    .to(backdropRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    }, "-=0.1");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm opacity-0"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div 
        ref={contentRef}
        className="relative w-full max-w-md bg-[#0a0f1d]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden opacity-0"
      >
        {/* Header/Banner Area */}
        <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-600 relative">
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-10 -mt-16 relative">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-32 h-32 bg-[#0a0f1d] rounded-full p-1.5 shadow-2xl ring-4 ring-indigo-500/20">
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-black">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-3xl font-black text-white tracking-tight">{user.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2 text-indigo-400 font-bold bg-indigo-400/10 px-4 py-1.5 rounded-full text-sm">
                <ShieldCheck size={16} /> Verified Traveler
              </div>
            </div>

            {/* Info Grid */}
            <div className="w-full mt-10 space-y-4">
              <div className="group flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-white/10 hover:border-white/10 transition-all">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</p>
                  <p className="text-white font-semibold truncate">{user.email || "Not provided"}</p>
                </div>
              </div>

              <div className="group flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-[1.5rem] hover:bg-white/10 hover:border-white/10 transition-all">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                  <Phone size={22} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</p>
                  <p className="text-white font-semibold">{user.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="w-full mt-10 space-y-3">
              <button 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => {
                   handleClose();
                   // Wait for animation then navigate/logout if needed
                }}
                className="w-full py-4 bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/5 hover:border-red-500/20 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
