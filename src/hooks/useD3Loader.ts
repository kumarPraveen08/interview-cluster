import { useState, useEffect } from 'react';

export function useD3Loader() {
  const [isD3Loaded, setIsD3Loaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js";
    script.onload = () => setIsD3Loaded(true);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  return isD3Loaded;
}
