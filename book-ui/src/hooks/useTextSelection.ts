/**
 * useTextSelection Hook
 *
 * Custom React hook to detect and track text selection on the page.
 * Uses the browser's Selection API to monitor when users select text.
 *
 * T049: Implement useTextSelection() custom hook with window.getSelection() API
 * T050: Add event listeners for selectionchange in useEffect
 *
 * @returns {Object} - Contains selectedText and selectionRange
 */

import { useState, useEffect } from 'react';

interface UseTextSelectionReturn {
  selectedText: string;
  selectionRange: Range | null;
}

const useTextSelection = (): UseTextSelectionReturn => {
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  useEffect(() => {
    /**
     * Handle selection change events.
     * Extracts selected text and stores the range for positioning.
     */
    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        setSelectedText('');
        setSelectionRange(null);
        return;
      }

      const text = selection.toString().trim();

      // Only update if there's actual text selected (min 3 characters)
      if (text.length >= 3) {
        setSelectedText(text);
        setSelectionRange(selection.getRangeAt(0));
      } else {
        setSelectedText('');
        setSelectionRange(null);
      }
    };

    // Add event listener for selection changes
    document.addEventListener('selectionchange', handleSelectionChange);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  return {
    selectedText,
    selectionRange,
  };
};

export default useTextSelection;
