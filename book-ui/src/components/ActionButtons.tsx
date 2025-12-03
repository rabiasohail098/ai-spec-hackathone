/**
 * ActionButtons Component
 *
 * Displays contextual AI action buttons when text is selected.
 * Provides quick access to AI features:
 * - Summarize: Get a concise summary of selected text
 * - Explain Simply: Get an easy-to-understand explanation
 * - Mind Map: Generate a text-based mind map
 * - Key Points: Extract bullet-point key points
 *
 * T051: Create ActionButtons component
 * T052: Implement button rendering
 * T053: Add positioning logic
 * T054: Implement mobile-friendly touch handling
 */

import React, { useRef, useEffect } from 'react';
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  position: { top: number; left: number };
  onAction: (intent: string) => void;
  selectedText: string;
}

interface ActionButton {
  intent: string;
  label: string;
  icon: string;
  color: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ position, onAction, selectedText }) => {
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Action buttons configuration
  const buttons: ActionButton[] = [
    { intent: 'summarize', label: 'Summarize', icon: '📝', color: '#4CAF50' },
    { intent: 'explain', label: 'Explain Simply', icon: '💡', color: '#2196F3' },
    { intent: 'mindmap', label: 'Mind Map', icon: '🗺️', color: '#FF9800' },
    { intent: 'keypoints', label: 'Key Points', icon: '🎯', color: '#9C27B0' },
  ];

  useEffect(() => {
    // Handle clicks outside action buttons to close them
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonsRef.current && !buttonsRef.current.contains(event.target as Node)) {
        // Don't close immediately on outside click - let user decide
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // T054: Mobile touch handling
  const handleTouchStart = (intent: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    onAction(intent);
  };

  const handleClick = (intent: string) => () => {
    onAction(intent);
  };

  return (
    <div
      ref={buttonsRef}
      className={styles.actionButtons}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)', // Center horizontally
      }}
    >
      <div className={styles.buttonContainer}>
        {buttons.map((button) => (
          <button
            key={button.intent}
            className={styles.actionButton}
            onClick={handleClick(button.intent)}
            onTouchStart={handleTouchStart(button.intent)}
            style={{ borderColor: button.color }}
            title={`${button.label}: ${selectedText.substring(0, 50)}...`}
          >
            <span className={styles.icon}>{button.icon}</span>
            <span className={styles.label}>{button.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionButtons;
