import React, { useEffect, useMemo, useState } from "react";
import { getLoggedInUser } from "../../services/VeterinaryRegistrationService";
import { fetchAppointments } from "../../services/PetService";
import "./DoctorDashboard.css";

const dummyTasks = [
  "Review lab reports for Luna",
  "Sign 2 discharge summaries",
  "Call owner about X-ray follow-up",
  "Update treatment notes for Bruno",
];

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getOwnerName = (appointment) => {
  return (
    appointment.ownerName ||
    appointment.name ||
    appointment.owner ||
    appointment.email ||
    "Unknown Owner"
  );
};

const getPetName = (appointment) => {
  return appointment.petName || appointment.pet || appointment.petType || "Pet";
};

const getReason = (appointment) => {
  return appointment.reason || appointment.purpose || appointment.notes || "General checkup";
};

const getStatusMeta = (status) => {
  const statusMap = {
    waiting: { label: "Waiting", className: "text-bg-info" },
    "checked-in": { label: "Checked In", className: "text-bg-primary" },
    pending: { label: "Pending", className: "text-bg-warning" },
    completed: { label: "Completed", className: "text-bg-success" },
    canceled: { label: "Canceled", className: "text-bg-secondary" },
  };

  return statusMap[status] || { label: status || "Unknown", className: "text-bg-secondary" };
};

const DoctorDashboard = () => {
  const doctorName = getLoggedInUser() || "Doctor";
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayDate = getTodayDate();

  useEffect(() => {
    setLoading(true);
    fetchAppointments(todayDate)
      .then((res) => {
        setAppointments(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctor queue:", err);
        setAppointments([]);
        setLoading(false);
      });
  }, [todayDate]);

  const stats = useMemo(() => {
    const waiting = appointments.filter((a) => a.status === "waiting").length;
    const checkedIn = appointments.filter((a) => a.status === "checked-in").length;
    const completed = appointments.filter((a) => a.status === "completed").length;
    const followUps = appointments.filter((a) => {
      const reason = (getReason(a) || "").toLowerCase();
      return reason.includes("follow");
    }).length;

    return [
      { label: "Today's Appointments", value: appointments.length, icon: "🩺", className: "doctor-stat-primary" },
      { label: "Patients Waiting", value: waiting, icon: "⏳", className: "doctor-stat-warning" },
      { label: "Checked In", value: checkedIn, icon: "📋", className: "doctor-stat-info" },
      { label: "Cases Completed", value: completed + followUps, icon: "✅", className: "doctor-stat-success" },
    ];
  }, [appointments]);

  const queueRows = useMemo(() => {
    return appointments.map((appointment, idx) => {
      const statusMeta = getStatusMeta(appointment.status);
      return {
        id: appointment.id || idx,
        petName: getPetName(appointment),
        owner: getOwnerName(appointment),
        reason: getReason(appointment),
        status: statusMeta.label,
        statusClassName: statusMeta.className,
      };
    });
  }, [appointments]);

  return (
    <div className="doctor-dashboard">
      <section className="doctor-header-card">
        <div>
          <h1 className="doctor-title">Doctor Dashboard</h1>
          <p className="doctor-subtitle">Welcome back, Dr. {doctorName}</p>
        </div>
        <div className="doctor-badge">Shift: 09:00 AM - 05:00 PM</div>
      </section>

      <section className="doctor-stats-grid">
        {stats.map((item) => (
          <article key={item.label} className={`doctor-stat-card ${item.className}`}>
            <div className="doctor-stat-icon">{item.icon}</div>
            <div>
              <h2 className="doctor-stat-value">{item.value}</h2>
              <p className="doctor-stat-label">{item.label}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="doctor-main-grid">
        <article className="doctor-panel">
          <div className="doctor-panel-header">
            <h3>Today's Queue</h3>
            <span className="doctor-panel-chip">{formatDisplayDate(todayDate)}</span>
          </div>

          {loading ? (
            <div className="doctor-table-status">Loading today's appointments...</div>
          ) : queueRows.length === 0 ? (
            <div className="doctor-table-status">No appointments scheduled for today.</div>
          ) : (
            <div className="table-responsive">
              <table className="table doctor-queue-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Pet</th>
                    <th>Owner</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {queueRows.map((entry) => (
                    <tr key={entry.id}>
                      <td className="fw-semibold">{entry.petName}</td>
                      <td>{entry.owner}</td>
                      <td>{entry.reason}</td>
                      <td>
                        <span className={`badge ${entry.statusClassName}`}>{entry.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <aside className="doctor-side-panels">
          <article className="doctor-panel">
            <div className="doctor-panel-header">
              <h3>Today's Tasks</h3>
            </div>
            <ul className="doctor-task-list">
              {dummyTasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </article>

          <article className="doctor-panel doctor-quick-actions">
            <div className="doctor-panel-header">
              <h3>Quick Actions</h3>
            </div>
            <button className="btn btn-primary w-100">Create Prescription</button>
            <button className="btn btn-outline-primary w-100">Add Treatment Note</button>
            <button className="btn btn-outline-secondary w-100">Request Lab Test</button>
          </article>
        </aside>
      </section>
    </div>
  );
};

export default DoctorDashboard;