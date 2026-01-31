import React, { useState } from 'react';
import { Search, X, Trash2, Download, ChevronDown, Star, CheckCircle2, CheckSquare, Square } from 'lucide-react';
import NodeDetails from './NodeDetails';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (filter: string) => void;
  allCompanies: string[];
  selectedCompanies: string[];
  setSelectedCompanies: React.Dispatch<React.SetStateAction<string[]>>;
  removeCompany: (companyName: string) => void;
  selectedNode: any;
  setSelectedNode: (node: any) => void;
  favorites: string[];
  completed: string[];
  toggleFavorite: (id: string) => void;
  toggleCompleted: (id: string) => void;
  questions: any[];
  theme: string;
  handleExport: (type: 'library' | 'favorites' | 'completed', format: 'json' | 'txt' | 'csv') => void;
}

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  searchTerm,
  setSearchTerm,
  difficultyFilter,
  setDifficultyFilter,
  allCompanies,
  selectedCompanies,
  setSelectedCompanies,
  removeCompany,
  selectedNode,
  setSelectedNode,
  favorites,
  completed,
  toggleFavorite,
  toggleCompleted,
  questions,
  theme,
  handleExport
}: SidebarProps) {
  const [showExport, setShowExport] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'txt' | 'csv'>('json');

  const toggleCompanyFilter = (companyName: string) => {
    setSelectedCompanies((prev: string[]) => 
      prev.includes(companyName) 
        ? prev.filter((c: string) => c !== companyName)
        : [...prev, companyName]
    );
  };

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto transition-transform duration-300 transform
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="flex justify-between items-center lg:hidden">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Dashboard</h2>
        <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <section>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Quick Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-300 dark:text-slate-600" size={18} />
          <input 
            type="text" 
            placeholder="Find a problem..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Difficulty Filter</label>
        <div className="grid grid-cols-2 gap-2">
          {['All', 'Easy', 'Medium', 'Hard'].map(d => (
            <button 
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`py-2 cursor-pointer rounded-lg text-xs font-bold border transition-all ${difficultyFilter === d ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      <section className="flex-1">
         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Linked Companies</label>
         <div className="space-y-2">
           {allCompanies.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No data loaded yet.</p>}
           {allCompanies.map(c => (
             <div key={c} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 group">
                <button onClick={() => toggleCompanyFilter(c)} className={`cursor-pointer shrink-0 transition-colors ${selectedCompanies.includes(c) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-700'}`}>
                  {selectedCompanies.includes(c) ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <span className={`text-xs font-bold truncate flex-1 ${selectedCompanies.includes(c) ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>{c}</span>
                <button onClick={() => removeCompany(c)} className="text-slate-300 hover:text-rose-500 cursor-pointer transition-all shrink-0"><Trash2 size={14} /></button>
             </div>
           ))}
         </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Export Center</label>
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value as 'json' | 'txt' | 'csv')} 
            className="cursor-pointer bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-[10px] font-black px-2 py-1 outline-none text-blue-600"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => handleExport('library', exportFormat)} 
            className="flex items-center justify-between cursor-pointer p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-all"
          >
            Full Master Library <Download size={14} />
          </button>
          <button 
            onClick={() => handleExport('favorites', exportFormat)} 
            className="flex items-center justify-between cursor-pointer p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-xl text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-all"
          >
            My Favorites <Star size={14} fill="currentColor" />
          </button>
          <button 
            onClick={() => handleExport('completed', exportFormat)} 
            className="flex items-center justify-between cursor-pointer p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-xl text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-all"
          >
            Completed Tasks <CheckCircle2 size={14} />
          </button>
        </div>
      </section>

      <NodeDetails
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        favorites={favorites}
        completed={completed}
        toggleFavorite={toggleFavorite}
        toggleCompleted={toggleCompleted}
        questions={questions}
        theme={theme}
      />
    </aside>
  );
}
