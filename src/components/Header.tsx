import React from 'react';
import { Github, Moon, Sun, Network, List, Plus, Menu, Star } from 'lucide-react';
import { GITHUB_REPO_OWNER, GITHUB_REPO_URL } from '@/lib/constants';

interface HeaderProps {
  theme: string;
  toggleTheme: () => void;
  viewMode: string;
  setViewMode: (mode: 'graph' | 'list') => void;
  setShowImporter: (show: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  repoStars: number;
}

export default function Header({
  theme,
  toggleTheme,
  viewMode,
  setViewMode,
  setShowImporter,
  setIsSidebarOpen,
  repoStars
}: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between z-30 shadow-sm gap-4">
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg cursor-pointer">
            <Github className="text-white" size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm sm:text-lg font-black tracking-tight uppercase">Interview Cluster</h1>
            <a 
              href={GITHUB_REPO_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
            >
              By @{GITHUB_REPO_OWNER}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[8px] text-slate-500">
                 <Star size={10} fill="currentColor" /> {repoStars} Stars
              </div>
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:hidden">
          <button onClick={toggleTheme} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 cursor-pointer">
             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setShowImporter(true)} className="bg-slate-900 dark:bg-blue-600 text-white p-2.5 rounded-xl shadow-lg cursor-pointer">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button onClick={toggleTheme} className="hidden sm:flex p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
             {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex flex-1 sm:flex-none">
          <button onClick={() => setViewMode('graph')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${viewMode === 'graph' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
            <Network size={16} /> <span className="hidden sm:inline">Graph</span>
          </button>
          <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
            <List size={16} /> <span className="hidden sm:inline">List</span>
          </button>
        </div>
        <button 
          onClick={() => setShowImporter(true)}
          className="hidden sm:flex bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-black dark:hover:bg-blue-500 transition-colors shadow-lg cursor-pointer"
        >
          <Plus size={18} /> Add Source
        </button>
      </div>
    </header>
  );
}
