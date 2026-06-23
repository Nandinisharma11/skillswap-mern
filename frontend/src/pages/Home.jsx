import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, BookOpen, MessageSquare, Shield, Users } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="main-content fade-in">
      <section className="hero-section">
        <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
          Swap Skills, Grow <span style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Together.</span>
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          A community platform where students teach what they excel at and learn what they want to master. Peer-to-peer learning made seamless, collaborative, and entirely free.
        </p>

        <div className="hero-cta">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to Your Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                Join SkillSwap
              </Link>
              <Link to="/login" className="btn btn-outline">
                Explore Mentors
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem' }}>How It Works</h2>
        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon">
              <Users size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Create Profile</h3>
            <p>Define your expertise. List skills you can teach and what you want to learn. Toggle your role to match your learning schedule.</p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon">
              <BookOpen size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Book Sessions</h3>
            <p>Find peer mentors who teach what you want to learn. Send session requests specifying proposed date, duration, and topics.</p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon">
              <MessageSquare size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Real-time Chat</h3>
            <p>Instantly coordinate with your mentor or student through our built-in real-time messaging system powered by WebSockets.</p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon">
              <Award size={24} />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Rate & Review</h3>
            <p>Build your peer teaching reputation. Collect reviews and ratings from students to become a featured mentor in the community.</p>
          </div>
        </div>
      </section>

      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-glass)',
        padding: '30px 16px',
        textAlign: 'center',
        background: 'rgba(10, 14, 23, 0.5)'
      }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} SkillSwap peer-learning platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
