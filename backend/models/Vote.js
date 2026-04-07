const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true }
}, { timestamps: true });

// Ensure a student can only vote once per candidate (though we should also prevent them from voting multiple times overall in controllers)
voteSchema.index({ studentId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
