import React from 'react';
import { RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  setShowImporter: (show: boolean) => void;
}

export default function EmptyState({ setShowImporter }: EmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="animate-spin" size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black mb-2">Ready to Visualize</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">Add a company source to generate the interactive interview cluster and track your progress across firms.</p>
        <button onClick={() => setShowImporter(true)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all cursor-pointer">Get Started</button>
      </div>
    </div>
  );
}
