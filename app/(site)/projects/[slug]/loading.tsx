export default function ProjectLoading() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Back button skeleton */}
        <div className="w-32 h-10 bg-white/5 rounded-full mb-10 animate-pulse" />

        {/* Hero skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16 lg:mb-24 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="w-3/4 h-16 bg-white/5 rounded-2xl animate-pulse" />
            <div className="w-full h-24 bg-white/5 rounded-2xl animate-pulse" />
            <div className="flex gap-4">
              <div className="w-32 h-12 bg-white/5 rounded-full animate-pulse" />
              <div className="w-32 h-12 bg-white/5 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="lg:col-span-5 h-[300px] bg-white/5 rounded-[2rem] animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="h-48 bg-white/5 rounded-[2rem] animate-pulse" />
              <div className="h-48 bg-white/5 rounded-[2rem] animate-pulse" />
            </div>
            <div className="h-64 bg-white/5 rounded-[2rem] animate-pulse" />
            <div className="h-96 bg-white/5 rounded-[2rem] animate-pulse" />
          </div>
          <div className="lg:col-span-4 h-[400px] bg-white/5 rounded-[2rem] animate-pulse sticky top-24" />
        </div>
      </div>
    </main>
  );
}
