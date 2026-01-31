import { Star } from 'lucide-react';
import { GITHUB_REPO_URL } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="hidden sm:flex bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-2 justify-between items-center z-30">
      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         <span>Data Source: GitHub / snehasishroy</span>
      </div>
      <a 
        href={GITHUB_REPO_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter hover:underline"
      >
        Give it a star to support the project <Star size={12} fill="currentColor" />
      </a>
    </footer>
  );
}
