import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ChapterControlsProps {
  chapterId: string; // Unique identifier for the chapter
  title: string;
}

const ChapterControls: React.FC<ChapterControlsProps> = ({ chapterId, title }) => {
  const { user, isAuthenticated } = useAuth();
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [originalContent, setOriginalContent] = useState<string | null>(null);

  // Store original content when component mounts
  useEffect(() => {
    // Find the main content area of the chapter
    const contentElement = document.querySelector('article');
    if (contentElement) {
      setOriginalContent(contentElement.innerHTML);
    }
  }, []);

  // Personalize content on the page
  const applyPersonalization = async () => {
    if (!user || !originalContent) return;

    // Find the main content area of the chapter
    const contentElement = document.querySelector('article');
    if (!contentElement) return;

    try {
      // Show a personalization in-progress indicator
      const personalizationNote = document.createElement('div');
      personalizationNote.className = 'alert alert--info';
      personalizationNote.id = 'personalization-progress';
      personalizationNote.style.cssText = `
        margin: 1rem 0;
        padding: 1rem;
        border-left: 4px solid #5e42a6;
        background-color: #f0e6ff;
      `;
      personalizationNote.innerHTML = `
        <p>🔄 <strong>Personalizing Content...</strong></p>
        <p>Customizing content based on your profile...</p>
      `;

      // Insert the personalization note after the controls
      const controlsElement = document.querySelector('.chapter-controls');
      if (controlsElement) {
        controlsElement.parentNode?.insertBefore(personalizationNote, controlsElement.nextSibling);
      }

      // Call the backend API to personalize the content
      const API_BASE_URL = typeof window !== 'undefined'
        ? (window as any).env?.REACT_APP_API_URL ||
          (process.env.NODE_ENV === 'production'
            ? `${window.location.origin}/api/v1` // For GitHub Pages deployment
            : 'http://localhost:8000/api/v1') // For local development
        : 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE_URL}/personalize-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: originalContent.substring(0, 2000), // Limit content size for API call
          user_id: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Personalization API request failed');
      }

      const data = await response.json();

      // Replace the content with the personalized text
      contentElement.innerHTML = data.personalized_content;

      // Update the progress note with success message
      personalizationNote.innerHTML = `
        <p>✅ <strong>Personalization Complete!</strong></p>
        <p>Welcome <strong>${user.first_name || user.email.split('@')[0]}</strong>! This content has been personalized for you.</p>
      `;
      personalizationNote.style.borderLeft = '4px solid #5e42a6';
      personalizationNote.style.backgroundColor = '#f0e6ff';
    } catch (error) {
      console.error('Personalization error:', error);

      // Show error message if personalization fails
      const errorNote = document.createElement('div');
      errorNote.className = 'alert alert--info';
      errorNote.id = 'personalization-error';
      errorNote.style.cssText = `
        margin: 1rem 0;
        padding: 1rem;
        border-left: 4px solid #dc3545;
        background-color: #f8d7da;
      `;
      errorNote.innerHTML = `
        <p>❌ <strong>Personalization Failed</strong></p>
        <p>Could not personalize content. Please try again later.</p>
      `;

      // Insert the error note after the controls
      const controlsElement = document.querySelector('.chapter-controls');
      if (controlsElement) {
        controlsElement.parentNode?.insertBefore(errorNote, controlsElement.nextSibling);
      }
    }
  };

  // Translate content to Urdu
  const applyTranslation = async () => {
    // Find the main content area of the chapter
    const contentElement = document.querySelector('article');
    if (!contentElement) return;

    // Get the original content from the store
    const contentToTranslate = originalContent || contentElement.innerHTML;

    // Add a translation in-progress indicator
    const translationNote = document.createElement('div');
    translationNote.className = 'alert alert--info';
    translationNote.id = 'translation-progress';
    translationNote.style.cssText = `
      margin: 1rem 0;
      padding: 1rem;
      border-left: 4px solid #28a745;
      background-color: #e6f7e9;
    `;
    translationNote.innerHTML = `
      <p>🔄 <strong>Urdu Translation in Progress...</strong></p>
      <p>Translating content to Urdu using AI services...</p>
    `;

    // Insert the translation note after the controls
    const controlsElement = document.querySelector('.chapter-controls');
    if (controlsElement) {
      controlsElement.parentNode?.insertBefore(translationNote, controlsElement.nextSibling);
    }

    try {
      // Call the backend API to translate the content
      const API_BASE_URL = typeof window !== 'undefined'
        ? (window as any).env?.REACT_APP_API_URL ||
          (process.env.NODE_ENV === 'production'
            ? `${window.location.origin}/api/v1` // For GitHub Pages deployment
            : 'http://localhost:8000/api/v1') // For local development
        : 'http://localhost:8000/api/v1';
      const response = await fetch(`${API_BASE_URL}/translate-to-urdu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: contentToTranslate.substring(0, 2000) }), // Limit content size for API call
      });

      if (!response.ok) {
        throw new Error('Translation API request failed');
      }

      const data = await response.json();

      // Replace the content with the translated text
      contentElement.innerHTML = data.translated_text;

      // Update the progress note with success message
      translationNote.innerHTML = `
        <p>✅ <strong>Urdu Translation Complete!</strong></p>
        <p>Content has been translated to Urdu.</p>
      `;
      translationNote.style.borderLeft = '4px solid #28a745';
      translationNote.style.backgroundColor = '#e6f7e9';

    } catch (error) {
      console.error('Translation error:', error);

      // Update the progress note with error message
      translationNote.innerHTML = `
        <p>❌ <strong>Translation Failed</strong></p>
        <p>Could not translate content. Please try again later.</p>
      `;
      translationNote.style.borderLeft = '4px solid #dc3545';
      translationNote.style.backgroundColor = '#f8d7da';
    }
  };

  const handlePersonalizeToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to use personalization features.');
      return;
    }

    // Reset to original content first
    if (originalContent) {
      const contentElement = document.querySelector('article');
      if (contentElement) {
        contentElement.innerHTML = originalContent;

        // Remove any personalized messages (progress, success, error)
        const messages = document.querySelectorAll('.alert--info');
        messages.forEach(msg => {
          if (msg.textContent?.includes('Personalizing') ||
              msg.textContent?.includes('Welcome') ||
              msg.textContent?.includes('Personalization')) {
            msg.remove();
          }
        });
      }
    }

    if (isPersonalized) {
      // Revert personalization
      setIsPersonalized(false);
    } else {
      // Apply personalization
      await applyPersonalization();
      setIsPersonalized(true);
    }
  };

  const handleTranslateToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to use translation features.');
      return;
    }

    if (isTranslated) {
      // Revert translation - restore original content
      if (originalContent) {
        const contentElement = document.querySelector('article');
        if (contentElement) {
          contentElement.innerHTML = originalContent;

          // Remove any translation messages (progress, success, error)
          const translationNotes = document.querySelectorAll('.alert--info');
          translationNotes.forEach(note => {
            if (note.textContent?.includes('Translation')) {
              note.remove();
            }
          });
        }
      }
      setIsTranslated(false);
    } else {
      // Apply translation
      await applyTranslation();
      setIsTranslated(true);
    }
  };

  return (
    <div className="chapter-controls" style={{
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      <div className="control-group" style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handlePersonalizeToggle}
          className={`button ${isPersonalized ? 'button--primary' : 'button--secondary'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          disabled={!isAuthenticated}
          title={isAuthenticated ?
            (isPersonalized ? 'Disable personalization' : 'Personalize content for me') :
            'Sign in to personalize content'}
        >
          <span>👤</span>
          <span>{isPersonalized ? 'Personalized' : 'Personalize'}</span>
        </button>

        <button
          onClick={handleTranslateToggle}
          className={`button ${isTranslated ? 'button--primary' : 'button--secondary'}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          disabled={!isAuthenticated}
          title={isAuthenticated ?
            (isTranslated ? 'Disable Urdu translation' : 'Translate to Urdu') :
            'Sign in to translate content'}
        >
          <span>🌐</span>
          <span>{isTranslated ? 'اُردو' : 'Urdu'}</span>
        </button>
      </div>

      {(isPersonalized || isTranslated) && (
        <div className="status-indicator" style={{
          display: 'flex',
          alignItems: 'center',
          color: '#5e42a6',
          fontWeight: '500',
        }}>
          {isPersonalized && isTranslated ? (
            <span>✨ Personalized & Translated Content</span>
          ) : isPersonalized ? (
            <span>✨ Personalized Content</span>
          ) : (
            <span>🌐 Translated Content</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterControls;