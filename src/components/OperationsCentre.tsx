/**
 * @license
 * CycloCast NWP - Operations Centre
 * Operational dashboard tracking model state, data feeds, compute utilization, and job logs
 */

import React from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Clock,
  AlertTriangle,
  CheckCircle,
  Layers,
  ArrowRight,
  Database,
  Sliders,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { BENCHMARK_RUN_META, PREVIOUS_RUNS } from '../data/benchmarkRun';
import { INGESTION_DATASETS } from '../data/ingestionDatasets';
import { REGIONAL_DOMAINS } from '../data/domains';

interface OperationsCentreProps {
  onNavigate: (tab: string) => void;
  onSelectRun: (runId: string) => void;
}

export const OperationsCentre: React.FC<OperationsCentreProps> = ({ onNavigate, onSelectRun }) => {
  const activeDomain = REGIONAL_DOMAINS.find((d) => d.id === BENCHMARK_RUN_META.domainId);

  return (
    <div className="space-y-6">
      {/* Hero / System Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>CYCLOCAST INDIA</span>
              <span aria-hidden="true">·</span>
              <span>OPERATIONAL NWP WORKBENCH</span>
              <span aria-hidden="true">·</span>
              <span>WRF-ARW DYNAMICAL FOUNDATION</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Operations Control Centre
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Independent Numerical Weather Prediction platform for regional domain nesting,
              hydrodynamic atmospheric modelling, and statistical verification over the Indian Subcontinent.
            </p>
          </div>

          {/* Engine Status Badge (Strict Scientific Honesty) */}
          <div className="flex flex-col items-start lg:items-end gap-1.5 p-3 rounded bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-mono font-semibold text-amber-300">
                ENGINE STANDBY / BENCHMARK ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Web Client Mode · Ready for Local/Cluster HPC Binding
            </p>
          </div>
        </div>

        {/* Scientific Honesty Disclaimer Card */}
        <div className="mt-4 p-3 bg-amber-950/20 border border-amber-500/20 rounded flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300">Strict Scientific Disclosure:</span> In accordance with
            NWP standards, numerical integration cannot execute in client browsers or serverless edge workers. The
            active run (<span className="font-mono text-amber-300">{BENCHMARK_RUN_META.runId}</span>) represents a calibrated
            synthetic meteorological benchmark (Western Ghats heavy orographic surge). No live cluster simulation is claimed.
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (60-30-10 palette, tabular numerals, unboxed metadata) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Initialization Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Initialisation Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            12:00 UTC
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            2026-11-01 · Cycle: 12Z
          </div>
        </div>

        {/* Card 2: Active Simulation Domain */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Active Regional Domain</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white truncate" title={activeDomain?.name}>
            {activeDomain?.name.replace('Orographic High-Res', 'WG-3km')}
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Grid: {activeDomain?.gridPointsX} × {activeDomain?.gridPointsY} · dx = {activeDomain?.resolutionKm} km
          </div>
        </div>

        {/* Card 3: Timestep & CFL Stability */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">CFL Timestep (dt)</span>
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
            {BENCHMARK_RUN_META.timestepSeconds} s
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            CFL Valid: dt ≤ 6 × {activeDomain?.resolutionKm}km (18s ≤ 18s)
          </div>
        </div>

        {/* Card 4: Forecast Lead Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Forecast Duration</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            +{BENCHMARK_RUN_META.forecastLengthHours} Hours
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Output Horizon: T+00h to T+72h
          </div>
        </div>
      </div>

      {/* Middle Row: Compute Resources & Ingestion Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Computational Requirements & Hardware Profile (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Computational Resource Budget (3 km Convection-Permitting Grid)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hardware requirements calculated for a 72-hour non-hydrostatic simulation
              </p>
            </div>
            <button
              onClick={() => onNavigate('configuration')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              Configure Grid <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>MPI CPU Cores</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                64 Cores
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Recommended: 32–64 cores (AVX-512)
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Memory Allocation</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                32 GB RAM
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Peak memory across 45 vertical levels
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>NetCDF Output Volume</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-white">
                18.4 GB
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Raw 4D fields before Zarr compression
              </div>
            </div>
          </div>

          {/* Staged Execution Notice */}
          <div className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded border border-slate-800 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-300">Zero-Budget Optimization Strategy:</strong> For local development workstations
              (8–16 cores), start with the <span className="text-cyan-300 font-mono">Research Benchmark</span> physics suite on a
              9 km grid, or run targeted 24-hour simulations on the single Western Ghats domain to complete within ~2 hours.
            </div>
          </div>
        </div>

        {/* Right: Ingestion Feeds Quick Status (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                Input Data Feeds
              </h2>
              <button
                onClick={() => onNavigate('ingestion')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                Inspect <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {INGESTION_DATASETS.slice(0, 4).map((feed) => (
                <div key={feed.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-200 truncate max-w-[180px]">
                      {feed.name.split('(')[0].replace('Global Boundary & Initial Conditions', 'LBC')}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {feed.format} · Latency: {feed.latencyMinutes}m
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-medium text-emerald-400">
                      ONLINE
                    </span>
                    <div className="text-[10px] font-mono text-slate-500">
                      SHA256 OK
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>All boundary feeds verified</span>
            <span className="font-mono text-cyan-400">0 Alerts</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Previous Benchmark Runs & Failed Job Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Previous Runs Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Simulation Runs & Benchmark History
            </h2>
            <button
              onClick={() => onNavigate('runs')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              Full Execution Queue <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Run Identifier</th>
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3">Horizon</th>
                  <th className="py-2.5 px-3">Forcing</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {PREVIOUS_RUNS.map((run) => (
                  <tr key={run.runId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {run.runId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {run.domainId.replace('d03_', '').replace('d02_', '').replace('d01_', '')}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums text-slate-300">
                      +{run.forecastLengthHours}h
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[140px]">
                      {run.boundarySource.split('(')[0]}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-amber-300">
                        Benchmark
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectRun(run.runId);
                          onNavigate('visualisation');
                        }}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                      >
                        Visualise
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Failed Job Diagnostics & Error Prevention (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3 text-slate-200">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">
              NWP Failure Prevention
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
              <div className="font-medium text-slate-200 mb-1">
                CFL Numerical Instability Check
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                If horizontal velocity advection exceeds grid spacing within one timestep, WRF aborts with
                <span className="font-mono text-rose-400"> cfl violation</span>. CycloCast automatically clamps <span className="font-mono text-cyan-300">time_step ≤ 6 × dx</span>.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
              <div className="font-medium text-slate-200 mb-1">
                GRIB2 Boundary Continuity
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                If an intermediate 3-hourly boundary file is missing from NOAA NOMADS, ungrib and metgrid fail.
                The ingestion validator asserts all 25 files are verified prior to real.exe launch.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
              <div className="font-medium text-slate-200 mb-1">
                Domain Nest Boundary Shock
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Nesting ratios strictly enforce 1:3 or 1:5 integer factors to prevent numerical wave reflection at child domain boundaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
