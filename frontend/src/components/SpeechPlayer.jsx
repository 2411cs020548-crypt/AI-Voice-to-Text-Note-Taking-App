import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

const SpeechPlayer = ({ text = '', title = 'Listen to Note' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [detectedLang, setDetectedLang] = useState('English');
  const [speakLang, setSpeakLang] = useState('en-US');
  const [rate, setRate] = useState(1);
  const [voiceMode, setVoiceMode] = useState('auto'); // 'auto', 'en-US', 'hi-IN', 'te-IN', 'ta-IN'
  const [availableVoices, setAvailableVoices] = useState([]);
  
  const utteranceRef = useRef(null);
  const sentenceIndexRef = useRef(0);
  const sentencesRef = useRef([]);

  // Detect script/language based on Unicode blocks
  useEffect(() => {
    if (voiceMode !== 'auto') {
      setSpeakLang(voiceMode);
      const modeNames = {
        'en-US': 'English (US)',
        'hi-IN': 'Hindi',
        'te-IN': 'Telugu',
        'ta-IN': 'Tamil'
      };
      setDetectedLang(modeNames[voiceMode] || 'Custom');
      return;
    }

    if (!text) {
      setDetectedLang('English');
      setSpeakLang('en-US');
      return;
    }

    const teluguRegex = /[\u0c00-\u0c7f]/;
    const hindiRegex = /[\u0900-\u097f]/;
    const tamilRegex = /[\u0b80-\u0bff]/;

    if (teluguRegex.test(text)) {
      setDetectedLang('Telugu');
      setSpeakLang('te-IN');
    } else if (hindiRegex.test(text)) {
      setDetectedLang('Hindi');
      setSpeakLang('hi-IN');
    } else if (tamilRegex.test(text)) {
      setDetectedLang('Tamil');
      setSpeakLang('ta-IN');
    } else {
      setDetectedLang('English (US)');
      setSpeakLang('en-US');
    }
  }, [text, voiceMode]);

  // Load and cache browser voices
  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Split text into manageable chunks (sentences) for reliable playback
  const getSentences = (fullText) => {
    if (!fullText) return [];
    // Split by common sentence terminators, maintaining them
    const matches = fullText.match(/[^.!?\n]+[.!?\n]*/g);
    return matches ? matches.map(s => s.trim()).filter(Boolean) : [fullText.trim()];
  };

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    sentenceIndexRef.current = 0;
  };

  const playSentence = (index) => {
    if (!window.speechSynthesis || index >= sentencesRef.current.length) {
      setIsPlaying(false);
      setIsPaused(false);
      sentenceIndexRef.current = 0;
      return;
    }

    const sentenceText = sentencesRef.current[index];
    const utterance = new SpeechSynthesisUtterance(sentenceText);
    utteranceRef.current = utterance;
    
    utterance.lang = speakLang;
    utterance.rate = rate;

    // Find best match voice
    let selectedVoice = null;
    let fallbackToDefault = false;
    let fallbackMsg = "";

    if (speakLang === 'te-IN') {
      // 1. Try to find native Telugu voice
      selectedVoice = availableVoices.find(v => v.lang.startsWith('te')) || 
                      availableVoices.find(v => v.name.toLowerCase().includes('telugu'));
      
      if (!selectedVoice) {
        // 2. Try to find Hindi voice as fallback
        selectedVoice = availableVoices.find(v => v.lang.startsWith('hi')) || 
                        availableVoices.find(v => v.name.toLowerCase().includes('hindi'));
        if (selectedVoice) {
          fallbackMsg = "Telugu voice pack not found. Reading using Hindi voice.";
        } else {
          fallbackToDefault = true;
          fallbackMsg = "Telugu and Hindi voice packs not found. Reading using default system voice.";
        }
      }
    } else if (speakLang === 'ta-IN') {
      selectedVoice = availableVoices.find(v => v.lang.startsWith('ta')) || 
                      availableVoices.find(v => v.name.toLowerCase().includes('tamil'));
      if (!selectedVoice) {
        fallbackToDefault = true;
        fallbackMsg = "Tamil voice pack not found. Reading using default system voice.";
      }
    } else if (speakLang === 'hi-IN') {
      selectedVoice = availableVoices.find(v => v.lang.startsWith('hi')) || 
                      availableVoices.find(v => v.name.toLowerCase().includes('hindi'));
      if (!selectedVoice) {
        fallbackToDefault = true;
        fallbackMsg = "Hindi voice pack not found. Reading using default system voice.";
      }
    } else {
      selectedVoice = availableVoices.find(v => v.lang === 'en-US') || 
                      availableVoices.find(v => v.lang.startsWith('en'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
      if (fallbackMsg && index === 0) {
        toast.info(fallbackMsg);
      }
    } else if (fallbackToDefault) {
      if (index === 0) {
        toast.info(fallbackMsg);
      }
      utterance.lang = 'en-US'; // use default language to avoid silent failure
    } else {
      utterance.lang = speakLang;
    }

    utterance.onend = () => {
      sentenceIndexRef.current = index + 1;
      playSentence(sentenceIndexRef.current);
    };

    utterance.onerror = (e) => {
      // Don't show toast if manually stopped or interrupted
      if (e.error !== 'interrupted') {
        toast.error('Speech error occurred: ' + e.error);
        stopSpeech();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (!window.speechSynthesis) {
      toast.error('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (!text.trim()) {
      toast.warning('No text content available to read.');
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      // Start fresh playback
      window.speechSynthesis.cancel();
      sentencesRef.current = getSentences(text);
      sentenceIndexRef.current = 0;
      setIsPlaying(true);
      setIsPaused(false);
      playSentence(0);
    }
  };

  return (
    <div className="speech-player-widget p-3 rounded-4 bg-light border border-light-subtle shadow-sm my-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <i className="material-icons-round text-indigo" style={{ color: '#6366f1' }}>volume_up</i>
          <span className="fw-semibold text-dark-emphasis small">{title}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge rounded-pill bg-indigo-subtle text-indigo px-2 py-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
            {detectedLang}
          </span>
          {isPlaying && !isPaused && (
            <div className="speech-playing-wave ms-1">
              <span /><span /><span /><span />
            </div>
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
        {/* Playback Controls */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-indigo rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5 text-white"
            onClick={handlePlayPause}
            title={isPlaying && !isPaused ? 'Pause' : 'Play'}
          >
            <i className="material-icons-round fs-6">
              {isPlaying && !isPaused ? 'pause' : 'play_arrow'}
            </i>
            <span>{isPlaying && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Listen'}</span>
          </button>
          
          {(isPlaying || isPaused) && (
            <button
              type="button"
              className="btn btn-outline-danger rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
              onClick={stopSpeech}
              title="Stop"
            >
              <i className="material-icons-round fs-6">stop</i>
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Voice Mode Selector */}
        <div className="d-flex align-items-center gap-2">
          <span className="small text-secondary fw-medium">Voice:</span>
          <select
            className="form-select form-select-sm rounded-pill"
            style={{ width: '120px', fontSize: '0.85rem' }}
            value={voiceMode}
            onChange={(e) => {
              const mode = e.target.value;
              setVoiceMode(mode);
              stopSpeech(); // Stop active speaking if language mode changes
            }}
          >
            <option value="auto">Auto-Detect</option>
            <option value="en-US">English (US)</option>
            <option value="hi-IN">Hindi</option>
            <option value="te-IN">Telugu</option>
            <option value="ta-IN">Tamil</option>
          </select>
        </div>

        {/* Speed Selector */}
        <div className="d-flex align-items-center gap-2">
          <span className="small text-secondary fw-medium">Speed:</span>
          <select
            className="form-select form-select-sm rounded-pill"
            style={{ width: '80px', fontSize: '0.85rem' }}
            value={rate}
            onChange={(e) => {
              const newRate = parseFloat(e.target.value);
              setRate(newRate);
              if (isPlaying) {
                // To apply rate changes immediately, stop current and resume from current sentence
                window.speechSynthesis.cancel();
                playSentence(sentenceIndexRef.current);
              }
            }}
          >
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SpeechPlayer;
