/**
 * @license
 * CycloCast NWP - Phase 4: Machine Learning Forecast Calibration Workbench (Cyclo-Calibrate)
 * Evaluates systematic bias removal using XGBoost ensembles and spatial quantile mapping
 */

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  Layers,
  Award,
  CheckCircle2,
  BarChart3,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import {
  ML_FEATURE_IMPORTANCE,
  CALIBRATION_STATION_RECORDS,
  CALIBRATION_SKILL_SUMMARY,
} from '../data/calibrationData';

export const CalibrationWorkbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'skills' | 'stations' | 'features'>('skills');

  // Chart data for Raw vs Calibrated comparison
  const skillChartData = [
    { name: 'Temp MAE (°C)', raw: 1.49, calibrated: 0.23 },
    { name: 'Temp RMSE (°C)', raw: 1.94, calibrated: 0.38 },
    { name: 'Wind RMSE (kt)', raw: 2.52, calibrated: 1.35 },
    { name: 'Rain RMSE (mm)', raw: 5.12, calibrated: 1.18 },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>CYCLOCAST PHASE 4 ARCHITECTURE</span>
              <span aria-hidden="true">·</span>
              <span>CYCLO-CALIBRATE ML POST-PROCESSING</span>
              <span aria-hidden="true">·</span>
              <span>HYBRID PHYSICAL-AI CALIBRATION</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Machine Learning Regional Calibration (Cyclo-Calibrate)
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Post-processing bias elimination layer trained on 5 years of IMD ground stations and high-resolution SRTM topography.
              Corrects systematic orographic precipitation drift and coastal temperature biases without violating physical conservation laws.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'skills' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Skill Improvement
            </button>
            <button
              onClick={() => setActiveTab('stations')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'stations' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Station Pairings (Raw vs ML)
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'features' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ML Feature Importance
            </button>
          </div>
        </div>
      </div>

      {/* Top Gain Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Temp MAE Reduction</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            -84.6%
          </div>
          <span className="text-[11px] font-mono text-slate-500">1.49°C → 0.23°C</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Temp Mean Bias</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
            -97.3%
          </div>
          <span className="text-[11px] font-mono text-slate-500">+1.48°C → +0.04°C (Near zero)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Rainfall RMSE Reduction</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300 mt-1">
            -76.9%
          </div>
          <span className="text-[11px] font-mono text-slate-500">5.12 mm → 1.18 mm</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <span className="text-xs font-mono text-slate-400 uppercase">Heavy Rain Threat (CSI)</span>
          <div className="text-2xl font-bold font-mono tabular-nums text-cyan-300 mt-1">
            +21.5%
          </div>
          <span className="text-[11px] font-mono text-slate-500">0.646 → 0.785 CSI Score</span>
        </div>
      </div>

      {/* Tab 1: Skill Improvement Charts */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bar Chart: Raw WRF vs ML Calibrated (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
              <span className="text-slate-200 uppercase font-semibold">
                Error Metrics: Raw WRF vs. Cyclo-Calibrate ML
              </span>
              <div className="flex items-center gap-3">
                <span className="text-rose-400">● Raw WRF Core</span>
                <span className="text-emerald-400">● Cyclo-Calibrate</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="JetBrains Mono" />
                  <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <Bar dataKey="raw" fill="#f43f5e" name="Raw WRF Core" />
                  <Bar dataKey="calibrated" fill="#10b981" name="Cyclo-Calibrate (ML)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-500 flex justify-between">
              <span>Lower bar = Superior accuracy</span>
              <span className="text-cyan-400">Average error reduction: 71.2%</span>
            </div>
          </div>

          {/* Metric Comparison Table (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-800 mb-3">
                <span className="text-[11px] font-mono text-cyan-400 uppercase">Verification Scorecard</span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  Regional Calibration Gains
                </h2>
              </div>

              <div className="divide-y divide-slate-800/80 text-xs font-mono">
                {CALIBRATION_SKILL_SUMMARY.map((row, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">{row.metric}</div>
                      <div className="text-[10px] text-slate-500">
                        Raw: {row.rawWrf} {row.unit} → ML: {row.mlCalibrated} {row.unit}
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {row.isLowerBetter ? `-${row.improvementPct}%` : `+${row.improvementPct}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded text-xs text-slate-400 font-sans leading-relaxed">
              <strong className="text-slate-200">Anti-Overfitting Guarantee:</strong> Models are validated using
              5-fold spatial cross-validation; stations in test folds are never present during gradient boosting training.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ground Station Pairings (Raw vs ML) */}
      {activeTab === 'stations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Station Ground-Truth Calibration (Observed vs Raw WRF vs Cyclo-Calibrate)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Demonstrates how machine learning eliminates systematic warm bias and precipitation drift across the 10 reference stations
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">10 Synoptic Stations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Station & Elevation</th>
                  <th className="py-2.5 px-3">Obs Temp</th>
                  <th className="py-2.5 px-3">Raw Temp</th>
                  <th className="py-2.5 px-3">ML Temp</th>
                  <th className="py-2.5 px-3">Temp Error Δ</th>
                  <th className="py-2.5 px-3">Obs Rain</th>
                  <th className="py-2.5 px-3">Raw Rain</th>
                  <th className="py-2.5 px-3">ML Rain</th>
                  <th className="py-2.5 px-3">Rain Error Δ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {CALIBRATION_STATION_RECORDS.map((stn, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {stn.station}
                        <span className="block text-[10px] text-slate-500 font-normal">{stn.elevationM}m MSL ({stn.state})</span>
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold tabular-nums">{stn.observedTempC}°C</td>
                      <td className="py-2.5 px-3 text-rose-300 tabular-nums">{stn.rawWrfTempC}°C</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">{stn.calibratedTempC}°C</td>
                      <td className="py-2.5 px-3 text-cyan-300 tabular-nums">
                        {stn.tempErrorRawC}°C → {stn.tempErrorCalibratedC}°C
                      </td>
                      <td className="py-2.5 px-3 text-white font-bold tabular-nums">{stn.observedRainMm} mm</td>
                      <td className="py-2.5 px-3 text-slate-300 tabular-nums">{stn.rawWrfRainMm} mm</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold tabular-nums">{stn.calibratedRainMm} mm</td>
                      <td className="py-2.5 px-3 text-cyan-300 tabular-nums">
                        {Math.abs(stn.rainErrorRawMm).toFixed(1)}mm → {Math.abs(stn.rainErrorCalibratedMm).toFixed(1)}mm
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: ML Feature Importance */}
      {activeTab === 'features' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              XGBoost Feature Importance Distribution
            </h2>

            <div className="space-y-3 font-mono text-xs">
              {ML_FEATURE_IMPORTANCE.map((feat, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-200">{feat.feature}</span>
                    <span className="text-cyan-400 font-bold">{feat.importancePct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden mb-1.5">
                    <div className="h-full bg-cyan-400 rounded" style={{ width: `${feat.importancePct * 3.5}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">{feat.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-800 mb-3">
                <span className="text-[11px] font-mono text-cyan-400 uppercase">Scientific Principle</span>
                <h2 className="text-base font-bold text-white mt-0.5">
                  Why Hybrid AI-Physics Outperforms Pure ML
                </h2>
              </div>

              <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
                <p>
                  Pure machine-learning weather models (trained solely on image-to-image or gridded reanalysis) frequently
                  violate mass and energy conservation laws during extreme, unprecedented events (such as intense cloudbursts or rapid cyclogenesis).
                </p>
                <p>
                  <strong>CycloCast's Hybrid Strategy:</strong> The non-hydrostatic WRF dynamical core solves the fundamental
                  conservation equations for mass, momentum, and thermodynamic energy. Cyclo-Calibrate then operates strictly as
                  a <em>post-processing residual corrector</em>, neutralizing unresolved local subgrid biases while respecting
                  fluid dynamics.
                </p>
              </div>

              <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5 text-xs font-mono">
                <div className="text-slate-400">1. Dynamical Core: <span className="text-white">Strict mass/moisture conservation</span></div>
                <div className="text-slate-400">2. Cyclo-Calibrate: <span className="text-emerald-400">Local station bias elimination</span></div>
                <div className="text-slate-400">3. Quantile Mapping: <span className="text-cyan-300">Extreme precipitation calibration</span></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500">
              Model Artifact: cyclocast_xgb_v2.4.ubj (Compressed Universal Binary JSON)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
