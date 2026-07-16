import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const NoteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [category, setCategory] = useState('Others');
  const [color, setColor] = useState('#ffffff');
  const [pinned, setPinned] = useState(false);
  const [favorite, setFavorite] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);

  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState('en-US');
  const recognitionRef = useRef(null);

  // Translation States
  const [transSourceLang, setTransSourceLang] = useState('en');
  const [transTargetLang, setTransTargetLang] = useState('hi');
  const [translating, setTranslating] = useState(false);

  const colors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Blue', value: '#dbeafe' },
    { name: 'Red', value: '#fee2e2' },
    { name: 'Amber', value: '#fef3c7' },
    { name: 'Green', value: '#dcfce7' },
    { name: 'Purple', value: '#f3e8ff' },
    { name: 'Orange', value: '#ffedd5' },
    { name: 'Gray', value: '#f3f4f6' }
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recObj = new SpeechRecognition();
      recObj.continuous = true;
      recObj.interimResults = true;
      recObj.lang = recognitionLang;

      recObj.onstart = () => {
        setIsRecording(true);
      };

      recObj.onend = () => {
        setIsRecording(false);
      };

      recObj.onerror = (event) => {
        toast.error('Speech recognition error: ' + event.error);
        setIsRecording(false);
      };

      recObj.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          // Append to content and update voice transcript
          setContent(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript.trim());
          setVoiceTranscript(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + finalTranscript.trim());
        }
      };

      recognitionRef.current = recObj;
    }

    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [recognitionLang]);

  // Load note details if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchNote = async () => {
        try {
          const response = await api.get(`/api/notes/${id}`);
          if (response.data.success && response.data.data) {
            const note = response.data.data;
            setTitle(note.title);
            setContent(note.content);
            setVoiceTranscript(note.voiceTranscript || '');
            setCategory(note.category);
            setColor(note.color || '#ffffff');
            setPinned(note.pinned);
            setFavorite(note.favorite);
          }
        } catch (error) {
          toast.error('Failed to load note');
          navigate('/notes');
        } finally {
          setPageLoading(false);
        }
      };
      fetchNote();
    }
  }, [id, isEditMode]);

  // Handle Speech recording toggle
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = recognitionLang;
      recognitionRef.current.start();
    }
  };

  // Handle Translation
  const handleTranslate = async () => {
    if (!content.trim()) {
      toast.warning('Note content is empty. Add text to translate.');
      return;
    }

    setTranslating(true);
    try {
      const response = await api.post('/api/notes/translate', {
        text: content,
        sourceLang: transSourceLang,
        targetLang: transTargetLang
      });

      if (response.data.success && response.data.data) {
        const translated = response.data.data.translatedText;
        if (window.confirm('Do you want to REPLACE your editor content with the translated text? Click cancel to APPEND it instead.')) {
          setContent(translated);
        } else {
          setContent(prev => prev + '\n\n--- Translation ---\n' + translated);
        }
        toast.success('Text translated successfully');
      }
    } catch (error) {
      toast.error('Translation failed. Verify connection/language settings.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and Content are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        content,
        voiceTranscript,
        category,
        color,
        pinned,
        favorite,
        archived: false // Active state
      };

      let response;
      if (isEditMode) {
        response = await api.put(`/api/notes/${id}`, payload);
      } else {
        response = await api.post('/api/notes', payload);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        navigate(`/notes/view/${response.data.data.id || id}`);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save note';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
        <div className="spinner-border text-indigo mb-3" role="status" style={{ color: '#6366f1' }} />
        <span className="text-secondary">Loading note details...</span>
      </div>
    );
  }

  return (
    <div className="container py-2" style={{ maxWidth: '850px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1">
          <i className="material-icons-round fs-6">arrow_back</i>
          <span>Cancel</span>
        </button>
        <h3 className="fs-5 mb-0 display-font">{isEditMode ? 'Edit Note' : 'Create New Note'}</h3>
      </div>

      <div className="row g-4">
        {/* Editor Form */}
        <div className="col-md-8">
          <form onSubmit={handleSave} className="card border-0 shadow-sm rounded-4 p-4 bg-white border border-light-subtle">
            <div className="mb-3">
              <input
                type="text"
                className="form-control border-0 fs-4 fw-bold px-0 bg-transparent text-dark-emphasis"
                placeholder="Enter Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
                style={{ outline: 'none', boxShadow: 'none' }}
              />
            </div>

            <div className="mb-4">
              <textarea
                className="form-control border-0 px-0 bg-transparent text-secondary"
                rows={12}
                placeholder="Type your content here or use the microphone to record speech..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                style={{ resize: 'none', outline: 'none', boxShadow: 'none', fontSize: '1rem', lineHeight: '1.6' }}
              />
            </div>

            {/* Bottom Form Settings */}
            <div className="row g-3 pt-3 border-top border-light-subtle align-items-center">
              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary">Category</label>
                <select 
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Ideas">Ideas</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Personal">Personal</option>
                  <option value="Travel">Travel</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="col-sm-6">
                <label className="form-label small fw-semibold text-secondary d-block">Note Color</label>
                <div className="d-flex flex-wrap gap-2 pt-1">
                  {colors.map((c) => (
                    <div 
                      key={c.value}
                      className={`color-picker-dot rounded-circle border ${color === c.value ? 'active border-dark' : 'border-light-subtle'}`}
                      style={{ backgroundColor: c.value, width: '26px', height: '26px', cursor: 'pointer' }}
                      onClick={() => setColor(c.value)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="col-12 d-flex flex-wrap gap-3 mt-4">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="pinSwitch"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                  />
                  <label className="form-check-label small fw-medium text-secondary" htmlFor="pinSwitch">Pin note to top</label>
                </div>
                
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="favSwitch"
                    checked={favorite}
                    onChange={(e) => setFavorite(e.target.checked)}
                  />
                  <label className="form-check-label small fw-medium text-secondary" htmlFor="favSwitch">Mark as favorite</label>
                </div>
              </div>

              <div className="col-12 mt-4">
                <button
                  type="submit"
                  className="btn rounded-pill px-5 text-white fw-semibold float-end"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      <span>Saving Note...</span>
                    </>
                  ) : (
                    <span>Save Note</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar Tools (Voice & Translation Widgets) */}
        <div className="col-md-4">
          {/* Voice Speech tool */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border border-light-subtle mb-4">
            <h5 className="fs-6 fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="material-icons-round text-success">mic</i>
              <span>Voice Transcriber</span>
            </h5>
            
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary">Recognition Language</label>
              <select 
                className="form-select"
                value={recognitionLang}
                onChange={(e) => setRecognitionLang(e.target.value)}
                disabled={isRecording}
              >
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
              </select>
            </div>

            <div className="text-center py-4 border border-light-subtle rounded-4 bg-light mb-3">
              {isRecording ? (
                <div className="mb-3">
                  <div className="speech-recording-wave mb-2">
                    <span /><span /><span /><span />
                  </div>
                  <div className="small text-danger fw-semibold">Transcribing Audio...</div>
                </div>
              ) : (
                <div className="mb-3">
                  <i className="material-icons-round text-muted fs-1">mic_none</i>
                  <div className="small text-secondary mt-1">Microphone is idle</div>
                </div>
              )}

              <button 
                type="button"
                className={`btn rounded-circle text-white shadow d-inline-flex align-items-center justify-content-center ${isRecording ? 'btn-danger' : 'btn-indigo'}`}
                style={{ width: '56px', height: '56px', background: isRecording ? '#ef4444' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none' }}
                onClick={toggleRecording}
              >
                <i className="material-icons-round fs-3">{isRecording ? 'stop' : 'mic'}</i>
              </button>
            </div>
            
            {voiceTranscript && (
              <div>
                <div className="small fw-semibold text-secondary mb-1">Session Transcript Preview:</div>
                <div className="small text-muted p-2 rounded bg-light border" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  "{voiceTranscript}"
                </div>
              </div>
            )}
          </div>

          {/* Translation tool */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border border-light-subtle">
            <h5 className="fs-6 fw-bold mb-3 d-flex align-items-center gap-2">
              <i className="material-icons-round text-indigo" style={{ color: '#6366f1' }}>translate</i>
              <span>Translator</span>
            </h5>
            
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">From</label>
                <select 
                  className="form-select"
                  value={transSourceLang}
                  onChange={(e) => setTransSourceLang(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                </select>
              </div>

              <div className="col-6">
                <label className="form-label small fw-semibold text-secondary">To</label>
                <select 
                  className="form-select"
                  value={transTargetLang}
                  onChange={(e) => setTransTargetLang(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
            </div>

            <button 
              type="button"
              className="btn btn-outline-primary w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={handleTranslate}
              disabled={translating}
              style={{ borderColor: '#6366f1', color: '#6366f1' }}
            >
              {translating ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <i className="material-icons-round fs-6">translate</i>
                  <span>Translate Content</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteForm;
