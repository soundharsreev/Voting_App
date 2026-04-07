const express = require('express');
const router = express.Router();
const { getCandidates, addCandidate, deleteCandidate } = require('../controllers/candidateController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCandidates)
  .post(protect, adminOnly, addCandidate);

router.route('/:id')
  .delete(protect, adminOnly, deleteCandidate);

module.exports = router;
