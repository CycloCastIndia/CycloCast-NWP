/**
 * @license
 * CycloCast NWP - Forecast Visualisation
 * High-precision meteorological spatial grid viewer with lead-time scrubber,
 * crosshair coordinate probing, and time-series meteogram
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Map as MapIcon,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Crosshair,
  TrendingUp,
  Sliders,
  Layers,
  Info,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { METEOROLOGICAL_VARIABLES } from '../data/variables';
import { generateForecastGrid, INDIAN_CITIES_LANDMARKS, GridPointValue } from '../data/benchmarkRun';

export const ForecastVisualisation: React.FC = () => {
  const [selectedVarId, setSelectedVarId] = useState<string>('rain_accum');
  const [leadTime, setLeadTime] = useState<number>(24);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedPoint, setSelectedPoint] = useState<GridPointValue | null>(null);
  const [showWindVectors, setShowWindVectors] = useState<boolean>(true);
  const [showIsobars, setShowIsobars] = useState<boolean>(true);

  const activeVar = METEOROLOGICAL_VARIABLES.find((v) => v.id === selectedVarId) || METEOROLOGICAL_VARIABLES[0];

  // Lead-time auto-advance loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setLeadTime((prev) => (prev >= 72 ? 0 : prev + 6));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute spatial grid for current lead time
  const gridData = useMemo(() => {
    return generateForecastGrid(leadTime, selectedVarId);
  }, [leadTime, selectedVarId]);

  // Initialize probed point if null (default to Mahabaleshwar / Western Ghats)
  useEffect(() => {
    if (!selectedPoint && gridData.length > 0) {
      const defaultPt = gridData.find((p) => p.lat === 17.5 && p.lon === 73.5) || gridData[Math.floor(gridData.length / 2)];
      setSelectedPoint(defaultPt);
    }
  }, [gridData, selectedPoint]);

  // 72-hour meteogram data for the currently probed location
  const meteogramData = useMemo(() => {
    if (!selectedPoint) return [];
    const times = [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72];
    return times.map((t) => {
      const sample = generateForecastGrid(t, selectedVarId);
      const match = sample.find((p) => Math.abs(p.lat - selectedPoint.lat) < 0.6 && Math.abs(p.lon - selectedPoint.lon) < 0.6) || sample[0];
      return {
        time: `+${t}h`,
        rain: match.rainAccumMm,
        rainRate: match.rainRateMmh,
        temp: match.temp2mC,
        wind: match.windSpeedKt,
        rh: match.rh2mPct,
        mslp: match.mslpHpa,
        cape: match.capeJkg,
      };
    });
  }, [selectedPoint, selectedVarId]);

  // Color mapper based on meteorological variable and value
  const getCellColor = (val: number, varId: string): string => {
    switch (varId) {
      case 'rain_accum':
        if (val < 2.5) return 'rgba(34, 197, 94, 0.2)'; // Very light green
        if (val < 15.6) return 'rgba(6, 182, 212, 0.45)'; // Cyan
        if (val < 64.5) return 'rgba(59, 130, 246, 0.7)'; // Moderate blue
        if (val < 115.5) return 'rgba(234, 179, 8, 0.85)'; // Yellow
        if (val < 204.4) return 'rgba(249, 115, 22, 0.9)'; // Orange
        return 'rgba(239, 68, 68, 0.95)'; // Extreme Red/Magenta
      case 'rain_rate':
        if (val < 1) return 'rgba(51, 65, 85, 0.2)';
        if (val < 5) return 'rgba(6, 182, 212, 0.5)';
        if (val < 15) return 'rgba(59, 130, 246, 0.75)';
        if (val < 30) return 'rgba(234, 179, 8, 0.85)';
        return 'rgba(239, 68, 68, 0.95)';
      case 't2m':
      case 'tmax':
      case 'tmin':
        if (val < 18) return 'rgba(59, 130, 246, 0.7)'; // Cool blue
        if (val < 24) return 'rgba(6, 182, 212, 0.6)'; // Cyan
        if (val < 28) return 'rgba(34, 197, 94, 0.6)'; // Green
        if (val < 33) return 'rgba(234, 179, 8, 0.75)'; // Warm yellow
        if (val < 38) return 'rgba(249, 115, 22, 0.85)'; // Orange
        return 'rgba(239, 68, 68, 0.95)'; // Hot red
      case 'wind10m':
        if (val < 10) return 'rgba(100, 116, 139, 0.3)';
        if (val < 20) return 'rgba(6, 182, 212, 0.55)';
        if (val < 30) return 'rgba(59, 130, 246, 0.75)';
        if (val < 45) return 'rgba(234, 179, 8, 0.85)';
        return 'rgba(239, 68, 68, 0.95)';
      case 'mslp':
        if (val < 998) return 'rgba(168, 85, 247, 0.85)'; // Deep low
        if (val < 1002) return 'rgba(239, 68, 68, 0.7)';
        if (val < 1006) return 'rgba(234, 179, 8, 0.6)';
        if (val < 1010) return 'rgba(34, 197, 94, 0.5)';
        return 'rgba(59, 130, 246, 0.5)';
      case 'cape':
        if (val < 500) return 'rgba(100, 116, 139, 0.2)';
        if (val < 1500) return 'rgba(234, 179, 8, 0.5)';
        if (val < 2500) return 'rgba(249, 115, 22, 0.75)';
        return 'rgba(239, 68, 68, 0.9)';
      default:
        return 'rgba(6, 182, 212, 0.5)';
    }
  };

  const getMetricValue = (pt: GridPointValue, varId: string): number => {
    switch (varId) {
      case 'rain_accum': return pt.rainAccumMm;
      case 'rain_rate': return pt.rainRateMmh;
      case 't2m': return pt.temp2mC;
      case 'tmax': return pt.tmaxC;
      case 'tmin': return pt.tminC;
      case 'wind10m': return pt.windSpeedKt;
      case 'mslp': return pt.mslpHpa;
      case 'psfc': return pt.psfcHpa;
      case 'rh2m': return pt.rh2mPct;
      case 'dewpoint2m': return pt.dewPointC;
      case 'cloud_cover': return pt.cloudCoverPct;
      case 'cape': return pt.capeJkg;
      case 'rain_convective': return pt.rainConvectiveMm;
      case 'gh500': return pt.gh500Gpm;
      case 'w850': return pt.w850Pas;
      default: return pt.rainAccumMm;
    }
  };

  // Convert lat/lon to SVG canvas coordinate (Domain: 8°N-22°N, 71°E-85°E)
  const mapWidth = 640;
  const mapHeight = 540;
  const minLon = 71.0;
  const maxLon = 85.0;
  const minLat = 8.0;
  const maxLat = 22.0;

  const projectX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * mapWidth;
  const projectY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * mapHeight;

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>SOUTH PENINSULAR INDIA & WESTERN GHATS</span>
              <span aria-hidden="true">·</span>
              <span>GRID RESOLUTION: 3 KM</span>
              <span aria-hidden="true">·</span>
              <span>INIT: 12Z</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-cyan-400" />
              Forecast Spatial Visualisation
            </h1>
          </div>

          {/* Demonstration Notice */}
          <div className="text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Calibrated Demonstration Benchmark Run (Western Ghats Surge)</span>
          </div>
        </div>

        {/* Lead Time Scrubber & Controls */}
        <div className="mt-5 p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play Simulation Time'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            </button>
            <button
              onClick={() => setLeadTime(0)}
              className="p-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
              title="Reset to Init T+00h"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-white">
                T+{leadTime < 10 ? `0${leadTime}` : leadTime}h
              </span>
              <span className="text-xs font-mono text-slate-400">
                (Valid: 2026-11-0{1 + Math.floor(leadTime / 24)} {(12 + (leadTime % 24)) % 24}:00 UTC)
              </span>
            </div>
          </div>

          {/* Slider */}
          <div className="flex-1 max-w-md flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">T+00h</span>
            <input
              type="range"
              min={0}
              max={72}
              step={6}
              value={leadTime}
              onChange={(e) => setLeadTime(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400">T+72h</span>
          </div>

          {/* Overlays Toggle */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showWindVectors}
                onChange={(e) => setShowWindVectors(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>10m Wind Barbs</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showIsobars}
                onChange={(e) => setShowIsobars(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              <span>MSLP Isobars</span>
            </label>
          </div>
        </div>

        {/* Variable Selector Tabs */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
          {METEOROLOGICAL_VARIABLES.map((v) => {
            const isSelected = v.id === selectedVarId;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVarId(v.id)}
                className={`px-3 py-1.5 text-xs font-mono rounded whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {v.shortName} · {v.name.split('(')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Visual Stage: Spatial Canvas on Left (7 cols) + Point Inspector / Meteogram on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spatial Map Viewport (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
            <span>Click any grid point or station to probe vertical profile</span>
            <span className="text-cyan-400">{activeVar.name} ({activeVar.unit})</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative bg-slate-950 border border-slate-800 rounded overflow-hidden flex items-center justify-center p-2">
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-auto max-h-[560px] cursor-crosshair select-none"
            >
              {/* Ocean Canvas Background */}
              <rect width={mapWidth} height={mapHeight} fill="#070c18" />

              {/* Geographic Coastline of South India (Schematic high-precision polygon) */}
              <path
                d="M 68,0 
                   L 110,65 L 105,140 L 98,210 L 115,290 L 140,360 L 180,430 L 245,510 
                   L 275,530 L 305,490 L 340,430 L 385,360 L 420,310 L 460,260 L 510,210 L 580,160 L 640,110 
                   L 640,0 Z"
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth="1.5"
              />

              {/* Arabian Sea & Bay of Bengal Watermark */}
              <text x="35" y="480" fill="#1e293b" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">ARABIAN SEA</text>
              <text x="470" y="480" fill="#1e293b" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">BAY OF BENGAL</text>

              {/* Western Ghats Ridge Elevation Axis Line */}
              <path
                d="M 125,65 Q 120,200 150,340 T 250,500"
                fill="none"
                stroke="rgba(148, 163, 184, 0.25)"
                strokeDasharray="4 3"
                strokeWidth="2"
              />

              {/* Model Grid Cells */}
              {gridData.map((pt, idx) => {
                const cx = projectX(pt.lon);
                const cy = projectY(pt.lat);
                const val = getMetricValue(pt, selectedVarId);
                const color = getCellColor(val, selectedVarId);
                const isProbed = selectedPoint && selectedPoint.lat === pt.lat && selectedPoint.lon === pt.lon;

                return (
                  <g key={idx} onClick={() => setSelectedPoint(pt)} className="cursor-pointer">
                    {/* Grid Fill Square */}
                    <rect
                      x={cx - 18}
                      y={cy - 16}
                      width={36}
                      height={32}
                      fill={color}
                      stroke={isProbed ? '#38bdf8' : 'rgba(15, 23, 42, 0.4)'}
                      strokeWidth={isProbed ? 2 : 0.5}
                      rx={3}
                    />

                    {/* Wind Vector Arrow (optional) */}
                    {showWindVectors && (
                      <line
                        x1={cx}
                        y1={cy}
                        x2={cx + pt.u10Ms * 0.9}
                        y2={cy - pt.v10Ms * 0.9}
                        stroke="rgba(255, 255, 255, 0.55)"
                        strokeWidth="1.2"
                      />
                    )}
                  </g>
                );
              })}

              {/* MSLP Isobars (optional contour lines) */}
              {showIsobars && (
                <g fill="none" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" strokeDasharray="3 3">
                  <path d="M 0,180 Q 280,240 640,190" />
                  <text x="50" y="195" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="JetBrains Mono">1004 hPa</text>
                  
                  <path d="M 0,280 Q 280,340 640,290" />
                  <text x="50" y="295" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="JetBrains Mono">1008 hPa</text>

                  <path d="M 0,390 Q 280,450 640,410" />
                  <text x="50" y="405" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="JetBrains Mono">1012 hPa</text>
                </g>
              )}

              {/* Major City Landmarks */}
              {INDIAN_CITIES_LANDMARKS.map((city, idx) => {
                const cx = projectX(city.lon);
                const cy = projectY(city.lat);
                const isSelected = selectedPoint && Math.abs(selectedPoint.lat - city.lat) < 0.6 && Math.abs(selectedPoint.lon - city.lon) < 0.6;
                return (
                  <g
                    key={idx}
                    onClick={() => {
                      const match = gridData.find((p) => Math.abs(p.lat - city.lat) < 0.6 && Math.abs(p.lon - city.lon) < 0.6);
                      if (match) setSelectedPoint(match);
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 4.5 : 3}
                      fill={isSelected ? '#38bdf8' : '#ffffff'}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    <text
                      x={cx + 6}
                      y={cy + 3}
                      fill="#e2e8f0"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none"
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}

              {/* Probed Target Crosshair */}
              {selectedPoint && (
                <g>
                  <circle
                    cx={projectX(selectedPoint.lon)}
                    cy={projectY(selectedPoint.lat)}
                    r={9}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={projectX(selectedPoint.lon) - 14}
                    y1={projectY(selectedPoint.lat)}
                    x2={projectX(selectedPoint.lon) + 14}
                    y2={projectY(selectedPoint.lat)}
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                  <line
                    x1={projectX(selectedPoint.lon)}
                    y1={projectY(selectedPoint.lat) - 14}
                    x2={projectX(selectedPoint.lon)}
                    y2={projectY(selectedPoint.lat) + 14}
                    stroke="#38bdf8"
                    strokeWidth="1"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Color Legend Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Min: {activeVar.range[0]} {activeVar.unit}</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">SCALE:</span>
              <div className="h-3 w-40 rounded flex overflow-hidden">
                <div className="flex-1 bg-emerald-500/30" />
                <div className="flex-1 bg-cyan-500/50" />
                <div className="flex-1 bg-blue-600/70" />
                <div className="flex-1 bg-amber-500/80" />
                <div className="flex-1 bg-orange-500/90" />
                <div className="flex-1 bg-rose-600" />
              </div>
            </div>
            <span className="text-slate-400">Max: {activeVar.range[1]} {activeVar.unit}</span>
          </div>
        </div>

        {/* Right Column: Probed Location Telemetry & 72h Meteogram (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Probed Coordinates Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Probed Grid Cell</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {selectedPoint ? `${selectedPoint.lat.toFixed(1)}°N, ${selectedPoint.lon.toFixed(1)}°E` : '---'}
              </span>
            </div>

            {selectedPoint && (
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">TOTAL PRECIP (ACCUM)</span>
                  <span className="text-lg font-bold text-cyan-300 tabular-nums">
                    {selectedPoint.rainAccumMm} mm
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">RAIN RATE (1H)</span>
                  <span className="text-lg font-bold text-emerald-400 tabular-nums">
                    {selectedPoint.rainRateMmh} mm/h
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">2M TEMPERATURE</span>
                  <span className="text-lg font-bold text-white tabular-nums">
                    {selectedPoint.temp2mC} °C
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">10M WIND SPEED</span>
                  <span className="text-lg font-bold text-white tabular-nums">
                    {selectedPoint.windSpeedKt} kt ({selectedPoint.windDirDeg}°)
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">MSLP</span>
                  <span className="text-slate-200 tabular-nums">
                    {selectedPoint.mslpHpa} hPa
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SURFACE CAPE</span>
                  <span className="text-slate-200 tabular-nums">
                    {selectedPoint.capeJkg} J/kg
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 72-Hour Meteogram Chart (Recharts) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-mono uppercase text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                72-Hour Lead-Time Meteogram
              </span>
              <span className="text-[11px] font-mono text-cyan-400">Precipitation & Temp</span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={meteogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <Area type="monotone" dataKey="rain" stroke="#06b6d4" fillOpacity={1} fill="url(#rainGradient)" name="Rain Accum (mm)" />
                  <Area type="monotone" dataKey="temp" stroke="#f59e0b" fill="none" strokeWidth={2} name="2m Temp (°C)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-[10px] font-mono text-slate-500 flex justify-between">
              <span>Cyan: Accumulated Rain (mm)</span>
              <span>Amber: 2m Temperature (°C)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
