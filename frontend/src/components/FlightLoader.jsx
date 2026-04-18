import React from "react";
import { useFlightLoaderAnimation } from "../hooks/useFlightLoaderAnimation";
import { useLeafletFlightMap } from "../hooks/useLeafletFlightMap";
import { useTheme } from "../context/ThemeContext";

const FlightLoader = ({ source, destination, loading, onComplete }) => {
  const { theme } = useTheme();
  const isLightTheme = theme === "light";
  const {
    visible,
    isFadingOut,
    showArrivalMarker,
    progress,
    sourceCoords,
    destinationCoords,
    sourceLatLng,
    destinationLatLng,
    curvePoints,
    trailPoints,
    planePosition,
    activeMessage,
  } = useFlightLoaderAnimation({
    source,
    destination,
    loading,
    onFadeComplete: onComplete,
  });

  const { mapContainerRef } = useLeafletFlightMap({
    visible,
    loading,
    source: source || "Mumbai",
    destination: destination || "Paris",
    sourceLatLng,
    destinationLatLng,
    curvePoints,
    trailPoints,
    planePosition,
    progress,
    showArrivalMarker,
  });

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[150] transition-opacity duration-700 ${
        isFadingOut ? "opacity-0" : "opacity-100"
      }`}
      aria-live="polite"
      aria-busy={loading}
      role="status"
    >
      <div className={`absolute inset-0 z-10 ${isLightTheme ? "bg-blue-100/70" : "bg-slate-950/44"}`} />
      <div ref={mapContainerRef} className="absolute inset-0 z-0 isolate" />
      <div className="absolute inset-0 z-20 bg-[radial-gradient(circle_at_14%_14%,rgba(99,102,241,0.20),transparent_36%),radial-gradient(circle_at_86%_82%,rgba(56,189,248,0.16),transparent_40%)] pointer-events-none" />
      <div className={`absolute inset-0 z-20 pointer-events-none ${isLightTheme ? "bg-blue-100/35" : "bg-black/24"}`} />

      <div className={`absolute z-40 top-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold tracking-wide pointer-events-none ${
        isLightTheme
          ? "bg-blue-50/95 border-blue-300 text-blue-900 shadow-[0_8px_24px_rgba(30,64,175,0.15)]"
          : "bg-slate-900/80 border-slate-600/80 text-slate-100 shadow-[0_8px_30px_rgba(2,6,23,0.45)]"
      }`}>
        {sourceCoords?.displayName?.split(",")[0] || source} → {destinationCoords?.displayName?.split(",")[0] || destination}
      </div>

      <div className="absolute z-50 bottom-8 left-1/2 -translate-x-1/2 pointer-events-none px-4 w-full max-w-3xl">
        <p
          key={activeMessage}
          className={`mx-auto w-fit max-w-full text-center text-base sm:text-xl font-extrabold tracking-wide rounded-2xl px-5 sm:px-7 py-3 sm:py-4 ${
            isLightTheme
              ? "text-blue-950 bg-blue-50/92 border border-blue-300 shadow-[0_10px_28px_rgba(30,64,175,0.16)]"
              : "text-white bg-slate-900/78 border border-slate-600/70 shadow-[0_12px_40px_rgba(2,6,23,0.55)]"
          }`}
          style={{ animation: "flightMessageIn 550ms ease both" }}
        >
          {activeMessage}
        </p>
      </div>

      <style>{`
        .leaflet-pane,
        .leaflet-tile,
        .leaflet-marker-icon,
        .leaflet-marker-shadow,
        .leaflet-tile-container,
        .leaflet-pane > svg,
        .leaflet-pane > canvas,
        .leaflet-zoom-box,
        .leaflet-image-layer,
        .leaflet-layer {
          position: absolute;
          left: 0;
          top: 0;
        }
        .leaflet-container {
          overflow: hidden;
          width: 100%;
          height: 100%;
          background: ${isLightTheme ? "#dbeafe" : "#020617"};
          outline: 0;
          font: 12px/1.5 "Inter", system-ui, sans-serif;
        }
        .leaflet-map-pane {
          z-index: 400;
        }
        .leaflet-tile-pane {
          z-index: 200;
        }
        .leaflet-overlay-pane {
          z-index: 400;
        }
        .leaflet-shadow-pane {
          z-index: 500;
        }
        .leaflet-marker-pane {
          z-index: 600;
        }
        .leaflet-tooltip-pane {
          z-index: 650;
        }
        .leaflet-tile {
          visibility: inherit;
          user-select: none;
          -webkit-user-drag: none;
          max-width: none !important;
          max-height: none !important;
        }
        .leaflet-tooltip {
          position: absolute;
          padding: 6px;
          pointer-events: none;
          white-space: nowrap;
        }
        .leaflet-zoom-animated {
          transform-origin: 0 0;
          will-change: transform;
        }
        .leaflet-interactive {
          cursor: inherit;
        }

        @keyframes flightMessageIn {
          0% { opacity: 0; transform: translate3d(0, 8px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        .flight-city-label {
          background: ${isLightTheme ? "rgba(239, 246, 255, 0.92)" : "rgba(15, 23, 42, 0.78)"};
          border: 1px solid ${isLightTheme ? "rgba(96, 165, 250, 0.55)" : "rgba(100, 116, 139, 0.45)"};
          color: ${isLightTheme ? "rgba(30, 58, 138, 0.95)" : "rgba(226, 232, 240, 0.98)"};
          border-radius: 8px;
          box-shadow: ${isLightTheme ? "0 8px 24px rgba(30, 64, 175, 0.16)" : "0 8px 24px rgba(2, 6, 23, 0.42)"};
          font-size: 11px;
          font-weight: 600;
          padding: 4px 7px;
        }
        .flight-city-label:before {
          display: none;
        }
        .flight-city-label-destination {
          border-color: rgba(74, 222, 128, 0.5);
          color: rgba(187, 247, 208, 0.98);
        }

        .flight-plane-marker {
          background: transparent !important;
          border: none !important;
        }
        .flight-plane-icon-shell {
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.55));
          will-change: transform;
        }
        .flight-plane-svg {
          width: 26px;
          height: 26px;
          transform: translateZ(0);
        }
        .flight-plane-svg path {
          fill: rgba(241, 245, 249, 0.97);
          stroke: rgba(125, 211, 252, 0.85);
          stroke-width: 1.1;
        }

        .flight-destination-pulse {
          transform-origin: center;
          animation: flightDestinationPulse 1.5s ease-out infinite;
          filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.62));
        }
        @keyframes flightDestinationPulse {
          0% { stroke-opacity: 0.95; fill-opacity: 1; }
          60% { stroke-opacity: 0.65; fill-opacity: 0.82; }
          100% { stroke-opacity: 0.95; fill-opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FlightLoader;

