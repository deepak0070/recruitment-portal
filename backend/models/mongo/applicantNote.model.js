const mongoose = require('mongoose');

const applicantNoteSchema = new mongoose.Schema(
  {
    applicationId: {
      type: Number,
      required: true,
      index: true
    },
    adminId: {
      type: Number,
      required: true
    },
    adminName: {
      type: String,
      required: true
    },
    note: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

applicantNoteSchema.index({ applicationId: 1, createdAt: -1 });

const ApplicantNote = mongoose.models.ApplicantNote || mongoose.model('ApplicantNote', applicantNoteSchema, 'applicant_notes');

module.exports = ApplicantNote;
