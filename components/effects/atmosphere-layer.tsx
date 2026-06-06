"use client";

export function AtmosphereLayer() {
    return (
        <div
            className="fixed inset-0 pointer-events-none z-[1]"
            aria-hidden="true"
        >
            {/* 
                1. bg-background/30: Adds a "fog" of the background color, tinting the sigils 
                   to make them look deeper/further away compared to the crisp foreground.
                2. backdrop-blur-[1px]: Adds a very subtle defocus to distant objects.
            */}
            <div className="hidden md:absolute md:inset-0 md:bg-background/30 md:backdrop-blur-[0.5px]" />

            {/* Ambient gradient washes */}
            <div className="absolute top-[20%] left-[10%] w-[50%] h-[40%] bg-[radial-gradient(ellipse_at_center,rgba(138,43,226,0.06)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute top-[25%] right-[5%] w-[40%] h-[35%] bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.04)_0%,transparent_70%)] pointer-events-none" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />
        </div>
    );
}
