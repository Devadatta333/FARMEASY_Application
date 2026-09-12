import React, { useEffect, useState } from 'react';
import { Sun, Droplets, Wind, Compass } from 'lucide-react';
import { fetchLiveWeatherData } from '../../api/weatherApi';

export default function WeatherWidget({ userLocation, className = '' }) {
  const [weather, setWeather] = useState({
    location: userLocation || 'Farm Station',
    temp: '...',
    condition: 'Loading...',
    humidity: '...',
    soilMoisture: 'Optimal (72%)',
    windSpeed: '...',
    isLive: false,
    provider: 'Connecting...',
  });

  useEffect(() => {
    let isMounted = true;
    fetchLiveWeatherData(userLocation).then((data) => {
      if (isMounted) {
        setWeather(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userLocation]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-forest-900 to-slate-900 text-white p-5 shadow-elevated border border-emerald-800/40 ${className}`}
    >
      {/* Subtle atmospheric light effect */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-28 h-28 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide uppercase text-emerald-300/90 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {weather.isLive ? 'Live Telemetry' : 'Microclimate Feed'}
            </span>
            <h4 className="text-xs text-slate-300 font-medium truncate max-w-[180px]">
              {weather.location}
            </h4>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" style={{ animationDuration: '20s' }} />
            <span className="text-xl font-display font-bold text-white">{weather.temp}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-emerald-200/80 mb-0.5">
              <Droplets className="w-3 h-3 text-emerald-400" />
              <span>Humidity</span>
            </div>
            <span className="text-xs font-semibold text-white">{weather.humidity}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-emerald-200/80 mb-0.5">
              <Wind className="w-3 h-3 text-emerald-400" />
              <span>Wind</span>
            </div>
            <span className="text-xs font-semibold text-white">{weather.windSpeed}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-[11px] text-emerald-200/80 mb-0.5">
              <Compass className="w-3 h-3 text-amber-400" />
              <span>Soil Mst.</span>
            </div>
            <span className="text-xs font-semibold text-emerald-300 font-medium truncate max-w-[80px]">
              {weather.soilMoisture}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
