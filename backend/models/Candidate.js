const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  manifesto: { type: String },
  image: { type: String }, // URL or base64 string
  voteCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
