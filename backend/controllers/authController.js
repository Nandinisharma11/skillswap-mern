const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_123456', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Role safety check (cannot register directly as admin unless through seed/env setting)
    const assignedRole = role === 'admin' ? 'student' : role || 'student';

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if banned
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been banned by the administrator' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        bio: user.bio,
        skillsToTeach: user.skillsToTeach,
        skillsToLearn: user.skillsToLearn,
        averageRating: user.averageRating
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Temporary in-memory reset store for simplified implementation (no external redis/db-bloat needed for simple reset links)
const resetTokens = new Map();

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour

    resetTokens.set(resetToken, { userId: user._id, expires });

    // In production, send via email. Here, we return it in response and log to server console for testing convenience.
    console.log(`\n--- PASSWORD RESET REQUEST ---`);
    console.log(`Email: ${email}`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset Link: http://localhost:5173/reset-password/${resetToken}`);
    console.log(`------------------------------\n`);

    res.json({
      success: true,
      message: 'Password reset link generated. Check server console for link (mock email).',
      resetToken // Returned for easy client testing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const session = resetTokens.get(token);

    if (!session || session.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Set new password (will be hashed automatically via User model pre-save hook)
    user.password = password;
    await user.save();

    // Remove token from cache
    resetTokens.delete(token);

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
