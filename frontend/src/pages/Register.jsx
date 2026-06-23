import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import Toast from '../components/Toast';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!name || !email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (name.trim().length < 2) {
      showToast('Name must be at least 2 characters', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register(name, email, password, role);

      if (res && res.success) {
        showToast('Registration successful! Redirecting...', 'success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        showToast(res.message || 'Registration failed. Try a different email.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      {toast && (
        <div className="toast-container">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="glass-card auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the SkillSwap peer-to-peer network</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. name@student.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Role</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ background: 'rgba(15, 23, 42, 0.6)', cursor: 'pointer' }}
            >
              <option value="student" style={{ background: '#1e293b' }}>Student (wants to learn/find mentors)</option>
              <option value="mentor" style={{ background: '#1e293b' }}>Mentor (wants to teach/receive requests)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Creating account...'
            ) : (
              <>
                <UserPlus size={18} /> Register
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
