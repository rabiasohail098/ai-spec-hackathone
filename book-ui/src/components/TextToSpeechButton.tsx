// src/components/TextToSpeechButton.tsx
import React, { useState, useEffect } from 'react';

interface TextToSpeechButtonProps {
  text: string;
  language?: string;
  compact?: boolean;
}

const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({
  text,
  language = 'en-US',
  compact = false
}) => {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      console.warn('Text-to-Speech not supported in this browser');
      return;
    }

    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();

    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getVoiceForLanguage = (lang: string): SpeechSynthesisVoice | null => {
    // Try to find a voice that matches the language
    const matchingVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
    return matchingVoice || voices[0] || null;
  };

  const speak = () => {
    if (!supported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice
    const voice = getVoiceForLanguage(language);
    if (voice) {
      utterance.voice = voice;
    }

    // Set language
    utterance.lang = language;

    // Set speech parameters
    utterance.rate = 1.0;  // Speed (0.1 to 10)
    utterance.pitch = 1.0; // Pitch (0 to 2)
    utterance.volume = 1.0; // Volume (0 to 1)

    // Event handlers
    utterance.onstart = () => {
      setSpeaking(true);
      setPaused(false);
    };

    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setSpeaking(false);
      setPaused(false);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const resume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  if (!supported) {
    return null; // Don't show button if not supported
  }

  if (compact) {
    // Compact single-button mode
    return (
      <button
        onClick={speaking ? stop : speak}
        className="tts-button-compact"
        title={speaking ? "Stop reading" : "Read aloud"}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: speaking ? '#dc2626' : '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <span style={{ fontSize: '1.1em' }}>
          {speaking ? '🔇' : '🔊'}
        </span>
        <span>{speaking ? 'Stop' : 'Read Aloud'}</span>
      </button>
    );
  }

  // Full control mode
  return (
    <div className="tts-controls" style={{
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      {!speaking ? (
        <button
          onClick={speak}
          className="tts-button"
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.1em' }}>🔊</span>
          <span>Read Aloud</span>
        </button>
      ) : (
        <>
          {!paused ? (
            <button
              onClick={pause}
              className="tts-button"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              ⏸️ Pause
            </button>
          ) : (
            <button
              onClick={resume}
              className="tts-button"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              ▶️ Resume
            </button>
          )}
          <button
            onClick={stop}
            className="tts-button"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            ⏹️ Stop
          </button>
        </>
      )}

      {speaking && (
        <span style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginLeft: '0.5rem',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          {paused ? '⏸ Paused' : '🔊 Speaking...'}
        </span>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .tts-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .tts-button:active {
          transform: translateY(0);
        }

        .tts-button-compact:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default TextToSpeechButton;
