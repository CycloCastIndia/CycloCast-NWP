/**
 * @license
 * CycloCast NWP - Header Component
 * Strict Top Bar Contract: Brand Wordmark | 5 Concise Nav Links | 1 Primary Action
 */

import React from 'react';
import { Terminal, Download } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenExportModal,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm tracking-wider">
          CC
        </div>
        <span 
          onClick={() => onSelectTab('dashboard')}
          className="text-lg font-bold tracking-tight text-white font-mono cursor-pointer hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          CYCLOCAST NWP
        </span>
      </div>

      {/* Zone 2: 5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'dashboard' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400'
          }`}
        >
          Map Dashboard
        </button>
        <button
          onClick={() => onSelectTab('operations')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'operations' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400'
          }`}
        >
          Operations
        </button>
        <button
          onClick={() => onSelectTab('profiles')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'profiles' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400'
          }`}
        >
          Soundings
        </button>
        <button
          onClick={() => onSelectTab('verification')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'verification' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400'
          }`}
        >
          Verification
        </button>
        <button
          onClick={() => onSelectTab('methodology')}
          className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
            activeTab === 'methodology' ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400'
          }`}
        >
          Architecture
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Namelist</span>
        </button>
      </div>
    </header>
  );
};
