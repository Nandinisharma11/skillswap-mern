import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, KeyRound } from 'lucide-react';
import Toast from '../components/Toast';

const ForgotPassword = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [step, setStep] = useState(1); // Step 1: Request, Step 2: Reset
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please provide your email address', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      if (res.data.success) {
        showToast('Reset token generated. Check backend terminal logs!', 'success');
        // Pre-fill token for easy developer/student testing convenience
        if (res.data.resetToken) {
          setResetTokenInput(res.data.resetToken);
        }
        setTimeout(() => {
          setStep(2);
        }, 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Email request failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetTokenInput || !newPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${API_URL}/auth/reset-password/${resetTokenInput}`, {
        password: newPassword
      });

      if (res.data.success) {
        showToast('Password updated! Redirecting to login...', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Password reset failed. Invalid/expired token.', 'error');
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
          {step === 1 ? (
            <>
              <h2>Reset Password</h2>
              <p>Enter your email to receive a recovery token</p>
            </>
          ) : (
            <>
              <h2>Choose New Password</h2>
              <p>Enter your token and desired new password</p>
            </>
          )}
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestToken}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. name@student.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <HelpCircle size={18} /> Send Recovery Token
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">Reset Token</label>
              <input
                type="text"
                className="form-input"
                placeholder="Paste token from console"
                value={resetTokenInput}
                onChange={(e) => setResetTokenInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Resetting...'
              ) : (
                <>
                  <KeyRound size={18} /> Save & Update Password
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
