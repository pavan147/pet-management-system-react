import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getLoggedInUser } from "../../services/VeterinaryRegistrationService";
import {
  fetchAppointments,
  getEmergencyMedicalFeed,
  getMedicalChatImageBlob,
  searchMedicalChatPets,
} from "../../services/PetService";
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

const getLatestTimestamp = (item) => item?.latestMessageAt || "";

const DoctorDashboard = () => {
  const doctorName = getLoggedInUser() || "Doctor";
  const [appointments, setAppointments] = useState([]);
  const [emergencyFeed, setEmergencyFeed] = useState([]);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatCaseFilter, setChatCaseFilter] = useState("ACTIVE");
  const [chatPets, setChatPets] = useState([]);
  const [emergencyImagePreviews, setEmergencyImagePreviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [chatSearchLoading, setChatSearchLoading] = useState(true);
  const imagePreviewUrlRef = useRef([]);

  const visibleMedicalCases = useMemo(() => {
    const emergencyByPetId = new Map(emergencyFeed.map((item) => [item.petId, item]));

    return [...chatPets]
      .map((item) => ({
        ...item,
        emergencyDetails: emergencyByPetId.get(item.petId) || null,
      }))
      .sort((a, b) => {
        if (a.emergency !== b.emergency) {
          return a.emergency ? -1 : 1;
        }
        return new Date(getLatestTimestamp(b) || 0) - new Date(getLatestTimestamp(a) || 0);
      });
  }, [chatPets, emergencyFeed]);

  const todayDate = getTodayDate();

  useEffect(() => {
    Promise.all([fetchAppointments(todayDate), getEmergencyMedicalFeed(), searchMedicalChatPets("", chatCaseFilter)])
      .then(([appointmentRes, emergencyRes, chatSearchRes]) => {
        setAppointments(appointmentRes.data || []);
        setEmergencyFeed(emergencyRes || []);
        setChatPets(chatSearchRes || []);
        setLoading(false);
        setChatSearchLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctor queue:", err);
        setAppointments([]);
        setEmergencyFeed([]);
        setChatPets([]);
        setLoading(false);
        setChatSearchLoading(false);
      });
  }, [todayDate, chatCaseFilter]);

  const handleSearchMedicalChats = async (event) => {
    event?.preventDefault();
    try {
      setChatSearchLoading(true);
      const results = await searchMedicalChatPets(chatSearchQuery, chatCaseFilter);
      setChatPets(results || []);
    } catch (error) {
      console.error("Error searching medical chat pets:", error);
      setChatPets([]);
    } finally {
      setChatSearchLoading(false);
    }
  };

  useEffect(() => {
    const imageIds = emergencyFeed
      .flatMap((item) => (item.images || []).map((img) => img.id))
      .filter((id) => !emergencyImagePreviews[id]);

    if (!imageIds.length) {
      return;
    }

    let cancelled = false;

    const loadEmergencyImages = async () => {
      const nextPreviews = {};
      for (const imageId of imageIds) {
        try {
          const blob = await getMedicalChatImageBlob(imageId);
          const objectUrl = URL.createObjectURL(blob);
          nextPreviews[imageId] = objectUrl;
          imagePreviewUrlRef.current.push(objectUrl);
        } catch {
          // Do not block doctor dashboard when one image fails.
        }
      }

      if (!cancelled && Object.keys(nextPreviews).length > 0) {
        setEmergencyImagePreviews((prev) => ({ ...prev, ...nextPreviews }));
      }
    };

    loadEmergencyImages();

    return () => {
      cancelled = true;
    };
  }, [emergencyFeed, emergencyImagePreviews]);

  useEffect(() => {
    return () => {
      imagePreviewUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
      imagePreviewUrlRef.current = [];
    };
  }, []);

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
              <h3>Medical Chat Cases</h3>
            </div>
            <form onSubmit={handleSearchMedicalChats} className="d-flex gap-2 mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by pet, owner, phone, pet ID"
                value={chatSearchQuery}
                onChange={(event) => setChatSearchQuery(event.target.value)}
              />
              <button className="btn btn-outline-primary" type="submit" disabled={chatSearchLoading}>
                Search
              </button>
            </form>
            <div className="btn-group btn-group-sm mb-3" role="group" aria-label="Medical case filter">
              <button
                type="button"
                className={`btn ${chatCaseFilter === "ACTIVE" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setChatCaseFilter("ACTIVE")}
              >
                Active Cases
              </button>
              <button
                type="button"
                className={`btn ${chatCaseFilter === "HISTORY" ? "btn-secondary" : "btn-outline-secondary"}`}
                onClick={() => setChatCaseFilter("HISTORY")}
              >
                History
              </button>
              <button
                type="button"
                className={`btn ${chatCaseFilter === "ALL" ? "btn-dark" : "btn-outline-dark"}`}
                onClick={() => setChatCaseFilter("ALL")}
              >
                All
              </button>
            </div>
            <small className="text-muted d-block mb-3">
              Search any pet medical chat by pet name, owner name, phone number, or pet ID. Closed cases move to History.
            </small>

            {chatSearchLoading ? (
              <div className="doctor-table-status">Loading medical chat pets...</div>
            ) : visibleMedicalCases.length === 0 ? (
              <div className="doctor-table-status">No medical chat cases found.</div>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: "280px", overflowY: "auto" }}>
                {visibleMedicalCases.slice(0, 12).map((item) => (
                  <div key={item.petId} className="border rounded p-2">
                    <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                      <div className="fw-semibold">{item.petName} (#{item.petId})</div>
                      <div className="d-flex gap-1 flex-wrap">
                        {item.emergency && <span className="badge text-bg-danger">Emergency</span>}
                        {item.chatStatus === "CLOSED" && <span className="badge text-bg-secondary">Closed</span>}
                        <span className="badge text-bg-light">Chat Case</span>
                      </div>
                    </div>
                    <small className="text-muted d-block">{item.petType} • {item.breed || "Breed N/A"}</small>
                    <small className="text-muted d-block">Owner: {item.ownerName} • {item.ownerPhoneNumber || "No phone"}</small>
                    <small className="text-muted d-block">Latest: {item.latestMessage || "No text message"}</small>
                    {item.latestMessageAt && (
                      <small className="text-muted d-block">Updated: {formatDisplayDate(item.latestMessageAt)}</small>
                    )}
                    {item.closedAt && (
                      <small className="text-muted d-block">Closed on: {formatDisplayDate(item.closedAt)} by {item.closedByName || "owner"}</small>
                    )}

                    {item.emergencyDetails?.images?.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        {item.emergencyDetails.images.slice(0, 3).map((img) => {
                          const previewUrl = emergencyImagePreviews[img.id];
                          if (!previewUrl) {
                            return (
                              <div
                                key={img.id}
                                className="d-flex align-items-center justify-content-center text-muted small"
                                style={{ width: "66px", height: "50px", borderRadius: "6px", background: "#f1f3f5" }}
                              >
                                ...
                              </div>
                            );
                          }

                          return (
                            <img
                              key={img.id}
                              src={previewUrl}
                              alt={img.fileName || "Emergency"}
                              style={{ width: "66px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                            />
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-2">
                      <Link className="btn btn-sm btn-outline-primary" to={`/pet-medical-chat/${item.petId}`}>
                        Open Full Pet Case
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

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