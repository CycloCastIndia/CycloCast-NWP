/**
 * @license
 * CycloCast NWP - Atmospheric Soundings & Thermodynamic Profiles
 * Interactive Skew-T ln-P sounding diagrams, vertical pressure-level cross-sections,
 * and computed convective instability indices for Indian radiosonde stations
 */

import React, { useState } from 'react';
import { TrendingUp, Wind, Compass, AlertCircle, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { RADIOSONDE_STATIONS } from '../data/soundingData';
import { RadiosondeStation } from '../types/nwp';

export const AtmosphericProfiles: React.FC = () => {
  const [selectedStationId, setSelectedStationId] = useState<string>(RADIOSONDE_STATIONS[0].id);

  const activeStation = RADIOSONDE_STATIONS.find((s) => s.id === selectedStationId) || RADIOSONDE_STATIONS[0];

  // Prepare data for Skew-T sounding chart (inverted pressure axis from 1000 to 100 hPa)
  const chartData = activeStation.sounding.map((lvl) => ({
    pressure: lvl.pressureHpa,
    temperature: lvl.temperatureC,
    dewpoint: lvl.dewPointC,
    parcel: lvl.temperatureC + (lvl.pressureHpa > 700 ? 2.5 : -1.0),
    windSpeed: lvl.windSpeedKt,
    windDir: lvl.windDirectionDeg,
    height: lvl.heightMeters,
    omega: lvl.verticalVelocityPaS,
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Atmospheric Soundings & Thermodynamic Profiles
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Vertical tropospheric profiles, thermodynamic stability indices, and wind shear hodographs
              simulated across key Indian radiosonde stations (1000 hPa to 100 hPa).
            </p>
          </div>

          {/* Station Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Station:</span>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {RADIOSONDE_STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.wmoId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Thermodynamic Indices Bar (Tabular numerals, unboxed discipline) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Surface CAPE</span>
          <span className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-0.5 block">
            {activeStation.indices.capeJkg}
          </span>
          <span className="text-[10px] font-mono text-slate-500">J/kg · High Convection</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Inhibition (CIN)</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-300 mt-0.5 block">
            {activeStation.indices.cinJkg}
          </span>
          <span className="text-[10px] font-mono text-slate-500">J/kg · Weak Cap</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Lifted Cond. (LCL)</span>
          <span className="text-xl font-bold font-mono tabular-nums text-white mt-0.5 block">
            {activeStation.indices.lclMeters}
          </span>
          <span className="text-[10px] font-mono text-slate-500">m AGL · Cloud Base</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Free Conv. (LFC)</span>
          <span className="text-xl font-bold font-mono tabular-nums text-cyan-300 mt-0.5 block">
            {activeStation.indices.lfcMeters}
          </span>
          <span className="text-[10px] font-mono text-slate-500">m AGL · Updraft Trigger</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">K-Index</span>
          <span className="text-xl font-bold font-mono tabular-nums text-white mt-0.5 block">
            {activeStation.indices.kIndex}
          </span>
          <span className="text-[10px] font-mono text-slate-500">°C · High T-Storm Potential</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Totals</span>
          <span className="text-xl font-bold font-mono tabular-nums text-white mt-0.5 block">
            {activeStation.indices.totalTotals}
          </span>
          <span className="text-[10px] font-mono text-slate-500">°C · Severe Squalls</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Precip Water (PWAT)</span>
          <span className="text-xl font-bold font-mono tabular-nums text-cyan-400 mt-0.5 block">
            {activeStation.indices.precipitableWaterMm}
          </span>
          <span className="text-[10px] font-mono text-slate-500">mm · Deep Trop. Moisture</span>
        </div>
      </div>

      {/* Sounding Chart & Vertical Profile Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sounding Chart: Temperature vs Dewpoint across Pressure (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
              <span className="text-slate-200">Thermodynamic Ascent Diagram (ln-P)</span>
              <div className="flex items-center gap-3">
                <span className="text-rose-400">● Temp (°C)</span>
                <span className="text-cyan-400">● Dewpoint (°C)</span>
                <span className="text-slate-400">-- Parcel</span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="temperature"
                    stroke="#64748b"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -12, fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    dataKey="pressure"
                    stroke="#64748b"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    reversed
                    domain={[100, 1000]}
                    label={{ value: 'Pressure (hPa)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  />
                  <Line type="monotone" dataKey="temperature" stroke="#f43f5e" strokeWidth={2.2} dot={{ r: 3 }} name="Air Temp (°C)" />
                  <Line type="monotone" dataKey="dewpoint" stroke="#06b6d4" strokeWidth={2.2} dot={{ r: 3 }} name="Dew Point (°C)" />
                  <Line type="monotone" dataKey="parcel" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name="Pseudo-Adiabat" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Surface: {activeStation.elevationM}m MSL · Lat {activeStation.lat}°N, Lon {activeStation.lon}°E</span>
            <span className="text-cyan-400">Tropical Tropopause ~100 hPa</span>
          </div>
        </div>

        {/* Vertical Levels Discrete Table (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Standard Pressure Levels
            </h2>
            <span className="text-xs font-mono text-cyan-400">11 Levels</span>
          </div>

          <div className="overflow-x-auto max-h-[360px]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-2">hPa</th>
                  <th className="py-2 px-2">Height</th>
                  <th className="py-2 px-2">Temp</th>
                  <th className="py-2 px-2">Td</th>
                  <th className="py-2 px-2">Wind</th>
                  <th className="py-2 px-2">RH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activeStation.sounding.map((lvl) => (
                  <tr key={lvl.pressureHpa} className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-2 font-semibold text-slate-200">{lvl.pressureHpa}</td>
                    <td className="py-1.5 px-2 text-slate-400 tabular-nums">{lvl.heightMeters}m</td>
                    <td className="py-1.5 px-2 text-rose-300 tabular-nums">{lvl.temperatureC}°C</td>
                    <td className="py-1.5 px-2 text-cyan-300 tabular-nums">{lvl.dewPointC}°C</td>
                    <td className="py-1.5 px-2 text-slate-300 tabular-nums">{lvl.windSpeedKt}kt {lvl.windDirectionDeg}°</td>
                    <td className="py-1.5 px-2 text-slate-400 tabular-nums">{lvl.relativeHumidityPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
