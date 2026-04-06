import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getThreadsForPet,
  createMedicalChatThread,
} from "../../services/PetService";
import { getDefaultDashboardPath, getUserRole } from "../../services/VeterinaryRegistrationService";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.error || error?.message || fallback;

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const PetMedicalChatPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const dashboardPath = getDefaultDashboardPath();
  const role = getUserRole();
  const canCreateThread = role === "ROLE_PET_OWNER" || role === "ROLE_ADMIN";

  const loadThreads = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getThreadsForPet(petId);
      setThreads(data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load medical chat threads."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  const handleCreateThread = async (event) => {
    event.preventDefault();
    try {
      setCreating(true);
      setCreateError("");
      const thread = await createMedicalChatThread(petId, newTitle.trim() || null);
      setNewTitle("");
      setShowNewForm(false);
      navigate(`/medical-chat/thread/${thread.threadId}`);
    } catch (err) {
      setCreateError(getErrorMessage(err, "Failed to create thread."));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="mb-0">Medical Chat Threads</h3>
          <small className="text-muted">Pet ID: {petId}</small>
        </div>
        <div className="d-flex gap-2">
          {canCreateThread && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => { setShowNewForm((v) => !v); setCreateError(""); }}
            >
              {showNewForm ? "Cancel" : "+ New Thread"}
            </button>
          )}
          <Link className="btn btn-outline-secondary btn-sm" to={dashboardPath}>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {showNewForm && canCreateThread && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">Start a New Medical Thread</div>
          <div className="card-body">
            <form onSubmit={handleCreateThread}>
              <div className="mb-3">
                <label className="form-label">Thread Title <span className="text-muted">(optional)</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Skin rash concern, Post-surgery follow-up..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              {createError && <div className="alert alert-danger py-2">{createError}</div>}
              <button className="btn btn-success" type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Thread"}
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-4 text-muted">Loading threads...</div>
      ) : threads.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-5">
            <div style={{ fontSize: "2.5rem" }}>💬</div>
            <h5 className="mt-3">No medical threads yet</h5>
            {canCreateThread ? (
              <>
                <p className="mb-3">Start a new thread to discuss a medical concern with your vet.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowNewForm(true)}
                >
                  + Start First Thread
                </button>
              </>
            ) : (
              <p className="mb-0">No thread has been created for this pet yet. Once owner/admin creates a thread, you can add your suggestions there.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {threads.map((thread) => (
            <div
              key={thread.threadId}
              className={`card shadow-sm border-start border-4 ${
                thread.status === "CLOSED"
                  ? "border-secondary"
                  : thread.hasEmergency
                  ? "border-danger"
                  : "border-primary"
              }`}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h5 className="mb-1">
                      {thread.title || `Medical Thread #${thread.threadId}`}
                      {thread.hasEmergency && (
                        <span className="badge text-bg-danger ms-2">Emergency</span>
                      )}
                      {thread.status === "CLOSED" ? (
                        <span className="badge text-bg-secondary ms-2">Closed</span>
                      ) : (
                        <span className="badge text-bg-success ms-2">Active</span>
                      )}
                    </h5>
                    <small className="text-muted">
                      Started: {formatDateTime(thread.createdAt)}
                    </small>
                    {thread.closedAt && (
                      <small className="text-muted d-block">
                        Closed: {formatDateTime(thread.closedAt)}
                        {thread.closedByName ? ` by ${thread.closedByName}` : ""}
                      </small>
                    )}
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <span className="badge text-bg-light border">
                      💬 {thread.messageCount} {thread.messageCount === 1 ? "message" : "messages"}
                    </span>
                  </div>
                </div>

                {thread.latestMessage && (
                  <p className="mb-2 mt-2 text-muted small fst-italic text-truncate" style={{ maxWidth: "600px" }}>
                    Latest: {thread.latestMessage}
                  </p>
                )}
                {thread.latestMessageAt && (
                  <small className="text-muted d-block mb-2">
                    Last activity: {formatDateTime(thread.latestMessageAt)}
                  </small>
                )}

                <Link
                  className="btn btn-sm btn-outline-primary mt-1"
                  to={`/medical-chat/thread/${thread.threadId}`}
                >
                  Open Thread
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetMedicalChatPage;

