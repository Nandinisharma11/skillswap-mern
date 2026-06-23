import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, Clock, MessageSquare, Search, Star, UserCheck } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, updateProfile, API_URL } = useAuth();
  const navigate = useNavigate();

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsToTeach, setSkillsToTeach] = useState(user?.skillsToTeach || []);
  const [skillsToLearn, setSkillsToLearn] = useState(user?.skillsToLearn || []);
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');

  // Mentors search state
  const [searchQuery, setSearchQuery] = useState('');
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  // Sessions history state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Modal controls
  const [selectedMentor, setSelectedMentor] = useState(null); // for requesting session
  const [sessionSkill, setSessionSkill] = useState('');
  const [proposedDate, setProposedDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');

  const [ratingSession, setRatingSession] = useState(null); // for rating a completed session
  const [sessionRating, setSessionRating] = useState(5);
  const [sessionReview, setSessionReview] = useState('');

  // UI state
  const [toast, setToast] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchMentors();
    fetchSessions();
  }, []);

  const fetchMentors = async (searchVal = '') => {
    try {
      setLoadingMentors(true);
      const url = searchVal
        ? `${API_URL}/users/mentors?search=${encodeURIComponent(searchVal)}`
        : `${API_URL}/users/mentors`;
      const res = await axios.get(url);
      if (res.data.success) {
        setMentors(res.data.data);
      }
    } catch (err) {
      showToast('Error loading mentors list', 'error');
    } finally {
      setLoadingMentors(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await axios.get(`${API_URL}/sessions/my-sessions`);
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      showToast('Error loading session history', 'error');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Profile skill additions
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

  // Session Request Submission
  const handleRequestSessionSubmit = async (e) => {
    e.preventDefault();
    if (!sessionSkill || !proposedDate || !duration) {
      showToast('Please fill in all booking fields', 'error');
      return;
    }

    try {
      setIsSubmittingSession(true);
      const res = await axios.post(`${API_URL}/sessions/request`, {
        mentorId: selectedMentor._id,
        skill: sessionSkill,
        proposedDate,
        duration: parseInt(duration),
        description
      });

      if (res.data.success) {
        showToast('Mentorship request sent successfully!', 'success');
        setSelectedMentor(null); // close modal
        setDescription('');
        setProposedDate('');
        fetchSessions(); // refresh history
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking request failed', 'error');
    } finally {
      setIsSubmittingSession(false);
    }
  };

  // Session Rating Submission
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingRating(true);
      const res = await axios.put(`${API_URL}/sessions/${ratingSession._id}/rate`, {
        rating: sessionRating,
        review: sessionReview
      });

      if (res.data.success) {
        showToast('Feedback submitted! Thank you.', 'success');
        setRatingSession(null); // close modal
        setSessionReview('');
        setSessionRating(5);
        fetchSessions(); // refresh history
        fetchMentors(); // refresh mentor rating indicators
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Review submission failed', 'error');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleOpenRequestModal = (mentor) => {
    setSelectedMentor(mentor);
    // Auto-select the first skill of the mentor's teach skills
    if (mentor.skillsToTeach && mentor.skillsToTeach.length > 0) {
      setSessionSkill(mentor.skillsToTeach[0]);
    } else {
      setSessionSkill('');
    }
  };

  return (
    <div className="main-content fade-in">
      {toast && (
        <div className="toast-container">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Global Wrapper Grid */}
      <div className="dashboard-layout">
        
        {/* Sidebar Controls */}
        <aside className="sidebar">
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '15px' }}>Student Dashboard</h4>
          <span className="sidebar-link active">
            <BookOpen size={18} /> Learn & Find Peer Mentors
          </span>
          <span className="sidebar-link" onClick={() => navigate('/chat')} style={{ cursor: 'pointer' }}>
            <MessageSquare size={18} /> Active Chats
          </span>
          
          <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Want to teach others? Switch your role in the profile section!</p>
          </div>
        </aside>

        {/* Dash Page Area */}
        <main className="dashboard-content">
          <div className="metrics-row">
            <div className="glass-card metric-card">
              <div className="metric-info">
                <h3>My Session Bookings</h3>
                <p>{sessions.length}</p>
              </div>
              <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                <Calendar size={24} />
              </div>
            </div>
            <div className="glass-card metric-card">
              <div className="metric-info">
                <h3>Completed Classes</h3>
                <p>{sessions.filter(s => s.status === 'completed').length}</p>
              </div>
              <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                <UserCheck size={24} />
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="grid-column">
              
              {/* Search Mentor Section */}
              <section className="glass-card dashboard-section">
                <div className="section-header">
                  <h2>Search Peer Mentors</h2>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search by skill name (e.g. JavaScript, Python, UI Design)..."
                      style={{ paddingLeft: '48px', width: '100%' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchMentors(searchQuery)}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={() => fetchMentors(searchQuery)}>
                    Search
                  </button>
                </div>

                {loadingMentors ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Finding available peer mentors...</p>
                ) : mentors.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No mentors found teaching that skill. Try searching "React" or adjust terms.</p>
                ) : (
                  <div className="mentors-list">
                    {mentors.map((mentor) => (
                      <div key={mentor._id} className="glass-card mentor-card">
                        <div className="mentor-card-header">
                          <div className="mentor-avatar">
                            {mentor.name.charAt(0)}
                          </div>
                          <div className="mentor-info">
                            <h4>{mentor.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{mentor.title || 'Student Mentor'}</p>
                            <div className="mentor-rating">
                              <Star size={14} fill="#f59e0b" color="#f59e0b" />
                              <span>{mentor.averageRating > 0 ? `${mentor.averageRating} (${mentor.ratings.length} reviews)` : 'No ratings yet'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Teaches:</p>
                          <div className="skills-container">
                            {mentor.skillsToTeach.map((sk, i) => (
                              <span key={i} className="skill-tag">{sk}</span>
                            ))}
                          </div>
                        </div>

                        {mentor.bio && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--color-primary)', paddingLeft: '8px' }}>
                            "{mentor.bio.length > 80 ? `${mentor.bio.slice(0, 80)}...` : mentor.bio}"
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button className="btn btn-primary btn-small" style={{ flex: 1 }} onClick={() => handleOpenRequestModal(mentor)}>
                            Request Session
                          </button>
                          <button className="btn btn-outline btn-small" onClick={() => navigate(`/chat?partnerId=${mentor._id}`)}>
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Booking History Table */}
              <section className="glass-card dashboard-section">
                <div className="section-header">
                  <h2>Booking Request History</h2>
                </div>
                {loadingSessions ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Loading history...</p>
                ) : sessions.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>You haven't requested any mentorship sessions yet. Use the mentor search to get started!</p>
                ) : (
                  <div className="table-container">
                    <table className="session-table">
                      <thead>
                        <tr>
                          <th>Mentor</th>
                          <th>Skill</th>
                          <th>Proposed Date</th>
                          <th>Duration</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((sess) => (
                          <tr key={sess._id}>
                            <td style={{ fontWeight: 600 }}>{sess.mentor?.name}</td>
                            <td><span className="skill-tag">{sess.skill}</span></td>
                            <td>{new Date(sess.proposedDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                            <td>{sess.duration} mins</td>
                            <td>
                              <span className={`status-badge status-${sess.status}`}>{sess.status}</span>
                            </td>
                            <td>
                              {sess.status === 'completed' && !sess.rating && (
                                <button className="btn btn-secondary btn-small" onClick={() => setRatingSession(sess)}>
                                  Rate & Review
                                </button>
                              )}
                              {sess.status === 'completed' && sess.rating && (
                                <div style={{ display: 'flex', gap: '2px' }}>
                                  <RatingStars rating={sess.rating} />
                                </div>
                              )}
                              {sess.status !== 'completed' && (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Waiting</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* Profile Management Column */}
            <div className="grid-column">
              <section className="glass-card dashboard-section">
                <h2>My Learning Profile</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Keep your details updated so peer mentors can connect with you.</p>

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
                    <label className="form-label">Current Academic Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Computer Science Freshman"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Brief Biography</label>
                    <textarea
                      className="form-input"
                      placeholder="Tell people about your learning goals..."
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
                      placeholder="Add a skill and press Enter"
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
                      placeholder="Add a skill and press Enter"
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

      {/* REQUEST SESSION MODAL */}
      {selectedMentor && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3>Request Mentorship Session</h3>
              <button className="modal-close" onClick={() => setSelectedMentor(null)}>&times;</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Booking a session with <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedMentor.name}</span>.
            </p>

            <form onSubmit={handleRequestSessionSubmit}>
              <div className="form-group">
                <label className="form-label">Select Skill to Learn</label>
                <select
                  className="form-input"
                  value={sessionSkill}
                  onChange={(e) => setSessionSkill(e.target.value)}
                  style={{ background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer' }}
                  required
                >
                  {selectedMentor.skillsToTeach?.map((sk) => (
                    <option key={sk} value={sk} style={{ background: '#1e293b' }}>{sk}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Proposed Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Session Duration</label>
                <select
                  className="form-input"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer' }}
                  required
                >
                  <option value={30} style={{ background: '#1e293b' }}>30 Minutes</option>
                  <option value={45} style={{ background: '#1e293b' }}>45 Minutes</option>
                  <option value={60} style={{ background: '#1e293b' }}>1 Hour (60m)</option>
                  <option value={90} style={{ background: '#1e293b' }}>1.5 Hours (90m)</option>
                  <option value={120} style={{ background: '#1e293b' }}>2 Hours (120m)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lesson Objectives / Message</label>
                <textarea
                  className="form-input"
                  placeholder="Explain what topics you'd like to go over during this peer session..."
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmittingSession}>
                  {isSubmittingSession ? 'Sending Request...' : 'Send Request'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedMentor(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RATE & REVIEW MODAL */}
      {ratingSession && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div className="modal-header">
              <h3>Submit Session Feedback</h3>
              <button className="modal-close" onClick={() => setRatingSession(null)}>&times;</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Rate your mentorship class with <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{ratingSession.mentor?.name}</span> for learning <span className="skill-tag">{ratingSession.skill}</span>.
            </p>

            <form onSubmit={handleRatingSubmit}>
              <div className="form-group" style={{ alignItems: 'center', marginHeight: '20px' }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>Your Rating</label>
                <RatingStars rating={sessionRating} onRatingChange={setSessionRating} interactive={true} />
              </div>

              <div className="form-group">
                <label className="form-label">Review / Testimonial</label>
                <textarea
                  className="form-input"
                  placeholder="How was the session? Did they explain concepts well?"
                  rows="4"
                  value={sessionReview}
                  onChange={(e) => setSessionReview(e.target.value)}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-secondary" style={{ flex: 1 }} disabled={isSubmittingRating}>
                  {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRatingSession(null)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
