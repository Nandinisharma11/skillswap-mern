const User = require('../models/User');
const Session = require('../models/Session');

// @desc    Get platform analytics (Users, Sessions, Popular Skills)
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    // 1. User stats
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const mentorsCount = await User.countDocuments({ role: 'mentor' });
    const bannedCount = await User.countDocuments({ isBanned: true });

    // 2. Session stats
    const totalSessions = await Session.countDocuments();
    const pendingSessions = await Session.countDocuments({ status: 'pending' });
    const acceptedSessions = await Session.countDocuments({ status: 'accepted' });
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const rejectedSessions = await Session.countDocuments({ status: 'rejected' });

    // 3. Top skills to teach
    const allUsers = await User.find({ isBanned: false });
    const skillTeachMap = {};
    const skillLearnMap = {};

    allUsers.forEach(user => {
      user.skillsToTeach.forEach(skill => {
        const normalized = skill.trim().toLowerCase();
        skillTeachMap[normalized] = (skillTeachMap[normalized] || 0) + 1;
      });
      user.skillsToLearn.forEach(skill => {
        const normalized = skill.trim().toLowerCase();
        skillLearnMap[normalized] = (skillLearnMap[normalized] || 0) + 1;
      });
    });

    // Sort skills
    const topSkillsToTeach = Object.entries(skillTeachMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => ({ skill: entry[0], count: entry[1] }));

    const topSkillsToLearn = Object.entries(skillLearnMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => ({ skill: entry[0], count: entry[1] }));

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: studentsCount,
          mentors: mentorsCount,
          banned: bannedCount
        },
        sessions: {
          total: totalSessions,
          pending: pendingSessions,
          accepted: acceptedSessions,
          completed: completedSessions,
          rejected: rejectedSessions
        },
        skills: {
          topToTeach: topSkillsToTeach,
          topToLearn: topSkillsToLearn
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users with filtering and search
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = {};

    if (role && ['student', 'mentor', 'admin'].includes(role)) {
      query.role = role;
    }

    if (status) {
      if (status === 'banned') query.isBanned = true;
      if (status === 'active') query.isBanned = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Ban/Unban user status
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety check: Cannot ban oneself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot ban your own administrator account' });
    }

    // Toggle ban status
    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      success: true,
      message: `User has been successfully ${user.isBanned ? 'banned' : 'unbanned'}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
