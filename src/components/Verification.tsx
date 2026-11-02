/**
 * @license
 * CycloCast NWP - Forecast Verification Suite
 * Statistical evaluation metrics matching forecast outputs against observational networks
 * (MAE, RMSE, Bias, POD, FAR, CSI, Frequency Bias)
 */

import React, { useState } from 'react';
import { CheckCircle2, Award, TrendingUp, BarChart3, Database, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  RAINFALL_CONTINGENCY_METRICS,
  CONTINUOUS_LEADTIME_METRICS,
  STATION_VERIFICATION_RECORDS,
} from '../data/verificationData';

export const Verification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contingency' | 'continuous' | 'stations'>('contingency');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>POST-EVENT VALIDATION ENGINE</span>
              <span aria-hidden="true">·</span>
              <span>INDEPENDENT OBSERVATION BENCHMARK</span>
              <span aria-hidden="true">·</span>
              <span>WMO STANDARD METRICS</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Forecast Verification & Reliability Suite
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Rigorous statistical evaluation evaluating model outputs against co-located IMD ground observations,
              rain gauges, and synoptic reports for the matching run cycle.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded">
            <button
              onClick={() => setActiveTab('contingency')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'contingency' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rainfall Categorical (POD/CSI)
            </button>
            <button
              onClick={() => setActiveTab('continuous')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'continuous' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Continuous Error (MAE/RMSE)
            </button>
            <button
              onClick={() => setActiveTab('stations')}
              className={`px-3 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                activeTab === 'stations' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ground Station Pairings
            </button>
          </div>
        </div>
      </div>

      {/* Contingency Table Section */}
      {activeTab === 'contingency' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <span className="text-xs font-mono text-slate-400 uppercase">Rain/No-Rain POD</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                {(RAINFALL_CONTINGENCY_METRICS[0].pod * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] font-mono text-slate-500">Probability of Detection (Hit Rate)</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <span className="text-xs font-mono text-slate-400 uppercase">Rain/No-Rain FAR</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-cyan-400 mt-1">
                {(RAINFALL_CONTINGENCY_METRICS[0].far * 100).toFixed(1)}%
              </div>
              <span className="text-[11px] font-mono text-slate-500">False Alarm Ratio</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <span className="text-xs font-mono text-slate-400 uppercase">Critical Success (CSI)</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                {RAINFALL_CONTINGENCY_METRICS[0].csi.toFixed(3)}
              </div>
              <span className="text-[11px] font-mono text-slate-500">Threat Score (0 to 1)</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <span className="text-xs font-mono text-slate-400 uppercase">Frequency Bias</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                {RAINFALL_CONTINGENCY_METRICS[0].frequencyBias.toFixed(3)}
              </div>
              <span className="text-[11px] font-mono text-slate-500">Ideal = 1.000 (Neither under/over)</span>
            </div>
          </div>

          {/* Full Contingency Table Across IMD Rain Thresholds */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Contingency Matrix Across Operational Rain Thresholds
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Threshold Category</th>
                    <th className="py-2.5 px-3">Hits (H)</th>
                    <th className="py-2.5 px-3">Misses (M)</th>
                    <th className="py-2.5 px-3">False Alarms (F)</th>
                    <th className="py-2.5 px-3">POD</th>
                    <th className="py-2.5 px-3">FAR</th>
                    <th className="py-2.5 px-3">CSI (Threat)</th>
                    <th className="py-2.5 px-3">Freq. Bias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {RAINFALL_CONTINGENCY_METRICS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {row.thresholdLabel}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 tabular-nums">{row.hits}</td>
                      <td className="py-2.5 px-3 text-slate-400 tabular-nums">{row.misses}</td>
                      <td className="py-2.5 px-3 text-slate-400 tabular-nums">{row.falseAlarms}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-semibold tabular-nums">
                        {(row.pod * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-amber-400 tabular-nums">
                        {(row.far * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300 font-semibold tabular-nums">
                        {row.csi.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200 tabular-nums">
                        {row.frequencyBias.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded text-xs text-slate-400 space-y-1">
              <div><strong className="text-slate-300">POD (Probability of Detection):</strong> Hits / (Hits + Misses) — measures the fraction of observed events correctly forecast.</div>
              <div><strong className="text-slate-300">FAR (False Alarm Ratio):</strong> False Alarms / (Hits + False Alarms) — fraction of forecast events that did not occur.</div>
              <div><strong className="text-slate-300">CSI (Critical Success Index):</strong> Hits / (Hits + Misses + False Alarms) — overall threat score excluding correct negatives.</div>
            </div>
          </div>
        </div>
      )}

      {/* Continuous Error Curves Section */}
      {activeTab === 'continuous' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
              <span className="text-slate-200 uppercase font-semibold">
                Continuous Error vs Forecast Lead Time (T+06h to T+72h)
              </span>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400">● 2m Temp MAE (°C)</span>
                <span className="text-rose-400">● 2m Temp RMSE (°C)</span>
                <span className="text-amber-400">● 10m Wind RMSE (kt)</span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CONTINUOUS_LEADTIME_METRICS} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="leadTimeHours"
                    stroke="#64748b"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    tickFormatter={(val) => `+${val}h`}
                  />
                  <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <Line type="monotone" dataKey="temp2mMAE" stroke="#06b6d4" strokeWidth={2} name="2m Temp MAE (°C)" />
                  <Line type="monotone" dataKey="temp2mRMSE" stroke="#f43f5e" strokeWidth={2} name="2m Temp RMSE (°C)" />
                  <Line type="monotone" dataKey="wind10mRMSE" stroke="#f59e0b" strokeWidth={2} name="10m Wind RMSE (kt)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Continuous metrics data table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Discrete Lead-Time Verification Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Lead Time</th>
                    <th className="py-2 px-3">T2m MAE</th>
                    <th className="py-2 px-3">T2m RMSE</th>
                    <th className="py-2 px-3">T2m Mean Bias</th>
                    <th className="py-2 px-3">10m Wind RMSE</th>
                    <th className="py-2 px-3">MSLP MAE</th>
                    <th className="py-2 px-3">RH2m RMSE</th>
                    <th className="py-2 px-3">Sample Pairs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {CONTINUOUS_LEADTIME_METRICS.map((row) => (
                    <tr key={row.leadTimeHours} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-slate-200">+{row.leadTimeHours}h</td>
                      <td className="py-2 px-3 text-cyan-300 tabular-nums">{row.temp2mMAE.toFixed(2)} °C</td>
                      <td className="py-2 px-3 text-rose-300 tabular-nums">{row.temp2mRMSE.toFixed(2)} °C</td>
                      <td className="py-2 px-3 text-slate-300 tabular-nums">{row.temp2mBias > 0 ? `+${row.temp2mBias}` : row.temp2mBias} °C</td>
                      <td className="py-2 px-3 text-amber-300 tabular-nums">{row.wind10mRMSE.toFixed(2)} kt</td>
                      <td className="py-2 px-3 text-slate-300 tabular-nums">{row.mslpMAE.toFixed(2)} hPa</td>
                      <td className="py-2 px-3 text-slate-400 tabular-nums">{row.rh2mRMSE.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-slate-500 tabular-nums">{row.sampleCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Ground Station Verification Pairings Section */}
      {activeTab === 'stations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Ground Station Pairings (Observed vs Model Forecast)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact point comparison of 24h rainfall and temperatures against official IMD weather stations
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400">10 Synoptic Stations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Station & State</th>
                  <th className="py-2.5 px-3">Obs Rain (24h)</th>
                  <th className="py-2.5 px-3">Model Rain (24h)</th>
                  <th className="py-2.5 px-3">Rain Error (Δ)</th>
                  <th className="py-2.5 px-3">Obs Temp</th>
                  <th className="py-2.5 px-3">Model Temp</th>
                  <th className="py-2.5 px-3">Temp Error (Δ)</th>
                  <th className="py-2.5 px-3">Obs Wind</th>
                  <th className="py-2.5 px-3">Model Wind</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {STATION_VERIFICATION_RECORDS.map((stn, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {stn.stationName} <span className="text-[10px] text-slate-500 font-normal">({stn.state})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">{stn.observedRain24hMm} mm</td>
                    <td className="py-2.5 px-3 text-cyan-300 font-semibold tabular-nums">{stn.forecastRain24hMm} mm</td>
                    <td className={`py-2.5 px-3 tabular-nums font-semibold ${Math.abs(stn.rainErrorMm) <= 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {stn.rainErrorMm > 0 ? `+${stn.rainErrorMm}` : stn.rainErrorMm} mm
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">{stn.observedTempC} °C</td>
                    <td className="py-2.5 px-3 text-slate-200 tabular-nums">{stn.forecastTempC} °C</td>
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums">
                      {stn.tempErrorC > 0 ? `+${stn.tempErrorC}` : stn.tempErrorC} °C
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 tabular-nums">{stn.observedWindKt} kt</td>
                    <td className="py-2.5 px-3 text-slate-300 tabular-nums">{stn.forecastWindKt} kt</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
