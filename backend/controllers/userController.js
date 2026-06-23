const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, title, bio, skillsToTeach, skillsToLearn, role } = req.body;

    if (name) user.name = name;
    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;
    if (skillsToTeach !== undefined) user.skillsToTeach = skillsToTeach;
    if (skillsToLearn !== undefined) user.skillsToLearn = skillsToLearn;
    
    // Allow users to toggle between student and mentor roles (admin is protected)
    if (role && ['student', 'mentor'].includes(role) && user.role !== 'admin') {
      user.role = role;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        title: updatedUser.title,
        bio: updatedUser.bio,
        skillsToTeach: updatedUser.skillsToTeach,
        skillsToLearn: updatedUser.skillsToLearn,
        averageRating: updatedUser.averageRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search mentors/teachers by skill or name
// @route   GET /api/users/mentors
// @access  Private
exports.searchMentors = async (req, res) => {
  try {
    const { skill, search } = req.query;
    let query = {
      _id: { $ne: req.user.id }, // Exclude self
      isBanned: false,
      role: 'mentor' // Search for mentors
    };

    if (skill) {
      query.skillsToTeach = { $in: [new RegExp(skill, 'i')] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { skillsToTeach: { $regex: search, $options: 'i' } }
      ];
    }

    const mentors = await User.find(query)
      .select('-createdAt -updatedAt -__v')
      .populate('ratings.student', 'name');

    res.json({ success: true, count: mentors.length, data: mentors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
