/**
 * @license
 * CycloCast NWP - Methodology & Scientific Architecture Blueprint
 * Comprehensive architectural treatise addressing the 7 core NWP engineering questions
 */

import React, { useState } from 'react';
import { BookOpen, Copy, Check, ChevronDown, ChevronRight, Code2, Cpu, Database, Server, Layers } from 'lucide-react';
import { METHODOLOGY_SECTIONS, ArchitectureSection } from '../data/scientificArchitecture';

export const Methodology: React.FC = () => {
  const [expandedSectionId, setExpandedSectionId] = useState<string>('engine_separation');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>CYCLOCAST INDIA METEOROLOGICAL SPECIFICATION</span>
          <span aria-hidden="true">·</span>
          <span>NWP ARCHITECTURE WHITE PAPER</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Methodology & Scientific Blueprint
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Detailed meteorological system documentation addressing engine separation, WRF-ARW dynamical core integration,
          input datasets, zero-budget computational budgets, domain nesting math, and the roadmap toward an independent modelling system.
        </p>
      </div>

      {/* 7 Architecture Sections */}
      <div className="space-y-4">
        {METHODOLOGY_SECTIONS.map((section) => {
          const isExpanded = expandedSectionId === section.id;
          return (
            <div
              key={section.id}
              className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden transition-colors"
            >
              {/* Header Accordion Bar */}
              <div
                onClick={() => setExpandedSectionId(isExpanded ? '' : section.id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-800/40 select-none"
              >
                <div className="flex items-start gap-4">
                  <span className="text-lg font-mono font-bold text-cyan-400 shrink-0 mt-0.5">
                    {section.number}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {section.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {section.summary}
                    </p>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-white mt-1 shrink-0">
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>

              {/* Expanded Content Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800 space-y-5 text-xs text-slate-300 leading-relaxed">
                  {/* Detailed Prose Paragraphs */}
                  <div className="space-y-3">
                    {section.content.map((p, i) => (
                      <p key={i} className="text-slate-300 text-xs leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* Key Takeaways */}
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded space-y-2">
                    <span className="font-mono text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                      Core Architectural Principles
                    </span>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                      {section.keyTakeaways.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Technical Specifications Matrix (if present) */}
                  {section.technicalSpecs && (
                    <div className="bg-slate-950 border border-slate-800 rounded p-3">
                      <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        Technical Specifications & Constraints
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        {Object.entries(section.technicalSpecs).map(([key, val]) => (
                          <div key={key} className="p-2 bg-slate-900/60 rounded border border-slate-800/80">
                            <span className="text-slate-500 text-[10px] block">{key}</span>
                            <span className="text-slate-200">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Snippet (if present) */}
                  {section.codeSnippet && (
                    <div className="bg-slate-950 border border-slate-800 rounded overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{section.codeSnippet.filename}</span>
                        </div>
                        <button
                          onClick={() => handleCopyCode(section.id, section.codeSnippet!.code)}
                          className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors cursor-pointer"
                        >
                          {copiedCodeId === section.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeId === section.id ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      </div>
                      <div className="p-4 font-mono text-xs overflow-auto max-h-72 text-slate-300 leading-relaxed">
                        <pre>
                          <code>{section.codeSnippet.code}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
