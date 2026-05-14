export default function Loading() {
  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <div className="card p-5 mb-4 animate-pulse">
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-earth-700" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-4 bg-earth-700 rounded" />
            <div className="w-24 h-3 bg-earth-700 rounded" />
          </div>
        </div>
        <div className="flex gap-6 pt-3 border-t border-earth-700">
          <div className="w-12 h-8 bg-earth-700 rounded" />
          <div className="w-12 h-8 bg-earth-700 rounded" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-4 mb-2 animate-pulse">
          <div className="w-32 h-4 bg-earth-700 rounded" />
        </div>
      ))}
    </div>
  );
}
