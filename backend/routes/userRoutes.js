const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, searchMentors } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/mentors', searchMentors);

module.exports = router;
