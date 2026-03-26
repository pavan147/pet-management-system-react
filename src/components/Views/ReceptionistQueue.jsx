import React, { useState } from "react";

const PAGE_SIZE = 5;

const initialAppointments = [
  { name: "John Doe", status: "waiting" },
  { name: "Jane Smith", status: "waiting" },
  { name: "Alice Johnson", status: "waiting" },
  { name: "Bob Brown", status: "waiting" },
  { name: "Charlie Lee", status: "waiting" },
  { name: "Diana Prince", status: "waiting" },
  { name: "Eve Adams", status: "waiting" },
  { name: "Frank Miller", status: "waiting" },
];

const ReceptionistQueue = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [page, setPage] = useState(1);

  // Pagination helpers
  const totalPages = Math.ceil(appointments.length / PAGE_SIZE);
  const paginatedAppointments = appointments.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleCheckIn = (idx) => {
    const globalIdx = (page - 1) * PAGE_SIZE + idx;
    const updated = appointments.map((appt, i) =>
      i === globalIdx ? { ...appt, status: "checked-in" } : appt
    );
    setAppointments(updated);
    callNext(globalIdx, updated);
  };

  const handleNotPresent = (idx) => {
    const globalIdx = (page - 1) * PAGE_SIZE + idx;
    const updated = appointments.map((appt, i) =>
      i === globalIdx ? { ...appt, status: "pending" } : appt
    );
    setAppointments(updated);
    callNext(globalIdx, updated);
  };

  const handleRecall = (idx) => {
    const globalIdx = (page - 1) * PAGE_SIZE + idx;
    // Set status back to 'waiting' and set as current
    const updated = appointments.map((appt, i) =>
      i === globalIdx ? { ...appt, status: "waiting" } : appt
    );
    setAppointments(updated);
    setCurrentIdx(globalIdx);
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

  // Pagination controls
  const goToPage = (p) => setPage(p);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Patient Queue</h2>
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
                  key={globalIdx}
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
    </div>
  );
};

export default ReceptionistQueue;