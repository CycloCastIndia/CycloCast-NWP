/**
 * @license
 * CycloCast NWP - Operational Navigation Ribbon
 * Segmented control for the 10 core meteorological workflow sections
 */

import React from 'react';
import {
  Compass,
  Activity,
  Sliders,
  Database,
  PlaySquare,
  Map,
  Layers,
  TrendingUp,
  CheckCircle2,
  FileCode2,
  BookOpen,
  Terminal,
  GitMerge,
  Sparkles,
  PieChart,
} from 'lucide-react';

export interface NavTabItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

export const NAV_TABS: NavTabItem[] = [
  { id: 'dashboard', label: 'Main Map Dashboard', shortLabel: 'Map Dashboard', icon: Compass },
  { id: 'operations', label: 'Operations Centre', shortLabel: 'Ops Centre', icon: Activity },
  { id: 'configuration', label: 'Model Configuration', shortLabel: 'Configuration', icon: Sliders },
  { id: 'ingestion', label: 'Data Ingestion', shortLabel: 'Data Ingest', icon: Database },
  { id: 'runs', label: 'Forecast Runs', shortLabel: 'Runs', icon: PlaySquare },
  { id: 'visualisation', label: 'Forecast Visualisation', shortLabel: 'Visualisation', icon: Map },
  { id: 'domains', label: 'Regional Domains', shortLabel: 'Domains', icon: Layers },
  { id: 'sensitivity', label: 'Physics Tuning (Phase 2)', shortLabel: 'Sensitivity', icon: Sliders },
  { id: 'localrunner', label: 'Local Runner (Phase 2)', shortLabel: 'Local Runner', icon: Terminal },
  { id: 'assimilation', label: 'Data Assimilation (Phase 3)', shortLabel: 'Cyclo-DA', icon: GitMerge },
  { id: 'calibration', label: 'ML Calibration (Phase 4)', shortLabel: 'ML Calibrate', icon: Sparkles },
  { id: 'ensemble', label: 'Ensemble & MPAS (Phase 5)', shortLabel: 'Ensemble', icon: PieChart },
  { id: 'profiles', label: 'Atmospheric Profiles', shortLabel: 'Profiles', icon: TrendingUp },
  { id: 'verification', label: 'Verification Suite', shortLabel: 'Verification', icon: CheckCircle2 },
  { id: 'logs', label: 'System Logs', shortLabel: 'Logs', icon: FileCode2 },
  { id: 'methodology', label: 'Methodology & Science', shortLabel: 'Methodology', icon: BookOpen },
];

interface NavigationRibbonProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const NavigationRibbon: React.FC<NavigationRibbonProps> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2 overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-max">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
