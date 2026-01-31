import React from 'react';

export default function Legend() {
  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-2 pointer-events-none z-20 scale-75 sm:scale-100 origin-top-right">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 pointer-events-auto transition-colors">
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-blue-600" /><span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Company</span></div>
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-emerald-500" /><span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Easy</span></div>
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-amber-500" /><span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Medium</span></div>
        <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-rose-500" /><span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Hard</span></div>
      </div>
    </div>
  );
}
