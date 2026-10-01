import { useEffect } from 'react';

/**
 * Custom hook to dynamically update the document title.
 * 
 * @param {string} title The title to set in the browser tab.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);
}
