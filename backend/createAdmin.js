const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Student = require('./models/Student');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/votingweb').then(async () => {
  console.log('Connected to MongoDB');
  
  const studentId = 'admin123';
  const password = 'password123';
  
  // Check if user exists
  let user = await Student.findOne({ studentId });
  if (user) {
    console.log('User already exists, deleting it to recreate...');
    await Student.deleteOne({ studentId });
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const newAdmin = await Student.create({
    name: 'Main Admin',
    studentId: studentId,
    department: 'Admin Dept',
    password: hashedPassword,
    role: 'admin',
    hasVoted: false
  });
  
  console.log('Created new explicit admin user:');
  console.log(`Student ID: ${studentId}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${newAdmin.role}`);
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
