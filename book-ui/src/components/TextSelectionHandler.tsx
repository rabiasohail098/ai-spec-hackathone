/**
 * TextSelectionHandler Component
 *
 * Handles text selection detection and displays action buttons for AI assistance.
 * This component wraps MDX content and provides inline AI features:
 * - Summarize selected text
 * - Explain in simple terms
 * - Generate mind map
 * - Extract key points
 *
 * T048: Create TextSelectionHandler component
 */

import React, { useEffect, useState, useRef } from 'react';
import ActionButtons from './ActionButtons';
import useTextSelection from '../hooks/useTextSelection';
import { useChatContext } from '../contexts/ChatContext';

interface TextSelectionHandlerProps {
  children: React.ReactNode;
}

interface SelectionPosition {
  top: number;
  left: number;
}

const TextSelectionHandler: React.FC<TextSelectionHandlerProps> = ({ children }) => {
  const { selectedText, selectionRange } = useTextSelection();
  const { openWithContext } = useChatContext(); // T059: Get openWithContext from ChatContext
  const [showButtons, setShowButtons] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<SelectionPosition>({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedText && selectedText.length > 0) {
      // Calculate button position based on selection
      const position = calculateButtonPosition();
      if (position) {
        setButtonPosition(position);
        setShowButtons(true);
      }
    } else {
      setShowButtons(false);
    }
  }, [selectedText, selectionRange]);

  /**
   * Calculate optimal position for action buttons near selected text.
   * Positions buttons above the selection, centered horizontally.
   */
  const calculateButtonPosition = (): SelectionPosition | null => {
    if (!selectionRange) return null;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (!containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();

    // Position buttons above the selection, centered
    const top = rect.top - containerRect.top - 50; // 50px above selection
    const left = rect.left - containerRect.left + (rect.width / 2);

    return { top, left };
  };

  /**
   * T059: Handle action button clicks (Summarize, Explain, etc.)
   * Opens chatbot with selected text and specified intent.
   */
  const handleActionClick = (intent: string) => {
    if (!selectedText) return;

    // Open chatbot with context using ChatContext
    openWithContext(selectedText, intent);

    // Hide buttons after action
    setShowButtons(false);
  };

  return (
    <div ref={containerRef} className="text-selection-handler" style={{ position: 'relative' }}>
      {children}

      {showButtons && (
        <ActionButtons
          position={buttonPosition}
          onAction={handleActionClick}
          selectedText={selectedText}
        />
      )}
    </div>
  );
};

export default TextSelectionHandler;
