const express = require('express');
const router = express.Router();
const { requestSession, getMySessions, updateSessionStatus, rateSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/request', requestSession);
router.get('/my-sessions', getMySessions);
router.put('/:id/status', updateSessionStatus);
router.put('/:id/rate', rateSession);

module.exports = router;
