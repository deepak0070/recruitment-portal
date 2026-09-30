import React, { useState } from 'react';
import Modal from '../common/Modal';
import api from '../../api/client';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ApplyModal({ isOpen, onClose, job, onApplied }) {
  const [file, setFile] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    setError(null);
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Resume file size must be less than 5 MB.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume to attach.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    if (coverNote.trim()) {
      formData.append('cover_note', coverNote.trim());
    }

    try {
      await api.post(`/jobs/${job.id}/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      if (onApplied) onApplied();
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
        setCoverNote('');
        onClose();
      }, 1800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit application.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!submitting) {
          setError(null);
          onClose();
        }
      }}
      title={`Apply for ${job.title}`}
    >
      {success ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3 animate-bounce" />
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Application Submitted!</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your application and resume have been forwarded to the recruiting team.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Resume (PDF format, max 5 MB) <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition bg-slate-50/50 dark:bg-slate-800/40">
              <div className="space-y-2 text-center">
                <UploadCloud className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500" />
                <div className="flex text-sm text-slate-600 dark:text-slate-300 justify-center">
                  <label
                    htmlFor="resume-upload"
                    className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none"
                  >
                    <span>{file ? file.name : 'Select a PDF document'}</span>
                    <input
                      id="resume-upload"
                      name="resume"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">PDF up to 5MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cover Note / Introduction (Optional)
            </label>
            <textarea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant experience, achievements, or why you are a great match for this role..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
