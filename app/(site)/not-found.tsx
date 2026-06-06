import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050609] px-6">
      <div className="max-w-xl text-center space-y-6">
        <p className="text-xs font-mono tracking-[0.3em] uppercase text-zinc-500">
          404 · Page not found
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-50 leading-tight">
          This path fell off the map.
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist here. Try heading
          back to the portfolio or homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-zinc-100 text-zinc-950 text-xs font-mono tracking-[0.16em] uppercase hover:bg-white transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/services"
            className="px-5 py-2.5 rounded-full border border-zinc-700 text-zinc-200 text-xs font-mono tracking-[0.16em] uppercase hover:border-zinc-500 hover:text-white transition-colors"
          >
            View services
          </Link>
        </div>
      </div>
    </div>
  );
}

