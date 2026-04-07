const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  hasVoted: { type: Boolean, default: false },
  role: { type: String, enum: ['student', 'admin', 'superadmin'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
