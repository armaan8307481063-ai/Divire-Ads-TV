import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteContent } from '../types.js';

interface SiteContentContextType {
  content: SiteContent | null;
  loading: boolean;
  refreshContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType>({
  content: null,
  loading: true,
  refreshContent: async () => {},
});

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/content');
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic site content, using initial layout:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();

    // Fire visitor hit counter once per tab session
    const hasVisited = sessionStorage.getItem('divire_visitor_hit');
    if (!hasVisited) {
      sessionStorage.setItem('divire_visitor_hit', 'true');
      fetch('/api/visitor-hit', { method: 'POST' }).catch(() => null);
    }
  }, [fetchContent]);

  return (
    <SiteContentContext.Provider value={{ content, loading, refreshContent: fetchContent }}>
      {children}
    </SiteContentContext.Provider>
  );
};

export const useSiteContent = () => useContext(SiteContentContext);
