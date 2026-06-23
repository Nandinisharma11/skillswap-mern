import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import MentorDashboard from './MentorDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        color: 'var(--text-secondary)'
      }}>
        Loading Dashboard...
      </div>
    );
  }

  // Choose the dashboard page depending on the user's role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'mentor':
      return <MentorDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;
