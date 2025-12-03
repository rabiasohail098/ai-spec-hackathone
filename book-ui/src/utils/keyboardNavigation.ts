// src/utils/keyboardNavigation.ts
export const setupKeyboardNavigation = () => {
  // Function to handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check if we're on a documentation page
    if (window.location.pathname.startsWith('/docs/')) {
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

  // Add the event listener when the module is loaded
  document.addEventListener('keydown', handleKeyDown);

  // Return a function to remove the event listener
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};