"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

export function ServicesTeaser() {
    return (
        <section className="py-24 container mx-auto px-4 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden"
            >
                {/* Background with glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-black to-accent/20 backdrop-blur-md border border-white/10" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[100px] -z-10" />

                <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-white/80 mb-6 border border-white/10">
                            <Zap size={12} className="text-yellow-400" />
                            <span>Available for hire</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                            I don&apos;t just write code; <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                I build solutions.
                            </span>
                        </h2>

                        <p className="text-lg text-white/70 mb-0">
                            From AI-powered automation for SMEs to custom scaling web applications.
                            Let's transform your ideas into reality.
                        </p>
                    </div>

                    <div className="flex-shrink-0">
                        <Link
                            href="/services"
                            className="group relative px-8 py-4 rounded-full bg-white text-black font-bold text-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
                        >
                            View Services
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
