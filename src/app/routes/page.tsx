import Link from "next/link";
import { ROUTES, DIFFICULTY_COLOR } from "@/lib/trek-routes";
import { Mountain, Clock, TrendingUp, Calendar } from "lucide-react";

export const revalidate = 3600; // cache for 1 hour — route data never changes
export const metadata = {
  title: "Trek Routes in Nepal | HidyoNepal",
  description:
    "Complete guide to popular trekking routes in Nepal. Everest Base Camp, Annapurna Circuit, Langtang, Poon Hill and more with real costs and permits.",
};

export default function RoutesPage() {
  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-1">Trek Routes</h1>
        <p className="text-earth-500 text-sm">
          {ROUTES.length} popular routes · Real costs · Community reports
        </p>
      </div>

      <div className="space-y-3">
        {ROUTES.map((route) => (
          <Link
            key={route.slug}
            href={`/routes/${route.slug}`}
            className="card p-4 block hover:border-earth-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="font-semibold text-sm text-gray-800">
                    {route.name}
                  </h2>{" "}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                      route.difficulty === "Easy"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : route.difficulty === "Moderate"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : route.difficulty === "Hard"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {route.difficulty}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{route.region}</p>{" "}
              </div>
              <Mountain className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
            </div>

            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {" "}
              {route.description}
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white border border-green-200 rounded-xl p-2 text-center">
                <Clock className="w-3 h-3 text-green-600 mx-auto mb-0.5" />
                <p className="text-xs font-semibold text-gray-800">
                  {route.duration}
                </p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="bg-white border border-green-200 rounded-xl p-2 text-center">
                <TrendingUp className="w-3 h-3 text-green-600 mx-auto mb-0.5" />
                <p className="text-xs font-semibold text-gray-800">
                  {route.maxAltitude}
                </p>
                <p className="text-xs text-gray-500">Max Alt.</p>
              </div>
              <div className="bg-white border border-green-200 rounded-xl p-2 text-center">
                <Calendar className="w-3 h-3 text-green-600 mx-auto mb-0.5" />
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {route.bestSeason.split(",")[0]}
                </p>
                <p className="text-xs text-gray-500">Best Season</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-earth-500">Nepali cost</p>
                <p className="text-xs font-medium text-brand-400">
                  {route.costNepali}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-earth-500">International</p>
                <p className="text-xs font-medium text-gray-600">
                  {" "}
                  {route.costInternational.split("·")[0]}
                </p>
              </div>
            </div>

            {route.tags.slice(0, 3).map((t) => (
              <span key={t} className="tag mr-1 mt-2 inline-flex">
                {t}
              </span>
            ))}
          </Link>
        ))}
      </div>
    </div>
  );
}
