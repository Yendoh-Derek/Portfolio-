"use client";

import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-transparent opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center px-6 max-w-md"
      >
        <motion.div
          animate={{
            textShadow: [
              "0 0 20px rgba(0, 255, 255, 0.3)",
              "0 0 40px rgba(0, 255, 255, 0.6)",
              "0 0 20px rgba(0, 255, 255, 0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl font-bold text-cyan-400 mb-4 font-mono"
        >
          ⚠️
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-cyan-200/80 mb-6 text-lg">
          The void has spoken. An unexpected error has occurred.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer"
          >
            Go home
          </button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left bg-red-950/50 border border-red-700 rounded-lg p-4">
            <summary className="cursor-pointer text-red-400 font-mono text-sm">
              Error details (dev only)
            </summary>
            <pre className="mt-4 text-xs text-red-300 overflow-auto max-h-48 whitespace-pre-wrap break-words">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </motion.div>
    </div>
  );
}
