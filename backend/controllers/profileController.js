const Student = require('../models/Student');
const bcrypt = require('bcrypt');

// Update user profile (studentId, password, and name)
const updateProfile = async (req, res) => {
  try {
    const { studentId, password, name } = req.body;
    
    // Find the current logged in user
    const user = await Student.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new studentId is already taken by someone else
    if (studentId && studentId !== user.studentId) {
      const existingUser = await Student.findOne({ studentId });
      if (existingUser) {
        return res.status(400).json({ message: 'Student ID already in use' });
      }
      user.studentId = studentId;
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    // Update name if provided
    if (name) {
      user.name = name;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      studentId: user.studentId,
      role: user.role,
      message: 'Profile updated successfully. Please log in again with your new credentials.'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { updateProfile };
