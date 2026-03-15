export default function LeaderboardLoading() {
  return (
    <main className="flex flex-col gap-10 px-20 py-10 animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-10 bg-border-primary rounded" />
          <div className="w-64 h-10 bg-border-primary rounded" />
        </div>
        <div className="w-80 h-4 bg-border-primary rounded" />
        <div className="w-48 h-4 bg-border-primary rounded" />
      </section>

      {/* Leaderboard Entries Skeleton */}
      <section className="flex flex-col gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border border-border-primary w-full h-40">
            <div className="h-12 border-b border-border-primary bg-bg-surface flex items-center px-5 gap-4">
              <div className="w-12 h-4 bg-border-primary rounded" />
              <div className="w-24 h-4 bg-border-primary rounded" />
              <div className="flex-1" />
              <div className="w-32 h-4 bg-border-primary rounded" />
            </div>
            <div className="p-5 flex flex-col gap-2">
              <div className="w-full h-3 bg-border-primary rounded" />
              <div className="w-3/4 h-3 bg-border-primary rounded" />
              <div className="w-1/2 h-3 bg-border-primary rounded" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
