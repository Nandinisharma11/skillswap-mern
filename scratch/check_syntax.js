const fs = require('fs');
const path = require('path');

console.log('Starting validation checks...');

try {
  // Test loading models
  console.log('Checking models...');
  const User = require('../backend/models/User');
  const Session = require('../backend/models/Session');
  const Message = require('../backend/models/Message');
  console.log('✓ Models imported successfully.');

  // Test loading middleware
  console.log('Checking middlewares...');
  const auth = require('../backend/middleware/auth');
  console.log('✓ Middlewares imported successfully.');

  // Test loading controllers
  console.log('Checking controllers...');
  const authController = require('../backend/controllers/authController');
  const userController = require('../backend/controllers/userController');
  const sessionController = require('../backend/controllers/sessionController');
  const chatController = require('../backend/controllers/chatController');
  const adminController = require('../backend/controllers/adminController');
  console.log('✓ Controllers imported successfully.');

  // Test loading database config
  console.log('Checking DB configuration...');
  const connectDB = require('../backend/config/db');
  console.log('✓ DB connection configuration loaded.');

  console.log('\n=======================================');
  console.log('🎉 ALL BACKEND COMPILATION CHECKS PASSED!');
  console.log('=======================================');
} catch (error) {
  console.error('❌ Compilation / import check failed:');
  console.error(error);
  process.exit(1);
}
