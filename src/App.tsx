import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  STORAGE_KEY,
  FAVORITES_KEY,
  COMPLETED_KEY,
  THEME_KEY,
  COMPANIES_KEY,
  GITHUB_REPO_BASE,
  PRESET_COMPANIES,
  PAGE_SIZE,
  GITHUB_REPO_URL
} from './lib/constants';
import { parseCSV, mergeToLibrary } from './lib/utils';
import { useD3Loader } from './hooks/useD3Loader';
import { exportToJSON, exportToTXT, exportToCSV, getExportData } from './lib/exportUtils';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import Sidebar from './components/Sidebar';
import GraphView from './components/GraphView';
import ListView from './components/ListView';
import ImporterModal from './components/ImporterModal';
import Legend from './components/Legend';
import EmptyState from './components/EmptyState';
import Footer from './components/Footer';

export default function App() {
  // --- 1. STATE MANAGEMENT ---
  const [masterLibrary, setMasterLibrary] = useState<any[]>([]); 
  const [favorites, setFavorites] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeCompanies, setActiveCompanies] = useState<string[]>([]);
  const [theme, setTheme] = useState('light');
  const [repoStars, setRepoStars] = useState(0);
  
  const [activeTab, setActiveTab] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]); // For filtering
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('list');
  const [graphLayout, setGraphLayout] = useState<'force' | 'semantic'>('force'); 
  
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  const [showImporter, setShowImporter] = useState(false);
  const [importCompany, setImportCompany] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [companyModalSearch, setCompanyModalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

  const isD3Loaded = useD3Loader();
  const observerTarget = useRef<HTMLDivElement>(null);

  // --- 2. LOGIC & HELPERS ---
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleFavorite = (id: string) => setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  const toggleCompleted = (id: string) => setCompleted(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);

  const removeCompany = (companyName: string) => {
    setActiveCompanies(prev => prev.filter(c => c !== companyName));
    if (selectedNode?.type === 'company' && selectedNode.label === companyName) {
      setSelectedNode(null);
    }
  };

  // --- 3. FILTERING & SORTING ---
  const sortedAndFilteredData = useMemo(() => {
    let result = masterLibrary.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
      
      let matchesTab = true;
      if (activeTab === 'all') {
        // Only show items that belong to at least one ACTIVE company AND at least one SELECTED company
        matchesTab = q.companies.some((c: string) => activeCompanies.includes(c));
        // Company filter: question must have at least one selected company
        // If all companies are unselected (selectedCompanies.length === 0), show nothing
        const matchesCompany = selectedCompanies.length > 0 && q.companies.some((c: string) => selectedCompanies.includes(c));
        return matchesSearch && matchesDifficulty && matchesTab && matchesCompany;
      } else if (activeTab === 'favorites') {
        // Show IF favorited, regardless of company selection (favorites persist even if company removed)
        matchesTab = favorites.includes(q.id);
        return matchesSearch && matchesDifficulty && matchesTab;
      } else if (activeTab === 'completed') {
        // Show IF completed, regardless of company selection (completed persist even if company removed)
        matchesTab = completed.includes(q.id);
        return matchesSearch && matchesDifficulty && matchesTab;
      }
      return matchesSearch && matchesDifficulty && matchesTab;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA: any = a[sortConfig.key];
        let valB: any = b[sortConfig.key];

        if (['acceptance', 'frequency'].includes(sortConfig.key)) {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [searchTerm, difficultyFilter, activeTab, masterLibrary, activeCompanies, favorites, completed, sortConfig, selectedCompanies]);

  const displayedData = useMemo(() => sortedAndFilteredData.slice(0, visibleCount), [sortedAndFilteredData, visibleCount]);

  const allCompaniesMaster = useMemo(() => {
    return [...new Set(masterLibrary.flatMap(q => q.companies))].sort();
  }, [masterLibrary]);

  const filteredPresets = useMemo(() => {
    return PRESET_COMPANIES.filter(c => c.name.toLowerCase().includes(companyModalSearch.toLowerCase()));
  }, [companyModalSearch]);

  const requestSort = (key: string) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

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
    if (savedActiveComps) {
      const companies = JSON.parse(savedActiveComps);
      setActiveCompanies(companies);
      // Initialize selectedCompanies with all active companies by default
      setSelectedCompanies(companies);
    }
    if (savedTheme) setTheme(savedTheme);

    fetch(GITHUB_REPO_URL).then(res => res.json()).then(data => setRepoStars(data.stargazers_count || 0)).catch(() => {});
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

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchTerm, difficultyFilter, activeTab, sortConfig, selectedCompanies]);

  // Update selectedCompanies when activeCompanies changes - default to all selected
  useEffect(() => {
    if (activeCompanies.length > 0) {
      setSelectedCompanies(prev => {
        // If no companies are selected yet, select all active companies (default behavior)
        if (prev.length === 0) {
          return [...activeCompanies];
        }
        // Otherwise, only add new companies that aren't already selected
        const newCompanies = activeCompanies.filter(c => !prev.includes(c));
        return newCompanies.length > 0 ? [...prev, ...newCompanies] : prev;
      });
    } else {
      setSelectedCompanies([]);
    }
  }, [activeCompanies]);

  // --- HANDLERS ---
  const handleManualImport = () => {
    if (!importCompany || !csvContent) return;
    const data = parseCSV(csvContent, importCompany);
    setMasterLibrary(prev => mergeToLibrary(prev, data, importCompany));
    setActiveCompanies(prev => {
      if (prev.includes(importCompany)) return prev;
      const updated = [...prev, importCompany];
      // Automatically select the new company
      setSelectedCompanies(selected => selected.includes(importCompany) ? selected : [...selected, importCompany]);
      return updated;
    });
    setCsvContent('');
    setImportCompany('');
    setShowImporter(false);
  };

  const fetchFromGithub = async (company: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${GITHUB_REPO_BASE}/${company.value}/${company.file}`);
      if (!response.ok) throw new Error("Fetch failed");
      const data = parseCSV(await response.text(), company.name);
      setMasterLibrary(prev => mergeToLibrary(prev, data, company.name));
      setActiveCompanies(prev => {
        if (prev.includes(company.name)) return prev;
        const updated = [...prev, company.name];
        // Automatically select the new company
        setSelectedCompanies(selected => selected.includes(company.name) ? selected : [...selected, company.name]);
        return updated;
      });
      setShowImporter(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Export handlers
  const handleExport = (type: 'library' | 'favorites' | 'completed', format: 'json' | 'txt' | 'csv') => {
    const data = getExportData(type, masterLibrary, favorites, completed);
    const typeName = type === 'library' ? 'master' : type;
    const filename = `leetcode_${typeName}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'json') {
      exportToJSON(data, filename);
    } else if (format === 'txt') {
      exportToTXT(data, filename, type);
    } else if (format === 'csv') {
      exportToCSV(data, filename);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setShowImporter={setShowImporter}
        setIsSidebarOpen={setIsSidebarOpen}
        repoStars={repoStars}
      />

      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        questionsCount={masterLibrary.filter(q => q.companies.some((c: string) => activeCompanies.includes(c))).length}
        favoritesCount={favorites.length}
        completedCount={completed.length}
      />

      <main className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          allCompanies={activeCompanies}
          selectedCompanies={selectedCompanies}
          setSelectedCompanies={setSelectedCompanies}
          removeCompany={removeCompany}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          favorites={favorites}
          completed={completed}
          toggleFavorite={toggleFavorite}
          toggleCompleted={toggleCompleted}
          questions={masterLibrary}
          theme={theme}
          handleExport={handleExport}
        />

        <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 w-full overflow-hidden transition-colors duration-300">
          {isSidebarOpen && (
            <div 
              className="lg:hidden absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {masterLibrary.length === 0 ? (
            <EmptyState setShowImporter={setShowImporter} />
          ) : viewMode === 'graph' ? (
            <GraphView
              sortedAndFilteredData={sortedAndFilteredData}
              isD3Loaded={isD3Loaded}
              viewMode={viewMode}
              completed={completed}
              favorites={favorites}
              theme={theme}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              hoveredNode={hoveredNode}
              setHoveredNode={setHoveredNode}
              graphLayout={graphLayout}
              setGraphLayout={setGraphLayout}
            />
          ) : (
            <ListView
              sortedAndFilteredData={displayedData}
              completed={completed}
              favorites={favorites}
              toggleCompleted={toggleCompleted}
              toggleFavorite={toggleFavorite}
              sortConfig={sortConfig}
              requestSort={requestSort}
              activeCompanies={selectedCompanies}
              observerTarget={observerTarget}
              hasMore={displayedData.length < sortedAndFilteredData.length}
              totalCount={sortedAndFilteredData.length}
            />
          )}

          {viewMode === 'graph' && <Legend />}
        </div>
      </main>

      <Footer />

      <ImporterModal
        showImporter={showImporter}
        setShowImporter={setShowImporter}
        importCompany={importCompany}
        setImportCompany={setImportCompany}
        csvContent={csvContent}
        setCsvContent={setCsvContent}
        companyModalSearch={companyModalSearch}
        setCompanyModalSearch={setCompanyModalSearch}
        handleManualImport={handleManualImport}
        fetchFromGithub={fetchFromGithub}
        isLoading={isLoading}
        allCompanies={activeCompanies}
        filteredPresets={filteredPresets}
      />
    </div>
  );
}
