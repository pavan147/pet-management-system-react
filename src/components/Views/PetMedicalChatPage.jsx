import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getMedicalChatThread,
  sendMedicalChatMessage,
  uploadMedicalChatImages,
  getMedicalChatImageBlob,
} from "../../services/PetService";
import { getUserRole } from "../../services/VeterinaryRegistrationService";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const getErrorMessage = (error, fallback) => {
  return error?.response?.data?.error || error?.message || fallback;
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const getPhotoDataUrl = (base64, contentType) => {
  if (!base64 || !contentType) {
    return null;
  }
  return `data:${contentType};base64,${base64}`;
};

const PetMedicalChatPage = () => {
  const { petId } = useParams();
  const role = getUserRole();
  const canUploadImages = role === "ROLE_PET_OWNER" || role === "ROLE_ADMIN";

  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [message, setMessage] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [files, setFiles] = useState([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadEmergency, setUploadEmergency] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({});
  const [selectedFilePreviews, setSelectedFilePreviews] = useState([]);
  const previewUrlRef = useRef([]);
  const selectedPreviewUrlRef = useRef([]);

  const orderedMessages = useMemo(() => {
    if (!thread?.messages) return [];
    return [...thread.messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [thread]);

  const loadThread = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMedicalChatThread(petId);
      setThread(response);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load medical chat."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThread();
    // Poll lightly for near real-time updates.
    const timer = setInterval(loadThread, 15000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  useEffect(() => {
    const imageIds = orderedMessages
      .flatMap((entry) => (entry.images || []).map((img) => img.id))
      .filter((id) => !imagePreviews[id]);

    if (!imageIds.length) {
      return;
    }

    let cancelled = false;

    const loadPreviews = async () => {
      const nextPreviews = {};
      for (const imageId of imageIds) {
        try {
          const blob = await getMedicalChatImageBlob(imageId);
          const objectUrl = URL.createObjectURL(blob);
          nextPreviews[imageId] = objectUrl;
          previewUrlRef.current.push(objectUrl);
        } catch {
          // Keep chat usable even if one image preview fails.
        }
      }

      if (!cancelled && Object.keys(nextPreviews).length > 0) {
        setImagePreviews((prev) => ({ ...prev, ...nextPreviews }));
      }
    };

    loadPreviews();

    return () => {
      cancelled = true;
    };
  }, [orderedMessages, imagePreviews]);

  useEffect(() => {
    selectedPreviewUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
    selectedPreviewUrlRef.current = [];

    if (!files.length) {
      setSelectedFilePreviews([]);
      return;
    }

    const previews = files.map((file) => {
      const url = URL.createObjectURL(file);
      selectedPreviewUrlRef.current.push(url);
      return {
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        url,
      };
    });

    setSelectedFilePreviews(previews);
  }, [files]);

  useEffect(() => {
    return () => {
      previewUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlRef.current = [];
      selectedPreviewUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
      selectedPreviewUrlRef.current = [];
    };
  }, []);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    try {
      setSubmitting(true);
      await sendMedicalChatMessage(petId, {
        message: message.trim(),
        emergency,
      });
      setMessage("");
      setEmergency(false);
      await loadThread();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send message."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (event) => {
    setUploadError("");
    const selected = Array.from(event.target.files || []);
    if (!selected.length) {
      setFiles([]);
      return;
    }

    for (const file of selected) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Only JPG and PNG files are allowed.");
        event.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError("Each image must be 5MB or smaller.");
        event.target.value = "";
        return;
      }
    }

    setFiles(selected);
  };

  const handleUploadImages = async (event) => {
    event.preventDefault();
    if (!files.length) {
      setUploadError("Please select at least one image.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      await uploadMedicalChatImages(petId, files, uploadMessage, uploadEmergency);
      setFiles([]);
      setUploadMessage("");
      setUploadEmergency(false);
      const input = document.getElementById("medical-chat-file-input");
      if (input) input.value = "";
      await loadThread();
    } catch (err) {
      setUploadError(getErrorMessage(err, "Image upload failed."));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading medical chat...</div>;
  }

  if (error && !thread) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Medical Chat: {thread?.petName}</h3>
          <small className="text-muted">Pet ID: {thread?.petId}</small>
        </div>
        <Link className="btn btn-outline-secondary btn-sm" to="/dashboard">
          Back to Dashboard
        </Link>
      </div>

      {error && <div className="alert alert-warning py-2">{error}</div>}

      {thread?.petContext && (
        <div className="card shadow-sm mb-3">
          <div className="card-header bg-light">Pet Case Summary</div>
          <div className="card-body">
            <div className="row g-3 align-items-start">
              <div className="col-md-3 text-center text-md-start">
                {getPhotoDataUrl(thread.petContext.photoBase64, thread.petContext.photoContentType) ? (
                  <img
                    src={getPhotoDataUrl(thread.petContext.photoBase64, thread.petContext.photoContentType)}
                    alt={thread.petContext.petName}
                    className="rounded border"
                    style={{ width: "160px", height: "160px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center rounded border bg-light"
                    style={{ width: "160px", height: "160px", fontSize: "2rem" }}
                  >
                    🐾
                  </div>
                )}
              </div>
              <div className="col-md-9">
                <div className="row g-2 small">
                  <div className="col-md-4"><strong>Pet:</strong> {thread.petContext.petName}</div>
                  <div className="col-md-4"><strong>Type:</strong> {thread.petContext.petType || "N/A"}</div>
                  <div className="col-md-4"><strong>Breed:</strong> {thread.petContext.breed || "N/A"}</div>
                  <div className="col-md-4"><strong>Gender:</strong> {thread.petContext.gender || "N/A"}</div>
                  <div className="col-md-4"><strong>DOB:</strong> {thread.petContext.dob || "N/A"}</div>
                  <div className="col-md-4"><strong>Registered:</strong> {thread.petContext.registrationDate || "N/A"}</div>
                  <div className="col-md-6"><strong>Owner:</strong> {thread.petContext.ownerName || "N/A"}</div>
                  <div className="col-md-6"><strong>Phone:</strong> {thread.petContext.ownerPhoneNumber || "N/A"}</div>
                  <div className="col-md-6"><strong>Email:</strong> {thread.petContext.ownerEmail || "N/A"}</div>
                  <div className="col-md-6"><strong>Assigned Vet:</strong> {thread.petContext.assignedVetName || "Any Doctor"}</div>
                  <div className="col-12"><strong>Allergies:</strong> {thread.petContext.allergies || "None recorded"}</div>
                  <div className="col-12"><strong>Description:</strong> {thread.petContext.description || "No description available"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-3 mb-3">
        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">Vaccination History</div>
            <div className="card-body" style={{ maxHeight: "260px", overflowY: "auto" }}>
              {thread?.vaccinationRecords?.length ? (
                thread.vaccinationRecords.map((record, index) => (
                  <div key={`${record.vaccination}-${index}`} className="border-bottom pb-2 mb-2 small">
                    <div className="fw-semibold">{record.vaccination}</div>
                    <div>Date: {record.vaccinationDate || "N/A"}</div>
                    <div>Valid till: {record.validTill || "N/A"}</div>
                    <div>Brand/Dose: {record.brandAndDoses || "N/A"}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted small">No vaccination records found.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">Deworming</div>
            <div className="card-body" style={{ maxHeight: "260px", overflowY: "auto" }}>
              {thread?.dewormingRecords?.length ? (
                thread.dewormingRecords.map((record, index) => (
                  <div key={`${record.vaccinationDate}-${index}`} className="border-bottom pb-2 mb-2 small">
                    <div className="fw-semibold">{record.vaccination}</div>
                    <div>Date: {record.vaccinationDate || "N/A"}</div>
                    <div>Valid till: {record.validTill || "N/A"}</div>
                    <div>Weight: {record.weight || "N/A"} kg</div>
                  </div>
                ))
              ) : (
                <div className="text-muted small">No deworming records found.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-light">Medical History</div>
            <div className="card-body" style={{ maxHeight: "260px", overflowY: "auto" }}>
              {thread?.medicalRecords?.length ? (
                thread.medicalRecords.map((record) => (
                  <div key={record.petMedicalId} className="border-bottom pb-2 mb-2 small">
                    <div className="fw-semibold">{record.diagnosis}</div>
                    <div>Visit: {record.visitDate || "N/A"}</div>
                    <div>Valid till: {record.validateTill || "N/A"}</div>
                    <div>Treatment: {record.treatmentSuggestions || "N/A"}</div>
                  </div>
                ))
              ) : (
                <div className="text-muted small">No medical history found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-header bg-light">Conversation</div>
        <div className="card-body" style={{ maxHeight: "450px", overflowY: "auto" }}>
          {orderedMessages.length === 0 ? (
            <div className="text-muted">No conversation yet.</div>
          ) : (
            orderedMessages.map((entry) => (
              <div key={entry.id} className="border rounded p-2 mb-2">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <strong>{entry.senderName}</strong>
                    <span className="text-muted ms-2">({entry.senderRole})</span>
                    {entry.emergency && <span className="badge text-bg-danger ms-2">Emergency</span>}
                  </div>
                  <small className="text-muted">{formatDateTime(entry.createdAt)}</small>
                </div>

                {entry.message && <p className="mb-2 mt-2">{entry.message}</p>}

                {entry.images?.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {entry.images.map((img) => {
                      const previewUrl = imagePreviews[img.id];
                      if (!previewUrl) {
                        return (
                          <div
                            key={img.id}
                            className="d-flex align-items-center justify-content-center text-muted small"
                            style={{ width: "130px", height: "100px", borderRadius: "8px", background: "#f1f3f5" }}
                          >
                            Loading image...
                          </div>
                        );
                      }

                      return (
                        <a key={img.id} href={previewUrl} target="_blank" rel="noreferrer">
                          <img
                            src={previewUrl}
                            alt={img.fileName || "Medical"}
                            style={{ width: "130px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                          />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-header bg-light">Send Chat Message</div>
        <div className="card-body">
          <form onSubmit={handleSendMessage}>
            <div className="mb-2">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Type your advice / update"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="messageEmergency"
                checked={emergency}
                onChange={(event) => setEmergency(event.target.checked)}
              />
              <label className="form-check-label" htmlFor="messageEmergency">
                Mark as emergency
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting || !message.trim()}>
              {submitting ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>

      {canUploadImages && (
        <div className="card shadow-sm">
          <div className="card-header bg-light">Upload Medical Condition Images</div>
          <div className="card-body">
            <form onSubmit={handleUploadImages}>
              <div className="mb-3">
                <input
                  id="medical-chat-file-input"
                  type="file"
                  accept="image/png,image/jpeg"
                  className="form-control"
                  multiple
                  onChange={handleFileChange}
                />
                <small className="text-muted">Allowed: JPG/PNG, max 5MB each.</small>
              </div>

              {selectedFilePreviews.length > 0 && (
                <div className="mb-3">
                  <div className="fw-semibold mb-2">Selected image preview</div>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedFilePreviews.map((preview) => (
                      <div key={preview.url} className="border rounded p-2" style={{ width: "150px" }}>
                        <img
                          src={preview.url}
                          alt={preview.name}
                          style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px" }}
                        />
                        <div className="small text-truncate mt-1" title={preview.name}>{preview.name}</div>
                        <div className="small text-muted">{preview.sizeKb} KB</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="Optional note for doctor"
                  value={uploadMessage}
                  onChange={(event) => setUploadMessage(event.target.value)}
                />
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="uploadEmergency"
                  checked={uploadEmergency}
                  onChange={(event) => setUploadEmergency(event.target.checked)}
                />
                <label className="form-check-label" htmlFor="uploadEmergency">
                  Emergency upload (notifies doctor via Telegram)
                </label>
              </div>

              {uploadError && <div className="alert alert-danger py-2">{uploadError}</div>}

              <button className="btn btn-danger" type="submit" disabled={uploading || files.length === 0}>
                {uploading ? "Uploading..." : "Upload Images"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetMedicalChatPage;

