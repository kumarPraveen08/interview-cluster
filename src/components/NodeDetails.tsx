import React from 'react';
import { X, Star, CheckCircle2, Circle, ExternalLink } from 'lucide-react';

interface NodeDetailsProps {
  selectedNode: any;
  setSelectedNode: (node: any) => void;
  favorites: string[];
  completed: string[];
  toggleFavorite: (id: string) => void;
  toggleCompleted: (id: string) => void;
  questions: any[];
  theme: string;
}

export default function NodeDetails({
  selectedNode,
  setSelectedNode,
  favorites,
  completed,
  toggleFavorite,
  toggleCompleted,
  questions,
  theme
}: NodeDetailsProps) {
  if (!selectedNode) return null;

  const nodeId = selectedNode.id.split('-').pop();
  const isFavorite = favorites.includes(nodeId);
  const isCompleted = completed.includes(nodeId);

  return (
    <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-5 text-white animate-in slide-in-from-bottom-4 shadow-2xl mt-auto border border-slate-800 dark:border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-bold text-base leading-tight">
            {selectedNode.type === 'question' ? (
              <a href={selectedNode.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 max-w-full">
                <span className="truncate">{selectedNode.label}</span> <ExternalLink size={14} className="shrink-0" />
              </a>
            ) : selectedNode.label}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selectedNode.type === 'question' && (
            <button 
              onClick={() => toggleFavorite(nodeId)}
              className={`p-1 rounded transition-colors cursor-pointer ${isFavorite ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-slate-400'}`}
            >
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}
          <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white cursor-pointer"><X size={18}/></button>
        </div>
      </div>
      
      {selectedNode.type === 'question' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => toggleCompleted(nodeId)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                isCompleted 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-800 dark:bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {isCompleted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              {isCompleted ? 'Completed' : 'Mark Done'}
            </button>
            <span className="text-blue-400 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest">{selectedNode.difficulty}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800 dark:bg-slate-900 p-2 rounded-xl text-center">
              <div className="text-[8px] text-slate-500 mb-0.5 uppercase font-bold tracking-wider">Success</div>
              <div className="text-xs font-bold">{selectedNode.acceptance}</div>
            </div>
            <div className="bg-slate-800 dark:bg-slate-900 p-2 rounded-xl text-center">
              <div className="text-[8px] text-slate-500 mb-0.5 uppercase font-bold tracking-wider">Frequency</div>
              <div className="text-xs font-bold">{selectedNode.frequency}</div>
            </div>
          </div>
          <a href={selectedNode.url} target="_blank" className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-lg shadow-blue-900/40 cursor-pointer">
            Open Problem <ExternalLink size={12}/>
          </a>
        </div>
      ) : (
        <div className="text-xs text-slate-400 leading-relaxed italic">
          Asking {questions.filter(q => q.companies.includes(selectedNode.label)).length} problems in this collection.
        </div>
      )}
    </div>
  );
}
