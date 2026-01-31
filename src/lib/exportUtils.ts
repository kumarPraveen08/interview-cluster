export const exportToJSON = (data: any[], filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToTXT = (data: any[], filename: string, type: 'library' | 'favorites' | 'completed' = 'library') => {
  const typeLabel = type === 'library' ? 'FULL MASTER LIBRARY' : type === 'favorites' ? 'FAVORITES' : 'COMPLETED';
  const header = `INTERVIEW CLUSTER EXPORT - ${typeLabel}\n------------------------------------------\n\n`;
  
  const lines = data.map((item, index) => {
    if (typeof item === 'string') {
      return item;
    }
    if (typeof item === 'object' && item !== null) {
      const difficulty = item.difficulty || 'N/A';
      const title = item.title || 'Untitled';
      const url = item.url || '';
      const companies = Array.isArray(item.companies) ? item.companies.join(',') : (item.companies || '');
      const acceptance = item.acceptance || 'N/A';
      const frequency = item.frequency || 'N/A';
      
      return `${index + 1}. [${difficulty}] ${title}
   URL: ${url}
   Companies: ${companies}
   Difficulty: ${difficulty}
   Acceptance: ${acceptance}
   Frequency: ${frequency}`;
    }
    return '';
  });
  
  const txtContent = header + lines.join('\n\n');
  const blob = new Blob([txtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  // Get all unique keys from all items
  const allKeys = new Set<string>();
  data.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      Object.keys(item).forEach(key => allKeys.add(key));
    }
  });
  
  const headers = Array.from(allKeys);
  const csvRows = [headers.join(',')];
  
  data.forEach(item => {
    if (typeof item === 'object' && item !== null) {
      const values = headers.map(header => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return `"${value.join('; ')}"`;
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return String(value);
      });
      csvRows.push(values.join(','));
    }
  });
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const getExportData = (type: 'library' | 'favorites' | 'completed', masterLibrary: any[], favorites: string[], completed: string[]) => {
  if (type === 'library') {
    return masterLibrary;
  } else if (type === 'favorites') {
    return masterLibrary.filter(q => favorites.includes(q.id));
  } else if (type === 'completed') {
    return masterLibrary.filter(q => completed.includes(q.id));
  }
  return [];
};
