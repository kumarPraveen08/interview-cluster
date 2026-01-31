import React from 'react';
import { Briefcase, Star, CheckCircle2 } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  questionsCount: number;
  favoritesCount: number;
  completedCount: number;
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
  questionsCount,
  favoritesCount,
  completedCount
}: TabNavigationProps) {
  const tabs = [
    { id: 'all', label: 'All Library', icon: Briefcase, count: questionsCount },
    { id: 'favorites', label: 'Favorites', icon: Star, count: favoritesCount },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: completedCount }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex gap-4 sm:gap-8 z-20 overflow-x-auto no-scrollbar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === tab.id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <tab.icon size={14} fill={tab.id === 'favorites' && activeTab === 'favorites' ? 'currentColor' : 'none'} />
          {tab.label}
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
