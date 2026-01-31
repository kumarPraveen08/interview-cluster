import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Network, 
  List, 
  Info,
  Users,
  Briefcase, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Github, 
  X, 
  FileText, 
  RefreshCw, 
  Link as LinkIcon, 
  ArrowUp, 
  ArrowDown, 
  Menu, 
  Star, 
  CheckCircle2, 
  Circle, 
  Moon, 
  Sun, 
  Loader2,
  ChevronDown,
  LayoutTemplate,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// --- CONFIG ---
const GITHUB_REPO_BASE = "https://raw.githubusercontent.com/snehasishroy/leetcode-companywise-interview-questions/refs/heads/master/";
const GITHUB_API_URL = "https://api.github.com/repos/snehasishroy/leetcode-companywise-interview-questions";
const STORAGE_KEY = 'leetcode_master_library_v4'; 
const FAVORITES_KEY = 'leetcode_favorites_v4';
const COMPLETED_KEY = 'leetcode_completed_v4';
const THEME_KEY = 'leetcode_theme_v4';
const COMPANIES_KEY = 'leetcode_active_companies_v4';
const PAGE_SIZE = 40;

const PRESET_COMPANIES = [
    { "name": "1kosmos", "file": "all.csv", "value": "1kosmos" },
    { "name": "6sense", "file": "all.csv", "value": "6sense" },
    { "name": "adobe", "file": "all.csv", "value": "adobe" },
    { "name": "airbnb", "file": "all.csv", "value": "airbnb" },
    { "name": "amazon", "file": "all.csv", "value": "amazon" },
    { "name": "apple", "file": "all.csv", "value": "apple" },
    { "name": "atlassian", "file": "all.csv", "value": "atlassian" },
    { "name": "bloomberg", "file": "all.csv", "value": "bloomberg" },
    { "name": "bytedance", "file": "all.csv", "value": "bytedance" },
    { "name": "cisco", "file": "all.csv", "value": "cisco" },
    { "name": "coinbase", "file": "all.csv", "value": "coinbase" },
    { "name": "doordash", "file": "all.csv", "value": "doordash" },
    { "name": "facebook", "file": "all.csv", "value": "facebook" },
    { "name": "google", "file": "all.csv", "value": "google" },
    { "name": "jpmorgan", "file": "all.csv", "value": "jpmorgan" },
    { "name": "linkedin", "file": "all.csv", "value": "linkedin" },
    { "name": "microsoft", "file": "all.csv", "value": "microsoft" },
    { "name": "netflix", "file": "all.csv", "value": "netflix" },
    { "name": "nvidia", "file": "all.csv", "value": "nvidia" },
    { "name": "oracle", "file": "all.csv", "value": "oracle" },
    { "name": "paypal", "file": "all.csv", "value": "paypal" },
    { "name": "salesforce", "file": "all.csv", "value": "salesforce" },
    { "name": "snapchat", "file": "all.csv", "value": "snapchat" },
    { "name": "snowflake", "file": "all.csv", "value": "snowflake" },
    { "name": "spotify", "file": "all.csv", "value": "spotify" },
    { "name": "stripe", "file": "all.csv", "value": "stripe" },
    { "name": "tesla", "file": "all.csv", "value": "tesla" },
    { "name": "tiktok", "file": "all.csv", "value": "tiktok" },
    { "name": "twitter", "file": "all.csv", "value": "twitter" },
    { "name": "uber", "file": "all.csv", "value": "uber" },
    { "name": "walmart-labs", "file": "all.csv", "value": "walmart-labs" }
];

export default function App() {
  // --- 1. STATE MANAGEMENT ---
  const [masterLibrary, setMasterLibrary] = useState([]); 
  const [favorites, setFavorites] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [activeCompanies, setActiveCompanies] = useState([]);
  const [theme, setTheme] = useState('light');
  const [repoStars, setRepoStars] = useState(0);
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list');
  const [graphLayout, setGraphLayout] = useState('force'); 
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isD3Loaded, setIsD3Loaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  const [showImporter, setShowImporter] = useState(false);
  const [importCompany, setImportCompany] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [companyModalSearch, setCompanyModalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const observerTarget = useRef(null);
  const d3ZoomRef = useRef(null);

  // --- 2. LOGIC & HELPERS ---
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  const toggleCompleted = (id) => setCompleted(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);

  const removeCompany = (companyName) => {
    setActiveCompanies(prev => prev.filter(c => c !== companyName));
    if (selectedNode?.type === 'company' && selectedNode.label === companyName) {
      setSelectedNode(null);
    }
  };

  const parseCSV = (content, companyName) => {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return [];
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const getVal = (keys) => {
        const idx = headers.findIndex(h => keys.some(k => h.includes(k)));
        return idx !== -1 ? values[idx] : "";
      };
      return {
        id: getVal(['id', 'number']),
        title: getVal(['title', 'name']),
        url: getVal(['url', 'link']),
        difficulty: getVal(['difficulty', 'level']),
        acceptance: getVal(['acceptance', 'success']),
        frequency: getVal(['frequency', 'freq']),
        companies: [companyName]
      };
    }).filter(q => q.id && q.title);
  };

  const mergeToLibrary = (newBatch, companyName) => {
    setMasterLibrary(prev => {
      const updated = [...prev];
      newBatch.forEach(newQ => {
        const existingIdx = updated.findIndex(q => q.id.toString() === newQ.id.toString());
        if (existingIdx !== -1) {
          if (!updated[existingIdx].companies.includes(companyName)) {
            updated[existingIdx].companies = [...updated[existingIdx].companies, companyName];
          }
        } else {
          updated.push(newQ);
        }
      });
      return updated;
    });
    setActiveCompanies(prev => prev.includes(companyName) ? prev : [...prev, companyName]);
  };

  // --- 3. FILTERING & SORTING ---
  const sortedAndFilteredData = useMemo(() => {
    let result = masterLibrary.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      
      let matchesTab = true;
      if (activeTab === 'all') {
        // Only show items that belong to at least one ACTIVE company
        matchesTab = q.companies.some(c => activeCompanies.includes(c));
      } else if (activeTab === 'favorites') {
        // Show IF favorited, regardless of company link status
        matchesTab = favorites.includes(q.id);
      } else if (activeTab === 'completed') {
        // Show IF completed, regardless of company link status
        matchesTab = completed.includes(q.id);
      }
      return matchesSearch && matchesDifficulty && matchesTab;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key], valB = b[sortConfig.key];
        if (['acceptance', 'frequency'].includes(sortConfig.key)) {
          valA = parseFloat(valA) || 0; valB = parseFloat(valB) || 0;
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [searchTerm, difficultyFilter, activeTab, masterLibrary, activeCompanies, favorites, completed, sortConfig]);

  const displayedData = useMemo(() => sortedAndFilteredData.slice(0, visibleCount), [sortedAndFilteredData, visibleCount]);

  const allCompaniesMaster = useMemo(() => {
    return [...new Set(masterLibrary.flatMap(q => q.companies))].sort();
  }, [masterLibrary]);

  const filteredPresets = useMemo(() => {
    return PRESET_COMPANIES.filter(c => c.name.toLowerCase().includes(companyModalSearch.toLowerCase()));
  }, [companyModalSearch]);

  const requestSort = (key) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUp size={12} className="opacity-0 group-hover:opacity-30 transition-opacity ml-1" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="ml-1 text-blue-600" /> : <ArrowDown size={12} className="ml-1 text-blue-600" />;
  };

  // --- 4. PERSISTENCE ---
  useEffect(() => {
    const savedLib = localStorage.getItem(STORAGE_KEY);
    const savedFavs = localStorage.getItem(FAVORITES_KEY);
    const savedComps = localStorage.getItem(COMPLETED_KEY);
    const savedActiveComps = localStorage.getItem(COMPANIES_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    if (savedLib) setMasterLibrary(JSON.parse(savedLib));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedComps) setCompleted(JSON.parse(savedComps));
    if (savedActiveComps) setActiveCompanies(JSON.parse(savedActiveComps));
    if (savedTheme) setTheme(savedTheme);

    fetch(GITHUB_API_URL).then(res => res.json()).then(data => setRepoStars(data.stargazers_count || 0)).catch(() => {});
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(masterLibrary)); }, [masterLibrary]);
  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem(COMPLETED_KEY, JSON.stringify(completed)); }, [completed]);
  useEffect(() => { localStorage.setItem(COMPANIES_KEY, JSON.stringify(activeCompanies)); }, [activeCompanies]);
  
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // --- 5. INFINITE SCROLL OBSERVER ---
  useEffect(() => {
    if (viewMode !== 'list' || sortedAndFilteredData.length <= visibleCount) return;

    const options = { root: null, rootMargin: '100px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, sortedAndFilteredData.length));
      }
    }, options);

    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [viewMode, sortedAndFilteredData.length, visibleCount]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchTerm, difficultyFilter, activeTab, sortConfig]);

  // --- 6. D3 GRAPH ENGINE ---
  useEffect(() => {
    if (!isD3Loaded || viewMode !== 'graph' || !svgRef.current || sortedAndFilteredData.length === 0) {
      if (svgRef.current) window.d3?.select(svgRef.current).selectAll("*").remove();
      return;
    }

    const d3 = window.d3;
    const updateSize = () => {
      if (!svgRef.current) return;
      const width = svgRef.current.clientWidth, height = svgRef.current.clientHeight;
      d3.select(svgRef.current).selectAll("*").remove();

      const nodes = [], links = [];
      sortedAndFilteredData.forEach(q => {
        nodes.push({ 
          id: `q-${q.id}`, label: q.title, type: 'question', difficulty: q.difficulty, 
          acceptance: q.acceptance, frequency: q.frequency, url: q.url, 
          isCompleted: completed.includes(q.id), isFavorite: favorites.includes(q.id),
          radius: 12 + (parseFloat(q.frequency) || 0) / 10 
        });
      });

      const activeCompsInFiltered = new Set(sortedAndFilteredData.flatMap(q => q.companies));
      Array.from(activeCompsInFiltered).sort().forEach(name => { 
        nodes.push({ id: `c-${name}`, label: name, type: 'company', radius: 24 }); 
      });
      
      sortedAndFilteredData.forEach(q => { 
        q.companies.forEach(company => { 
          if (activeCompsInFiltered.has(company)) { 
            links.push({ source: `q-${q.id}`, target: `c-${company}`, frequency: parseFloat(q.frequency) || 0 }); 
          } 
        }); 
      });

      const svg = d3.select(svgRef.current), g = svg.append("g");
      const zoom = d3.zoom().scaleExtent([0.1, 5]).on("zoom", (e) => g.attr("transform", e.transform));
      svg.call(zoom);
      d3ZoomRef.current = { zoom, svg };

      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(140).strength(0.5))
        .force("charge", d3.forceManyBody().strength(-600))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => d.radius + 40));

      if (graphLayout === 'semantic') {
        simulation.force("x", d3.forceX(d => d.type === 'company' ? width * 0.2 : width * 0.8).strength(1)).force("y", d3.forceY(height / 2).strength(0.1));
      }

      const link = g.append("g").selectAll("line").data(links).join("line")
        .attr("stroke", theme === 'dark' ? "#334155" : "#e2e8f0").attr("stroke-width", d => Math.max(1, d.frequency / 20)).attr("stroke-opacity", 0.6);

      const node = g.append("g").selectAll("g").data(nodes).join("g").attr("class", "cursor-pointer")
        .call(d3.drag().on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }).on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; }).on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }))
        .on("click", (e, d) => { e.stopPropagation(); setSelectedNode(d); highlight(d); })
        .on("mouseenter", (e, d) => setHoveredNode(d))
        .on("mouseleave", () => setHoveredNode(null));

      node.each(function(d) {
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

      node.append("text").attr("dy", d => d.radius + 18).attr("text-anchor", "middle").text(d => d.label).attr("class", `text-[10px] ${theme === 'dark' ? 'fill-slate-400' : 'fill-slate-600'} font-bold pointer-events-none`);

      simulation.on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

      function highlight(target) {
        const activeIds = new Set([target.id]); links.forEach(l => { if (l.source.id === target.id) activeIds.add(l.target.id); if (l.target.id === target.id) activeIds.add(l.source.id); });
        node.style("opacity", d => activeIds.has(d.id) ? 1 : 0.1); 
        link.style("opacity", l => (l.source.id === target.id || l.target.id === target.id) ? 1 : 0.05).attr("stroke", l => (l.source.id === target.id || l.target.id === target.id) ? "#2563eb" : (theme === 'dark' ? "#334155" : "#e2e8f0"));
      }

      svg.on("click", () => { setSelectedNode(null); node.style("opacity", 1); link.style("opacity", 0.6); });
      simulationRef.current = simulation;
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => { window.removeEventListener('resize', updateSize); simulationRef.current?.stop(); };
  }, [sortedAndFilteredData, isD3Loaded, viewMode, graphLayout, completed, favorites, theme]);

  // --- HANDLERS ---
  const handleZoom = (type) => {
    if (!d3ZoomRef.current) return;
    const { zoom, svg } = d3ZoomRef.current;
    if (type === 'reset') svg.transition().duration(750).call(zoom.transform, window.d3.zoomIdentity);
    else svg.transition().duration(300).call(zoom.scaleBy, type === 'in' ? 1.4 : 0.6);
  };

  const handleManualImport = () => {
    if (!importCompany || !csvContent) return;
    mergeToLibrary(parseCSV(csvContent, importCompany), importCompany);
    setCsvContent(''); setImportCompany(''); setShowImporter(false);
  };

  const fetchFromRepo = async (company) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${GITHUB_REPO_BASE}/${company.value}/${company.file}`);
      if (!response.ok) throw new Error("Fetch failed");
      mergeToLibrary(parseCSV(await response.text(), company.name), company.name);
      setShowImporter(false);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const loadD3 = () => {
     const script = document.createElement('script');
     script.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js";
     script.onload = () => setIsD3Loaded(true);
     document.head.appendChild(script);
  };

  useEffect(() => { loadD3(); }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between z-30 shadow-sm gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"><Menu size={20} /></button>
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg"><Github className="text-white" size={20} /></div>
            <div className="hidden sm:block">
              <h1 className="text-sm sm:text-lg font-black tracking-tight uppercase">Interview Cluster</h1>
              <a href="https://github.com/snehasishroy/leetcode-companywise-interview-questions" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-widest">
                By @snehasishroy <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[8px] text-slate-500"><Star size={10} fill="currentColor" /> {repoStars} Stars</div>
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <button onClick={toggleTheme} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
            <button onClick={() => setShowImporter(true)} className="bg-slate-900 dark:bg-blue-600 text-white p-2.5 rounded-xl shadow-lg"><Plus size={20} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button onClick={toggleTheme} className="hidden sm:flex p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex flex-1 sm:flex-none">
            <button onClick={() => setViewMode('graph')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'graph' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}><Network size={16} /> <span className="hidden sm:inline">Graph</span></button>
            <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}><List size={16} /> <span className="hidden sm:inline">List</span></button>
          </div>
          <button onClick={() => setShowImporter(true)} className="hidden sm:flex bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-black dark:hover:bg-blue-500 transition-colors shadow-lg"><Plus size={18} /> Add Source</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex gap-4 sm:gap-8 z-20 overflow-x-auto no-scrollbar shrink-0">
        {[
          { id: 'all', label: 'All Library', icon: Briefcase, count: masterLibrary.filter(q => q.companies.some(c => activeCompanies.includes(c))).length },
          { id: 'favorites', label: 'Favorites', icon: Star, count: favorites.length },
          { id: 'completed', label: 'Completed', icon: CheckCircle2, count: completed.length }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 shrink-0 ${activeTab === tab.id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <Icon size={14} fill={tab.id === 'favorites' && activeTab === 'favorites' ? 'currentColor' : 'none'} />
              {tab.label} <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      <main className="flex-1 flex overflow-hidden relative">
        <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shrink-0`}>
          <div className="flex justify-between items-center lg:hidden"><h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Dashboard</h2><button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
          
          <section>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Quick Search</label>
            <div className="relative"><Search className="absolute left-3 top-3 text-slate-300 dark:text-slate-600" size={18} /><input type="text" placeholder="Find a problem..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </section>
          <section>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Difficulty Filter</label>
            <div className="grid grid-cols-2 gap-2">{['All', 'Easy', 'Medium', 'Hard'].map(d => (<button key={d} onClick={() => setDifficultyFilter(d)} className={`py-2 rounded-lg text-xs font-bold border transition-all ${difficultyFilter === d ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'}`}>{d}</button>))}</div>
          </section>
          <section className="flex-1 overflow-y-auto custom-scrollbar">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Linked Companies</label>
             <div className="space-y-2">
               {activeCompanies.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">No companies active.</p>}
               {activeCompanies.map(c => (<div key={c} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group"><span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 truncate pr-2"><div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> {c}</span><button onClick={() => removeCompany(c)} className="text-slate-300 hover:text-rose-500 transition-all shrink-0"><Trash2 size={14} /></button></div>))}
             </div>
          </section>
          {selectedNode && (
            <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-5 text-white animate-in slide-in-from-bottom-4 shadow-2xl mt-auto border border-slate-800 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-base leading-tight">
                    {selectedNode.type === 'question' ? (<a href={selectedNode.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 max-w-full"><span className="truncate">{selectedNode.label}</span> <ExternalLink size={14} className="shrink-0" /></a>) : selectedNode.label}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedNode.type === 'question' && (<button onClick={() => toggleFavorite(selectedNode.id.split('-').pop())} className={`p-1 rounded transition-colors ${favorites.includes(selectedNode.id.split('-').pop()) ? 'text-amber-400' : 'text-slate-500'}`}><Star size={18} fill={favorites.includes(selectedNode.id.split('-').pop()) ? "currentColor" : "none"} /></button>)}
                  <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white"><X size={18}/></button>
                </div>
              </div>
              {selectedNode.type === 'question' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button onClick={() => toggleCompleted(selectedNode.id.split('-').pop())} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${completed.includes(selectedNode.id.split('-').pop()) ? 'bg-emerald-500 text-white' : 'bg-slate-800 dark:bg-slate-700 text-slate-400 hover:text-white'}`}>{completed.includes(selectedNode.id.split('-').pop()) ? <CheckCircle2 size={14} /> : <Circle size={14} />} {completed.includes(selectedNode.id.split('-').pop()) ? 'Completed' : 'Mark Done'}</button>
                    <span className="text-blue-400 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest">{selectedNode.difficulty}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2"><div className="bg-slate-800 dark:bg-slate-900 p-2 rounded-xl text-center"><div className="text-[8px] text-slate-500 mb-0.5 uppercase font-bold">Success</div><div className="text-xs font-bold">{selectedNode.acceptance}</div></div><div className="bg-slate-800 dark:bg-slate-900 p-2 rounded-xl text-center"><div className="text-[8px] text-slate-500 mb-0.5 uppercase font-bold">Frequency</div><div className="text-xs font-bold">{selectedNode.frequency}</div></div></div>
                </div>
              ) : <div className="text-xs text-slate-400 italic">Explore cluster nodes for details.</div>}
            </div>
          )}
        </aside>

        <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 w-full overflow-hidden transition-colors duration-300">
           {isSidebarOpen && <div className="lg:hidden absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30" onClick={() => setIsSidebarOpen(false)} />}
           
           {viewMode === 'graph' ? (
             <div className="w-full h-full relative">
                <svg ref={svgRef} className="w-full h-full block" />
                <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                   <div className="flex gap-2 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
                      <button onClick={() => setGraphLayout('force')} className={`p-2 rounded-lg transition-all ${graphLayout === 'force' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`} title="Force Layout"><Network size={18}/></button>
                      <button onClick={() => setGraphLayout('semantic')} className={`p-2 rounded-lg transition-all ${graphLayout === 'semantic' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`} title="Semantic Layout"><LayoutTemplate size={18}/></button>
                   </div>
                   <div className="flex flex-col gap-1 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
                      <button onClick={() => handleZoom('in')} className="p-2 text-slate-500 hover:text-blue-600 transition-colors"><ZoomIn size={18}/></button>
                      <button onClick={() => handleZoom('out')} className="p-2 text-slate-500 hover:text-blue-600 transition-colors"><ZoomOut size={18}/></button>
                      <button onClick={() => handleZoom('reset')} className="p-2 text-slate-500 hover:text-blue-600 transition-colors border-t border-slate-100 dark:border-slate-800"><RotateCcw size={18}/></button>
                   </div>
                </div>
                {hoveredNode && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border border-slate-700 shadow-2xl flex items-center gap-4 transition-all">
                    <span className="text-blue-400">{hoveredNode.label}</span>
                    {hoveredNode.type === 'question' && (<><span className="opacity-30">|</span><span className={hoveredNode.difficulty === 'Easy' ? 'text-emerald-400' : hoveredNode.difficulty === 'Medium' ? 'text-amber-400' : 'text-rose-400'}>{hoveredNode.difficulty}</span><span className="opacity-30">|</span><span>{hoveredNode.acceptance} Success</span></>)}
                  </div>
                )}
             </div>
           ) : (
             <div className="p-4 sm:p-10 h-full overflow-y-auto custom-scrollbar">
                <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left min-w-[700px]">
                       <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-black text-[10px] text-slate-400 uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm">
                         <tr>
                           <th className="px-4 py-4 w-24">Status</th>
                           <th className="px-4 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => requestSort('title')}><div className="flex items-center">Problem <SortIcon columnKey="title" /></div></th>
                           <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => requestSort('difficulty')}><div className="flex items-center">Difficulty <SortIcon columnKey="difficulty" /></div></th>
                           <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => requestSort('acceptance')}><div className="flex items-center">Success <SortIcon columnKey="acceptance" /></div></th>
                           <th className="px-6 py-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onClick={() => requestSort('frequency')}><div className="flex items-center justify-end">Frequency <SortIcon columnKey="frequency" /></div></th>
                           <th className="px-6 py-4 text-center w-10">URL</th>
                         </tr>
                       </thead>
                       <tbody className="text-xs sm:text-sm">
                         {displayedData.map(q => (
                           <tr key={q.id} className={`border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${completed.includes(q.id) ? 'opacity-60 bg-slate-50/50' : ''}`}>
                             <td className="px-4 py-4"><div className="flex items-center gap-2"><button onClick={() => toggleCompleted(q.id)} className={`transition-colors ${completed.includes(q.id) ? 'text-emerald-500' : 'text-slate-200 dark:text-slate-700 hover:text-slate-300'}`}><CheckCircle2 size={18} /></button><button onClick={() => toggleFavorite(q.id)} className={`transition-colors ${favorites.includes(q.id) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700 hover:text-slate-300'}`}><Star size={18} fill={favorites.includes(q.id) ? "currentColor" : "none"} /></button></div></td>
                             <td className="px-4 py-4">
                               <div className={`font-bold transition-all ${completed.includes(q.id) ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>{q.title}</div>
                               <div className="flex flex-wrap gap-1 mt-1">{q.companies.map(c => <span key={c} className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${activeCompanies.includes(c) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700'}`}>{c}</span>)}</div>
                             </td>
                             <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${q.difficulty === 'Easy' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : q.difficulty === 'Medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>{q.difficulty}</span></td>
                             <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{q.acceptance}</td>
                             <td className="px-6 py-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{q.frequency}</td>
                             <td className="px-6 py-4 text-center">{q.url && <a href={q.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors inline-block"><ExternalLink size={16} /></a>}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                     <div ref={observerTarget} className="h-20 flex justify-center items-center">
                        {displayedData.length < sortedAndFilteredData.length ? (<Loader2 className="animate-spin text-blue-600" size={24} />) : sortedAndFilteredData.length > 0 ? (<span className="text-[10px] font-black uppercase tracking-widest opacity-30">End of records</span>) : null}
                     </div>
                   </div>
                </div>
             </div>
           )}

           <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-2 pointer-events-none z-20 scale-75 sm:scale-100 origin-top-right">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 pointer-events-auto transition-colors">
                 <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-blue-600" /><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Company</span></div>
                 <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-emerald-500" /><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Easy</span></div>
                 <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-amber-500" /><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Medium</span></div>
                 <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-md bg-rose-500" /><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Hard</span></div>
              </div>
           </div>
        </div>
      </main>

      <footer className="hidden sm:flex bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-2 justify-between items-center z-30 transition-colors">
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span>Data Source: GitHub / snehasishroy</span><span className="flex items-center gap-1"><Star size={10} fill="currentColor"/> {repoStars} Stars on main repo</span></div>
        <a href="https://github.com/snehasishroy/leetcode-companywise-interview-questions" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter hover:underline transition-all">Support project with a star <Star size={12} fill="currentColor" /></a>
      </footer>

      {showImporter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 transition-colors overflow-hidden">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3"><div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400"><LinkIcon size={20}/></div><h2 className="text-xl font-bold">Import Source</h2></div>
              <button onClick={() => setShowImporter(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-8">
                <section>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Popular Presets</label>
                    <div className="relative w-full md:w-64"><Search className="absolute left-2 top-2.5 text-slate-400" size={14} /><input type="text" placeholder="Search companies..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-200" value={companyModalSearch} onChange={(e) => setCompanyModalSearch(e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                    {filteredPresets.length > 0 ? (
                      filteredPresets.slice(0, 48).map(company => (
                        <button key={company.name} onClick={() => fetchFromRepo(company)} disabled={isLoading} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all gap-1 sm:gap-2 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300`}>
                          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                          <span className="text-[10px] sm:text-xs font-bold truncate w-full px-1">{company.name}</span>
                        </button>
                      ))
                    ) : <div className="col-span-full py-8 text-center text-slate-400 text-xs italic">No matching presets.</div>}
                  </div>
                </section>
                <div className="flex items-center gap-4 py-2"><div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div><span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase shrink-0">Manual Import</span><div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div></div>
                <section className="space-y-4 pb-4">
                  <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Company Name</label><input type="text" placeholder="e.g. Netflix..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200" value={importCompany} onChange={(e) => setImportCompany(e.target.value)} /></div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">CSV Raw Text</label><textarea className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-mono h-24 sm:h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200" placeholder="Paste ID,Title,Acceptance... here" value={csvContent} onChange={(e) => setCsvContent(e.target.value)} /></div>
                  <button onClick={handleManualImport} disabled={!importCompany || !csvContent} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-black dark:hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20">Sync Data</button>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}