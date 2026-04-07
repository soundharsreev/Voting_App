const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, studentId, department, password, role } = req.body;

    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ message: 'Student ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If it's the first user ever, make them a superadmin by default!
    const isFirstUser = (await Student.countDocuments({})) === 0;
    const finalRole = isFirstUser ? 'superadmin' : (role || 'student');

    const student = await Student.create({
      name,
      studentId,
      department,
      password: hashedPassword,
      role: finalRole
    });

    if (student) {
      res.status(201).json({
        message: 'Student registered successfully. Please sign in to continue.',
        student: {
          _id: student._id,
          name: student.name,
          studentId: student.studentId,
          role: student.role
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    const student = await Student.findOne({ studentId });

    if (student && (await bcrypt.compare(password, student.password))) {
      res.json({
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        role: student.role,
        hasVoted: student.hasVoted,
        token: generateToken(student._id, student.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset Admin Password
const resetAdminPassword = async (req, res) => {
  try {
    const { studentId, secretKey, newPassword } = req.body;

    // Check if secret key is correct
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ message: 'Invalid Secret Key' });
    }

    const user = await Student.findOne({ studentId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only admins or superadmins can use the secret key reset' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully. You may now log in.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  resetAdminPassword
};
