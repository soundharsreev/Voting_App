const Setting = require('../models/Setting');
const Candidate = require('../models/Candidate');
const Student = require('../models/Student');

// Toggle Election Status
const toggleElectionStatus = async (req, res) => {
  try {
    const { active } = req.body;

    let setting = await Setting.findOne({ key: 'electionActive' });
    
    if (setting) {
      setting.value = active;
      await setting.save();
    } else {
      setting = new Setting({ key: 'electionActive', value: active });
      await setting.save();
    }

    res.json({ message: `Election is now ${active ? 'Active' : 'Closed'}`, setting });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Election Status
const getElectionStatus = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'electionActive' });
    if (!setting) {
      // Default to false if not set
      setting = new Setting({ key: 'electionActive', value: false });
      await setting.save();
    }
    res.json({ active: setting.value });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Results (Admin or public if closed, but we'll stick to admin for now or simple results)
const getResults = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'electionActive' });
    const isActive = setting ? setting.value : false;

    // If the user is not an admin or superadmin, and the election is still active, deny access
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && isActive) {
      return res.status(403).json({ message: 'The Election is not completed until the Results are published' });
    }

    const candidates = await Candidate.find({}).sort({ voteCount: -1 });
    
    const totalVotes = candidates.reduce((acc, curr) => acc + curr.voteCount, 0);

    res.json({ candidates, totalVotes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all students (for admin)
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({}).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Promote student to admin
const promoteToAdmin = async (req, res) => {
  try {
    // Only admins or superadmins can promote
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to promote users' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.role = 'admin';
    await student.save();

    res.json({ message: 'User promoted to Admin successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Demote admin to student
const demoteToStudent = async (req, res) => {
  try {
    // Only superadmins can demote admins
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Not authorized to demote users. Only Main Admins can do this.' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.role = 'student';
    await student.save();

    res.json({ message: 'User demoted to Student successfully', student });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { toggleElectionStatus, getElectionStatus, getResults, getStudents, promoteToAdmin, demoteToStudent };
