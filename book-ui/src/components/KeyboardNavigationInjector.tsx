// src/components/KeyboardNavigationInjector.tsx
import { useEffect } from 'react';

export default function KeyboardNavigationInjector(): JSX.Element {
  useEffect(() => {
    // Function to handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle on docs pages and home page, skip if user is typing in an input
      if (
        (window.location.pathname.startsWith('/docs/') || window.location.pathname === '/') &&
        e.target instanceof HTMLElement &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)
      ) {
        // Handle arrow down (move down the page)
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          window.scrollBy({ top: 200, behavior: 'smooth' });
        }
        // Handle arrow up (move up the page)
        else if (e.key === 'ArrowUp') {
          e.preventDefault();
          window.scrollBy({ top: -200, behavior: 'smooth' });
        }
      }
    };

    // Add the event listener when component mounts
    document.addEventListener('keydown', handleKeyDown);

    // Return a function to remove the event listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // This component doesn't render anything itself
  return null;
}