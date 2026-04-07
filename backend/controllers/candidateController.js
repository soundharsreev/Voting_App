const Candidate = require('../models/Candidate');
const Setting = require('../models/Setting');

// Get all candidates
const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    
    // Check if user is admin, if not check if election is active to show results or not
    // We can also just send candidates with voteCount hidden for students, but to keep it simple, 
    // we'll send everything. Real app might want to hide voteCount for students until election is over.
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a candidate (Admin only)
const addCandidate = async (req, res) => {
  try {
    const { name, department, position, manifesto, image } = req.body;
    
    const candidate = new Candidate({
      name,
      department,
      position,
      manifesto,
      image
    });

    const createdCandidate = await candidate.save();
    res.status(201).json(createdCandidate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a candidate (Admin only)
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    await candidate.deleteOne();
    res.json({ message: 'Candidate removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getCandidates, addCandidate, deleteCandidate };
