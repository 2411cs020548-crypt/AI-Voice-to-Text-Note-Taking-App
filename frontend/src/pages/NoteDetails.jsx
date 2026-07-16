import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import SpeechPlayer from '../components/SpeechPlayer';

const NoteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNoteDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/notes/${id}`);
      if (response.data.success) {
        setNote(response.data.data);
      }
    } catch {
      toast.error('Failed to load note details');
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchNoteDetails();
  }, [fetchNoteDetails]);

  const [transSourceLang, setTransSourceLang] = useState('en');
  const [transTargetLang, setTransTargetLang] = useState('hi');
  const [translating, setTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTogglePin = async () => {
    try {
      const response = await api.put(`/api/notes/pin/${note.id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setNote(response.data.data);
      }
    } catch {
      toast.error('Failed to update pin status');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await api.put(`/api/notes/favorite/${note.id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setNote(response.data.data);
      }
    } catch {
      toast.error('Failed to update favorite status');
    }
  };

  const handleToggleArchive = async () => {
    try {
      const response = await api.put(`/api/notes/archive/${note.id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        setNote(response.data.data);
      }
    } catch {
      toast.error('Failed to update archive status');
    }
  };

  const handleTranslate = async () => {
    if (!note || !note.content) return;
    setTranslating(true);
    try {
      const response = await api.post('/api/notes/translate', {
        text: note.content,
        sourceLang: transSourceLang,
        targetLang: transTargetLang
      });

      if (response.data.success && response.data.data) {
        setTranslatedText(response.data.data.translatedText);
        setShowTranslation(true);
        toast.success('Text translated successfully');
      }
    } catch {
      toast.error('Translation failed. Verify connection/language settings.');
    } finally {
      setTranslating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this note?')) return;
    try {
      const response = await api.delete(`/api/notes/${note.id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/notes');
      }
    } catch {
      toast.error('Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
        <div className="spinner-border text-indigo mb-3" role="status" style={{ color: '#6366f1' }} />
        <span className="text-secondary">Retrieving note content...</span>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="empty-state p-5 bg-white border border-light-subtle rounded-4 text-center my-5">
        <i className="material-icons-round empty-state-icon text-danger">error_outline</i>
        <h5>Note not found</h5>
        <p className="text-secondary small">This note may have been deleted or is inaccessible.</p>
        <Link to="/notes" className="btn rounded-pill px-4 text-white" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
          Back to Notes
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-2" style={{ maxWidth: '800px' }}>
      {/* Back & Actions header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1">
          <i className="material-icons-round fs-6">arrow_back</i>
          <span>Back</span>
        </button>
        
        <div className="d-flex gap-2">
          <button 
            className={`btn btn-icon ${note.pinned ? 'btn-warning text-white' : 'btn-light text-muted'}`}
            onClick={handleTogglePin}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            <i className="material-icons-round">push_pin</i>
          </button>
          <button 
            className={`btn btn-icon ${note.favorite ? 'btn-danger text-white' : 'btn-light text-muted'}`}
            onClick={handleToggleFavorite}
            title={note.favorite ? 'Remove Favorite' : 'Favorite'}
          >
            <i className="material-icons-round">{note.favorite ? 'favorite' : 'favorite_border'}</i>
          </button>
          <button 
            className={`btn btn-icon ${note.archived ? 'btn-indigo text-white' : 'btn-light text-muted'}`}
            onClick={handleToggleArchive}
            title={note.archived ? 'Restore Note' : 'Archive Note'}
          >
            <i className="material-icons-round">archive</i>
          </button>
          <Link to={`/notes/edit/${note.id}`} className="btn btn-icon btn-light text-secondary" title="Edit Note">
            <i className="material-icons-round">edit</i>
          </Link>
          <button className="btn btn-icon btn-light text-danger" onClick={handleDelete} title="Delete Permanently">
            <i className="material-icons-round">delete_outline</i>
          </button>
        </div>
      </div>

      {/* Main Content card */}
      <div className="card border-0 shadow-sm rounded-4 bg-white border border-light-subtle overflow-hidden">
        {/* Top color indicator */}
        <div style={{ height: '8px', backgroundColor: note.color || '#6366f1' }} />
        
        <div className="p-4 p-md-5">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
            <span className="badge rounded-pill px-3 py-1.5" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', fontSize: '0.85rem', fontWeight: '500' }}>
              {note.category}
            </span>
            
            <div className="small text-muted d-flex align-items-center gap-1">
              <i className="material-icons-round" style={{ fontSize: '16px' }}>schedule</i>
              <span>Created on: {new Date(note.createdDate).toLocaleString()}</span>
            </div>
          </div>

          <h2 className="display-6 fw-bold mb-4 display-font">{note.title}</h2>
          
          <div className="note-content-body text-secondary mb-5" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.05rem' }}>
            {showTranslation && translatedText ? (
              <div className="position-relative">
                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1.5 mb-3 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                  <i className="material-icons-round fs-6">translate</i>
                  <span>Translated ({transTargetLang.toUpperCase()})</span>
                </span>
                <div>{translatedText}</div>
              </div>
            ) : (
              note.content
            )}
          </div>

          {/* Text-to-Speech Player */}
          <SpeechPlayer 
            text={showTranslation && translatedText ? translatedText : note.content}
            title={showTranslation ? "Listen to Translation" : "Listen to Note"}
          />

          {/* Translation Engine Widget */}
          <div className="p-4 rounded-4 bg-light border border-light-subtle mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2 fw-semibold text-indigo">
                <i className="material-icons-round">translate</i>
                <span>Translation Engine</span>
              </div>
              {translatedText && (
                <button 
                  type="button"
                  className="btn btn-sm btn-link text-indigo text-decoration-none fw-semibold p-0"
                  onClick={() => setShowTranslation(prev => !prev)}
                >
                  {showTranslation ? 'View Original Text' : 'View Translated Text'}
                </button>
              )}
            </div>

            <div className="row g-2 align-items-end">
              <div className="col-5">
                <label className="form-label small fw-semibold text-secondary mb-1">Source Language</label>
                <select 
                  className="form-select form-select-sm"
                  value={transSourceLang}
                  onChange={(e) => setTransSourceLang(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>

              <div className="col-5">
                <label className="form-label small fw-semibold text-secondary mb-1">Target Language</label>
                <select 
                  className="form-select form-select-sm"
                  value={transTargetLang}
                  onChange={(e) => setTransTargetLang(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>

              <div className="col-2">
                <button 
                  type="button"
                  className="btn btn-sm btn-indigo text-white rounded-pill w-100 py-1.5 d-flex align-items-center justify-content-center"
                  onClick={handleTranslate}
                  disabled={translating}
                  title="Translate Note"
                >
                  {translating ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  ) : (
                    <i className="material-icons-round fs-6">translate</i>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Voice Transcript section */}
          {note.voiceTranscript && (
            <div className="p-4 rounded-4 bg-light border-start border-success border-3 mt-4">
              <div className="d-flex align-items-center gap-2 mb-2 text-success fw-semibold">
                <i className="material-icons-round">settings_voice</i>
                <span>Original Voice Transcript</span>
              </div>
              <p className="mb-0 text-secondary italic small" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                "{note.voiceTranscript}"
              </p>
            </div>
          )}

          {/* Edit status footer */}
          <div className="text-muted small mt-5 pt-3 border-top border-light-subtle text-end">
            Last modified: {new Date(note.updatedDate).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetails;
