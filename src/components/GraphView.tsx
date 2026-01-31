import React, { useEffect, useRef } from 'react';
import { Network, LayoutTemplate, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GraphViewProps {
  sortedAndFilteredData: any[];
  isD3Loaded: boolean;
  viewMode: string;
  completed: string[];
  favorites: string[];
  theme: string;
  selectedNode: any;
  setSelectedNode: (node: any) => void;
  hoveredNode: any;
  setHoveredNode: (node: any) => void;
  graphLayout: 'force' | 'semantic';
  setGraphLayout: (layout: 'force' | 'semantic') => void;
}

export default function GraphView({
  sortedAndFilteredData,
  isD3Loaded,
  viewMode,
  completed,
  favorites,
  theme,
  selectedNode,
  setSelectedNode,
  hoveredNode,
  setHoveredNode,
  graphLayout,
  setGraphLayout
}: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<any>(null);
  const d3ZoomRef = useRef<any>(null);

  useEffect(() => {
    if (!isD3Loaded || viewMode !== 'graph' || !svgRef.current || sortedAndFilteredData.length === 0) {
      if (svgRef.current) (window as any).d3?.select(svgRef.current).selectAll("*").remove();
      return;
    }

    const d3 = (window as any).d3;
    const updateSize = () => {
      if (!svgRef.current) return;
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;
      d3.select(svgRef.current).selectAll("*").remove();

      const nodes: any[] = [];
      const links: any[] = [];

      sortedAndFilteredData.forEach((q: any) => {
        nodes.push({ 
          id: `q-${q.id}`, label: q.title, type: 'question', difficulty: q.difficulty, 
          acceptance: q.acceptance, frequency: q.frequency, url: q.url, 
          isCompleted: completed.includes(q.id), isFavorite: favorites.includes(q.id),
          radius: 12 + (parseFloat(q.frequency) || 0) / 10 
        });
      });

      const activeCompsInFiltered = new Set(sortedAndFilteredData.flatMap((q: any) => q.companies));
      Array.from(activeCompsInFiltered).sort().forEach((name: string) => { 
        nodes.push({ id: `c-${name}`, label: name, type: 'company', radius: 24 }); 
      });
      
      sortedAndFilteredData.forEach((q: any) => { 
        q.companies.forEach((company: string) => { 
          if (activeCompsInFiltered.has(company)) { 
            links.push({ source: `q-${q.id}`, target: `c-${company}`, frequency: parseFloat(q.frequency) || 0 }); 
          } 
        }); 
      });

      const svg = d3.select(svgRef.current);
      const g = svg.append("g");
      const zoom = d3.zoom().scaleExtent([0.1, 5]).on("zoom", (e: any) => g.attr("transform", e.transform));
      svg.call(zoom);
      d3ZoomRef.current = { zoom, svg };

      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(140).strength(0.5))
        .force("charge", d3.forceManyBody().strength(-600))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius((d: any) => d.radius + 40));

      if (graphLayout === 'semantic') {
        simulation.force("x", d3.forceX((d: any) => d.type === 'company' ? width * 0.2 : width * 0.8).strength(1)).force("y", d3.forceY(height / 2).strength(0.1));
      }

      const link = g.append("g").selectAll("line").data(links).join("line")
        .attr("stroke", theme === 'dark' ? "#334155" : "#e2e8f0").attr("stroke-width", (d: any) => Math.max(1, d.frequency / 20)).attr("stroke-opacity", 0.6);

      const node = g.append("g").selectAll("g").data(nodes).join("g").attr("class", "cursor-pointer")
        .call(d3.drag().on("start", (e: any, d: any) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }).on("drag", (e: any, d: any) => { d.fx = e.x; d.fy = e.y; }).on("end", (e: any, d: any) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }))
        .on("click", (e: any, d: any) => { e.stopPropagation(); setSelectedNode(d); highlight(d); })
        .on("mouseenter", (e: any, d: any) => setHoveredNode(d))
        .on("mouseleave", () => setHoveredNode(null));

      node.each(function(this: SVGElement, d: any) {
        const el = d3.select(this);
        if (d.type === 'company') {
          el.append("circle").attr("r", d.radius).attr("fill", "#2563eb").attr("stroke", theme === 'dark' ? "#1e293b" : "#fff").attr("stroke-width", 3);
          el.append("text").attr("text-anchor", "middle").attr("dy", ".35em").attr("fill", "#fff").attr("font-size", "10px").attr("font-weight", "bold").text(d.label.substring(0, 3).toUpperCase());
        } else {
          const color = d.difficulty === 'Easy' ? '#10b981' : d.difficulty === 'Medium' ? '#f59e0b' : '#ef4444';
          el.append("rect").attr("x", -d.radius).attr("y", -d.radius).attr("width", d.radius * 2).attr("height", d.radius * 2).attr("rx", 8)
            .attr("fill", color).attr("stroke", d.isCompleted ? (theme === 'dark' ? '#fff' : '#000') : (theme === 'dark' ? '#1e293b' : '#fff')).attr("stroke-width", d.isCompleted ? 4 : 2);
          if (d.isCompleted) el.append("path").attr("d", "M-4,0 L-1,3 L4,-3").attr("fill", "none").attr("stroke", "#fff").attr("stroke-width", 2);
          if (d.isFavorite) el.append("path").attr("d", "M0,-2 L.5,-.5 L2,-.5 L1,1 L1.5,2.5 L0,1.5 L-1.5,2.5 L-1,1 L-2,-.5 L-.5,-.5 Z").attr("fill", "#fbbf24").attr("transform", `translate(${d.radius-6}, ${-d.radius+6}) scale(3)`);
        }
      });

      node.append("text").attr("dy", (d: any) => d.radius + 18).attr("text-anchor", "middle").text((d: any) => d.label).attr("class", `text-[10px] ${theme === 'dark' ? 'fill-slate-400' : 'fill-slate-600'} font-bold pointer-events-none`);

      simulation.on("tick", () => {
        link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y).attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });

      function highlight(target: any) {
        const activeIds = new Set([target.id]);
        links.forEach((l: any) => { 
          if (l.source.id === target.id) activeIds.add(l.target.id); 
          if (l.target.id === target.id) activeIds.add(l.source.id); 
        });
        node.style("opacity", (d: any) => activeIds.has(d.id) ? 1 : 0.1); 
        link.style("opacity", (l: any) => (l.source.id === target.id || l.target.id === target.id) ? 1 : 0.05).attr("stroke", (l: any) => (l.source.id === target.id || l.target.id === target.id) ? "#2563eb" : (theme === 'dark' ? "#334155" : "#e2e8f0"));
      }

      svg.on("click", () => { setSelectedNode(null); node.style("opacity", 1); link.style("opacity", 0.6); });
      simulationRef.current = simulation;
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => { 
      window.removeEventListener('resize', updateSize); 
      simulationRef.current?.stop(); 
    };
  }, [sortedAndFilteredData, isD3Loaded, viewMode, graphLayout, completed, favorites, theme, setSelectedNode, setHoveredNode]);

  const handleZoom = (type: string) => {
    if (!d3ZoomRef.current) return;
    const { zoom, svg } = d3ZoomRef.current;
    if (type === 'reset') {
      svg.transition().duration(750).call(zoom.transform, (window as any).d3.zoomIdentity);
    } else {
      svg.transition().duration(300).call(zoom.scaleBy, type === 'in' ? 1.4 : 0.6);
    }
  };

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full block" />
      <div className="absolute bottom-6 left-6 flex flex-col gap-2">
        <div className="flex gap-2 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
          <button onClick={() => setGraphLayout('force')} className={`p-2 rounded-lg transition-all cursor-pointer ${graphLayout === 'force' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`} title="Force Layout"><Network size={18}/></button>
          <button onClick={() => setGraphLayout('semantic')} className={`p-2 rounded-lg transition-all cursor-pointer ${graphLayout === 'semantic' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`} title="Semantic Layout"><LayoutTemplate size={18}/></button>
        </div>
        <div className="flex flex-col gap-1 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
          <button onClick={() => handleZoom('in')} className="p-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"><ZoomIn size={18}/></button>
          <button onClick={() => handleZoom('out')} className="p-2 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"><ZoomOut size={18}/></button>
          <button onClick={() => handleZoom('reset')} className="p-2 text-slate-500 hover:text-blue-600 transition-colors border-t border-slate-100 dark:border-slate-800 cursor-pointer"><RotateCcw size={18}/></button>
        </div>
      </div>
      {hoveredNode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-slate-700 shadow-2xl flex items-center gap-4 transition-all">
          <span className="text-blue-400">{hoveredNode.label}</span>
          {hoveredNode.type === 'question' && (<><span className="opacity-30">|</span><span className={hoveredNode.difficulty === 'Easy' ? 'text-emerald-400' : hoveredNode.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'}>{hoveredNode.difficulty}</span><span className="opacity-30">|</span><span>{hoveredNode.acceptance} Success</span></>)}
        </div>
      )}
    </div>
  );
}
