const mongoose = require('mongoose');
const Student = require('./models/Student');

mongoose.connect('mongodb://localhost:27017/votingweb').then(async () => {
  const users = await Student.find({}, { name: 1, studentId: 1, role: 1, _id: 0 });
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
