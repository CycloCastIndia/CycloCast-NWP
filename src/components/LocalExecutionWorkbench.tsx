/**
 * @license
 * CycloCast NWP - Phase 2: Local Execution Workbench & Pipeline Runner
 * Interactive local hardware sizing calculator, step-by-step pipeline testbed,
 * and Python scientific engine package manager.
 */

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  HardDrive,
  Server,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { REGIONAL_DOMAINS } from '../data/domains';

interface PipelineStep {
  id: string;
  number: number;
  name: string;
  binary: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  durationSeconds: number;
  outputArtifact: string;
}

export const LocalExecutionWorkbench: React.FC = () => {
  // Hardware Calculator States
  const [localCores, setLocalCores] = useState<number>(16);
  const [localRamGb, setLocalRamGb] = useState<number>(32);
  const [forecastHorizon, setForecastHorizon] = useState<number>(24);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('d03_western_ghats');

  // Pipeline Runner States
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] CycloCast NWP Local Execution Daemon v2.1-arw initialized.',
    '[READY] Workstation hardware detected. Select pipeline stage to execute.',
  ]);

  // Code inspection tab
  const [selectedScript, setSelectedScript] = useState<'fetch' | 'wps' | 'wrf' | 'post' | 'verify'>('fetch');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const domain = REGIONAL_DOMAINS.find((d) => d.id === selectedDomainId) || REGIONAL_DOMAINS[2];

  // Hardware calculation logic
  const requiredRamGb = Math.round(domain.estimatedMemoryGB * (forecastHorizon / 24) * 0.7);
  const ramHeadroomGb = localRamGb - requiredRamGb;
  const isRamSafe = ramHeadroomGb >= 4;

  // Runtime calculation (governed by grid cells * time steps / cores)
  const baseRuntimeMinutes = Math.round((domain.estimatedCoreHoursPer24h / localCores) * 60 * (forecastHorizon / 24));

  const pipelineSteps: PipelineStep[] = [
    { id: 'ingest', number: 1, name: 'Boundary Data Ingestion', binary: 'fetch_gfs.py', status: 'idle', durationSeconds: 4, outputArtifact: 'gfs.t12z.pgrb2.0p25.*' },
    { id: 'geogrid', number: 2, name: 'Domain Topography & Landuse', binary: 'geogrid.exe', status: 'idle', durationSeconds: 6, outputArtifact: 'geo_em.d01.nc' },
    { id: 'ungrib', number: 3, name: 'GRIB2 Variable Unpacking', binary: 'ungrib.exe', status: 'idle', durationSeconds: 5, outputArtifact: 'FILE:2026-11-01_*' },
    { id: 'metgrid', number: 4, name: 'Meteorological Interpolation', binary: 'metgrid.exe', status: 'idle', durationSeconds: 7, outputArtifact: 'met_em.d01.*.nc' },
    { id: 'real', number: 5, name: 'Hydrostatic Boundary Derivation', binary: 'real.exe', status: 'idle', durationSeconds: 5, outputArtifact: 'wrfinput_d01, wrfbdy_d01' },
    { id: 'wrf', number: 6, name: 'Non-Hydrostatic Integration', binary: 'wrf.exe (ARW)', status: 'idle', durationSeconds: 12, outputArtifact: 'wrfout_d03_2026-11-01_12:00:00' },
    { id: 'postprocess', number: 7, name: 'Zarr & JSON Post-Processing', binary: 'postprocess_wrf.py', status: 'idle', durationSeconds: 4, outputArtifact: 'forecast_grid.json' },
  ];

  const [stepsState, setStepsState] = useState<PipelineStep[]>(pipelineSteps);

  // Pipeline simulation runner
  const handleRunFullPipeline = () => {
    if (isRunningPipeline) return;
    setIsRunningPipeline(true);
    setActiveStepIndex(0);
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toISOString()}] Launching complete CycloCast NWP Phase 2 Pipeline for domain ${domain.name}...`,
    ]);
  };

  useEffect(() => {
    if (!isRunningPipeline || activeStepIndex < 0) return;

    if (activeStepIndex >= stepsState.length) {
      setIsRunningPipeline(false);
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toISOString()}] [SUCCESS] Complete pipeline execution finished. All artifacts generated.`,
      ]);
      return;
    }

    const currentStep = stepsState[activeStepIndex];
    setTerminalLogs((prev) => [
      ...prev,
      `[${new Date().toISOString()}] [STAGE ${currentStep.number}/7] Executing ${currentStep.binary}...`,
    ]);

    // Update current step to running
    setStepsState((prev) =>
      prev.map((s, idx) => (idx === activeStepIndex ? { ...s, status: 'running' } : s))
    );

    const timer = setTimeout(() => {
      setStepsState((prev) =>
        prev.map((s, idx) => (idx === activeStepIndex ? { ...s, status: 'completed' } : s))
      );
      setTerminalLogs((prev) => [
        ...prev,
        `[${new Date().toISOString()}] [STAGE ${currentStep.number}/7] ✓ Completed ${currentStep.name} -> Created ${currentStep.outputArtifact}`,
      ]);
      setActiveStepIndex((prev) => prev + 1);
    }, currentStep.durationSeconds * 350);

    return () => clearTimeout(timer);
  }, [isRunningPipeline, activeStepIndex, stepsState.length]);

  const handleResetPipeline = () => {
    setIsRunningPipeline(false);
    setActiveStepIndex(-1);
    setStepsState(pipelineSteps);
    setTerminalLogs([
      '[INIT] CycloCast NWP Local Execution Daemon reset.',
      '[READY] Ready for next test run.',
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <span>PHASE 2 SCIENTIFIC IMPLEMENTATION</span>
              <span aria-hidden="true">·</span>
              <span>LOCAL MODEL RUNNER</span>
              <span aria-hidden="true">·</span>
              <span>ZERO-BUDGET WORKSTATION TESTBED</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              Local Execution Workbench & Pipeline Runner
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Configure local workstation hardware limits, simulate step-by-step WPS and WRF executions,
              and inspect the complete Python scientific orchestration codebase.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleRunFullPipeline}
              disabled={isRunningPipeline}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold rounded transition-colors cursor-pointer ${
                isRunningPipeline
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isRunningPipeline ? 'Pipeline Executing...' : 'Run Pipeline Test'}</span>
            </button>
            <button
              onClick={handleResetPipeline}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors cursor-pointer"
              title="Reset Testbed"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Profile & Resource Sizing Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Local Workstation Hardware Sizing Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          {/* CPU Cores Input */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Available CPU Cores
            </label>
            <select
              value={localCores}
              onChange={(e) => setLocalCores(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              <option value={4}>4 Cores (Entry Laptop)</option>
              <option value={8}>8 Cores (Modern Desktop)</option>
              <option value={16}>16 Cores (Workstation)</option>
              <option value={32}>32 Cores (Dual Socket / Threadripper)</option>
              <option value={64}>64 Cores (Dedicated Node)</option>
            </select>
          </div>

          {/* RAM Input */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Installed System RAM
            </label>
            <select
              value={localRamGb}
              onChange={(e) => setLocalRamGb(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              <option value={8}>8 GB RAM</option>
              <option value={16}>16 GB RAM</option>
              <option value={32}>32 GB RAM</option>
              <option value={64}>64 GB RAM</option>
              <option value={128}>128 GB RAM</option>
            </select>
          </div>

          {/* Forecast Duration Input */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Forecast Horizon
            </label>
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              <option value={24}>24 Hours (Fast Single Day)</option>
              <option value={48}>48 Hours (2 Days)</option>
              <option value={72}>72 Hours (Standard 3 Days)</option>
            </select>
          </div>

          {/* Regional Domain Target */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Target Test Domain
            </label>
            <select
              value={selectedDomainId}
              onChange={(e) => setSelectedDomainId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
            >
              {REGIONAL_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.resolutionKm}km)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculated Resource Sizing Readouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">ESTIMATED WALLCLOCK RUNTIME</span>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              ~{baseRuntimeMinutes < 60 ? `${baseRuntimeMinutes} mins` : `${(baseRuntimeMinutes / 60).toFixed(1)} hours`}
            </div>
            <span className="text-[10px] text-slate-400">
              For {forecastHorizon}h forecast on {localCores} MPI cores
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">RAM SAFETY HEADROOM</span>
            <div className={`text-xl font-bold mt-1 tabular-nums ${isRamSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
              {ramHeadroomGb >= 0 ? `+${ramHeadroomGb} GB Free` : `${ramHeadroomGb} GB Deficit`}
            </div>
            <span className="text-[10px] text-slate-400">
              Peak: ~{requiredRamGb} GB on 45 vertical levels
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">RECOMMENDED RESOLUTION</span>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {domain.resolutionKm <= 4 && localRamGb < 16 ? '9 km Recommended' : `${domain.resolutionKm} km Optimal`}
            </div>
            <span className="text-[10px] text-slate-400">
              {isRamSafe ? 'Hardware sufficient for selected grid' : 'Consider larger dx or cloud spot'}
            </span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Pipeline Testbed & Live Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Steps Flow (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Pipeline Execution Flow (7 Steps)
          </h2>

          <div className="space-y-2">
            {stepsState.map((step) => {
              const isCompleted = step.status === 'completed';
              const isRunning = step.status === 'running';

              return (
                <div
                  key={step.id}
                  className={`p-2.5 rounded border transition-colors text-xs font-mono ${
                    isRunning
                      ? 'bg-cyan-500/15 border-cyan-400 text-white'
                      : isCompleted
                      ? 'bg-slate-950/90 border-emerald-500/40 text-slate-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold">0{step.number}</span>
                      <span className="font-semibold text-slate-200">{step.name}</span>
                    </div>
                    {isCompleted ? (
                      <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> OK
                      </span>
                    ) : isRunning ? (
                      <span className="text-cyan-400 text-[11px] animate-pulse font-bold">
                        RUNNING
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[11px]">STANDBY</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 pl-6">
                    <span>{step.binary}</span>
                    <span className="text-slate-400">{step.outputArtifact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Output Console (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
            <span className="text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Execution Daemon Console Stream
            </span>
            <span className="text-[11px] text-slate-500 font-mono">stdout / stderr</span>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded p-4 font-mono text-xs overflow-auto max-h-[380px] text-slate-300 space-y-1">
            {terminalLogs.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                {line.includes('SUCCESS') ? (
                  <span className="text-emerald-400">{line}</span>
                ) : line.includes('STAGE') ? (
                  <span className="text-cyan-300 font-semibold">{line}</span>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Daemon Process PID: 48921 (Python 3.11)</span>
            <span className="text-cyan-400">Target: {domain.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
