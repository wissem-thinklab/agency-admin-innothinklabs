import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>InnoThinkLab Admin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>Welcome to your Dashboard</h2>
            <p>You are successfully logged in as {user?.role}</p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Users Management</h3>
              <p>Manage system users and permissions</p>
              <button className="card-button">Manage Users</button>
            </div>

            <div className="dashboard-card">
              <h3>Content Management</h3>
              <p>Update website content and pages</p>
              <button className="card-button">Manage Content</button>
            </div>

            <div className="dashboard-card">
              <h3>Analytics</h3>
              <p>View website analytics and reports</p>
              <button className="card-button">View Analytics</button>
            </div>

            <div className="dashboard-card">
              <h3>Settings</h3>
              <p>Configure system settings</p>
              <button className="card-button">Settings</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
