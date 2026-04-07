const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Student = require('../models/Student');
const Setting = require('../models/Setting');

const castVote = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const studentId = req.user.id; // from protect middleware

    // Check if election is active
    const setting = await Setting.findOne({ key: 'electionActive' });
    const isActive = setting ? setting.value : false;
    
    if (!isActive) {
      return res.status(400).json({ message: 'Election is currently closed' });
    }

    // Check if student has already voted (via DB query to be safe, though jwt has info)
    const student = await Student.findById(studentId);
    if (student.hasVoted) {
      return res.status(400).json({ message: 'You have already voted' });
    }

    // Create Vote record
    const vote = new Vote({
      studentId: student._id,
      candidateId
    });
    
    await vote.save();

    // Increment Candidate vote code
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

    // Update Student hasVoted to true
    student.hasVoted = true;
    await student.save();

    res.status(200).json({ message: 'Vote successfully cast' });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted (duplicate vote detected)' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { castVote };
