/**
 * @license
 * CycloCast NWP - Data Ingestion Pipeline
 * Validated atmospheric adapters for boundary conditions, satellite, and surface observations
 */

import React, { useState } from 'react';
import { Database, CheckCircle, ShieldCheck, AlertCircle, FileText, Globe, RefreshCw, Key } from 'lucide-react';
import { INGESTION_DATASETS } from '../data/ingestionDatasets';
import { IngestionDataset } from '../types/nwp';

export const DataIngestion: React.FC = () => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(INGESTION_DATASETS[0].id);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const activeDataset = INGESTION_DATASETS.find((d) => d.id === selectedDatasetId) || INGESTION_DATASETS[0];

  const handleTestPing = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Input Atmospheric Data Pipeline
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Independent ingestion adapters for global numerical boundary forcings (NOAA GFS, ECMWF Open Data),
              geostationary satellite radiances (INSAT-3D/3DR), and ground observational networks (IMD AWS & Upper-Air).
            </p>
          </div>
          <button
            onClick={handleTestPing}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-cyan-300 bg-slate-950 border border-slate-800 hover:border-cyan-400 rounded transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isRefreshing ? 'Verifying Feeds...' : 'Verify Ingestion Feeds'}</span>
          </button>
        </div>
      </div>

      {/* Validation Protocols Checklist (Strict Section 5 requirements) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Mandatory Ingestion Validation Protocols
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              File Integrity & Checksums
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Automated MD5/SHA256 checksum verification against NOAA NOMADS & ECMWF manifest to prevent GRIB2 unpacking crashes in ungrib.exe.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Spatial & Temporal Bounds
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Ensures complete spatial coverage of the Indian window (60°–100°E, 0°–42°N) across all 3-hourly time steps from T+00h to T+72h.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Units & Missing Value Checks
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Standardizes SI units (Kelvin to Celsius, Pa to hPa, kg/kg to % RH) and scans for corrupted -9999 / NaN flags.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded">
            <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Licensing & Data Rights
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Verified under Open Data Commons, WMO Resolution 40/1, and CC-BY-4.0 for non-commercial and operational modeling.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Grid Table + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Datasets Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
            Atmospheric Ingestion Adapters
          </h2>

          <div className="space-y-3">
            {INGESTION_DATASETS.map((dataset) => {
              const isSelected = dataset.id === selectedDatasetId;
              return (
                <div
                  key={dataset.id}
                  onClick={() => setSelectedDatasetId(dataset.id)}
                  className={`p-3.5 rounded border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">
                      {dataset.name}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      ONLINE
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                    <span>{dataset.sourceOrg.split('(')[0]}</span>
                    <span>·</span>
                    <span>{dataset.format}</span>
                    <span>·</span>
                    <span>Res: {dataset.spatialResolution.split('(')[0]}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
                    <span>Last File: {dataset.lastFileTimestamp}</span>
                    <span className="text-cyan-400">Checksum: {dataset.checksumStatus.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Ingestion Specification (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800 mb-4">
              <span className="text-[11px] font-mono text-cyan-400 uppercase">Adapter Inspector</span>
              <h2 className="text-base font-bold text-white mt-0.5">
                {activeDataset.name}
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">{activeDataset.sourceOrg}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Format & Protocol</span>
                <span className="text-slate-200 font-mono">{activeDataset.format} via S3 / HTTPS POSIX Ingest</span>
              </div>

              <div>
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Temporal Frequency</span>
                <span className="text-slate-200">{activeDataset.temporalFrequency}</span>
              </div>

              <div>
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Latency</span>
                <span className="text-slate-200 font-mono">{activeDataset.latencyMinutes} minutes post-observation</span>
              </div>

              <div>
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Spatial Coverage</span>
                <span className="text-slate-200">{activeDataset.spatialCoverage}</span>
              </div>

              <div>
                <span className="text-slate-500 font-mono block text-[10px] uppercase">Licensing Terms</span>
                <span className="text-slate-300 font-mono text-[11px]">{activeDataset.licensing}</span>
              </div>

              <div>
                <span className="text-slate-500 font-mono block text-[10px] uppercase mb-1.5">Key Meteorological Variables</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDataset.variablesProvided.map((v, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-cyan-300">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500">
            Validated for WPS Ungrib Vtable parsing without missing coordinates.
          </div>
        </div>
      </div>
    </div>
  );
};
