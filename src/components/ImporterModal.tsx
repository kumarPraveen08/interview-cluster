import React, { useState } from 'react';
import { X, Search, LinkIcon, RefreshCw, Info } from 'lucide-react';
import { PRESET_COMPANIES } from '../lib/constants';

interface ImporterModalProps {
  showImporter: boolean;
  setShowImporter: (show: boolean) => void;
  importCompany: string;
  setImportCompany: (company: string) => void;
  csvContent: string;
  setCsvContent: (content: string) => void;
  companyModalSearch: string;
  setCompanyModalSearch: (search: string) => void;
  handleManualImport: () => void;
  fetchFromGithub: (company: any) => void;
  isLoading: boolean;
  allCompanies: string[];
  filteredPresets: any[];
}

export default function ImporterModal({
  showImporter,
  setShowImporter,
  importCompany,
  setImportCompany,
  csvContent,
  setCsvContent,
  companyModalSearch,
  setCompanyModalSearch,
  handleManualImport,
  fetchFromGithub,
  isLoading,
  allCompanies,
  filteredPresets
}: ImporterModalProps) {
  if (!showImporter) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400"><LinkIcon size={20}/></div>
            <h2 className="text-xl font-bold">Import Source</h2>
          </div>
          <button onClick={() => setShowImporter(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"><X size={24}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-8">
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Popular Presets</label>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search companies..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-200"
                    value={companyModalSearch}
                    onChange={(e) => setCompanyModalSearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                {filteredPresets.length > 0 ? (
                  filteredPresets.slice(0, 48).map(company => (
                    <button 
                      key={company.name}
                      onClick={() => fetchFromGithub(company)}
                      disabled={isLoading || allCompanies.includes(company.name)}
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all gap-1 sm:gap-2
                        ${allCompanies.includes(company.name) 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 cursor-not-allowed' 
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer'}`}
                    >
                      <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                      <span className="text-[10px] sm:text-xs font-bold truncate w-full px-1">{company.name}</span>
                      {allCompanies.includes(company.name) && <span className="text-[8px] uppercase">Synced</span>}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-400 text-xs italic">
                    No presets match your search.
                  </div>
                )}
              </div>
            </section>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase shrink-0">Manual Import</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>

            <section className="space-y-4 pb-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Company Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Netflix..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200"
                  value={importCompany}
                  onChange={(e) => setImportCompany(e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">CSV Raw Text</label>
                  <div className="relative group">
                    <Info size={14} className="text-slate-400 cursor-help" />
                    <div className="absolute left-0 bottom-full mt-2 w-72 p-3 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none">
                      <div className="font-bold mb-2">CSV Format Guide:</div>
                      <div className="space-y-1 text-[10px]">
                        <div>• First row: Header (Title, URL, Difficulty, etc.)</div>
                        <div>• ID is optional (auto-generated if missing)</div>
                        <div>• Required: Title</div>
                        <div>• Optional: URL, Difficulty, Acceptance, Frequency</div>
                        <div className="mt-2 pt-2 border-t border-slate-700">
                          <div className="font-bold mb-1">Example:</div>
                          <div className="font-mono text-[9px]">Title,URL,Difficulty</div>
                          <div className="font-mono text-[9px]">Two Sum,https://...,Easy</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-mono h-24 sm:h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200"
                  placeholder="Title,URL,Difficulty,Acceptance,Frequency&#10;Two Sum,https://leetcode.com/problems/two-sum/,Easy,52.1%,5.2"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                />
              </div>

              <button 
                onClick={handleManualImport}
                disabled={!importCompany || !csvContent}
                className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-black dark:hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sync Custom Data
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
