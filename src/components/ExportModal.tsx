/**
 * @license
 * CycloCast NWP - Export Configuration Modal
 * Allows downloading and copying complete WRF namelists and orchestrator scripts
 */

import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';
import { REGIONAL_DOMAINS } from '../data/domains';
import { PHYSICS_SUITES } from '../data/physicsSuites';
import { generateNamelistWps, generateNamelistInput } from '../data/namelists';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>('d03_western_ghats');
  const [selectedFormat, setSelectedFormat] = useState<'input' | 'wps' | 'json'>('input');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const domain = REGIONAL_DOMAINS.find((d) => d.id === selectedDomainId) || REGIONAL_DOMAINS[2];
  const physics = PHYSICS_SUITES[0];
  const startDate = '2026-11-01_12:00:00';
  const endDate = '2026-11-04_12:00:00';

  let content = '';
  let filename = '';

  if (selectedFormat === 'input') {
    content = generateNamelistInput(domain, physics, 72, startDate, endDate);
    filename = 'namelist.input';
  } else if (selectedFormat === 'wps') {
    content = generateNamelistWps(domain, startDate, endDate);
    filename = 'namelist.wps';
  } else {
    content = JSON.stringify(domain, null, 2);
    filename = `${domain.id}_config.json`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-mono">
              Export Model Configuration & Scripts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Options */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Target Domain
              </label>
              <select
                value={selectedDomainId}
                onChange={(e) => setSelectedDomainId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {REGIONAL_DOMAINS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.resolutionKm} km)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                File Type
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setSelectedFormat('input')}
                  className={`py-2 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    selectedFormat === 'input'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  namelist.input
                </button>
                <button
                  onClick={() => setSelectedFormat('wps')}
                  className={`py-2 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    selectedFormat === 'wps'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  namelist.wps
                </button>
                <button
                  onClick={() => setSelectedFormat('json')}
                  className={`py-2 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    selectedFormat === 'json'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Domain JSON
                </button>
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div className="relative bg-slate-950 border border-slate-800 rounded p-4 font-mono text-xs overflow-auto max-h-64 text-slate-300 leading-relaxed">
            <pre>
              <code>{content}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <span className="text-xs font-mono text-slate-500">
            Filename: {filename}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono text-slate-950 font-bold bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
