const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Request a mentorship session
// @route   POST /api/sessions/request
// @access  Private
exports.requestSession = async (req, res) => {
  try {
    const { mentorId, skill, proposedDate, duration, description } = req.body;

    if (!mentorId || !skill || !proposedDate || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Verify mentor exists and is actually a mentor
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ success: false, message: 'Invalid mentor selected' });
    }

    if (mentor.isBanned) {
      return res.status(400).json({ success: false, message: 'This mentor is currently unavailable' });
    }

    // Create session request
    const session = await Session.create({
      student: req.user.id,
      mentor: mentorId,
      skill,
      proposedDate,
      duration,
      description,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Session requested successfully', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's sessions (History)
// @route   GET /api/sessions/my-sessions
// @access  Private
exports.getMySessions = async (req, res) => {
  try {
    let query = {};
    
    // Filter sessions based on role
    if (req.user.role === 'mentor') {
      query.mentor = req.user.id;
    } else if (req.user.role === 'student') {
      query.student = req.user.id;
    } else {
      // Admins see all
      query = {};
    }

    const sessions = await Session.find(query)
      .populate('student', 'name email title')
      .populate('mentor', 'name email title averageRating')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session status (Accept/Reject/Complete)
// @route   PUT /api/sessions/:id/status
// @access  Private
exports.updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Authorization check: Only the mentor assigned can accept/reject/complete
    if (session.mentor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this session' });
    }

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid session status' });
    }

    session.status = status;
    await session.save();

    res.json({ success: true, message: `Session status updated to ${status}`, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rate and review a completed session
// @route   PUT /api/sessions/:id/rate
// @access  Private
exports.rateSession = async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a rating between 1 and 5' });
    }

    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Check authorization: Only the student of this session can rate it
    if (session.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the session student can rate this session' });
    }

    // Check status: Session must be completed or accepted to be rated
    if (session.status !== 'completed' && session.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'You can only rate accepted or completed sessions' });
    }

    // Set rating in session
    session.rating = rating;
    session.review = review;
    session.status = 'completed'; // Force status to completed when rated
    await session.save();

    // Add rating to mentor profile
    const mentor = await User.findById(session.mentor);
    if (mentor) {
      // Check if rating already added to this mentor's reviews array from this session
      // (avoid duplicates if request is repeated)
      mentor.ratings.push({
        student: req.user.id,
        rating,
        review,
        createdAt: new Date()
      });

      // Recalculate average rating
      const totalRatings = mentor.ratings.length;
      const sumRatings = mentor.ratings.reduce((sum, item) => sum + item.rating, 0);
      mentor.averageRating = parseFloat((sumRatings / totalRatings).toFixed(2));

      await mentor.save();
    }

    res.json({ success: true, message: 'Session rated successfully', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
