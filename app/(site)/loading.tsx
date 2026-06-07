export default function SiteLoading() {
  return (
    <main className="min-h-screen pb-32 flex items-center justify-center">
      <div className="space-y-4 flex flex-col items-center">
        <div className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-white/30 text-xs font-mono tracking-widest uppercase">
          Loading...
        </p>
      </div>
    </main>
  );
}
