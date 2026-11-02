/**
 * @license
 * CycloCast NWP - Forecast Runs
 * Orchestrator queue, run history, and HPC batch submission scripts (SLURM / PBS / Local)
 */

import React, { useState } from 'react';
import { PlaySquare, Terminal, FileCode, Check, Copy, Download, ShieldAlert, Cpu } from 'lucide-react';
import { PREVIOUS_RUNS } from '../data/benchmarkRun';
import { REGIONAL_DOMAINS } from '../data/domains';

export const ForecastRuns: React.FC = () => {
  const [selectedRunId, setSelectedRunId] = useState<string>(PREVIOUS_RUNS[0].runId);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const activeRun = PREVIOUS_RUNS.find((r) => r.runId === selectedRunId) || PREVIOUS_RUNS[0];
  const activeDomain = REGIONAL_DOMAINS.find((d) => d.id === activeRun.domainId);

  const slurmBatchScript = `#!/bin/bash
# ==============================================================================
# CycloCast NWP - SLURM HPC Job Submission Script
# Target Domain: ${activeDomain?.name} (dx=${activeDomain?.resolutionKm}km)
# Run Identifier: ${activeRun.runId}
# ==============================================================================
#SBATCH --job-name=CC_WRF_${activeRun.domainId}
#SBATCH --output=/var/log/cyclocast/slurm_%j.out
#SBATCH --error=/var/log/cyclocast/slurm_%j.err
#SBATCH --nodes=2
#SBATCH --ntasks-per-node=32
#SBATCH --cpus-per-task=1
#SBATCH --time=04:00:00
#SBATCH --partition=compute
#SBATCH --exclusive

# 1. Environment & MPI Module Loading
module purge
module load intel/2023.2
module load openmpi/4.1.5-intel
module load hdf5/1.14.0-intel
module load netcdf-c/4.9.2-intel
module load netcdf-fortran/4.6.1-intel

# Export WRF environment variables
export OMP_NUM_THREADS=1
export WRFIO_NCD_LARGE_FILE_SUPPORT=1
export MALLOC_TRIM_THRESHOLD_=0

WORKDIR="/opt/cyclocast/runs/${activeRun.runId}"
mkdir -p \$WORKDIR && cd \$WORKDIR

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Starting WPS/WRF Execution on $(hostname)..."

# 2. Execute WPS Pipeline
ln -sf /opt/cyclocast/wps/* .
./geogrid.exe > geogrid.log 2>&1
if [ $? -ne 0 ]; then echo "FATAL: geogrid failed"; exit 1; fi

./link_grib.csh /opt/cyclocast/incoming_gfs/gfs.*.pgrb2.0p25
ln -sf ungrib/Variable_Tables/Vtable.GFS Vtable
./ungrib.exe > ungrib.log 2>&1
if [ $? -ne 0 ]; then echo "FATAL: ungrib failed"; exit 1; fi

./metgrid.exe > metgrid.log 2>&1
if [ $? -ne 0 ]; then echo "FATAL: metgrid failed"; exit 1; fi

# 3. Real.exe (Initial & Boundary Condition Generation)
ln -sf /opt/cyclocast/wrf/* .
mpirun -np 8 ./real.exe > real.log 2>&1
if [ $? -ne 0 ]; then echo "FATAL: real.exe failed"; exit 1; fi

# 4. WRF-ARW Non-Hydrostatic Dynamical Integration
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Launching 64-core WRF integration..."
mpirun -np ${activeRun.coresAllocated} ./wrf.exe

if grep -q "SUCCESS COMPLETE WRF" rsl.error.0000; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] WRF completed successfully."
    # 5. Trigger CycloCast Postprocessing & Zarr export
    python3 /opt/cyclocast/scripts/postprocess_wrf.py --run-id ${activeRun.runId}
else
    echo "ERROR: wrf.exe terminated prematurely. Check rsl.error.0000"
    exit 2
fi
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(slurmBatchScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <PlaySquare className="w-5 h-5 text-cyan-400" />
          Forecast Run Management & Job Submission
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Manage numerical simulation runs, inspect configuration provenance, and export validated
          HPC batch submission scripts (SLURM / PBS / Local OpenMPI runners) for cluster deployment.
        </p>
      </div>

      {/* Warning banner regarding non-browser execution */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Execution Environment Protocol:</span> Atmospheric simulations are executed on
          an external MPI Linux compute cluster or dedicated workstation. The web operational console generates job scripts,
          monitors queue status, and visualizes output fields once transferred to storage.
        </div>
      </div>

      {/* Grid: Runs List & SLURM Script Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Runs List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Simulation Run Catalog
          </h2>

          <div className="space-y-3">
            {PREVIOUS_RUNS.map((run) => {
              const isSelected = run.runId === selectedRunId;
              const d = REGIONAL_DOMAINS.find((dom) => dom.id === run.domainId);
              return (
                <div
                  key={run.runId}
                  onClick={() => setSelectedRunId(run.runId)}
                  className={`p-3.5 rounded border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-cyan-300">
                      {run.runId}
                    </span>
                    <span className="text-[11px] font-mono text-amber-300">
                      Benchmark Run
                    </span>
                  </div>

                  <div className="text-xs text-slate-200 mt-1.5 font-medium">
                    {d?.name}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2">
                    <span>Horizon: +{run.forecastLengthHours}h</span>
                    <span>·</span>
                    <span>dt: {run.timestepSeconds}s</span>
                    <span>·</span>
                    <span>{run.coresAllocated} Cores</span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80 leading-snug">
                    {run.notes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HPC Submission Script Generator (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                SLURM Batch Script (submit_wrf.sh)
              </h2>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Target: {activeDomain?.name} ({activeRun.coresAllocated} MPI Tasks)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
              </button>
            </div>
          </div>

          <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded p-4 font-mono text-xs overflow-auto max-h-[520px] text-slate-300 leading-relaxed">
            <pre>
              <code>{slurmBatchScript}</code>
            </pre>
          </div>

          <div className="mt-3 p-3 bg-slate-950/60 border border-slate-800 rounded text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>To launch on Linux workstation:</span>
            <span className="text-cyan-400">sbatch submit_wrf.sh</span>
          </div>
        </div>
      </div>
    </div>
  );
};
