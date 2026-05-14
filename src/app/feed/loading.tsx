export default function Loading() {
  return (
    <div className="max-w-xl mx-auto px-3 py-4 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-8 flex flex-col gap-1 items-center pt-1">
              <div className="w-5 h-5 bg-earth-700 rounded" />
              <div className="w-4 h-3 bg-earth-700 rounded" />
              <div className="w-5 h-5 bg-earth-700 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-earth-700" />
                <div className="w-24 h-3 bg-earth-700 rounded" />
              </div>
              <div className="w-3/4 h-4 bg-earth-700 rounded" />
              <div className="w-full h-3 bg-earth-700 rounded" />
              <div className="w-1/2 h-3 bg-earth-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
