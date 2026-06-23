const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: String,
    required: [true, 'Please specify the skill you want to learn'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  proposedDate: {
    type: Date,
    required: [true, 'Please select a date and time for the session']
  },
  duration: {
    type: Number,
    required: [true, 'Please specify the session duration in minutes'],
    min: [15, 'Minimum duration is 15 minutes'],
    max: [180, 'Maximum duration is 3 hours (180 minutes)']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);
