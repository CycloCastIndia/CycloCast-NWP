/**
 * @license
 * CycloCast NWP - Phase 2: Physics Sensitivity & Parameterization Tuning Workbench
 * Comparative evaluation of microphysics, boundary layer (PBL), and orographic schemes
 * for the Indian Summer Monsoon and Western Ghats escarpment
 */

import React, { useState } from 'react';
import { Sliders, Award, Layers, BarChart3, AlertCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { SENSITIVITY_EXPERIMENTS, SENSITIVITY_STATION_COMPARISONS } from '../data/sensitivityData';

export const SensitivityWorkbench: React.FC = () => {
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>('exp_wsm6_ysu');
  const [viewMode, setViewMode] = useState<'individual' | 'difference' | 'stations'>('individual');

  const activeSuite = SENSITIVITY_EXPERIMENTS.find((e) => e.id === selectedSuiteId) || SENSITIVITY_EXPERIMENTS[0];
  const baselineSuite = SENSITIVITY_EXPERIMENTS[0];

  // Bar chart data comparing verification metrics across the 3 suites
  const comparisonBarData = SENSITIVITY_EXPERIMENTS.map((exp) => ({
    name: exp.shortLabel,
    podHeavy: Number((exp.podHeavyRain * 100).toFixed(1)),
    csiHeavy: Number((exp.csiHeavyRain * 100).toFixed(1)),
    farHeavy: Number((exp.farHeavyRain * 100).toFixed(1)),
    tempRMSE: Number((exp.tempRMSE * 10).toFixed(1)), // Scaled for comparison
    costFactor: Number((exp.computationalCostFactor * 10).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>PHASE 2 SCIENTIFIC WORKBENCH</span>
              <span aria-hidden="true">·</span>
              <span>OROGRAPHIC SENSITIVITY BENCHMARK</span>
              <span aria-hidden="true">·</span>
              <span>WESTERN GHATS CASE STUDY</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Regional Parameterization & Physics Tuning
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Evaluate microphysics (WSM6 vs. Thompson vs. Morrison 2-Moment) and Planetary Boundary Layer schemes
              (YSU vs. MYNN2.5 vs. Shin-Hong) against steep terrain observations.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded self-start sm:self-auto">
            <button
              onClick={() => setViewMode('individual')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                viewMode === 'individual' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suite Inspection
            </button>
            <button
              onClick={() => setViewMode('difference')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                viewMode === 'difference' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Difference vs Baseline
            </button>
            <button
              onClick={() => setViewMode('stations')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                viewMode === 'stations' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ghats Stations Match
            </button>
          </div>
        </div>
      </div>

      {/* Physics Suite Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SENSITIVITY_EXPERIMENTS.map((exp) => {
          const isSelected = exp.id === selectedSuiteId;
          return (
            <div
              key={exp.id}
              onClick={() => setSelectedSuiteId(exp.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                <span>{exp.shortLabel}</span>
                <span className="text-cyan-400 font-bold">{exp.computationalCostFactor}× Cost</span>
              </div>
              <h2 className="text-sm font-bold text-white mb-2 leading-snug">
                {exp.name.split(':')[1]}
              </h2>

              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Crest Peak Rain:</span>
                  <span className="text-white font-bold tabular-nums">{exp.peakRainMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Heavy Rain CSI:</span>
                  <span className="text-cyan-300 font-semibold tabular-nums">{exp.csiHeavyRain.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Temp RMSE:</span>
                  <span className="text-emerald-400 tabular-nums">{exp.tempRMSE.toFixed(2)} °C</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Viewport Content based on active viewMode */}
      {viewMode === 'individual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Physical Mechanisms & Parameter Detail (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Microphysics & Boundary Layer Formulation
              </span>
              <h2 className="text-lg font-bold text-white mt-1">
                {activeSuite.name}
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded border border-slate-800">
              <strong className="text-slate-200">Atmospheric Dynamics Rationale:</strong> {activeSuite.physicalMechanism}
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded">
                <span className="text-slate-500 text-[10px] block">MICROPHYSICS SCHEME (mp_physics)</span>
                <span className="text-slate-200 font-medium">{activeSuite.microphysics}</span>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded">
                <span className="text-slate-500 text-[10px] block">BOUNDARY LAYER SCHEME (bl_pbl_physics)</span>
                <span className="text-slate-200 font-medium">{activeSuite.pblScheme}</span>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded">
                <span className="text-slate-500 text-[10px] block">LAND-SURFACE MODEL (sf_surface_physics)</span>
                <span className="text-slate-200 font-medium">{activeSuite.landSurface}</span>
              </div>
            </div>
          </div>

          {/* Right: Comparative Skill Scores Chart (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
                <span className="text-slate-200 uppercase font-semibold">
                  Forecast Skill Comparison Across Suites
                </span>
                <span className="text-cyan-400">Higher CSI = Higher Skill</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                    <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                    <Bar dataKey="podHeavy" fill="#10b981" name="POD (%)" />
                    <Bar dataKey="csiHeavy" fill="#06b6d4" name="CSI Threat (%)" />
                    <Bar dataKey="farHeavy" fill="#f59e0b" name="FAR (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded text-xs text-slate-400 leading-relaxed">
              <strong className="text-cyan-300">Phase 2 Finding:</strong> Double-moment schemes (Thompson and Morrison) yield
              a +12% increase in CSI for heavy rainfall over the steep Western Ghats crest by arresting premature coastal droplet
              fallout and capturing rimed graupel trajectories.
            </div>
          </div>
        </div>
      )}

      {/* Difference View: Suite vs Baseline */}
      {viewMode === 'difference' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Spatial Precipitation Difference: {activeSuite.shortLabel} minus Baseline (WSM6/YSU)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates spatial hydrometeor redistribution caused by predictive droplet concentration and non-local boundary layer closure
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">
              Delta: {(activeSuite.peakRainMm - baselineSuite.peakRainMm).toFixed(1)} mm Crest Peak
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">WINDWARD CREST ACCUMULATION</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                +{(activeSuite.gridPrecipSummary.crestAccumMm - baselineSuite.gridPrecipSummary.crestAccumMm)} mm
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Enhanced orographic uplift efficiency over Mahabaleshwar and Agumbe ridgelines.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">COASTAL PLAIN CONVERGENCE</span>
              <div className="text-lg font-bold text-cyan-300 mt-1">
                +{(activeSuite.gridPrecipSummary.coastalAccumMm - baselineSuite.gridPrecipSummary.coastalAccumMm)} mm
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Stronger low-level maritime jet deceleration along Konkan and coastal Karnataka.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-500 text-[10px] block">LEEWARD RAINSHADOW BIAS REDUCTION</span>
              <div className="text-lg font-bold text-amber-400 mt-1">
                {(activeSuite.gridPrecipSummary.rainshadowAccumMm - baselineSuite.gridPrecipSummary.rainshadowAccumMm)} mm
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Reduces spurious leeward spillover across the Deccan plateau (Pune and interior Maharashtra).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ghats Stations Match Table */}
      {viewMode === 'stations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Ghats Observation Station Match (24h Rainfall in mm)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ground-truth comparison against IMD rain gauges across coastal, crest, and rainshadow elevations
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">7 Reference Stations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Station & Elevation</th>
                  <th className="py-2.5 px-3">Observed (IMD)</th>
                  <th className="py-2.5 px-3">Exp 1 (WSM6)</th>
                  <th className="py-2.5 px-3">Exp 2 (Thompson)</th>
                  <th className="py-2.5 px-3">Exp 3 (Morrison)</th>
                  <th className="py-2.5 px-3">Best Performing Suite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {SENSITIVITY_STATION_COMPARISONS.map((row, idx) => {
                  const err1 = Math.abs(row.wsm6RainMm - row.observedRainMm);
                  const err2 = Math.abs(row.thompsonRainMm - row.observedRainMm);
                  const err3 = Math.abs(row.morrisonRainMm - row.observedRainMm);
                  const minErr = Math.min(err1, err2, err3);
                  const bestSuite = minErr === err3 ? 'Exp 3 (Morrison)' : minErr === err2 ? 'Exp 2 (Thompson)' : 'Exp 1 (WSM6)';

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {row.station} <span className="text-[10px] text-slate-500 font-normal">({row.elevationM}m)</span>
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold tabular-nums">{row.observedRainMm} mm</td>
                      <td className={`py-2.5 px-3 tabular-nums ${err1 === minErr ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {row.wsm6RainMm} mm
                      </td>
                      <td className={`py-2.5 px-3 tabular-nums ${err2 === minErr ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {row.thompsonRainMm} mm
                      </td>
                      <td className={`py-2.5 px-3 tabular-nums ${err3 === minErr ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                        {row.morrisonRainMm} mm
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300 font-semibold">
                        {bestSuite} (Δ = {minErr.toFixed(1)}mm)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
