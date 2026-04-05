import React, { useState, useEffect } from "react";
import { fetchAppointments, updateAppointmentStatus, checkOwnerRegistered } from "../../services/PetService";
import { getLoggedInUser } from "../../services/VeterinaryRegistrationService";
import "./ReceptionistDashboard.css";

const ReceptionistDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("queue");
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  const loggedInUser = getLoggedInUser();

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch appointments for date
  useEffect(() => {
    setLoading(true);
    fetchAppointments(date)
      .then((res) => {
        setAppointments(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        setAppointments([]);
        setLoading(false);
      });
  }, [date]);

  // Helper Functions
  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  const isToday = () => date === getTodayDate();

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const showNotificationMessage = (type, message) => {
    setNotification({ type, message });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Calculate statistics
  const stats = {
    total: appointments.length,
    waiting: appointments.filter((a) => a.status === "waiting").length,
    checkedIn: appointments.filter((a) => a.status === "checked-in").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    canceled: appointments.filter((a) => a.status === "canceled").length,
  };

  const getStatusBadge = (status) => {
    const badges = {
      waiting: { bg: "danger", text: "Waiting", icon: "⏳" },
      "checked-in": { bg: "info", text: "Checked In", icon: "✓" },
      completed: { bg: "success", text: "Completed", icon: "✓✓" },
      canceled: { bg: "secondary", text: "Canceled", icon: "✕" },
    };
    return badges[status] || { bg: "light", text: "Unknown", icon: "?" };
  };

  const getNextWaitingAppointment = () => {
    return appointments.find((a) => a.status === "waiting");
  };

  const handleCheckIn = async (appointmentId, ownerEmail) => {
    try {
      // Check if owner is registered
      const res = await checkOwnerRegistered(ownerEmail);
      const isRegistered = res.data === true || res.data?.isRegistered === true;

      if (!isRegistered) {
        showNotificationMessage(
          "warning",
          `Owner "${ownerEmail}" is not registered in system.`
        );
        return;
      }

      // Update status
      await updateAppointmentStatus(appointmentId, "checked-in", "check-in");
      
      // Update local state
      const updated = appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: "checked-in" } : a
      );
      setAppointments(updated);
      showNotificationMessage("success", "✓ Patient checked in successfully!");
    } catch (err) {
      console.error("Check-in error:", err);
      showNotificationMessage("danger", "Error during check-in. Please try again.");
    }
  };

  const handleMarkCompleted = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, "completed", "complete");
      
      const updated = appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: "completed" } : a
      );
      setAppointments(updated);
      showNotificationMessage("success", "✓ Appointment marked as completed!");
    } catch (err) {
      console.error("Error marking completed:", err);
      showNotificationMessage("danger", "Error updating appointment.");
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, "canceled", "cancel");
      
      const updated = appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: "canceled" } : a
      );
      setAppointments(updated);
      showNotificationMessage("info", "Appointment canceled.");
    } catch (err) {
      console.error("Error canceling:", err);
      showNotificationMessage("danger", "Error canceling appointment.");
    }
  };

  // Dummy data for owners (mix with real data in production)
  const getDummyOwnerInfo = (appointment) => {
    const dummyMap = {
      0: { name: "John Doe", phone: "+1234567890", registration: "Registered" },
      1: { name: "Jane Smith", phone: "+0987654321", registration: "Registered" },
      2: { name: "Bob Johnson", phone: "+1571234567", registration: "Not Registered" },
      3: { name: "Alice Brown", phone: "+1234571890", registration: "Registered" },
      4: { name: "Charlie Wilson", phone: "+9876541234", registration: "Registered" },
    };
    
    // Use real owner info if available, otherwise use dummy
    return {
      name: appointment.ownerName || dummyMap[appointments.indexOf(appointment)]?.name || "Unknown Owner",
      phone: appointment.phoneNumber || dummyMap[appointments.indexOf(appointment)]?.phone || "N/A",
    };
  };

  return (
    <div className="receptionist-dashboard">
      {/* Header */}
      <div className="receptionist-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📋 Receptionist Dashboard</h1>
            <p className="receptionist-name">Welcome, {loggedInUser}</p>
          </div>
          <div className="header-right">
            <div className="current-time">
              <div className="time">{currentTime.toLocaleTimeString()}</div>
              <div className="date">{formatDate(new Date())}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
          {notification.message}
          <button 
            type="button" 
            className="btn-close"
            onClick={() => setShowNotification(false)}
          ></button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Today's Appointments</div>
          </div>
        </div>

        <div className="stat-card stat-waiting">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.waiting}</div>
            <div className="stat-label">Waiting</div>
          </div>
        </div>

        <div className="stat-card stat-checked">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.checkedIn}</div>
            <div className="stat-label">Checked In</div>
          </div>
        </div>

        <div className="stat-card stat-completed">
          <div className="stat-icon">✓✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div className="stat-card stat-canceled">
          <div className="stat-icon">✕</div>
          <div className="stat-content">
            <div className="stat-value">{stats.canceled}</div>
            <div className="stat-label">Canceled</div>
          </div>
        </div>
      </div>

      {/* Current Patient Alert */}
      {isToday() && getNextWaitingAppointment() && (
        <div className="current-patient-alert">
          <div className="alert-icon">🚨</div>
          <div className="alert-content">
            <h3>Next Patient Waiting</h3>
            <p>
              <strong>{getNextWaitingAppointment().petName}</strong> - Owner: <strong>{getNextWaitingAppointment().ownerName}</strong>
            </p>
            <p className="appointment-time">Appointment Time: {formatTime(getNextWaitingAppointment().appointmentDateTime)}</p>
          </div>
          <button 
            className="btn btn-success btn-lg"
            onClick={() => handleCheckIn(getNextWaitingAppointment().id, getNextWaitingAppointment().email)}
          >
            Check In Now
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="nav nav-tabs" role="tablist">
          <button
            className={`nav-link ${activeTab === "queue" ? "active" : ""}`}
            onClick={() => setActiveTab("queue")}
          >
            📋 Appointment Queue
          </button>
          <button
            className={`nav-link ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            📅 Date Selector
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Queue Tab */}
          {activeTab === "queue" && (
            <div className="queue-tab">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="no-appointments">
                  <div className="icon">😌</div>
                  <p>No appointments scheduled for {formatDate(date)}</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {appointments.map((appt, idx) => {
                    const ownerInfo = getDummyOwnerInfo(appt);
                    const statusBadge = getStatusBadge(appt.status);
                    
                    return (
                      <div key={appt.id || idx} className={`appointment-card status-${appt.status}`}>
                        <div className="appointment-order">
                          <span className="order-number">#{idx + 1}</span>
                        </div>

                        <div className="appointment-main">
                          <div className="appointment-pet">
                            <div className="pet-icon">🐾</div>
                            <div className="pet-info">
                              <h4>{appt.petName}</h4>
                              <p className="pet-type">{appt.petType || "Pet"}</p>
                            </div>
                          </div>

                          <div className="appointment-owner">
                            <div className="owner-icon">👤</div>
                            <div className="owner-info">
                              <h5>{ownerInfo.name}</h5>
                              <p>{ownerInfo.phone}</p>
                              <p className="email">📧 {appt.email}</p>
                            </div>
                          </div>

                          <div className="appointment-details">
                            <div className="detail-row">
                              <span className="label">Time:</span>
                              <span className="value">{formatTime(appt.appointmentDateTime)}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Doctor:</span>
                              <span className="value">{appt.doctorName || "Dr. Sarah Johnson"}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Reason:</span>
                              <span className="value">{appt.reason || "Checkup"}</span>
                            </div>
                          </div>

                          <div className="appointment-status">
                            <span className={`badge bg-${statusBadge.bg}`}>
                              {statusBadge.icon} {statusBadge.text}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="appointment-actions">
                          {appt.status === "waiting" && isToday() && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleCheckIn(appt.id, appt.email)}
                              title="Check in this patient"
                            >
                              ✓ Check In
                            </button>
                          )}

                          {appt.status === "checked-in" && isToday() && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleMarkCompleted(appt.id)}
                              title="Mark as completed"
                            >
                              ✓✓ Completed
                            </button>
                          )}

                          {appt.status !== "completed" && appt.status !== "canceled" && isToday() && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleCancel(appt.id)}
                              title="Cancel appointment"
                            >
                              ✕ Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === "calendar" && (
            <div className="calendar-tab">
              <div className="date-selector">
                <label htmlFor="dateInput">Select Date:</label>
                <input
                  type="date"
                  id="dateInput"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {date === getTodayDate() && (
                  <span className="badge bg-primary ms-3">Today</span>
                )}
              </div>

              <div className="date-info mt-4">
                <h5>Showing appointments for: {formatDate(date)}</h5>
                <p className="text-muted">Total: {stats.total} appointments</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="quick-reference">
        <h5>📞 Quick Reference</h5>
        <div className="reference-items">
          <div className="reference-item">
            <span className="ref-label">Clinic Hours:</span>
            <span className="ref-value">9:00 AM - 6:00 PM</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">Help Desk:</span>
            <span className="ref-value">+1-800-PET-CARE</span>
          </div>
          <div className="reference-item">
            <span className="ref-label">Emergency:</span>
            <span className="ref-value">+1-800-VET-EMERGENCY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
