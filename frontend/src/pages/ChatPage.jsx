import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Send } from 'lucide-react';
import Toast from '../components/Toast';

const ChatPage = () => {
  const { user, API_URL } = useAuth();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  // Conversational state
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  
  // Real-time statuses
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // UI state
  const [toast, setToast] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  // Load conversations list on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle socket event listeners for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // If the incoming message belongs to our active conversation
      const currentPartnerId = activePartner?.id || activePartner?._id;
      if (
        (msg.sender === currentPartnerId && msg.receiver === user.id) ||
        (msg.sender === user.id && msg.receiver === currentPartnerId)
      ) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      
      // Always refresh conversations list to update sidebar previews/unread counts
      fetchConversations();
    };

    const handleTypingStatus = (data) => {
      const currentPartnerId = activePartner?.id || activePartner?._id;
      if (data.senderId === currentPartnerId) {
        setIsPartnerTyping(data.isTyping);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTypingStatus);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTypingStatus);
    };
  }, [socket, activePartner, user]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchConversations = async (targetPartnerId = null) => {
    try {
      setLoadingConversations(true);
      const res = await axios.get(`${API_URL}/chat/conversations`);
      if (res.data.success) {
        setConversations(res.data.data);

        // If targetPartnerId is provided (e.g. from query param) or we already have one
        const activeId = targetPartnerId || new URLSearchParams(window.location.search).get('partnerId');
        if (activeId) {
          // Check if this partner already has a conversation
          const existingConv = res.data.data.find(c => c.user.id === activeId);
          if (existingConv) {
            setActivePartner(existingConv.user);
            fetchMessages(activeId);
          } else {
            // Start a new mock/empty conversation item by fetching the user details
            fetchNewPartnerDetails(activeId);
          }
        }
      }
    } catch (err) {
      showToast('Error loading chat contacts list', 'error');
    } finally {
      setLoadingConversations(false);
    }
  };

  // Fetch info for a brand new chat partner not in the conversation list yet
  const fetchNewPartnerDetails = async (partnerId) => {
    try {
      // Temporary fetch profile of the mentor
      const res = await axios.get(`${API_URL}/users/mentors`);
      if (res.data.success) {
        const found = res.data.data.find(m => m._id === partnerId);
        if (found) {
          const tempPartner = {
            id: found._id,
            name: found.name,
            email: found.email,
            role: found.role,
            title: found.title
          };
          setActivePartner(tempPartner);
          setMessages([]);
        }
      }
    } catch (err) {
      showToast('Error initializing conversation with new partner', 'error');
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      setLoadingMessages(true);
      const res = await axios.get(`${API_URL}/chat/messages/${partnerId}`);
      if (res.data.success) {
        setMessages(res.data.data);
        scrollToBottom();
      }
    } catch (err) {
      showToast('Error fetching messages history', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectPartner = (partner) => {
    setActivePartner(partner);
    setIsPartnerTyping(false);
    fetchMessages(partner.id || partner._id);

    // Clear unread counts locally
    setConversations(prev =>
      prev.map(c => (c.user.id === partner.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessageSubmit = (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activePartner) return;

    const partnerId = activePartner.id || activePartner._id;

    if (socket) {
      // Send message via WebSocket
      socket.emit('send_message', {
        sender: user.id || user._id,
        receiver: partnerId,
        content: newMessageText.trim()
      });

      // Clear local message typing indicator
      socket.emit('typing', {
        senderId: user.id || user._id,
        receiverId: partnerId,
        isTyping: false
      });
    }

    setNewMessageText('');
  };

  const handleTypingKeyAction = () => {
    if (!socket || !activePartner) return;

    const partnerId = activePartner.id || activePartner._id;

    // Send typing status as true
    socket.emit('typing', {
      senderId: user.id || user._id,
      receiverId: partnerId,
      isTyping: true
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Set timeout to clear typing state after 2 seconds of silence
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        senderId: user.id || user._id,
        receiverId: partnerId,
        isTyping: false
      });
    }, 2000);
  };

  return (
    <div className="chat-container fade-in">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Sidebar Contacts List */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>Chat Sessions</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active peer correspondences</p>
        </div>

        <div className="chat-sidebar-list">
          {loadingConversations && conversations.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No conversations yet. Browse mentors to start a chat!</p>
          ) : (
            conversations.map((conv) => {
              const isSelected = activePartner?.id === conv.user.id || activePartner?._id === conv.user.id;
              return (
                <div
                  key={conv.user.id}
                  className={`chat-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectPartner(conv.user)}
                >
                  <div className="mentor-avatar" style={{ width: '36px', height: '36px', fontSize: '0.95rem' }}>
                    {conv.user.name.charAt(0)}
                  </div>
                  <div className="chat-item-info">
                    <div className="chat-item-header">
                      <span className="chat-item-name">{conv.user.name}</span>
                      <span className="chat-item-time">
                        {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="chat-item-preview">
                        {conv.lastMessage.sender === user.id ? 'You: ' : ''}
                        {conv.lastMessage.content}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Active Messaging Box */}
      <section className="chat-window">
        {activePartner ? (
          <>
            {/* Header info */}
            <div className="chat-window-header">
              <div className="mentor-avatar" style={{ width: '40px', height: '40px' }}>
                {activePartner.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem' }}>{activePartner.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activePartner.title || 'Student Mentor'}
                </p>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="chat-messages">
              {loadingMessages && messages.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading message history...</p>
              ) : messages.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '40px 0' }}>
                  No messages yet. Send a message to introduce yourself!
                </p>
              ) : (
                messages.map((msg, i) => {
                  const isSentByMe = msg.sender === user.id || msg.sender === (user._id || user.id);
                  return (
                    <div key={i} className={`chat-bubble-container ${isSentByMe ? 'sent' : 'received'}`}>
                      <div className="chat-bubble">
                        <p>{msg.content}</p>
                        <div className="chat-bubble-time">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator Status */}
            {isPartnerTyping && (
              <div className="typing-indicator">
                {activePartner.name} is typing...
              </div>
            )}

            {/* Chat message form input */}
            <div className="chat-input-area">
              <form onSubmit={handleSendMessageSubmit} className="chat-input-form">
                <input
                  type="text"
                  className="form-input chat-input-field"
                  placeholder="Type your message here..."
                  value={newMessageText}
                  onChange={(e) => {
                    setNewMessageText(e.target.value);
                    handleTypingKeyAction();
                  }}
                  required
                />
                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            gap: '16px'
          }}>
            <MessageSquare size={48} style={{ color: 'var(--text-muted)' }} />
            <h3>Select a Conversation</h3>
            <p style={{ maxWidth: '300px', textAlign: 'center', fontSize: '0.9rem' }}>
              Choose a classmate from the sidebar or click Chat in the Mentor listings to begin a real-time discussion.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatPage;
