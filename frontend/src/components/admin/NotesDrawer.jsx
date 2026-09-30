import React, { useState } from 'react';
import api from '../../api/client';
import { MessageSquare, Send, Clock, User } from 'lucide-react';

export default function NotesDrawer({ applicationId, notes = [], onNoteAdded }) {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/admin/applications/${applicationId}/notes`, {
        note: newNote.trim()
      });
      setNewNote('');
      if (onNoteAdded) {
        onNoteAdded(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save note.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
          Internal Evaluation Notes <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(MongoDB flexible storage)</span>
        </h4>
      </div>

      {error && (
        <div className="mb-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 p-2.5 rounded-lg border border-rose-200 dark:border-rose-800">
          {error}
        </div>
      )}

      {/* Note input form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add an internal note or interview evaluation on this candidate..."
            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={submitting || !newNote.trim()}
            className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center shadow-2xs"
            title="Save Note"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Notes timeline */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {notes && notes.length > 0 ? (
          notes.map((n, idx) => (
            <div key={n._id || idx} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  {n.adminName || 'Admin'}
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                  {new Date(n.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{n.note}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4 italic">
            No evaluation notes added yet for this applicant.
          </p>
        )}
      </div>
    </div>
  );
}
