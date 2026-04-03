import React, { useState, useEffect } from "react";
import {
  fetchAppointments,
  updateAppointmentStatus,
  checkOwnerRegistered,
} from "../../services/PetService";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    fetchAppointments(date)
      .then((res) => {
        setAppointments(res.data);
        const idx = res.data.findIndex((a) => a.status === "waiting");
        setCurrentIdx(idx !== -1 ? idx : -1);
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
      if (res.data === false) {
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
      setPopupMessage("Please registar this user before checking in.");
      setRedirectUrl("");
      setShowPopup(true);
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
        }
      }
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Patient Queue</h2>
      <div className="mb-3">
        <label>Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-control"
          style={{ maxWidth: 200, display: "inline-block", marginLeft: 10 }}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.map((appt, idx) => {
              const globalIdx = (page - 1) * PAGE_SIZE + idx;
              return (
                <tr
                  key={appt.id ? appt.id : globalIdx}
                  className={
                    globalIdx === currentIdx
                      ? "table-primary"
                      : appt.status === "checked-in"
                      ? "table-success"
                      : appt.status === "pending"
                      ? "table-warning"
                      : ""
                  }
                >
                  <td>{globalIdx + 1}</td>
                  <td>{appt.name}</td>
                  <td>
                    {globalIdx === currentIdx
                      ? "Current"
                      : appt.status === "checked-in"
                      ? "Checked In"
                      : appt.status === "pending"
                      ? "Pending"
                      : "Waiting"}
                  </td>
                  <td>
                    {globalIdx === currentIdx && appt.status === "waiting" && (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleCheckIn(idx)}
                        >
                          Check In
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleNotPresent(idx)}
                        >
                          Not Present
                        </button>
                      </>
                    )}
                    {appt.status === "pending" && globalIdx !== currentIdx && (
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleRecall(idx)}
                      >
                        Recall
                      </button>
                    )}
                    {appt.status === "checked-in" && <span>✔️</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <nav>
        <ul className="pagination justify-content-center">
          {[...Array(totalPages)].map((_, i) => (
            <li
              key={i}
              className={`page-item ${page === i + 1 ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => goToPage(i + 1)}>
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {currentIdx === -1 && (
        <div className="alert alert-info text-center mt-3">
          All patients have been processed.
        </div>
      )}
      {/* Modal Overlay */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              padding: "24px",
              position: "relative",
            }}
          >
            <h5 style={{ marginBottom: "16px" }}>Registration Required</h5>
            <button
              type="button"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
              }}
              onClick={handleClosePopupOnly}
              aria-label="Close"
            >
              ×
            </button>
            <div>
              <p>{popupMessage}</p>
            </div>
            <div style={{ textAlign: "right", marginTop: "24px" }}>
              <button
                className="btn btn-primary"
                onClick={handlePopupClose}
              >
                Go to Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistQueue;