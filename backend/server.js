const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Student = require('./models/Student');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/votingweb').then(async () => {
  console.log('Connected to MongoDB');
  
  // Requirement: If no admin exists, automatically create a default Super Admin account
  try {
    const adminCount = await Student.countDocuments({ role: 'superadmin' });
    if (adminCount === 0) {
      console.log('No Super Admin found. Bootstrapping default Super Admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await Student.create({
        name: 'Default Admin',
        studentId: 'admin123', // Act as username/email
        department: 'Administration',
        password: hashedPassword,
        role: 'superadmin',
        hasVoted: true
      });
      console.log('Default Super Admin created: ID = admin123, Password = password123');
    }
  } catch (err) {
    console.error('Failed to bootstrap admin:', err);
  }
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

// Import Routes (will be created next)
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const voteRoutes = require('./routes/vote');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('Voting Web App Backend API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
