"use client";

export function GrainOverlay() {
    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Film Grain Noise Texture */}
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay w-full h-full bg-[url('/noise.svg')] bg-repeat" />

            {/* Vignette (Darkened Corners) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
        </div>
    );
}
