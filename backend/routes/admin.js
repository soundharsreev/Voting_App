const express = require('express');
const router = express.Router();
const { toggleElectionStatus, getElectionStatus, getResults, getStudents, promoteToAdmin, demoteToStudent } = require('../controllers/adminController');
const { protect, adminOnly, superAdminOnly } = require('../middleware/authMiddleware');

router.get('/status', getElectionStatus);
router.put('/status', protect, adminOnly, toggleElectionStatus);
router.get('/results', protect, getResults); 
router.get('/students', protect, adminOnly, getStudents);
router.put('/students/:id/promote', protect, adminOnly, promoteToAdmin);
router.put('/students/:id/demote', protect, superAdminOnly, demoteToStudent);

module.exports = router;
