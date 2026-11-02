/**
 * @license
 * CycloCast NWP - Model Configuration
 * WPS & WRF-ARW configuration editor, physics suites, CFL stability calculator, and namelist generator
 */

import React, { useState } from 'react';
import { Sliders, Copy, Check, Download, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';
import { REGIONAL_DOMAINS } from '../data/domains';
import { PHYSICS_SUITES } from '../data/physicsSuites';
import { generateNamelistWps, generateNamelistInput } from '../data/namelists';

export const ModelConfiguration: React.FC = () => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('d03_western_ghats');
  const [selectedPhysicsId, setSelectedPhysicsId] = useState<string>('cyclocast_tropical_convection_v1');
  const [forecastHours, setForecastHours] = useState<number>(72);
  const [boundarySource, setBoundarySource] = useState<string>('noaa_gfs_025');
  const [activeNamelistTab, setActiveNamelistTab] = useState<'wps' | 'input'>('input');
  const [copied, setCopied] = useState<boolean>(false);

  const domain = REGIONAL_DOMAINS.find((d) => d.id === selectedDomainId) || REGIONAL_DOMAINS[2];
  const physics = PHYSICS_SUITES.find((p) => p.id === selectedPhysicsId) || PHYSICS_SUITES[0];

  // CFL Calculation
  const recommendedDt = Math.min(180, Math.floor(domain.resolutionKm * 6));
  const integrationSteps = Math.round((forecastHours * 3600) / recommendedDt);

  const startDate = '2026-11-01_12:00:00';
  const endDate = `2026-11-0${1 + Math.floor(forecastHours / 24)}_${12 + (forecastHours % 24)}:00:00`;

  const namelistWpsText = generateNamelistWps(domain, startDate, endDate);
  const namelistInputText = generateNamelistInput(domain, physics, forecastHours, startDate, endDate);
  const activeNamelistText = activeNamelistTab === 'wps' ? namelistWpsText : namelistInputText;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeNamelistText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeNamelistTab === 'wps' ? 'namelist.wps' : 'namelist.input';
    const blob = new Blob([activeNamelistText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Scope */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          Model Configuration & Namelist Generator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure regional grid domains, physical parameterization schemes, CFL integration timesteps,
          and generate syntax-verified <span className="font-mono text-cyan-300">namelist.wps</span> and <span className="font-mono text-cyan-300">namelist.input</span> for WRF-ARW execution.
        </p>
      </div>

      {/* Grid: Controls on Left (5 cols) and Namelist on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Regional Domain Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Target Regional Domain
            </label>
            <select
              value={selectedDomainId}
              onChange={(e) => setSelectedDomainId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {REGIONAL_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.resolutionKm} km · d0{d.nestLevel})
                </option>
              ))}
            </select>

            <div className="mt-3 p-2.5 bg-slate-950/70 border border-slate-800/80 rounded text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Grid Dimension:</span>
                <span className="font-mono text-slate-200">{domain.gridPointsX} × {domain.gridPointsY} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Horizontal Spacing (dx, dy):</span>
                <span className="font-mono text-cyan-400">{domain.resolutionKm} km ({domain.resolutionKm * 1000} m)</span>
              </div>
              <div className="flex justify-between">
                <span>Map Projection:</span>
                <span className="font-mono text-slate-200 uppercase">{domain.projection} Conformal</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Parallel:</span>
                <span className="font-mono text-slate-200">{domain.standLon}°E</span>
              </div>
            </div>
          </div>

          {/* 2. Physics Parameterization Suite */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              Atmospheric Physics Suite
            </label>
            <select
              value={selectedPhysicsId}
              onChange={(e) => setSelectedPhysicsId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {PHYSICS_SUITES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {physics.description}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="p-2 bg-slate-950/70 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MICROPHYSICS</span>
                <span className="text-slate-200">{physics.microphysics.split('(')[0]}</span>
              </div>
              <div className="p-2 bg-slate-950/70 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CUMULUS</span>
                <span className="text-slate-200">
                  {domain.resolutionKm <= 4 ? 'Explicit (None)' : physics.cumulus.split('(')[0]}
                </span>
              </div>
              <div className="p-2 bg-slate-950/70 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PBL SCHEME</span>
                <span className="text-slate-200">{physics.pbl.split('(')[0]}</span>
              </div>
              <div className="p-2 bg-slate-950/70 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">LAND SURFACE</span>
                <span className="text-slate-200">{physics.landSurface.split('(')[0]}</span>
              </div>
            </div>
          </div>

          {/* 3. Duration & Lateral Boundary Source */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Forecast Duration (Hours)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[24, 48, 72, 96, 120].map((h) => (
                  <button
                    key={h}
                    onClick={() => setForecastHours(h)}
                    className={`py-1.5 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      forecastHours === h
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    +{h}h
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Boundary Condition Feed (LBC)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setBoundarySource('noaa_gfs_025')}
                  className={`p-2 rounded text-left border transition-colors cursor-pointer ${
                    boundarySource === 'noaa_gfs_025'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold">NOAA GFS 0.25°</div>
                  <div className="text-[10px] text-slate-500 font-mono">3-hourly · Free Global</div>
                </button>
                <button
                  onClick={() => setBoundarySource('ecmwf_ifs_opendata')}
                  className={`p-2 rounded text-left border transition-colors cursor-pointer ${
                    boundarySource === 'ecmwf_ifs_opendata'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-semibold">ECMWF OpenData</div>
                  <div className="text-[10px] text-slate-500 font-mono">0.25° · CC-BY 4.0</div>
                </button>
              </div>
            </div>
          </div>

          {/* 4. CFL Stability Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Courant-Friedrichs-Lewy (CFL) Check</span>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded space-y-1.5 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Horizontal dx:</span>
                <span className="text-white">{domain.resolutionKm} km</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Theoretical Max dt (6 × dx):</span>
                <span className="text-white">{domain.resolutionKm * 6} seconds</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Assigned time_step:</span>
                <span className="text-emerald-400 font-bold">{recommendedDt} seconds</span>
              </div>
              <div className="flex justify-between font-mono pt-1 border-t border-slate-800">
                <span className="text-slate-400">Total Iterations:</span>
                <span className="text-slate-200 tabular-nums">{integrationSteps.toLocaleString()} steps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Namelist Code Viewer */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveNamelistTab('input')}
                className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
                  activeNamelistTab === 'input'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                namelist.input (WRF-ARW)
              </button>
              <button
                onClick={() => setActiveNamelistTab('wps')}
                className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
                  activeNamelistTab === 'wps'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                namelist.wps (WPS Geogrid)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded p-4 font-mono text-xs overflow-auto max-h-[640px] text-slate-300 leading-relaxed">
            <pre>
              <code>{activeNamelistText}</code>
            </pre>
          </div>

          <div className="mt-3 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>WRF-ARW v4.5 Compatible Syntax</span>
            <span>Target: {domain.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
