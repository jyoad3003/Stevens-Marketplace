import { useEffect } from 'react';

/**
 * Custom hook to dynamically update the document title (browser tab).
 * @param {string} title - The specific page title (e.g., 'Explore', 'Profile')
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    // If a title is provided, format it. Otherwise, use the default.
    document.title = title ? `${title} | Stevens Marketplace` : 'Stevens Marketplace';
    
    // Optional: Reset title when component unmounts (useful if they navigate to a page without the hook)
    return () => {
      document.title = 'Stevens Marketplace';
    };
  }, [title]);
};

export default useDocumentTitle;
