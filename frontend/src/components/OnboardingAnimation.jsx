import React, { useState, useEffect, useRef } from "react";

const OnboardingAnimation = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef(null);
  // phase 0: sky + stars + airplane enters (0ms)
  // phase 1: destination icons pop in (700ms)
  // phase 2: text + path glow + cards form (1500ms)
  // phase 3: fade out + scale transition (2400ms)
  // complete: (3200ms)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => onComplete(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Particle starfield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let w, h;
    const stars = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create stars
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = (time) => {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        const flicker = Math.sin(time * 0.002 + s.pulse) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 255, ${s.alpha * flicker})`;
        ctx.fill();
        // subtle glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(165, 180, 252, ${s.alpha * flicker * 0.1})`;
        ctx.fill();
        s.y -= s.speed;
        if (s.y < -5) { s.y = h + 5; s.x = Math.random() * w; }
      });
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="onb-overlay"
      style={{
        opacity: phase === 3 ? 0 : 1,
        transform: phase === 3 ? "scale(1.05)" : "scale(1)",
      }}
    >
      {/* Deep gradient background */}
      <div className="onb-sky" />

      {/* Aurora / Nebula effects */}
      <div className="onb-aurora onb-aurora-1" />
      <div className="onb-aurora onb-aurora-2" />
      <div className="onb-aurora onb-aurora-3" />

      {/* Star canvas */}
      <canvas ref={canvasRef} className="onb-stars" />

      {/* Curved dotted travel path */}
      <svg className="onb-path-svg" viewBox="0 0 1400 700" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.6" />
            <stop offset="40%" stopColor="#9333ea" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#6366f1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.5" />
          </linearGradient>
          <filter id="pathBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Shadow path */}
        <path
          d="M-40,520 C180,470 320,260 520,300 C720,340 780,180 950,210 C1120,240 1200,120 1450,90"
          stroke="url(#pathGrad)"
          strokeWidth="6"
          strokeDasharray="0"
          fill="none"
          filter="url(#pathBlur)"
          className={`onb-path-shadow ${phase >= 0 ? "draw" : ""}`}
        />
        {/* Main dotted path */}
        <path
          d="M-40,520 C180,470 320,260 520,300 C720,340 780,180 950,210 C1120,240 1200,120 1450,90"
          stroke="rgba(165, 180, 252, 0.5)"
          strokeWidth="2.5"
          strokeDasharray="6 10"
          fill="none"
          className={`onb-path-main ${phase >= 0 ? "draw" : ""}`}
        />
        {/* Glow overlay on phase 2 */}
        <path
          d="M-40,520 C180,470 320,260 520,300 C720,340 780,180 950,210 C1120,240 1200,120 1450,90"
          stroke="url(#pathGrad)"
          strokeWidth="4"
          fill="none"
          className={`onb-path-glow ${phase >= 2 ? "active" : ""}`}
        />
      </svg>

      {/* Airplane with contrail & engine glow */}
      <div className={`onb-airplane ${phase >= 0 ? "fly" : ""}`}>
        <div className="onb-contrail" />
        <div className="onb-engine-glow" />
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bodyGrad" x1="10" y1="20" x2="70" y2="60">
              <stop offset="0%" stopColor="#e0e7ff" />
              <stop offset="50%" stopColor="#c7d2fe" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </linearGradient>
            <linearGradient id="wingGrad" x1="0" y1="0" x2="50" y2="50">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
            <filter id="planeShadow">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="rgba(99,102,241,0.5)" />
            </filter>
          </defs>
          <g filter="url(#planeShadow)">
            {/* Fuselage */}
            <path d="M10,38 L18,35 L55,24 L68,26 L58,32 L42,34 L44,44 L52,52 L46,52 L38,42 L26,40 L22,50 L16,50 L20,38 Z"
              fill="url(#bodyGrad)" />
            {/* Main wing */}
            <path d="M30,33 L52,14 L58,17 L40,33 Z" fill="url(#wingGrad)" opacity="0.95" />
            {/* Tail wing */}
            <path d="M14,38 L10,28 L18,30 L20,38 Z" fill="#818cf8" opacity="0.85" />
            {/* Engine highlight */}
            <ellipse cx="60" cy="28" rx="4" ry="2.5" fill="#c7d2fe" opacity="0.6" />
            {/* Windows */}
            <circle cx="34" cy="34" r="1.8" fill="#4f46e5" opacity="0.6" />
            <circle cx="30" cy="35" r="1.5" fill="#4f46e5" opacity="0.5" />
            <circle cx="38" cy="33" r="1.5" fill="#4f46e5" opacity="0.5" />
            {/* Belly highlight */}
            <path d="M22,40 L38,42 L36,44 L20,42 Z" fill="rgba(255,255,255,0.15)" />
          </g>
        </svg>
      </div>

      {/* Destination Icons - Realistic Style */}
      <div className={`onb-dest onb-dest-mountains ${phase >= 1 ? "pop" : ""}`}>
        <MountainScene />
      </div>
      <div className={`onb-dest onb-dest-beach ${phase >= 1 ? "pop" : ""}`}>
        <BeachScene />
      </div>
      <div className={`onb-dest onb-dest-city ${phase >= 1 ? "pop" : ""}`}>
        <CityScene />
      </div>

      {/* Center Text */}
      <div className={`onb-text ${phase >= 2 ? "show" : ""}`}>
        <div className="onb-text-glow" />
        <p className="onb-text-main">Planning your perfect trip...</p>
        <div className="onb-text-dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>

      {/* Floating Dashboard Cards - Glassmorphism */}
      <div className={`onb-cards ${phase >= 2 ? "organize" : ""}`}>
        <div className="onb-card" style={{ animationDelay: "0s" }}>
          <div className="onb-card-accent flight" />
          <div className="onb-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
          </div>
          <div className="onb-card-content">
            <div className="onb-card-title">Flight Booked</div>
            <div className="onb-card-sub">JFK → NRT • Direct</div>
          </div>
          <div className="onb-card-badge">✓</div>
        </div>

        <div className="onb-card" style={{ animationDelay: "0.12s" }}>
          <div className="onb-card-accent hotel" />
          <div className="onb-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
              <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16" />
              <path d="M8 7h.01M16 7h.01M12 7h.01M12 11h.01M16 11h.01M8 11h.01" />
            </svg>
          </div>
          <div className="onb-card-content">
            <div className="onb-card-title">Hotel Reserved</div>
            <div className="onb-card-sub">4★ Suite • 5 nights</div>
          </div>
          <div className="onb-card-badge purple">✓</div>
        </div>

        <div className="onb-card" style={{ animationDelay: "0.24s" }}>
          <div className="onb-card-accent explore" />
          <div className="onb-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>
          <div className="onb-card-content">
            <div className="onb-card-title">Destinations</div>
            <div className="onb-card-sub">3 spots curated</div>
          </div>
          <div className="onb-card-badge blue">✓</div>
        </div>
      </div>

      <style>{`
        /* ══════════ OVERLAY ══════════ */
        .onb-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ══════════ SKY ══════════ */
        .onb-sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            #020617 0%,
            #0a0f1d 15%,
            #0f172a 30%,
            #1e1b4b 50%,
            #312e81 65%,
            #1e1b4b 80%,
            #0a0f1d 95%,
            #020617 100%
          );
        }

        /* ══════════ AURORA / NEBULA ══════════ */
        .onb-aurora {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0;
          animation: auroraFade 0.8s ease-out forwards;
        }
        .onb-aurora-1 {
          width: 600px; height: 400px;
          top: -10%; left: 10%;
          background: radial-gradient(ellipse, rgba(99,102,241,0.35) 0%, transparent 70%);
          animation-delay: 0.1s;
        }
        .onb-aurora-2 {
          width: 500px; height: 350px;
          top: 20%; right: 5%;
          background: radial-gradient(ellipse, rgba(147,51,234,0.25) 0%, transparent 70%);
          animation-delay: 0.3s;
        }
        .onb-aurora-3 {
          width: 700px; height: 300px;
          bottom: 5%; left: 30%;
          background: radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%);
          animation-delay: 0.5s;
        }
        @keyframes auroraFade {
          0% { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* ══════════ STARS CANVAS ══════════ */
        .onb-stars {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* ══════════ TRAVEL PATH ══════════ */
        .onb-path-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .onb-path-main, .onb-path-shadow {
          stroke-dashoffset: 2000;
          transition: stroke-dashoffset 2.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .onb-path-main.draw { stroke-dashoffset: 0; }
        .onb-path-shadow.draw { stroke-dashoffset: 0; }
        .onb-path-glow {
          opacity: 0;
          filter: drop-shadow(0 0 10px rgba(99,102,241,0.6)) drop-shadow(0 0 30px rgba(147,51,234,0.3));
          transition: opacity 0.6s ease-in-out;
        }
        .onb-path-glow.active { opacity: 1; }

        /* ══════════ AIRPLANE ══════════ */
        .onb-airplane {
          position: absolute;
          left: -100px;
          top: 72%;
          z-index: 20;
          transform: rotate(-18deg);
        }
        .onb-airplane.fly {
          animation: planeAcross 2.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .onb-contrail {
          position: absolute;
          right: 60px;
          top: 50%;
          width: 200px;
          height: 3px;
          background: linear-gradient(to left, rgba(165,180,252,0.5), transparent);
          border-radius: 2px;
          transform: translateY(-50%);
          opacity: 0;
        }
        .onb-airplane.fly .onb-contrail {
          animation: contrailIn 1s 0.4s ease-out forwards;
        }
        .onb-engine-glow {
          position: absolute;
          right: 4px;
          top: 26px;
          width: 16px;
          height: 10px;
          background: radial-gradient(ellipse, rgba(165,180,252,0.8) 0%, rgba(99,102,241,0.4) 50%, transparent 100%);
          border-radius: 50%;
          animation: enginePulse 0.3s ease-in-out infinite alternate;
        }

        @keyframes planeAcross {
          0%   { left: -100px; top: 72%;  transform: rotate(-18deg) scale(0.85); }
          25%  { left: 22%;    top: 50%;  transform: rotate(-12deg) scale(1.05); }
          50%  { left: 46%;    top: 38%;  transform: rotate(-8deg)  scale(1.0); }
          75%  { left: 72%;    top: 26%;  transform: rotate(-6deg)  scale(0.95); }
          100% { left: 110%;   top: 10%;  transform: rotate(-4deg)  scale(0.75); }
        }
        @keyframes contrailIn {
          0%   { opacity: 0; width: 0; }
          100% { opacity: 1; width: 200px; }
        }
        @keyframes enginePulse {
          0%   { opacity: 0.5; transform: scale(0.8); }
          100% { opacity: 1;   transform: scale(1.2); }
        }

        /* ══════════ DESTINATION ICONS ══════════ */
        .onb-dest {
          position: absolute;
          z-index: 15;
          opacity: 0;
          transform: scale(0) translateY(30px);
        }
        .onb-dest.pop {
          animation: destPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .onb-dest-mountains { left: 24%; top: 36%; }
        .onb-dest-beach     { left: 48%; top: 24%; animation-delay: 0.18s !important; }
        .onb-dest-city      { left: 68%; top: 18%; animation-delay: 0.36s !important; }

        @keyframes destPop {
          0%   { opacity: 0; transform: scale(0) translateY(30px); }
          50%  { opacity: 1; transform: scale(1.12) translateY(-6px); }
          70%  { transform: scale(0.95) translateY(2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ══════════ CENTER TEXT ══════════ */
        .onb-text {
          position: absolute;
          left: 50%;
          top: 54%;
          transform: translate(-50%, -50%);
          z-index: 25;
          text-align: center;
          opacity: 0;
          transition: opacity 0.6s ease-out;
        }
        .onb-text.show { opacity: 1; }
        .onb-text-glow {
          position: absolute;
          inset: -40px -60px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%);
          border-radius: 50%;
          z-index: -1;
        }
        .onb-text-main {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: #e0e7ff;
          letter-spacing: -0.03em;
          text-shadow: 0 0 40px rgba(99,102,241,0.4), 0 2px 10px rgba(0,0,0,0.4);
          margin: 0;
          white-space: nowrap;
        }
        .onb-text-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 16px;
        }
        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #6366f1;
          animation: dotPulse 1s ease-in-out infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }

        /* ══════════ UI CARDS ══════════ */
        .onb-cards {
          position: absolute;
          right: 6%;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 14px;
          z-index: 30;
        }
        .onb-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          background: rgba(10, 15, 29, 0.7);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          min-width: 220px;
          position: relative;
          overflow: hidden;
          opacity: 0;
          transform: translateY(50px) scale(0.7) rotate(6deg);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.1);
        }
        .onb-cards.organize .onb-card {
          animation: cardSlide 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .onb-card-accent {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
        }
        .onb-card-accent.flight  { background: linear-gradient(to bottom, #6366f1, #818cf8); }
        .onb-card-accent.hotel   { background: linear-gradient(to bottom, #9333ea, #c084fc); }
        .onb-card-accent.explore { background: linear-gradient(to bottom, #2563eb, #38bdf8); }
        .onb-card-icon {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          flex-shrink: 0;
        }
        .onb-card-content { flex: 1; }
        .onb-card-title {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #e0e7ff;
          letter-spacing: -0.01em;
        }
        .onb-card-sub {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          color: #64748b;
          margin-top: 2px;
        }
        .onb-card-badge {
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 800;
          background: rgba(99,102,241,0.2);
          color: #818cf8;
          flex-shrink: 0;
        }
        .onb-card-badge.purple { background: rgba(147,51,234,0.2); color: #c084fc; }
        .onb-card-badge.blue   { background: rgba(37,99,235,0.2);  color: #38bdf8; }

        @keyframes cardSlide {
          0%   { opacity: 0; transform: translateY(50px) scale(0.7) rotate(6deg); }
          60%  { opacity: 1; transform: translateY(-6px) scale(1.02) rotate(-1deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
        }

        /* ══════════ RESPONSIVE ══════════ */
        @media (max-width: 768px) {
          .onb-text-main { font-size: 1.2rem; }
          .onb-cards { right: 3%; gap: 10px; }
          .onb-card { min-width: 170px; padding: 10px 14px; }
          .onb-dest-mountains { left: 18%; top: 38%; }
          .onb-dest-beach { left: 40%; top: 28%; }
          .onb-dest-city { left: 60%; top: 22%; }
        }
      `}</style>
    </div>
  );
};

/* ══════════ Destination Scene: Mountains ══════════ */
const MountainScene = () => (
  <svg width="76" height="76" viewBox="0 0 76 76" fill="none">
    <defs>
      <linearGradient id="mtBg" x1="0" y1="0" x2="76" y2="76">
        <stop offset="0%" stopColor="#1e1b4b" />
        <stop offset="100%" stopColor="#312e81" />
      </linearGradient>
      <linearGradient id="mt1" x1="20" y1="15" x2="40" y2="58">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
      <linearGradient id="mt2" x1="38" y1="20" x2="58" y2="58">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#3730a3" />
      </linearGradient>
    </defs>
    <circle cx="38" cy="38" r="36" fill="url(#mtBg)" stroke="rgba(165,180,252,0.2)" strokeWidth="1.5" />
    {/* Background mountain */}
    <path d="M10,58 L28,22 L36,34 L40,26 L58,58 Z" fill="url(#mt2)" opacity="0.7" />
    {/* Foreground mountain */}
    <path d="M16,58 L32,18 L40,32 L44,24 L62,58 Z" fill="url(#mt1)" />
    {/* Snow caps */}
    <path d="M32,18 L35,26 L29,26 Z" fill="#e0e7ff" opacity="0.9" />
    <path d="M44,24 L47,30 L41,30 Z" fill="#c7d2fe" opacity="0.8" />
    {/* Trees */}
    <path d="M18,58 L21,48 L24,58 Z" fill="#4338ca" opacity="0.6" />
    <path d="M52,58 L55,46 L58,58 Z" fill="#4338ca" opacity="0.5" />
    {/* Moon */}
    <circle cx="56" cy="18" r="6" fill="#a5b4fc" opacity="0.5" />
    <circle cx="58" cy="17" r="5" fill="url(#mtBg)" />
  </svg>
);

/* ══════════ Destination Scene: Beach ══════════ */
const BeachScene = () => (
  <svg width="76" height="76" viewBox="0 0 76 76" fill="none">
    <defs>
      <linearGradient id="bbBg" x1="0" y1="0" x2="76" y2="76">
        <stop offset="0%" stopColor="#0c4a6e" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <linearGradient id="ocean" x1="0" y1="44" x2="76" y2="56">
        <stop offset="0%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <linearGradient id="sand" x1="0" y1="52" x2="76" y2="64">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#c084fc" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <circle cx="38" cy="38" r="36" fill="url(#bbBg)" stroke="rgba(165,180,252,0.2)" strokeWidth="1.5" />
    {/* Sunset glow */}
    <circle cx="54" cy="26" r="10" fill="#9333ea" opacity="0.3" />
    <circle cx="54" cy="26" r="7" fill="#a78bfa" opacity="0.5" />
    <circle cx="54" cy="26" r="4" fill="#c7d2fe" opacity="0.7" />
    {/* Ocean */}
    <path d="M10,48 Q28,42 38,46 Q48,50 66,46 L66,62 Q38,58 10,62 Z" fill="url(#ocean)" opacity="0.7" />
    {/* Waves */}
    <path d="M12,50 Q22,47 30,50 Q38,53 50,49 Q58,46 64,49" stroke="rgba(165,180,252,0.3)" strokeWidth="1" fill="none" />
    {/* Sand */}
    <path d="M10,54 Q28,50 38,52 Q54,55 66,52 L66,64 L10,64 Z" fill="url(#sand)" />
    {/* Palm tree */}
    <line x1="24" y1="26" x2="24" y2="52" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M24,26 Q34,22 36,28" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M24,26 Q16,20 12,24" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M24,26 Q30,18 34,22" stroke="#818cf8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M24,26 Q18,24 14,28" stroke="#818cf8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

/* ══════════ Destination Scene: City ══════════ */
const CityScene = () => (
  <svg width="76" height="76" viewBox="0 0 76 76" fill="none">
    <defs>
      <linearGradient id="ctBg" x1="0" y1="0" x2="76" y2="76">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#1e1b4b" />
      </linearGradient>
      <linearGradient id="bld1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
      <linearGradient id="bld2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
      <linearGradient id="bld3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9333ea" />
        <stop offset="100%" stopColor="#6d28d9" />
      </linearGradient>
    </defs>
    <circle cx="38" cy="38" r="36" fill="url(#ctBg)" stroke="rgba(165,180,252,0.2)" strokeWidth="1.5" />
    {/* Stars */}
    <circle cx="16" cy="16" r="1" fill="#a5b4fc" opacity="0.6" />
    <circle cx="52" cy="12" r="0.8" fill="#a5b4fc" opacity="0.5" />
    <circle cx="38" cy="10" r="1.2" fill="#c7d2fe" opacity="0.4" />
    <circle cx="60" cy="22" r="0.6" fill="#a5b4fc" opacity="0.7" />
    {/* Buildings */}
    <rect x="12" y="30" width="10" height="30" rx="2" fill="url(#bld1)" />
    <rect x="24" y="20" width="10" height="40" rx="2" fill="url(#bld2)" />
    <rect x="36" y="26" width="10" height="34" rx="2" fill="url(#bld3)" />
    <rect x="48" y="32" width="10" height="28" rx="2" fill="url(#bld1)" opacity="0.8" />
    <rect x="60" y="38" width="6" height="22" rx="1.5" fill="url(#bld2)" opacity="0.6" />
    {/* Antenna */}
    <line x1="29" y1="14" x2="29" y2="20" stroke="#818cf8" strokeWidth="1.5" />
    <circle cx="29" cy="13" r="1.5" fill="#ef4444" opacity="0.7" />
    {/* Windows */}
    <rect x="14" y="34" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="14" y="40" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.4)" />
    <rect x="14" y="46" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="17.5" y="34" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.3)" />
    <rect x="17.5" y="40" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="17.5" y="46" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.4)" />
    <rect x="26" y="24" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="26" y="30" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.4)" />
    <rect x="26" y="36" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="26" y="42" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.3)" />
    <rect x="26" y="48" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="30" y="24" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.3)" />
    <rect x="30" y="30" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="30" y="36" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.4)" />
    <rect x="30" y="42" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="30" y="48" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.3)" />
    <rect x="38" y="30" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.4)" />
    <rect x="38" y="36" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="38" y="42" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.3)" />
    <rect x="42" y="30" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="42" y="36" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.4)" />
    <rect x="42" y="42" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="50" y="36" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.4)" />
    <rect x="50" y="42" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="50" y="48" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.3)" />
    <rect x="54" y="36" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.5)" />
    <rect x="54" y="42" width="2.5" height="2" rx="0.5" fill="rgba(165,180,252,0.4)" />
    {/* Ground reflection */}
    <rect x="8" y="59" width="60" height="2" rx="1" fill="rgba(99,102,241,0.15)" />
  </svg>
);

export default OnboardingAnimation;
