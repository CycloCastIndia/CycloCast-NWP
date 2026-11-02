/**
 * @license
 * CycloCast NWP - System Logs
 * HPC cluster diagnostics and stdout/stderr execution traces from WPS, ARW, and postprocessing
 */

import React, { useState } from 'react';
import { FileCode2, Search, Filter, Copy, Check, Terminal, CheckCircle2 } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  stage: 'geogrid' | 'ungrib' | 'metgrid' | 'real' | 'wrf' | 'postprocess';
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}

const SAMPLE_SYSTEM_LOGS: LogEntry[] = [
  { timestamp: '12:01:04', stage: 'geogrid', level: 'INFO', message: 'Starting WPS geogrid.exe version 4.5.1' },
  { timestamp: '12:01:05', stage: 'geogrid', level: 'INFO', message: 'Configuring Domain 1 (dx=27000m) & Domain 2 (dx=9000m) & Domain 3 (dx=3000m)' },
  { timestamp: '12:01:12', stage: 'geogrid', level: 'INFO', message: 'Interpolating USGS 30-arc-second topography and MODIS 21-class land use' },
  { timestamp: '12:01:18', stage: 'geogrid', level: 'SUCCESS', message: 'Successful completion of geogrid.exe. Output: geo_em.d01.nc, geo_em.d02.nc, geo_em.d03.nc' },
  { timestamp: '12:01:22', stage: 'ungrib', level: 'INFO', message: 'Starting ungrib.exe with Vtable.GFS on NOAA GFS 0.25deg GRIB2 series' },
  { timestamp: '12:01:25', stage: 'ungrib', level: 'INFO', message: 'Parsing 25 GRIB2 files from T+00h to T+72h (3-hour interval)' },
  { timestamp: '12:01:54', stage: 'ungrib', level: 'SUCCESS', message: 'Successful completion of ungrib.exe. Output: 25 FILE:YYYY-MM-DD_HH records' },
  { timestamp: '12:01:58', stage: 'metgrid', level: 'INFO', message: 'Starting metgrid.exe. Subgrid interpolation to Arakawa C-grid' },
  { timestamp: '12:02:15', stage: 'metgrid', level: 'INFO', message: 'Processing metgrid level 34 for 25 time steps...' },
  { timestamp: '12:02:44', stage: 'metgrid', level: 'SUCCESS', message: 'Successful completion of metgrid.exe. Output: met_em.d01.*.nc' },
  { timestamp: '12:02:50', stage: 'real', level: 'INFO', message: 'Launching real.exe on 8 MPI ranks...' },
  { timestamp: '12:02:52', stage: 'real', level: 'INFO', message: 'Deriving 45 vertical eta levels (p_top=5000 Pa). Terrain pressure calculation complete' },
  { timestamp: '12:03:10', stage: 'real', level: 'SUCCESS', message: 'SUCCESS COMPLETE REAL_EM. Created wrfinput_d01 and wrfbdy_d01' },
  { timestamp: '12:03:15', stage: 'wrf', level: 'INFO', message: 'Launching wrf.exe with OpenMPI (64 cores, 2 nodes, Intel AVX-512)' },
  { timestamp: '12:03:16', stage: 'wrf', level: 'INFO', message: 'Non-hydrostatic dynamical core initialized. dt=18.0s, CFL margin=0.62' },
  { timestamp: '12:03:45', stage: 'wrf', level: 'INFO', message: 'Timing for 60 timesteps: 8.42 elapsed seconds on 64 processes' },
  { timestamp: '12:05:12', stage: 'wrf', level: 'INFO', message: 'Forecast Hour 06 complete: Writing wrfout_d03_2026-11-01_18:00:00 (NetCDF4)' },
  { timestamp: '12:08:40', stage: 'wrf', level: 'INFO', message: 'Forecast Hour 12 complete: Writing wrfout_d03_2026-11-02_00:00:00 (NetCDF4)' },
  { timestamp: '12:15:20', stage: 'wrf', level: 'INFO', message: 'Forecast Hour 24 complete: Diurnal convective peak captured over Western Ghats crest' },
  { timestamp: '12:28:10', stage: 'wrf', level: 'INFO', message: 'Forecast Hour 48 complete: Writing wrfout_d03_2026-11-03_12:00:00' },
  { timestamp: '12:44:50', stage: 'wrf', level: 'INFO', message: 'Forecast Hour 72 complete: Simulation horizon reached. Flushing I/O buffers' },
  { timestamp: '12:45:02', stage: 'wrf', level: 'SUCCESS', message: 'SUCCESS COMPLETE WRF. Total simulation wallclock time: 41m 47s' },
  { timestamp: '12:45:08', stage: 'postprocess', level: 'INFO', message: 'Triggering Python postprocess_wrf.py (wrf-python + Xarray)' },
  { timestamp: '12:45:22', stage: 'postprocess', level: 'INFO', message: 'Destaggering U10/V10 vectors and rotating to earth coordinates' },
  { timestamp: '12:45:45', stage: 'postprocess', level: 'INFO', message: 'Calculating 2D CAPE, CIN, Dew Point, and MSLP' },
  { timestamp: '12:46:10', stage: 'postprocess', level: 'SUCCESS', message: 'Exported web-optimized Zarr chunks and GeoJSON contour layers. Output size: 18.4 MB' },
];

export const SystemLogs: React.FC = () => {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredLogs = SAMPLE_SYSTEM_LOGS.filter((log) => {
    if (filterStage !== 'all' && log.stage !== filterStage) return false;
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return log.message.toLowerCase().includes(q) || log.stage.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCopy = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.stage.toUpperCase()}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-cyan-400" />
          HPC Execution & System Diagnostic Logs
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Complete execution logs and diagnostic stdout/stderr traces capturing WPS geogrid, ungrib,
          metgrid, real.exe, wrf.exe MPI steps, and post-processing.
        </p>
      </div>

      {/* Control Bar: Stage filter, Level filter, Search, Copy */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Stage:</span>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Stages</option>
              <option value="geogrid">geogrid.exe</option>
              <option value="ungrib">ungrib.exe</option>
              <option value="metgrid">metgrid.exe</option>
              <option value="real">real.exe</option>
              <option value="wrf">wrf.exe (ARW)</option>
              <option value="postprocess">postprocess</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Level:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[560px] text-slate-300 space-y-1.5">
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No log entries matched your filter.</div>
        ) : (
          filteredLogs.map((log, index) => {
            const isSuccess = log.level === 'SUCCESS';
            const isError = log.level === 'ERROR';
            const isWarn = log.level === 'WARN';

            return (
              <div key={index} className="flex items-start gap-3 hover:bg-slate-900/60 py-0.5 px-1.5 rounded transition-colors">
                <span className="text-slate-500 shrink-0 select-none">{log.timestamp}</span>
                <span className="text-cyan-400 w-24 shrink-0 font-semibold uppercase">[{log.stage}]</span>
                <span
                  className={`w-16 shrink-0 font-bold ${
                    isSuccess ? 'text-emerald-400' : isError ? 'text-rose-400' : isWarn ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {log.level}
                </span>
                <span className={`flex-1 ${isSuccess ? 'text-emerald-200' : isError ? 'text-rose-300' : 'text-slate-300'}`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="text-[11px] font-mono text-slate-500 flex justify-between">
        <span>Displaying {filteredLogs.length} of {SAMPLE_SYSTEM_LOGS.length} log lines</span>
        <span>Standard stdout/stderr formatted according to WRF rsl.out specification</span>
      </div>
    </div>
  );
};
