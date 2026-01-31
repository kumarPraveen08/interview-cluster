import { PRESET_COMPANIES } from './constants';

export const parseCSV = (content: string, companyName: string) => {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const headers = header.split(',').map(h => h.trim());
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const getVal = (keys: string[]) => {
      const idx = headers.findIndex(h => keys.some(k => h.includes(k)));
      return idx !== -1 ? values[idx] : "";
    };

    const title = getVal(['title', 'name']);
    // Generate ID from title if not provided, or use provided ID
    const id = getVal(['id', 'number']) || `${companyName}-${title.toLowerCase().replace(/\s+/g, '-')}-${index}`;

    return {
      id: id,
      title: title,
      url: getVal(['url', 'link']),
      difficulty: getVal(['difficulty', 'level']),
      acceptance: getVal(['acceptance', 'success']),
      frequency: getVal(['frequency', 'freq']),
      companies: [companyName]
    };
  }).filter(q => q.title); // Only require title, ID is auto-generated if missing
};

export const mergeToLibrary = (prevLibrary: any[], newBatch: any[], companyName: string) => {
  const updated = [...prevLibrary];
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
};
