import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, ShieldCheck, Users, Calendar, Award, Search, UserMinus, UserCheck } from 'lucide-react';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const { API_URL } = useAuth();

  // Admin states
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Users Directory filters
  const [searchVal, setSearchVal] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // UI state
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await axios.get(`${API_URL}/admin/analytics`);
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load platform analytics', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchUsers = async (queryStr = '') => {
    try {
      setLoadingUsers(true);
      let url = `${API_URL}/admin/users`;
      const params = [];
      
      if (queryStr) params.push(`search=${encodeURIComponent(queryStr)}`);
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (statusFilter) params.push(`status=${statusFilter}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await axios.get(url);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      showToast('Error loading user directory', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(searchVal);
  };

  // Trigger filters refresh when selectors shift
  useEffect(() => {
    fetchUsers(searchVal);
  }, [roleFilter, statusFilter]);

  const handleBanToggle = async (userId, isCurrentlyBanned) => {
    try {
      const res = await axios.put(`${API_URL}/admin/users/${userId}/ban`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        // Refresh both tables
        fetchUsers(searchVal);
        fetchAnalytics();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error executing action', 'error');
    }
  };

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
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '15px' }}>Administrator</h4>
          <span className="sidebar-link active">
            <ShieldCheck size={18} /> Platform Overview
          </span>
          
          <div style={{ marginTop: 'auto', padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You are in Super Admin Moderator view. Please exercise caution when muting/banning users.</p>
          </div>
        </aside>

        {/* Contents Area */}
        <main className="dashboard-content">
          
          {/* Metrics summary cards */}
          {loadingAnalytics ? (
            <p style={{ color: 'var(--text-secondary)' }}>Loading platform indicators...</p>
          ) : (
            <div className="metrics-row">
              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Total Platform Users</h3>
                  <p>{analytics?.users?.total}</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {analytics?.users?.students} Studs | {analytics?.users?.mentors} Mentors
                  </span>
                </div>
                <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)' }}>
                  <Users size={24} />
                </div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Total Class Bookings</h3>
                  <p>{analytics?.sessions?.total}</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {analytics?.sessions?.completed} Done | {analytics?.sessions?.pending} Pend
                  </span>
                </div>
                <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                  <Calendar size={24} />
                </div>
              </div>

              <div className="glass-card metric-card">
                <div className="metric-info">
                  <h3>Muted Account Bans</h3>
                  <p>{analytics?.users?.banned}</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Flagged violations</span>
                </div>
                <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
                  <ShieldAlert size={24} />
                </div>
              </div>
            </div>
          )}

          {/* Grids area */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
            
            {/* User directories management */}
            <section className="glass-card dashboard-section">
              <div className="section-header">
                <h2>User Moderation Directory</h2>
              </div>

              {/* Filtering forms */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
                <div style={{ position: 'relative', flex: '2 1 300px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search users by name or email address..."
                    style={{ paddingLeft: '48px', width: '100%' }}
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                  />
                </div>

                <select
                  className="form-input"
                  style={{ flex: '1 1 150px', background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer' }}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="" style={{ background: '#1e293b' }}>All Roles</option>
                  <option value="student" style={{ background: '#1e293b' }}>Students Only</option>
                  <option value="mentor" style={{ background: '#1e293b' }}>Mentors Only</option>
                  <option value="admin" style={{ background: '#1e293b' }}>Admins Only</option>
                </select>

                <select
                  className="form-input"
                  style={{ flex: '1 1 150px', background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="" style={{ background: '#1e293b' }}>All Statuses</option>
                  <option value="active" style={{ background: '#1e293b' }}>Active Accounts</option>
                  <option value="banned" style={{ background: '#1e293b' }}>Banned Accounts</option>
                </select>

                <button type="submit" className="btn btn-primary">Filter</button>
              </form>

              {loadingUsers ? (
                <p style={{ color: 'var(--text-secondary)' }}>Refreshing user directory database...</p>
              ) : users.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No matching users found.</p>
              ) : (
                <div className="table-container">
                  <table className="session-table">
                    <thead>
                      <tr>
                        <th>User Profile</th>
                        <th>Email Address</th>
                        <th>Role</th>
                        <th>Joined Date</th>
                        <th>Account Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{item.name}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.title || 'No Headline'}</span>
                            </div>
                          </td>
                          <td>{item.email}</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              background: item.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              color: item.role === 'admin' ? 'var(--color-danger)' : 'var(--color-primary)',
                              fontWeight: 600
                            }}>{item.role}</span>
                          </td>
                          <td>{new Date(item.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}</td>
                          <td>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              background: item.isBanned ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                              color: item.isBanned ? 'var(--color-danger)' : 'var(--color-success)',
                              border: item.isBanned ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)'
                            }}>
                              {item.isBanned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td>
                            {item.role === 'admin' ? (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Protected</span>
                            ) : (
                              <button
                                className={`btn ${item.isBanned ? 'btn-primary' : 'btn-danger'} btn-small`}
                                onClick={() => handleBanToggle(item._id, item.isBanned)}
                                style={{ display: 'inline-flex', gap: '6px' }}
                              >
                                {item.isBanned ? (
                                  <>
                                    <UserCheck size={14} /> Lift Ban
                                  </>
                                ) : (
                                  <>
                                    <UserMinus size={14} /> Ban User
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Popular Skills Analytics summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <section className="glass-card dashboard-section">
                <h3>Top Skills Offered (To Teach)</h3>
                <div style={{ marginTop: '15px' }}>
                  {analytics?.skills?.topToTeach?.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No skills offered yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {analytics?.skills?.topToTeach?.map((sk, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <span style={{ fontWeight: 600 }} className="skill-tag">{sk.skill}</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{sk.count} mentors teaching</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="glass-card dashboard-section">
                <h3>Top Skills Requested (To Learn)</h3>
                <div style={{ marginTop: '15px' }}>
                  {analytics?.skills?.topToLearn?.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No skills requested yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {analytics?.skills?.topToLearn?.map((sk, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                          <span style={{ fontWeight: 600 }} className="skill-tag" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--color-secondary)' }}>{sk.skill}</span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{sk.count} students learning</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
