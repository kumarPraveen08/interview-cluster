import React from 'react';
import { CheckCircle2, Star, ExternalLink, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

interface ListViewProps {
  sortedAndFilteredData: any[];
  completed: string[];
  favorites: string[];
  toggleCompleted: (id: string) => void;
  toggleFavorite: (id: string) => void;
  sortConfig: { key: string; direction: string };
  requestSort: (key: string) => void;
  activeCompanies: string[];
  observerTarget: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  totalCount: number;
}

const SortIcon = ({ columnKey, sortConfig }: { columnKey: string; sortConfig: { key: string; direction: string } }) => {
  if (sortConfig.key !== columnKey) return <ArrowUp size={12} className="opacity-0 group-hover:opacity-30 transition-opacity ml-1" />;
  return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1 text-blue-600" /> : <ArrowDown size={12} className="ml-1 text-blue-600" />;
};

export default function ListView({
  sortedAndFilteredData,
  completed,
  favorites,
  toggleCompleted,
  toggleFavorite,
  sortConfig,
  requestSort,
  activeCompanies,
  observerTarget,
  hasMore,
  totalCount
}: ListViewProps) {
  return (
    <div className="p-4 sm:p-10 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-black text-[10px] text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-4 py-4 w-24">Status</th>
              <th 
                className="px-4 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => requestSort('title')}
              >
                <div className="flex items-center">Problem <SortIcon columnKey="title" sortConfig={sortConfig} /></div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => requestSort('difficulty')}
              >
                <div className="flex items-center">Difficulty <SortIcon columnKey="difficulty" sortConfig={sortConfig} /></div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => requestSort('acceptance')}
              >
                <div className="flex items-center">Success <SortIcon columnKey="acceptance" sortConfig={sortConfig} /></div>
              </th>
              <th 
                className="px-6 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => requestSort('frequency')}
              >
                <div className="flex items-center">Frequency <SortIcon columnKey="frequency" sortConfig={sortConfig} /></div>
              </th>
              <th className="px-6 py-4 text-center w-10">URL</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
            {sortedAndFilteredData.map(q => (
              <tr key={q.id} className={`border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${completed.includes(q.id) ? 'opacity-60 bg-slate-50/50' : ''}`}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={() => toggleCompleted(q.id)}
                       className={`cursor-pointer transition-colors ${completed.includes(q.id) ? 'text-emerald-500' : 'text-slate-200 dark:text-slate-700 hover:text-slate-300'}`}
                     >
                       <CheckCircle2 size={18} />
                     </button>
                     <button 
                       onClick={() => toggleFavorite(q.id)}
                       className={`cursor-pointer transition-colors ${favorites.includes(q.id) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700 hover:text-slate-300'}`}
                     >
                       <Star size={18} fill={favorites.includes(q.id) ? "currentColor" : "none"} />
                     </button>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className={`font-bold transition-all ${completed.includes(q.id) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {q.title}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {q.companies.map((c: string) => {
                      const isSelected = activeCompanies.includes(c);
                      return (
                        <span 
                          key={c} 
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 opacity-40'
                          }`}
                        >
                          {c}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    q.difficulty === 'Easy' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' :
                    q.difficulty === 'Medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'
                  }`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{q.acceptance}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{q.frequency}</td>
                <td className="px-6 py-4 text-center">
                  {q.url && (
                    <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors inline-block">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {sortedAndFilteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                  No problems found matching your current filters.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
        <div ref={observerTarget} className="h-20 flex justify-center items-center">
          {hasMore ? (
            <Loader2 className="animate-spin text-blue-600" size={24} />
          ) : totalCount > 0 ? (
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">End of records</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
