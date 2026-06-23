const express = require('express');
const router = express.Router();
const { getAnalytics, getUsers, toggleBanUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes and require 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBanUser);

module.exports = router;
