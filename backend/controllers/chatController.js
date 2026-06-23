const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get chat message history with a specific user
// @route   GET /api/chat/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const chatPartnerId = req.params.userId;
    const currentUserId = req.user.id;

    // Get messages between current user and chat partner
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: chatPartnerId },
        { sender: chatPartnerId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages sent by partner to current user as read
    await Message.updateMany(
      { sender: chatPartnerId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of active conversations
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email role title')
      .populate('receiver', 'name email role title');

    // Filter to get unique conversation partners
    const conversationMap = new Map();

    for (const msg of messages) {
      const partner = msg.sender._id.toString() === currentUserId ? msg.receiver : msg.sender;
      const partnerId = partner._id.toString();

      if (!conversationMap.has(partnerId)) {
        // Count unread messages from this partner
        const unreadCount = await Message.countDocuments({
          sender: partnerId,
          receiver: currentUserId,
          read: false
        });

        conversationMap.set(partnerId, {
          user: {
            id: partner._id,
            name: partner.name,
            email: partner.email,
            role: partner.role,
            title: partner.title
          },
          lastMessage: {
            content: msg.content,
            sender: msg.sender._id,
            createdAt: msg.createdAt
          },
          unreadCount
        });
      }
    }

    const conversations = Array.from(conversationMap.values());
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
