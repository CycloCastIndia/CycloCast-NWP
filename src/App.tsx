/**
 * @license
 * CycloCast NWP - Independent Numerical Weather Prediction System
 * Operations Control Platform
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { NavigationRibbon } from './components/NavigationRibbon';
import { OperationsCentre } from './components/OperationsCentre';
import { ModelConfiguration } from './components/ModelConfiguration';
import { DataIngestion } from './components/DataIngestion';
import { ForecastRuns } from './components/ForecastRuns';
import { ForecastVisualisation } from './components/ForecastVisualisation';
import { RegionalDomains } from './components/RegionalDomains';
import { SensitivityWorkbench } from './components/SensitivityWorkbench';
import { LocalExecutionWorkbench } from './components/LocalExecutionWorkbench';
import { AssimilationWorkbench } from './components/AssimilationWorkbench';
import { CalibrationWorkbench } from './components/CalibrationWorkbench';
import { EnsembleWorkbench } from './components/EnsembleWorkbench';
import { AtmosphericProfiles } from './components/AtmosphericProfiles';
import { Verification } from './components/Verification';
import { SystemLogs } from './components/SystemLogs';
import { Methodology } from './components/Methodology';
import { ExportModal } from './components/ExportModal';
import { MainMapDashboard } from './components/MainMapDashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [activeRunId, setActiveRunId] = useState<string>('CYCLOCAST-EXP-20261101-12Z-WG3KM');

  const handleSelectRun = (runId: string) => {
    setActiveRunId(runId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Strict Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Navigation Ribbon with Phase 2, 3 & 4 modules */}
      <NavigationRibbon activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <MainMapDashboard onNavigateToWorkbench={setActiveTab} />
        )}
        {activeTab === 'operations' && (
          <OperationsCentre
            onNavigate={setActiveTab}
            onSelectRun={handleSelectRun}
          />
        )}
        {activeTab === 'configuration' && <ModelConfiguration />}
        {activeTab === 'ingestion' && <DataIngestion />}
        {activeTab === 'runs' && <ForecastRuns />}
        {activeTab === 'visualisation' && <ForecastVisualisation />}
        {activeTab === 'domains' && <RegionalDomains />}
        {activeTab === 'sensitivity' && <SensitivityWorkbench />}
        {activeTab === 'localrunner' && <LocalExecutionWorkbench />}
        {activeTab === 'assimilation' && <AssimilationWorkbench />}
        {activeTab === 'calibration' && <CalibrationWorkbench />}
        {activeTab === 'ensemble' && <EnsembleWorkbench />}
        {activeTab === 'profiles' && <AtmosphericProfiles />}
        {activeTab === 'verification' && <Verification />}
        {activeTab === 'logs' && <SystemLogs />}
        {activeTab === 'methodology' && <Methodology />}
      </main>

      {/* Export Namelist / Scripts Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Professional Meteorological Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-bold">CYCLOCAST INDIA</span>
            <span aria-hidden="true">·</span>
            <span>Independent Numerical Weather Prediction System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Core: WRF-ARW v4.5</span>
            <span aria-hidden="true">·</span>
            <span>Non-Hydrostatic Euler Equations</span>
            <span aria-hidden="true">·</span>
            <span>Demonstration Benchmark Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
