/**
 * @license
 * CycloCast NWP - Phase 3: Cyclo-DA Data Assimilation System
 * Interactive 3D-Var variational analysis workbench, cost function convergence,
 * analysis increment spatial viewer (xa - xb), and observational QC inspector.
 */

import React, { useState } from 'react';
import {
  GitMerge,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Database,
  Crosshair,
  TrendingDown,
  Info,
  Radio,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import {
  ASSIMILATION_SOURCES,
  COST_FUNCTION_CONVERGENCE,
  ANALYSIS_INCREMENT_GRID,
  AnalysisIncrementPoint,
} from '../data/assimilationData';

export const AssimilationWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'increments' | 'convergence' | 'qc'>('increments');
  const [selectedIncrementVar, setSelectedIncrementVar] = useState<'q' | 'temp' | 'wind' | 'psfc'>('q');
  const [probedPoint, setProbedPoint] = useState<AnalysisIncrementPoint>(ANALYSIS_INCREMENT_GRID[0]);

  // Aggregate QC metrics
  const totalObs = ASSIMILATION_SOURCES.reduce((acc, s) => acc + s.totalObs, 0);
  const totalPassed = ASSIMILATION_SOURCES.reduce((acc, s) => acc + s.passedQc, 0);
  const totalCloud = ASSIMILATION_SOURCES.reduce((acc, s) => acc + s.rejectedCloudContaminated, 0);
  const totalGross = ASSIMILATION_SOURCES.reduce((acc, s) => acc + s.rejectedGrossError, 0);

  // SVG dimensions for assimilation increment map (8°N–22°N, 70°E–86°E)
  const mapW = 600;
  const mapH = 480;
  const minLon = 70.0;
  const maxLon = 86.0;
  const minLat = 8.0;
  const maxLat = 22.0;

  const projX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * mapW;
  const projY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * mapH;

  const getIncrementColor = (pt: AnalysisIncrementPoint, varType: 'q' | 'temp' | 'wind' | 'psfc') => {
    switch (varType) {
      case 'q': {
        const v = pt.deltaQGkg;
        if (v > 1.5) return 'rgba(6, 182, 212, 0.9)'; // Strong moisture moistening
        if (v > 0.5) return 'rgba(34, 197, 94, 0.75)';
        if (v > -0.2) return 'rgba(100, 116, 139, 0.4)';
        return 'rgba(234, 179, 8, 0.8)'; // Drying
      }
      case 'temp': {
        const v = pt.deltaTC;
        if (v > 0.4) return 'rgba(239, 68, 68, 0.85)'; // Warming
        if (v > -0.2) return 'rgba(100, 116, 139, 0.4)';
        return 'rgba(59, 130, 246, 0.85)'; // Cooling
      }
      case 'wind': {
        const v = pt.deltaWindMs;
        if (v > 2.0) return 'rgba(168, 85, 247, 0.9)'; // Acceleration
        if (v > 0.5) return 'rgba(6, 182, 212, 0.75)';
        return 'rgba(100, 116, 139, 0.4)';
      }
      case 'psfc': {
        const v = pt.deltaPsfcHpa;
        if (v < -1.0) return 'rgba(168, 85, 247, 0.9)'; // Deepening low
        if (v < 0.0) return 'rgba(6, 182, 212, 0.7)';
        return 'rgba(234, 179, 8, 0.7)';
      }
    }
  };

  const getMetricString = (pt: AnalysisIncrementPoint, varType: 'q' | 'temp' | 'wind' | 'psfc') => {
    switch (varType) {
      case 'q': return `${pt.deltaQGkg > 0 ? `+${pt.deltaQGkg}` : pt.deltaQGkg} g/kg`;
      case 'temp': return `${pt.deltaTC > 0 ? `+${pt.deltaTC}` : pt.deltaTC} °C`;
      case 'wind': return `${pt.deltaWindMs > 0 ? `+${pt.deltaWindMs}` : pt.deltaWindMs} m/s`;
      case 'psfc': return `${pt.deltaPsfcHpa > 0 ? `+${pt.deltaPsfcHpa}` : pt.deltaPsfcHpa} hPa`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>CYCLOCAST PHASE 3 ARCHITECTURE</span>
              <span aria-hidden="true">·</span>
              <span>CYCLO-DA VARIATIONAL DATA ASSIMILATION</span>
              <span aria-hidden="true">·</span>
              <span>3D-VAR ANALYSIS STATE (xa)</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-cyan-400" />
              Cyclo-DA Data Assimilation System
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Blends first-guess numerical boundary states ($x_b$) with INSAT-3D/3DR geostationary satellite radiances,
              Atmospheric Motion Vectors (AMVs), and IMD ground mesonet observations to construct dynamically balanced initial conditions.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('increments')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'increments' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Analysis Increments (xa - xb)
            </button>
            <button
              onClick={() => setActiveTab('convergence')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'convergence' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cost Function & B-Matrix
            </button>
            <button
              onClick={() => setActiveTab('qc')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'qc' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Observational QC & Innovations
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry Strip: Assimilation Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Total Input Observations</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {totalObs.toLocaleString()}
          </div>
          <span className="text-[11px] font-mono text-slate-500">INSAT-3D + IMD AWS + RS/RW</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Passed Quality Control</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            {totalPassed.toLocaleString()} ({(totalPassed / totalObs * 100).toFixed(1)}%)
          </div>
          <span className="text-[11px] font-mono text-slate-500">Assimilated into 3D-Var</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Cloud / Thinning Filter</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {(totalCloud + 1095).toLocaleString()}
          </div>
          <span className="text-[11px] font-mono text-slate-500">Cloud cleared & 60km thinned</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Cost Function Reduction</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300 mt-1">
            -83.4%
          </div>
          <span className="text-[11px] font-mono text-slate-500">Gradient norm: 1.000 → 0.001</span>
        </div>
      </div>

      {/* Tab 1: Analysis Increments (xa - xb) Spatial Viewer */}
      {activeTab === 'increments' && (
        <div className="space-y-6">
          {/* Sub-bar variable selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Increment Parameter:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedIncrementVar('q')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                    selectedIncrementVar === 'q' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  Δq Specific Humidity (g/kg)
                </button>
                <button
                  onClick={() => setSelectedIncrementVar('wind')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                    selectedIncrementVar === 'wind' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  ΔV Wind Vectors (m/s)
                </button>
                <button
                  onClick={() => setSelectedIncrementVar('psfc')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                    selectedIncrementVar === 'psfc' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  ΔPsfc Pressure (hPa)
                </button>
                <button
                  onClick={() => setSelectedIncrementVar('temp')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                    selectedIncrementVar === 'temp' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  ΔT Temperature (°C)
                </button>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Increment = Analysis (xa) minus First-Guess (xb)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SVG Increment Map (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
                  <span className="text-slate-300">Analysis Increments Map</span>
                  <span className="text-cyan-400">Click node to inspect observational provenance</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center justify-center">
                  <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full h-auto max-h-[460px]">
                    <rect width={mapW} height={mapH} fill="#070c18" />

                    {/* Schematic Peninsular Coastline */}
                    <path
                      d="M 68,0 L 110,65 L 105,140 L 98,210 L 115,290 L 140,360 L 180,430 L 245,510 
                         L 275,530 L 305,490 L 340,430 L 385,360 L 420,310 L 460,260 L 510,210 L 580,160 L 640,110 
                         L 640,0 Z"
                      fill="#0f172a"
                      stroke="#1e293b"
                      strokeWidth="1.5"
                    />

                    <text x="35" y="440" fill="#1e293b" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">ARABIAN SEA</text>
                    <text x="440" y="440" fill="#1e293b" fontSize="12" fontFamily="JetBrains Mono" fontWeight="bold">BAY OF BENGAL</text>

                    {/* Plot Analysis Increment Nodes */}
                    {ANALYSIS_INCREMENT_GRID.map((pt, idx) => {
                      const cx = projX(pt.lon);
                      const cy = projY(pt.lat);
                      const isProbed = probedPoint.lat === pt.lat && probedPoint.lon === pt.lon;
                      const color = getIncrementColor(pt, selectedIncrementVar);

                      return (
                        <g key={idx} onClick={() => setProbedPoint(pt)} className="cursor-pointer">
                          {/* Radial footprint of increment */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isProbed ? 28 : 20}
                            fill={color}
                            stroke={isProbed ? '#38bdf8' : 'rgba(255,255,255,0.2)'}
                            strokeWidth={isProbed ? 2 : 1}
                            opacity={0.75}
                          />

                          {/* Center Node dot */}
                          <circle cx={cx} cy={cy} r={3.5} fill="#ffffff" />

                          {/* Metric tag */}
                          <text
                            x={cx + 7}
                            y={cy + 3}
                            fill="#ffffff"
                            fontSize="9"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                          >
                            {getMetricString(pt, selectedIncrementVar)}
                          </text>

                          {/* Station label */}
                          <text
                            x={cx + 7}
                            y={cy + 14}
                            fill="#94a3b8"
                            fontSize="8"
                            fontFamily="JetBrains Mono"
                          >
                            {pt.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
                <span>Cyan: Moisture Added</span>
                <span>Purple: Dynamic Cyclonic Convergence</span>
                <span>Amber: Leeward Drying</span>
              </div>
            </div>

            {/* Right: Probed Increment & Provenance Detail (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Analysis Increment Inspector</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    {probedPoint.name}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">
                    {probedPoint.lat.toFixed(1)}°N, {probedPoint.lon.toFixed(1)}°E · Focus: {probedPoint.primarySource}
                  </div>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 text-[10px] block">SPECIFIC HUMIDITY INCREMENT (Δq)</span>
                      <span className="text-base font-bold text-cyan-300">
                        {probedPoint.deltaQGkg > 0 ? `+${probedPoint.deltaQGkg}` : probedPoint.deltaQGkg} g/kg
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 text-right">
                      {probedPoint.deltaQGkg > 0 ? 'Moisture added to Arabian Sea LLJ' : 'Slight drying correction'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 text-[10px] block">WIND VECTOR INCREMENT (ΔV)</span>
                      <span className="text-base font-bold text-emerald-400">
                        {probedPoint.deltaWindMs > 0 ? `+${probedPoint.deltaWindMs}` : probedPoint.deltaWindMs} m/s ({probedPoint.deltaWindDirDeg}°)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 text-right">
                      Satellite AMV constraint
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 text-[10px] block">SURFACE PRESSURE INCREMENT (ΔPsfc)</span>
                      <span className="text-base font-bold text-purple-300">
                        {probedPoint.deltaPsfcHpa > 0 ? `+${probedPoint.deltaPsfcHpa}` : probedPoint.deltaPsfcHpa} hPa
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 text-right">
                      IMD AWS pressure barometer
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 text-[10px] block">TEMPERATURE INCREMENT (ΔT)</span>
                      <span className="text-base font-bold text-white">
                        {probedPoint.deltaTC > 0 ? `+${probedPoint.deltaTC}` : probedPoint.deltaTC} °C
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 text-right">
                      Sounder & Radiosonde
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded text-xs text-slate-400 leading-relaxed font-sans">
                <strong className="text-slate-200">Scientific Impact:</strong> Incorporating satellite AMVs and INSAT-3D sounder
                data remedies the traditional oceanic moisture deficiency in GFS initial conditions, providing the
                Western Ghats regional model with the exact moisture flux required for precipitation accuracy.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cost Function & B-Matrix */}
      {activeTab === 'convergence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Convergence Chart (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
              <span className="text-slate-200 uppercase font-semibold">
                3D-Var Cost Function Minimization J(x)
              </span>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400">● Total J(x)</span>
                <span className="text-emerald-400">● Obs Penalty (Jo)</span>
                <span className="text-amber-400">● Background (Jb)</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COST_FUNCTION_CONVERGENCE} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="iter" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" label={{ value: 'Conjugate Gradient Iterations', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                  <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <Line type="monotone" dataKey="costJ" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} name="Total J(x)" />
                  <Line type="monotone" dataKey="costJo" stroke="#10b981" strokeWidth={1.8} dot={false} name="Observation Penalty Jo" />
                  <Line type="monotone" dataKey="costJb" stroke="#f59e0b" strokeWidth={1.8} dot={false} name="Background Penalty Jb" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-500 flex justify-between">
              <span>Preconditioned Conjugate Gradient (PCG) Algorithm</span>
              <span className="text-cyan-400">Converged at Iteration 45 (tol = 0.001)</span>
            </div>
          </div>

          {/* B-Matrix Specifications (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-800 mb-3">
                <span className="text-[11px] font-mono text-cyan-400 uppercase">Static B-Matrix Formulation</span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  Background Error Covariance (NMC Method)
                </h2>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded border border-slate-800 mb-3 font-sans">
                The CycloCast B-matrix governs how observational information spreads horizontally and vertically
                across model grid cells. Calculated from 30 days of paired 24h vs. 12h forecast differences over the Indian Monsoon trough.
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-500">Horizontal Correlation Length (s_x):</span>
                  <span className="text-white font-bold">120 km</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-500">Vertical Correlation Levels:</span>
                  <span className="text-white font-bold">45 eta levels</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-500">Control Variables (cv_options):</span>
                  <span className="text-cyan-300 font-bold">cv5 (psi, chi_u, t_u, rh, ps_u)</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800 flex justify-between">
                  <span className="text-slate-500">Recursive Filter Passes:</span>
                  <span className="text-white font-bold">8 passes</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500">
              Formulated via gen_be module in WRFDA v4.5.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Observational Quality Control & Innovation Statistics */}
      {activeTab === 'qc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Observational Quality Control & Innovation Statistics (O-B vs O-A)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates how observational departures (Observation minus Background) are minimized in the final Analysis state (Observation minus Analysis)
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">4 Observing Systems</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Observing System & Platform</th>
                  <th className="py-2.5 px-3">Total Obs</th>
                  <th className="py-2.5 px-3">Passed QC</th>
                  <th className="py-2.5 px-3">Cloud Filter</th>
                  <th className="py-2.5 px-3">Gross Rej</th>
                  <th className="py-2.5 px-3">Mean (O-B)</th>
                  <th className="py-2.5 px-3">Mean (O-A)</th>
                  <th className="py-2.5 px-3">Std (O-B)</th>
                  <th className="py-2.5 px-3">Std (O-A)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {ASSIMILATION_SOURCES.map((src) => (
                  <tr key={src.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {src.name}
                      <span className="block text-[10px] text-slate-500 font-normal">{src.platform}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">{src.totalObs.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">{src.passedQc.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-amber-400 tabular-nums">{src.rejectedCloudContaminated}</td>
                    <td className="py-2.5 px-3 text-rose-400 tabular-nums">{src.rejectedGrossError}</td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">{src.meanInnovationOB > 0 ? `+${src.meanInnovationOB}` : src.meanInnovationOB}</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold tabular-nums">{src.meanResidualOA > 0 ? `+${src.meanResidualOA}` : src.meanResidualOA}</td>
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums">{src.stdInnovationOB}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">{src.stdResidualOA}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded text-xs text-slate-400 leading-relaxed font-sans">
            <strong className="text-slate-200">Verification Finding:</strong> Across all platforms, the standard deviation of
            Observation minus Analysis $\sigma(O-A)$ is reduced by more than $50\%$ compared to $\sigma(O-B)$, proving that
            the Cyclo-DA 3D-Var variational step has successfully drawn the atmospheric model state closer to genuine satellite and in-situ observations.
          </div>
        </div>
      )}
    </div>
  );
};
