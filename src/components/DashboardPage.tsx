import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Play,
  Plus,
  Square,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

export function DashboardPage() {
  // Mock data for dental practice dashboard
  const todayStats = {
    totalPatients: 147,
    completedTreatments: 23,
    upcomingAppointments: 8,
    pendingApprovals: 3,
  };

  const recentPatients = [
    {
      id: 1,
      name: "Alexandra Rodriguez",
      treatment: "Dental Implant Procedure",
      status: "Completed",
      avatar: "AR",
    },
    {
      id: 2,
      name: "Marcus Johnson",
      treatment: "Root Canal Treatment",
      status: "In Progress",
      avatar: "MJ",
    },
    {
      id: 3,
      name: "Sarah Williams",
      treatment: "Orthodontic Consultation",
      status: "Pending",
      avatar: "SW",
    },
    {
      id: 4,
      name: "David Chen",
      treatment: "Teeth Whitening Session",
      status: "Completed",
      avatar: "DC",
    },
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <>
      {/* Dashboard Header */}
      <div className="donezo-dashboard-header">
        <h1 className="donezo-dashboard-title">Dashboard</h1>
        <p className="donezo-dashboard-subtitle">
          Plan, prioritize, and accomplish your dental practice tasks with ease.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="donezo-stats-grid">
        {/* Total Patients */}
        <div className="donezo-stat-card primary">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Total Patients</span>
            <TrendingUp className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">{todayStats.totalPatients}</div>
          <div className="donezo-stat-meta">
            <TrendingUp className="donezo-stat-trend" />
            Increased from last month
          </div>
        </div>

        {/* Completed Treatments */}
        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Completed Treatments</span>
            <Activity className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">
            {todayStats.completedTreatments}
          </div>
          <div className="donezo-stat-meta">
            <TrendingUp className="donezo-stat-trend" />
            Increased from last month
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Upcoming Appointments</span>
            <Calendar className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">
            {todayStats.upcomingAppointments}
          </div>
          <div className="donezo-stat-meta">
            <Clock className="donezo-stat-trend" />
            Increased from last month
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="donezo-stat-card">
          <div className="donezo-stat-header">
            <span className="donezo-stat-label">Pending Review</span>
            <FileText className="donezo-stat-icon" />
          </div>
          <div className="donezo-stat-value">{todayStats.pendingApprovals}</div>
          <div className="donezo-stat-meta">On Review</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="donezo-content-grid">
        {/* Patient Analytics Chart */}
        <div className="donezo-section">
          <div className="donezo-section-header">
            <h3 className="donezo-section-title">Patient Analytics</h3>
          </div>
          <div className="donezo-chart-container">
            <div className="donezo-chart-bars">
              {[40, 80, 60, 90, 30, 70, 50, 85, 45, 75].map((height, i) => (
                <div
                  key={i}
                  className="donezo-chart-bar"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="donezo-section">
          <div className="donezo-section-header">
            <h3 className="donezo-section-title">Reminders</h3>
          </div>

          <div className="donezo-reminder-item">
            <div className="donezo-reminder-icon">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="donezo-reminder-content">
              <div className="donezo-reminder-title">Weekly Team Meeting</div>
              <div className="donezo-reminder-time">Today 3:00 - 04:00 pm</div>
            </div>
            <button className="donezo-start-button">Start Meeting</button>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="donezo-bottom-grid">
        {/* Team Collaboration */}
        <div className="donezo-section">
          <div className="donezo-section-header">
            <h3 className="donezo-section-title">Team Collaboration</h3>
            <button className="donezo-section-action">
              <Plus className="w-3 h-3" />
              Add Member
            </button>
          </div>

          <div className="donezo-team-list">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="donezo-team-member">
                <div className="donezo-team-avatar">{patient.avatar}</div>
                <div className="donezo-team-info">
                  <div className="donezo-team-name">{patient.name}</div>
                  <div className="donezo-team-role">
                    Working on • {patient.treatment}
                  </div>
                </div>
                <span
                  className={`donezo-team-status ${patient.status
                    .toLowerCase()
                    .replace(" ", "")}`}
                >
                  {patient.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Progress */}
        <div className="donezo-section">
          <div className="donezo-section-header">
            <h3 className="donezo-section-title">Practice Progress</h3>
          </div>

          <div className="donezo-progress-circle">
            <svg className="donezo-progress-svg" viewBox="0 0 120 120">
              <circle
                className="donezo-progress-bg"
                cx="60"
                cy="60"
                r="54"
              />
              <circle
                className="donezo-progress-bar"
                cx="60"
                cy="60"
                r="54"
                strokeDasharray={339.292}
                strokeDashoffset={200}
              />
            </svg>
            <div className="donezo-progress-text">41%</div>
          </div>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "8px",
              }}
            >
              Practice Progress
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                ></div>
                Completed
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#6b7280",
                  }}
                ></div>
                In Progress
              </span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#e5e7eb",
                  }}
                ></div>
                Pending
              </span>
            </div>
          </div>
        </div>

        {/* Time Tracker */}
        <div className="donezo-section donezo-time-tracker">
          <h3
            style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}
          >
            Time Tracker
          </h3>
          <div className="donezo-time-display">{formatTime(currentTime)}</div>
          <div className="donezo-time-controls">
            <button className="donezo-time-button">
              <Play className="w-4 h-4" />
            </button>
            <button className="donezo-time-button">
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}