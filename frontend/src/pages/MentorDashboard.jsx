import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Award, Calendar, Check, MessageSquare, Star, Trash2, User, UserCheck, X } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const MentorDashboard = () => {
  const { user, updateProfile, API_URL } = useAuth();
  const navigate = useNavigate();

  // Profile fields state (shares structure with student profile)
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsToTeach, setSkillsToTeach] = useState(user?.skillsToTeach || []);
  const [skillsToLearn, setSkillsToLearn] = useState(user?.skillsToLearn || []);
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // UI state
  const [toast, setToast] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await axios.get(`${API_URL}/sessions/my-sessions`);
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      showToast('Error loading session list', 'error');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Profile skill handlers
  const handleAddTeachSkill = (e) => {
    if (e.key === 'Enter' && teachInput.trim()) {
      e.preventDefault();
      if (!skillsToTeach.includes(teachInput.trim())) {
        setSkillsToTeach([...skillsToTeach, teachInput.trim()]);
      }
      setTeachInput('');
    }
  };

  const handleRemoveTeachSkill = (skillToRemove) => {
    setSkillsToTeach(skillsToTeach.filter(s => s !== skillToRemove));
  };

  const handleAddLearnSkill = (e) => {
    if (e.key === 'Enter' && learnInput.trim()) {
      e.preventDefault();
      if (!skillsToLearn.includes(learnInput.trim())) {
        setSkillsToLearn([...skillsToLearn, learnInput.trim()]);
      }
      setLearnInput('');
    }
  };

  const handleRemoveLearnSkill = (skillToRemove) => {
    setSkillsToLearn(skillsToLearn.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const res = await updateProfile({
        name,
        title,
        bio,
        skillsToTeach,
        skillsToLearn
      });
      if (res.success) {
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Profile update failed', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Manage Session status (Accept / Reject / Complete)
  const handleStatusUpdate = async (sessionId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/sessions/${sessionId}/status`, {
        status: newStatus
      });

      if (res.data.success) {
        showToast(`Session successfully ${newStatus}!`, 'success');
        fetchSessions(); // refresh list
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating session status', 'error');
    }
  };

  // Group reviews from User model
  const ratingsList = user?.ratings || [];

  return (
    <div className="main-content fade-in">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      <div className="dashboard-layout">
        
        {/* Sidebar Controls */}
        <aside className="sidebar">
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '15px' }}>Mentor Dashboard</h4>
          <span className="sidebar-link active">
            <UserCheck size={18} /> Manage Peer Sessions
          </span>
          <span className="sidebar-link" onClick={() => navigate('/chat')} style={{ cursor: 'pointer' }}>
            <MessageSquare size={18} /> Active Chats
          </span>
          
          <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Searching for a class? Switch your role to student in the profile column!</p>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="dashboard-content">
          <div className="metrics-row">
            <div className="glass-card metric-card">
              <div className="metric-info">
                <h3>My Ratings Score</h3>
                <p>{user?.averageRating > 0 ? user.averageRating : '0.0'}</p>
              </div>
              <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
                <Star size={24} fill="#f59e0b" color="#f59e0b" />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div className="metric-info">
                <h3>Incoming Requests</h3>
                <p>{sessions.filter(s => s.status === 'pending').length}</p>
              </div>
              <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div className="metric-info">
                <h3>Completed Lessons</h3>
                <p>{sessions.filter(s => s.status === 'completed').length}</p>
              </div>
              <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                <Award size={24} />
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-column">
              
              {/* Mentorship Requests management panel */}
              <section className="glass-card dashboard-section">
                <div className="section-header">
                  <h2>Mentorship Bookings & Requests</h2>
                </div>

                {loadingSessions ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Loading sessions...</p>
                ) : sessions.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>You don't have any booking requests yet. Add skills to teach to get listed!</p>
                ) : (
                  <div className="table-container">
                    <table className="session-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>SkillRequested</th>
                          <th>Proposed Date</th>
                          <th>Duration</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((sess) => (
                          <tr key={sess._id}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600 }}>{sess.student?.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sess.student?.title || 'Student'}</span>
                              </div>
                            </td>
                            <td><span className="skill-tag">{sess.skill}</span></td>
                            <td>{new Date(sess.proposedDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                            <td>{sess.duration}m</td>
                            <td>
                              <span className={`status-badge status-${sess.status}`}>{sess.status}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {sess.status === 'pending' && (
                                  <>
                                    <button
                                      className="btn btn-primary btn-small"
                                      onClick={() => handleStatusUpdate(sess._id, 'accepted')}
                                      title="Accept request"
                                      style={{ padding: '6px 12px' }}
                                    >
                                      <Check size={14} /> Accept
                                    </button>
                                    <button
                                      className="btn btn-danger btn-small"
                                      onClick={() => handleStatusUpdate(sess._id, 'rejected')}
                                      title="Reject request"
                                      style={{ padding: '6px 12px' }}
                                    >
                                      <X size={14} /> Reject
                                    </button>
                                  </>
                                )}
                                
                                {sess.status === 'accepted' && (
                                  <button
                                    className="btn btn-secondary btn-small"
                                    onClick={() => handleStatusUpdate(sess._id, 'completed')}
                                  >
                                    Mark Complete
                                  </button>
                                )}

                                <button
                                  className="btn btn-outline btn-small"
                                  onClick={() => navigate(`/chat?partnerId=${sess.student?._id}`)}
                                  title="Chat with student"
                                >
                                  <MessageSquare size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Student Ratings & Reviews Testimonials Feed */}
              <section className="glass-card dashboard-section">
                <h2>Ratings & Student Reviews</h2>
                <div style={{ marginTop: '20px' }}>
                  {ratingsList.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>You haven't received any review testimonials yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {ratingsList.map((rate, i) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{rate.student?.name || 'Anonymous Student'}</span>
                            <RatingStars rating={rate.rating} />
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            "{rate.review}"
                          </p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            Posted on {new Date(rate.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Profile Manager Setup */}
            <div className="grid-column">
              <section className="glass-card dashboard-section">
                <h2>My Mentorship Profile</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>List the topics you can instruct to begin receiving student matches.</p>

                <form onSubmit={handleSaveProfile}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mentor Headline / Specialty</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior CS Major | Full Stack Developer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teaching Philosophy / Bio</label>
                    <textarea
                      className="form-input"
                      placeholder="Explain how you can help students master skills..."
                      rows="3"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={{ resize: 'none', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skills I Can Teach (Press Enter)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add a teaching skill"
                      value={teachInput}
                      onChange={(e) => setTeachInput(e.target.value)}
                      onKeyDown={handleAddTeachSkill}
                    />
                    <div className="skills-container">
                      {skillsToTeach.map((sk) => (
                        <span key={sk} className="skill-tag">
                          {sk}
                          <button type="button" className="skill-tag-remove" onClick={() => handleRemoveTeachSkill(sk)}>&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Skills I Want to Learn (Press Enter)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add a skill you want to acquire"
                      value={learnInput}
                      onChange={(e) => setLearnInput(e.target.value)}
                      onKeyDown={handleAddLearnSkill}
                    />
                    <div className="skills-container">
                      {skillsToLearn.map((sk) => (
                        <span key={sk} className="skill-tag" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--color-secondary)', borderColor: 'rgba(236, 72, 153, 0.2)' }}>
                          {sk}
                          <button type="button" className="skill-tag-remove" onClick={() => handleRemoveLearnSkill(sk)}>&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">My Active Role</label>
                    <select
                      className="form-input"
                      value={user?.role}
                      onChange={(e) => updateProfile({ role: e.target.value })}
                      style={{ background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer' }}
                    >
                      <option value="student" style={{ background: '#1e293b' }}>Student Mode (Find Mentors)</option>
                      <option value="mentor" style={{ background: '#1e293b' }}>Mentor Mode (Accept Session Requests)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={isSavingProfile}>
                    {isSavingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
                  </button>
                </form>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorDashboard;
