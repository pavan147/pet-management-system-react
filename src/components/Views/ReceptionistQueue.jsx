import React, { useState, useEffect } from "react";
import {
  fetchAppointments,
  updateAppointmentStatus,
  checkOwnerRegistered,
} from "../../services/PetService";
import { useNavigate } from "react-router-dom";
import "./ReceptionistQueue.css";

const PAGE_SIZE = 10;

const ReceptionistQueue = () => {
  const [appointments, setAppointments] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [page, setPage] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const navigator = useNavigate();

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().slice(0, 10);

  // Helper function to check if appointment date matches today
  const isAppointmentToday = (appointmentDate) => {
    if (!appointmentDate) return false;
    const appointmentDateStr = appointmentDate.toString().slice(0, 10);
    const todayStr = getTodayDate();
    return appointmentDateStr === todayStr;
  };

  // Helper function to check if action is allowed
  const isActionAllowed = (appointmentDate) => {
    return isAppointmentToday(appointmentDate);
  };

  // Helper function to check if viewing today's appointments
  const isViewingToday = () => {
    const todayStr = getTodayDate();
    return date === todayStr;
  };

  useEffect(() => {
    fetchAppointments(date)
      .then((res) => {
        setAppointments(res.data);
        // Only set current patient if viewing today's appointments
        const todayStr = getTodayDate();
        const selectedDateStr = date;
        if (todayStr === selectedDateStr) {
          const idx = res.data.findIndex((a) => a.status === "waiting");
          setCurrentIdx(idx !== -1 ? idx : -1);
        } else {
          // For past/future dates, don't set any as current
          setCurrentIdx(-1);
        }
        setPage(1);
      })
      .catch(() => {
        setAppointments([]);
        setCurrentIdx(-1);
      });
  }, [date]);

  const totalPages = Math.ceil(appointments.length / PAGE_SIZE);
  const paginatedAppointments = appointments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleCheckIn = async (idx) => {
    const globalIdx = (page - 1) * PAGE_SIZE + idx;
    const appt = appointments[globalIdx];
    if (!appt.id) {
      alert("Appointment ID missing. Please add 'id' to your backend DTO.");
      return;
    }
    try {
      // Check owner registration
      const res = await checkOwnerRegistered(appt.email);
      const isRegistered = res.data === true || res.data?.isRegistered === true;
      
      if (!isRegistered) {
        setPopupMessage(
          `Owner with email "${appt.email}" is not registered. Please register the owner before checking in.`
        );
        setRedirectUrl("/owner-registration");
        setShowPopup(true);
        return;
      }
      // Owner is registered, proceed with check-in
      await updateAppointmentStatus(appt.id, "checked-in", "check-in");
      const updated = appointments.map((a, i) =>
        i === globalIdx ? { ...a, status: "checked-in", action: "check-in" } : a
      );
      setAppointments(updated);
      callNext(globalIdx, updated);
    } catch (err) {
      setPopupMessage("Error checking owner registration. Please try again.");
      setRedirectUrl("");
      setShowPopup(true);
      console.error("Owner check error:", err);
    }
  };

  const handleNotPresent = (idx) => {
    const globalIdx = (page - 1) * PAGE_SIZE + idx;
    const appt = appointments[globalIdx];
    updateAppointmentStatus(appt.id, "pending", "not-present").then(() => {
      const updated = appointments.map((a, i) =>
        i === globalIdx ? { ...a, status: "pending", action: "not-present" } : a
      );
      setAppointments(updated);
      callNext(globalIdx, updated);
    });
  };

  const handleRecall = (idx) => {
    const globalIdx = (page - 1) * PAGE_SIZE + idx;
    const appt = appointments[globalIdx];
    updateAppointmentStatus(appt.id, "waiting", "recall").then(() => {
      const updated = appointments.map((a, i) =>
        i === globalIdx ? { ...a, status: "waiting", action: "recall" } : a
      );
      setAppointments(updated);
      setCurrentIdx(globalIdx);
    });
  };

  const callNext = (idx, updatedList = appointments) => {
    let nextIdx = idx + 1;
    while (
      nextIdx < updatedList.length &&
      updatedList[nextIdx].status !== "waiting"
    ) {
      nextIdx++;
    }
    setCurrentIdx(nextIdx < updatedList.length ? nextIdx : -1);
  };

  const goToPage = (p) => setPage(p);

  const handleClosePopupOnly = () => {
    setShowPopup(false);
    setPopupMessage("");
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setPopupMessage("");
    const globalIdx = (page - 1) * PAGE_SIZE + currentIdx;
    const appt = appointments[globalIdx];
    navigator('/owner-registration', {
      state: {
        prefillData: {
          ownerName: appt.name || "",
          email: appt.email || "",
          phone: appt.phone || "",
          address: appt.address || "",
        },
        returnTo: '/view-appointment',
        returnToDate: date
      }
    });
  };

  return (
    <div className="receptionist-container">
      {/* Header Section */}
      <div className="receptionist-header">
        <div className="header-content">
          <div className="header-title">
            <i className="bi bi-calendar2-check"></i>
            <div>
              <h1>Patient Queue Management</h1>
              <p>Call patients for their appointments</p>
            </div>
          </div>
          <div className="header-date-picker">
            <label htmlFor="appointmentDate">Select Date:</label>
            <input
              id="appointmentDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="modern-date-input"
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {appointments.length > 0 && (
        <div className="queue-stats">
          <div className="stat-card waiting">
            <div className="stat-number">
              {appointments.filter((a) => a.status === "waiting").length}
            </div>
            <div>Waiting</div>
          </div>
          <div className="stat-card checked-in">
            <div className="stat-number">
              {appointments.filter((a) => a.status === "checked-in").length}
            </div>
            <div>Checked In</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">
              {appointments.filter((a) => a.status === "pending").length}
            </div>
            <div>Pending</div>
          </div>
          <div className="stat-card total">
            <div className="stat-number">{appointments.length}</div>
            <div>Total</div>
          </div>
        </div>
      )}

      {/* No Appointments */}
      {appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Appointments</h3>
          <p>No appointments scheduled for {date}</p>
        </div>
      ) : isViewingToday() && currentIdx === -1 ? (
        <div className="completed-state">
          <div className="completed-icon">✅</div>
          <h3>All Patients Processed!</h3>
          <p>Great job! All patients have been attended to.</p>
        </div>
      ) : (
        <>
          {/* Current Patient - Highlighted (only for today) */}
          {isViewingToday() && currentIdx !== -1 && (
            <div className="current-patient-section">
              <div className="current-label">📢 NOW CALLING</div>
              <div className="current-patient-card">
                <div className="patient-position">#{currentIdx + 1}</div>
                <div className="patient-info">
                  <h2>{appointments[currentIdx]?.name}</h2>
                  <div className="patient-details">
                    <span>📧 {appointments[currentIdx]?.email}</span>
                    <span>📞 {appointments[currentIdx]?.phone}</span>
                  </div>
                </div>
                <div className="patient-status-large">
                  <span className="badge-large">Waiting</span>
                </div>
              </div>
            </div>
          )}

          {/* View-Only Mode Banner for non-today dates */}
          {!isViewingToday() && (
            <div className="view-only-banner">
              <i className="bi bi-info-circle"></i>
              <span>You are viewing {date < getTodayDate() ? "past" : "future"} appointments in view-only mode</span>
            </div>
          )}

          {/* Appointments List */}
          <div className="appointments-section">
            <h3 className="section-title">Queue</h3>
            <div className="appointments-grid">
              {paginatedAppointments.map((appt, idx) => {
                const globalIdx = (page - 1) * PAGE_SIZE + idx;
                const isCurrent = globalIdx === currentIdx;
                const statusColor =
                  appt.status === "checked-in"
                    ? "success"
                    : appt.status === "pending"
                    ? "warning"
                    : appt.status === "waiting"
                    ? "info"
                    : "secondary";

                return (
                  <div
                    key={appt.id ? appt.id : globalIdx}
                    className={`appointment-card ${isCurrent ? "current" : ""} status-${statusColor}`}
                  >
                    {/* Position Badge */}
                    <div className="position-badge">#{globalIdx + 1}</div>

                    {/* Current Indicator */}
                    {isCurrent && <div className="current-indicator">●</div>}

                    {/* Patient Info */}
                    <div className="appointment-info">
                      <h5>{appt.name}</h5>
                      <p className="email-phone">
                        <span>{appt.email}</span> • <span>{appt.phone}</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`status-badge status-${statusColor}`}>
                      {isCurrent
                        ? "Current"
                        : appt.status === "checked-in"
                        ? "✔ Checked In"
                        : appt.status === "pending"
                        ? "⏸ Pending"
                        : "⏳ Waiting"}
                    </div>

                    {/* Actions */}
                    <div className="appointment-actions">
                      {isViewingToday() ? (
                        <>
                          {isCurrent && appt.status === "waiting" && (
                            <>
                              <button
                                className="btn-action btn-check-in"
                                onClick={() => handleCheckIn(idx)}
                                title="Check in patient"
                              >
                                <i className="bi bi-check-circle"></i> Check In
                              </button>
                              <button
                                className="btn-action btn-not-present"
                                onClick={() => handleNotPresent(idx)}
                                title="Patient not present"
                              >
                                <i className="bi bi-x-circle"></i> Not Present
                              </button>
                            </>
                          )}
                          {appt.status === "pending" && globalIdx !== currentIdx && (
                            <button
                              className="btn-action btn-recall"
                              onClick={() => handleRecall(idx)}
                              title="Recall patient"
                            >
                              <i className="bi bi-arrow-repeat"></i> Recall
                            </button>
                          )}
                          {appt.status === "checked-in" && (
                            <div className="status-done">✓ Done</div>
                          )}
                        </>
                      ) : (
                        <div className="appointment-locked">
                          <i className="bi bi-lock"></i> View Only
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-section">
              <ul className="modern-pagination">
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i}>
                    <button
                      className={`pagination-btn ${
                        page === i + 1 ? "active" : ""
                      }`}
                      onClick={() => goToPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Modern Modal */}
      {showPopup && (
        <div className="modal-overlay">
          <div className="modern-modal">
            <div className="modal-header">
              <div className="modal-icon">⚠️</div>
              <h5>Registration Required</h5>
              <button
                type="button"
                className="modal-close"
                onClick={handleClosePopupOnly}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>{popupMessage}</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal btn-secondary"
                onClick={handleClosePopupOnly}
              >
                Cancel
              </button>
              <button
                className="btn-modal btn-primary"
                onClick={handlePopupClose}
              >
                Register Owner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistQueue;