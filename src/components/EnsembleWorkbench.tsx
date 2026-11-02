/**
 * @license
 * CycloCast NWP - Phase 5: Ensemble Prediction System (CycloCast-EPS) & MPAS Voronoi Core
 * Interactive 10-member ensemble probabilistic exceedance, plume spaghetti plots,
 * spread-skill verification, and MPAS unstructured mesh evaluation
 */

import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sliders,
  Wind,
  Globe2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  ComposedChart,
} from 'recharts';
import {
  ENSEMBLE_MEMBERS,
  PROBABILISTIC_GRID,
  MAHABALESHWAR_PLUME_DATA,
  SPREAD_SKILL_DATA,
  ProbabilisticGridPoint,
} from '../data/ensembleData';

export const EnsembleWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'probabilistic' | 'mpas' | 'spread_skill'>('probabilistic');
  const [selectedThreshold, setSelectedThreshold] = useState<'25mm' | '64mm' | '115mm' | 'gale'>('64mm');
  const [probedPoint, setProbedPoint] = useState<ProbabilisticGridPoint>(PROBABILISTIC_GRID[0]);

  // SVG coordinate transformation (8°N–22°N, 70°E–86°E)
  const mapW = 600;
  const mapH = 480;
  const minLon = 70.0;
  const maxLon = 86.0;
  const minLat = 8.0;
  const maxLat = 22.0;

  const projX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * mapW;
  const projY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * mapH;

  const getProbValue = (pt: ProbabilisticGridPoint, threshold: '25mm' | '64mm' | '115mm' | 'gale') => {
    switch (threshold) {
      case '25mm': return pt.probRain25mm;
      case '64mm': return pt.probRain64mm;
      case '115mm': return pt.probRain115mm;
      case 'gale': return pt.probGaleWind;
    }
  };

  const getProbColor = (prob: number) => {
    if (prob < 20) return 'rgba(34, 197, 94, 0.4)';  // Green low risk
    if (prob < 50) return 'rgba(234, 179, 8, 0.7)';  // Yellow moderate risk
    if (prob < 80) return 'rgba(249, 115, 22, 0.85)'; // Orange high risk
    return 'rgba(239, 68, 68, 0.95)';                 // Red extreme risk
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>CYCLOCAST PHASE 5 ARCHITECTURE</span>
              <span aria-hidden="true">·</span>
              <span>CYCLOCAST-EPS 10-MEMBER ENSEMBLE</span>
              <span aria-hidden="true">·</span>
              <span>MPAS VORONOI DYNAMICAL CORE</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-cyan-400" />
              Ensemble Prediction System & Next-Gen Dynamical Core
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Quantify atmospheric chaos and forecast uncertainty via a 10-member regional ensemble (CycloCast-EPS)
              and explore next-generation variable-resolution unstructured Voronoi meshes (MPAS-Atmosphere).
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('probabilistic')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'probabilistic' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Probabilistic Risk & Plumes
            </button>
            <button
              onClick={() => setActiveTab('mpas')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'mpas' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              MPAS Voronoi Mesh
            </button>
            <button
              onClick={() => setActiveTab('spread_skill')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'spread_skill' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Spread-Skill & Members
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Ensemble Membership</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            10 Members
          </div>
          <span className="text-[11px] font-mono text-slate-500">IC + Multi-Physics + SKEBS</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Spread-Skill Calibration</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            0.98 / 1.00
          </div>
          <span className="text-[11px] font-mono text-slate-500">Perfect Spread-Skill Balance</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">High Risk Crest Probability</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1">
            98% ≥ 64.5mm
          </div>
          <span className="text-[11px] font-mono text-slate-500">IMD Heavy Warning High Confidence</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">MPAS Resolution Transition</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300 mt-1">
            60km → 3km
          </div>
          <span className="text-[11px] font-mono text-slate-500">Seamless Voronoi Hexagonal Mesh</span>
        </div>
      </div>

      {/* Tab 1: Probabilistic Risk & Plume Spaghetti Plots */}
      {activeTab === 'probabilistic' && (
        <div className="space-y-6">
          {/* Threshold Selector Ribbon */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Warning Threshold:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedThreshold('25mm')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                    selectedThreshold === '25mm' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  P(Rain ≥ 25mm)
                </button>
                <button
                  onClick={() => setSelectedThreshold('64mm')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                    selectedThreshold === '64mm' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  P(Rain ≥ 64.5mm - IMD Warning)
                </button>
                <button
                  onClick={() => setSelectedThreshold('115mm')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                    selectedThreshold === '115mm' ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  P(Rain ≥ 115.5mm - Very Heavy)
                </button>
                <button
                  onClick={() => setSelectedThreshold('gale')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                    selectedThreshold === 'gale' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  P(Wind ≥ 35kt - Maritime Gale)
                </button>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Evaluated across all 10 ensemble members
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Probabilistic Spatial Map (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
                  <span className="text-slate-300">Spatial Exceedance Probability Map</span>
                  <span className="text-cyan-400">Click node for station plume trajectory</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded p-2 flex items-center justify-center">
                  <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full h-auto max-h-[460px]">
                    <rect width={mapW} height={mapH} fill="#070c18" />

                    {/* Peninsular Coastline */}
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

                    {/* Probability Nodes */}
                    {PROBABILISTIC_GRID.map((pt, idx) => {
                      const cx = projX(pt.lon);
                      const cy = projY(pt.lat);
                      const prob = getProbValue(pt, selectedThreshold);
                      const isProbed = probedPoint.lat === pt.lat && probedPoint.lon === pt.lon;
                      const color = getProbColor(prob);

                      return (
                        <g key={idx} onClick={() => setProbedPoint(pt)} className="cursor-pointer">
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isProbed ? 26 : 18}
                            fill={color}
                            stroke={isProbed ? '#38bdf8' : 'rgba(255,255,255,0.2)'}
                            strokeWidth={isProbed ? 2.5 : 1}
                          />

                          <circle cx={cx} cy={cy} r={3} fill="#ffffff" />

                          <text
                            x={cx + 6}
                            y={cy + 3}
                            fill="#ffffff"
                            fontSize="9"
                            fontFamily="JetBrains Mono"
                            fontWeight="bold"
                          >
                            {prob}%
                          </text>

                          <text
                            x={cx + 6}
                            y={cy + 13}
                            fill="#94a3b8"
                            fontSize="8"
                            fontFamily="JetBrains Mono"
                          >
                            {pt.name.split('(')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Probability Risk Scale Legend */}
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
                <span className="text-slate-400">Risk Level:</span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400">● Low (&lt;20%)</span>
                  <span className="text-amber-400">● Moderate (20-50%)</span>
                  <span className="text-orange-400">● High (50-80%)</span>
                  <span className="text-rose-400">● Severe (&gt;80%)</span>
                </div>
              </div>
            </div>

            {/* Right: Ensemble Plume (Spaghetti Plot) Chart (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-400 uppercase">Ensemble Plume (Spaghetti Chart)</span>
                    <span className="text-xs font-mono text-slate-400">{probedPoint.name}</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">
                    72-Hour Rainfall Spread Across 10 Members
                  </h2>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={MAHABALESHWAR_PLUME_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="leadTime" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                      <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      />
                      {/* Confidence Envelope (10th to 90th percentile) */}
                      <Area type="monotone" dataKey="p90" stroke="none" fill="rgba(6, 182, 212, 0.15)" />
                      <Area type="monotone" dataKey="p10" stroke="none" fill="rgba(6, 182, 212, 0.15)" />

                      {/* Individual Members Spaghetti Lines */}
                      <Line type="monotone" dataKey="m01" stroke="#64748b" strokeWidth={1} dot={false} name="M01 (IC+)" />
                      <Line type="monotone" dataKey="m02" stroke="#64748b" strokeWidth={1} dot={false} name="M02 (IC-)" />
                      <Line type="monotone" dataKey="m04" stroke="#a855f7" strokeWidth={1} dot={false} name="M04 (Thompson)" />
                      <Line type="monotone" dataKey="m05" stroke="#ec4899" strokeWidth={1.2} dot={false} name="M05 (Morrison)" />
                      <Line type="monotone" dataKey="m06" stroke="#f59e0b" strokeWidth={1} dot={false} name="M06 (SKEBS)" />
                      <Line type="monotone" dataKey="m08" stroke="#3b82f6" strokeWidth={1} dot={false} name="M08 (ECMWF)" />

                      {/* Ensemble Mean */}
                      <Line type="monotone" dataKey="ensMean" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 2 }} name="Ensemble Mean (mm)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ensemble Mean 24h Rain:</span>
                  <span className="text-cyan-300 font-bold tabular-nums">{probedPoint.ensMeanRainMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ensemble Standard Deviation (Spread):</span>
                  <span className="text-amber-400 font-bold tabular-nums">±{probedPoint.ensSpreadRainMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IMD Heavy Warning Confidence:</span>
                  <span className="text-emerald-400 font-bold">{probedPoint.probRain64mm}% (High)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MPAS-Atmosphere Unstructured Voronoi Mesh Evaluation */}
      {activeTab === 'mpas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Voronoi Mesh Conceptual Visualizer (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-mono text-cyan-400 uppercase">Variable-Resolution Voronoi Mesh</span>
                <span className="text-xs font-mono text-slate-400">Spherical Conformal C-Grid</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded p-4 flex flex-col items-center justify-center">
                <svg viewBox="0 0 400 300" className="w-full h-auto max-h-[300px]">
                  <rect width="400" height="300" fill="#070c18" />

                  {/* Outer coarse mesh (60km cells) */}
                  <g stroke="#334155" strokeWidth="1" fill="none" opacity="0.6">
                    <polygon points="40,40 80,20 120,40 120,80 80,100 40,80" />
                    <polygon points="120,40 160,20 200,40 200,80 160,100 120,80" />
                    <polygon points="200,40 240,20 280,40 280,80 240,100 200,80" />
                    <polygon points="280,40 320,20 360,40 360,80 320,100 280,80" />
                  </g>

                  {/* Middle transition mesh (15km cells) */}
                  <g stroke="#0ea5e9" strokeWidth="1.2" fill="none" opacity="0.75">
                    <polygon points="100,120 120,110 140,120 140,140 120,150 100,140" />
                    <polygon points="140,120 160,110 180,120 180,140 160,150 140,140" />
                    <polygon points="180,120 200,110 220,120 220,140 200,150 180,140" />
                    <polygon points="220,120 240,110 260,120 260,140 240,150 220,140" />
                    <polygon points="260,120 280,110 300,120 300,140 280,150 260,140" />
                  </g>

                  {/* Inner refined core mesh (3km convection-permitting cells over Western Ghats) */}
                  <g stroke="#38bdf8" strokeWidth="1.5" fill="rgba(6, 182, 212, 0.2)">
                    <polygon points="160,180 170,175 180,180 180,190 170,195 160,190" />
                    <polygon points="180,180 190,175 200,180 200,190 190,195 180,190" />
                    <polygon points="200,180 210,175 220,180 220,190 210,195 200,190" />
                    <polygon points="170,195 180,190 190,195 190,205 180,210 170,205" />
                    <polygon points="190,195 200,190 210,195 210,205 200,210 190,205" />
                  </g>

                  {/* Annotations */}
                  <text x="20" y="30" fill="#64748b" fontSize="10" fontFamily="JetBrains Mono">60 km Outer Ocean</text>
                  <text x="20" y="130" fill="#0ea5e9" fontSize="10" fontFamily="JetBrains Mono">15 km Peninsula Transition</text>
                  <text x="20" y="200" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">3 km Convection-Permitting</text>
                </svg>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded text-xs text-slate-400 font-sans leading-relaxed">
              <strong className="text-white">Why MPAS Replaces Rectangular Nesting:</strong> Traditional WRF rectangular
              nesting introduces artificial boundary wave reflections and sudden resolution jumps (1:3 ratio).
              MPAS utilizes spherical centroidal Voronoi tessellations (SCVT) allowing a continuous, smooth spatial
              transition from 60 km across the Indian Ocean to 3 km over the Western Ghats.
            </div>
          </div>

          {/* Architectural Comparison Table (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              WRF-ARW vs. MPAS-Atmosphere Architecture
            </h2>

            <div className="divide-y divide-slate-800/80 text-xs font-mono">
              <div className="py-3">
                <span className="text-slate-500 text-[10px] block">GRID TOPOLOGY</span>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-300">WRF: Rectangular Arakawa C-grid</span>
                  <span className="text-cyan-300 font-bold">MPAS: Unstructured Voronoi Hexagons</span>
                </div>
              </div>

              <div className="py-3">
                <span className="text-slate-500 text-[10px] block">LATERAL BOUNDARY CONDITIONS</span>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-300">WRF: Required every 3h (External LBC)</span>
                  <span className="text-cyan-300 font-bold">MPAS: Global Mesh (Zero Boundary Errors)</span>
                </div>
              </div>

              <div className="py-3">
                <span className="text-slate-500 text-[10px] block">WAVE DISPERSION & CORNERS</span>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-300">WRF: Anisotropic corner reflection</span>
                  <span className="text-cyan-300 font-bold">MPAS: Isotropic spherical propagation</span>
                </div>
              </div>

              <div className="py-3">
                <span className="text-slate-500 text-[10px] block">PARALLEL SCALABILITY</span>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-300">WRF: MPI 2D patch decomposition</span>
                  <span className="text-cyan-300 font-bold">MPAS: Metis graph partitioning (10k+ cores)</span>
                </div>
              </div>

              <div className="py-3">
                <span className="text-slate-500 text-[10px] block">CYCLOCAST TARGET STATUS</span>
                <div className="flex justify-between mt-1">
                  <span className="text-emerald-400">WRF: Operational Baseline</span>
                  <span className="text-amber-400 font-bold">MPAS: Phase 5 Evaluation Benchmark</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Spread-Skill & 10-Member Ensemble Matrix */}
      {activeTab === 'spread_skill' && (
        <div className="space-y-6">
          {/* Spread-Skill Verification Curve */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
              <span className="text-slate-200 uppercase font-semibold">
                Ensemble Spread vs. Skill Validation (Ideal Ratio = 1.00)
              </span>
              <div className="flex items-center gap-3">
                <span className="text-rose-400">● Ensemble Mean RMSE (Skill)</span>
                <span className="text-cyan-400">● Ensemble Spread (σ)</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPREAD_SKILL_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="leadHours" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" tickFormatter={(v) => `+${v}h`} />
                  <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <Line type="monotone" dataKey="ensMeanRMSE" stroke="#f43f5e" strokeWidth={2.2} name="Ensemble Mean RMSE" />
                  <Line type="monotone" dataKey="ensSpread" stroke="#06b6d4" strokeWidth={2.2} strokeDasharray="4 2" name="Ensemble Spread σ" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-500 flex justify-between">
              <span>Spread-Skill Ratio = 0.98 (Calibrated, neither overconfident nor underdispersive)</span>
              <span className="text-cyan-400">WMO Standard Ensemble Metric</span>
            </div>
          </div>

          {/* 10-Member Perturbation Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              CycloCast-EPS 10-Member Perturbation Formulation
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Member ID</th>
                    <th className="py-2.5 px-3">Perturbation Type</th>
                    <th className="py-2.5 px-3">Methodology / Formulation</th>
                    <th className="py-2.5 px-3">Microphysics</th>
                    <th className="py-2.5 px-3">PBL Scheme</th>
                    <th className="py-2.5 px-3">Boundary Forcing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {ENSEMBLE_MEMBERS.map((m) => (
                    <tr key={m.memberId} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-200">{m.name}</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-semibold">{m.type.replace('_', ' ').toUpperCase()}</td>
                      <td className="py-2.5 px-3 text-slate-300">{m.perturbationMethod}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.microphysics}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.pblScheme}</td>
                      <td className="py-2.5 px-3 text-slate-500">{m.boundarySource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
