export default function Loading() {
  return (
    <div className="max-w-xl mx-auto px-3 py-4 space-y-3">
      <div className="flex justify-between mb-4">
        <div className="w-28 h-6 bg-earth-700 rounded animate-pulse" />
        <div className="w-24 h-8 bg-earth-700 rounded animate-pulse" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-earth-700" />
            <div className="flex-1 space-y-2">
              <div className="w-1/2 h-4 bg-earth-700 rounded" />
              <div className="w-full h-3 bg-earth-700 rounded" />
              <div className="w-1/3 h-3 bg-earth-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
