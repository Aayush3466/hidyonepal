"use client";
import { useEffect, useState } from "react";
import { Wind, Droplets, Eye, Thermometer } from "lucide-react";

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windspeed: number;
  weatherCode: number;
  visibility: number;
}

function getWeatherDescription(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "Clear sky", emoji: "☀️" };
  if (code <= 2) return { label: "Partly cloudy", emoji: "⛅" };
  if (code === 3) return { label: "Overcast", emoji: "☁️" };
  if (code <= 49) return { label: "Foggy", emoji: "🌫️" };
  if (code <= 59) return { label: "Drizzle", emoji: "🌦️" };
  if (code <= 69) return { label: "Rain", emoji: "🌧️" };
  if (code <= 79) return { label: "Snow", emoji: "❄️" };
  if (code <= 82) return { label: "Rain showers", emoji: "🌧️" };
  if (code <= 86) return { label: "Snow showers", emoji: "🌨️" };
  if (code <= 99) return { label: "Thunderstorm", emoji: "⛈️" };
  return { label: "Unknown", emoji: "🌡️" };
}

export function WeatherWidget({ lat, lon }: { lat: number; lon: number }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,visibility&wind_speed_unit=kmh&timezone=Asia/Kathmandu`,
        );
        const data = await res.json();
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          windspeed: Math.round(c.wind_speed_10m),
          weatherCode: c.weather_code,
          visibility: Math.round((c.visibility || 0) / 1000),
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [lat, lon]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-8 bg-earth-700 rounded w-1/2" />
        <div className="h-4 bg-earth-700 rounded w-3/4" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <p className="text-xs text-earth-500">
        Weather data unavailable right now.
      </p>
    );
  }

  const { label, emoji } = getWeatherDescription(weather.weatherCode);

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{emoji}</span>
        <div>
          <p className="text-2xl font-semibold">{weather.temp}°C</p>
          <p className="text-xs text-earth-400">
            {label} · Feels like {weather.feelsLike}°C
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-green-100 rounded-xl p-2 flex items-center gap-1.5">
          <Droplets className="w-3 h-3 text-blue-500" />
          <div>
            <p className="text-xs font-semibold text-gray-800">
              {weather.humidity}%
            </p>
            <p className="text-xs text-gray-400">Humidity</p>
          </div>
        </div>
        <div className="bg-white border border-green-100 rounded-xl p-2 flex items-center gap-1.5">
          <Wind className="w-3 h-3 text-gray-500" />
          <div>
            <p className="text-xs font-semibold text-gray-800">
              {weather.windspeed} km/h
            </p>
            <p className="text-xs text-gray-400">Wind</p>
          </div>
        </div>
        <div className="bg-white border border-green-100 rounded-xl p-2 flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-gray-500" />
          <div>
            <p className="text-xs font-semibold text-gray-800">
              {weather.visibility} km
            </p>
            <p className="text-xs text-gray-400">Visibility</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Live data · Open-Meteo · Updates hourly · Free API
      </p>
    </div>
  );
}
