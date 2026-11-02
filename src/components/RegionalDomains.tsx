/**
 * @license
 * CycloCast NWP - Regional Domains Catalog & Nesting Hierarchy
 * Nested meteorological grid configurations for India, South Peninsula, Western Ghats,
 * Maharashtra & Konkan, Tamil Nadu, Kerala, Karnataka, Andhra Pradesh & Telangana, and Bay of Bengal.
 */

import React, { useState } from 'react';
import { Layers, MapPin, Cpu, HardDrive, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { REGIONAL_DOMAINS } from '../data/domains';
import { RegionalDomain } from '../types/nwp';

export const RegionalDomains: React.FC = () => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('d03_western_ghats');

  const selectedDomain = REGIONAL_DOMAINS.find((d) => d.id === selectedDomainId) || REGIONAL_DOMAINS[2];

  // Total computational estimate if all domains were executed simultaneously
  const totalSimultaneousMemoryGB = REGIONAL_DOMAINS.reduce((acc, d) => acc + d.estimatedMemoryGB, 0);
  const totalSimultaneousCoreHours = REGIONAL_DOMAINS.reduce((acc, d) => acc + d.estimatedCoreHoursPer24h, 0);

  // SVG bounding box coordinates mapped to subcontinental box (4°N–38°N, 64°E–98°E)
  const mapSvgWidth = 500;
  const mapSvgHeight = 460;
  const bMinLon = 64.0;
  const bMaxLon = 98.0;
  const bMinLat = 4.0;
  const bMaxLat = 38.0;

  const mapX = (lon: number) => ((lon - bMinLon) / (bMaxLon - bMinLon)) * mapSvgWidth;
  const mapY = (lat: number) => ((bMaxLat - lat) / (bMaxLat - bMinLat)) * mapSvgHeight;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Regional Forecasting Domains & Nesting Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Multi-scale nested domain hierarchy supporting 27 km synoptic boundary forcing down to 3 km
          convection-permitting regional runs across Indian meteorological zones.
        </p>
      </div>

      {/* Resource Reality Alert (Section 3 rule: Do not assume all domains run simultaneously) */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-amber-300">Compute Allocation Constraint:</span> Running all 9 regional domains
          simultaneously would require <span className="font-mono text-cyan-300">{totalSimultaneousCoreHours.toLocaleString()} CPU core-hours</span> and{' '}
          <span className="font-mono text-cyan-300">{totalSimultaneousMemoryGB} GB RAM</span> per 24 hours of forecast time.
          In operational practice, CycloCast dispatches high-resolution 3 km nests dynamically based on synoptic alerts
          (e.g. Western Ghats orographic surge, Bay of Bengal depression, or pre-monsoon squall lines).
        </div>
      </div>

      {/* Main Grid: Interactive Map Bounding Box (6 cols) & Domains List/Inspector (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SVG Subcontinental Bounding Box Visualizer (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono text-slate-300">
              <span>Domain Nesting Footprint</span>
              <span className="text-cyan-400">Lambert Conformal Projection</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center justify-center">
              <svg viewBox={`0 0 ${mapSvgWidth} ${mapSvgHeight}`} className="w-full h-auto max-h-[460px]">
                {/* Background ocean */}
                <rect width={mapSvgWidth} height={mapSvgHeight} fill="#090d16" />

                {/* Subcontinent Outline Schematic */}
                <path
                  d="M 120,40 L 190,40 L 250,70 L 320,110 L 440,140 L 460,180 L 410,210 L 330,220 
                     L 300,280 L 260,370 L 230,420 L 210,430 L 170,360 L 140,290 L 120,240 L 80,180 L 80,100 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />

                {/* Grid Lat/Lon Guide lines */}
                {[10, 20, 30].map((lat) => (
                  <line
                    key={lat}
                    x1="0"
                    y1={mapY(lat)}
                    x2={mapSvgWidth}
                    y2={mapY(lat)}
                    stroke="rgba(51, 65, 85, 0.4)"
                    strokeDasharray="2 3"
                  />
                ))}
                {[70, 80, 90].map((lon) => (
                  <line
                    key={lon}
                    x1={mapX(lon)}
                    y1="0"
                    x2={mapX(lon)}
                    y2={mapSvgHeight}
                    stroke="rgba(51, 65, 85, 0.4)"
                    strokeDasharray="2 3"
                  />
                ))}

                {/* Render All Domains Bounding Boxes */}
                {REGIONAL_DOMAINS.map((dom) => {
                  const x1 = mapX(dom.bounds.minLon);
                  const y1 = mapY(dom.bounds.maxLat);
                  const w = mapX(dom.bounds.maxLon) - x1;
                  const h = mapY(dom.bounds.minLat) - y1;
                  const isSelected = dom.id === selectedDomainId;

                  return (
                    <g
                      key={dom.id}
                      onClick={() => setSelectedDomainId(dom.id)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={x1}
                        y={y1}
                        width={w}
                        height={h}
                        fill={isSelected ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.15)'}
                        stroke={isSelected ? '#38bdf8' : (dom.nestLevel === 1 ? '#64748b' : '#334155')}
                        strokeWidth={isSelected ? 2 : 1}
                        strokeDasharray={dom.nestLevel === 3 ? '4 2' : 'none'}
                        rx={2}
                      />
                      {isSelected && (
                        <text
                          x={x1 + 4}
                          y={y1 + 12}
                          fill="#38bdf8"
                          fontSize="9"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {dom.id.toUpperCase()} ({dom.resolutionKm}km)
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Mother Domain (d01): 27 km</span>
            <span>Nested Focus (d03): 3 km</span>
          </div>
        </div>

        {/* Right: Domains Table & Parameter Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Selected Domain Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <span className="text-[11px] font-mono text-cyan-400">
                  NEST LEVEL {selectedDomain.nestLevel} · {selectedDomain.resolutionKm} KM RESOLUTION
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {selectedDomain.name}
                </h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                {selectedDomain.projection.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              <strong className="text-slate-200">Scientific Objective:</strong> {selectedDomain.targetFocus}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">GRID POINTS</span>
                <span className="text-white font-bold">{selectedDomain.gridPointsX} × {selectedDomain.gridPointsY}</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">CENTER LAT/LON</span>
                <span className="text-white font-bold">{selectedDomain.centerLat}°N, {selectedDomain.centerLon}°E</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">EST. MEMORY</span>
                <span className="text-cyan-300 font-bold">{selectedDomain.estimatedMemoryGB} GB RAM</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 text-[10px] block">CORE-HOURS (24H)</span>
                <span className="text-amber-400 font-bold">{selectedDomain.estimatedCoreHoursPer24h} h</span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded text-xs font-mono text-slate-400 space-y-1">
              <div>
                <span className="text-slate-500">Geographic Bounding Box:</span> {selectedDomain.bounds.minLat}°N to {selectedDomain.bounds.maxLat}°N, {selectedDomain.bounds.minLon}°E to {selectedDomain.bounds.maxLon}°E
              </div>
              <div>
                <span className="text-slate-500">Projection Constants:</span> truelat1 = {selectedDomain.trueLat1}°, truelat2 = {selectedDomain.trueLat2}°, stand_lon = {selectedDomain.standLon}°
              </div>
            </div>
          </div>

          {/* Quick Selector Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              All 9 Configured Regional Domains
            </h3>
            <div className="divide-y divide-slate-800/80 text-xs font-mono">
              {REGIONAL_DOMAINS.map((d) => {
                const isSelected = d.id === selectedDomainId;
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDomainId(d.id)}
                    className={`py-2 px-2 flex items-center justify-between cursor-pointer rounded transition-colors ${
                      isSelected ? 'bg-cyan-500/15 text-cyan-300 font-semibold' : 'text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">d0{d.nestLevel}</span>
                      <span>{d.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span>{d.resolutionKm} km</span>
                      <span className="w-16 text-right tabular-nums">{d.estimatedCoreHoursPer24h} c-h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
