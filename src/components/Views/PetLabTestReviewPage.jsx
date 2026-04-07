import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  downloadLabTestReport,
  getLabTestReportBlob,
  getLabTestReportDetails,
  reviewLabTestReport,
} from "../../services/PetService";
import { isAdminUser, isDoctorUser } from "../../services/VeterinaryRegistrationService";

const EMPTY_PRESCRIPTION = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  times: [],
  meal: "after",
};

const TIME_OPTIONS = [
  { label: "Morning", value: "M" },
  { label: "Afternoon", value: "A" },
  { label: "Evening", value: "E" },
  { label: "Night", value: "N" },
];

const STATUS_BADGE = {
  PENDING_REVIEW: "text-bg-warning",
  REVIEWED: "text-bg-info",
  PRESCRIPTION_SHARED: "text-bg-success",
};

const formatBytes = (bytes) => {
  if (!bytes) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const PetLabTestReviewPage = () => {
  const { labTestId } = useParams();
  const [report, setReport] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formState, setFormState] = useState({
    reviewSummary: "",
    doctorReviewNotes: "",
    recommendedFollowUpDate: "",
    allergies: "",
    diagnosis: "",
    treatmentSuggestions: "",
    validateTill: "",
    visitDate: "",
    prescriptions: [{ ...EMPTY_PRESCRIPTION }],
  });

  const canReview = isDoctorUser() || isAdminUser();

  useEffect(() => {
    if (!canReview) {
      return undefined;
    }

    let active = true;
    let objectUrl;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await getLabTestReportDetails(labTestId);
        const blob = await getLabTestReportBlob(labTestId);
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
        setReport(detail);
        setFormState((current) => ({
          ...current,
          reviewSummary: detail.reviewSummary || "",
          doctorReviewNotes: detail.doctorReviewNotes || "",
          recommendedFollowUpDate: detail.recommendedFollowUpDate || "",
        }));
      } catch (loadError) {
        if (active) {
          setError(loadError.response?.data?.error || "Failed to load lab report details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [labTestId, canReview]);

  const isPdf = useMemo(() => report?.contentType === "application/pdf", [report]);

  const updatePrescription = (index, field, value) => {
    setFormState((current) => {
      const next = [...current.prescriptions];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return {
        ...current,
        prescriptions: next,
      };
    });
  };

  const togglePrescriptionTime = (index, value) => {
    setFormState((current) => {
      const next = [...current.prescriptions];
      const times = next[index].times || [];
      next[index] = {
        ...next[index],
        times: times.includes(value) ? times.filter((time) => time !== value) : [...times, value],
      };
      return {
        ...current,
        prescriptions: next,
      };
    });
  };

  const addPrescriptionRow = () => {
    setFormState((current) => ({
      ...current,
      prescriptions: [...current.prescriptions, { ...EMPTY_PRESCRIPTION }],
    }));
  };

  const removePrescriptionRow = (index) => {
    setFormState((current) => ({
      ...current,
      prescriptions: current.prescriptions.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const payload = {
        ...formState,
        prescriptions: formState.prescriptions.filter(
          (item) => item.medicine || item.dosage || item.frequency || item.duration || item.instructions
        ),
      };
      const updatedReport = await reviewLabTestReport(labTestId, payload);
      setReport(updatedReport);
      setSuccess(
        updatedReport.followUpMedicalRecordId
          ? "Doctor review saved and follow-up prescription created successfully."
          : "Doctor review saved successfully."
      );
    } catch (submitError) {
      setError(submitError.response?.data?.error || "Failed to save doctor review.");
    } finally {
      setSaving(false);
    }
  };

  if (!canReview) {
    return <Navigate to="/doctor-dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Loading lab report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error || "Lab report not found."}</div>
        <Link className="btn btn-outline-primary" to="/doctor-dashboard">
          Back to Doctor Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <h2 className="fw-bold mb-1">Lab Test Review</h2>
          <p className="text-muted mb-0">
            Review uploaded report, add notes, and optionally issue a follow-up prescription.
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link className="btn btn-outline-secondary" to="/doctor-dashboard">
            Back
          </Link>
          <button className="btn btn-outline-primary" type="button" onClick={() => downloadLabTestReport(report.id)}>
            Download Report
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-3">
                <div>
                  <h5 className="mb-1">{report.title}</h5>
                  <small className="text-muted">{report.originalFileName}</small>
                </div>
                <span className={`badge ${STATUS_BADGE[report.status] || "text-bg-secondary"}`}>{report.status}</span>
              </div>

              <div className="small text-muted mb-3">
                <div><strong>Pet:</strong> {report.petName} #{report.petId}</div>
                <div><strong>Owner:</strong> {report.ownerName} • {report.ownerPhoneNumber || "No phone"}</div>
                <div><strong>Assigned Doctor:</strong> {report.assignedVetName || "Not assigned"}</div>
                <div><strong>Test Type:</strong> {report.labTestType || "General lab report"}</div>
                <div><strong>Uploaded:</strong> {report.uploadedAt || "-"}</div>
                <div><strong>File Size:</strong> {formatBytes(report.sizeBytes)}</div>
              </div>

              {report.ownerNotes && (
                <div className="alert alert-light border">
                  <strong>Owner Notes:</strong>
                  <div className="mt-1">{report.ownerNotes}</div>
                </div>
              )}

              <div className="border rounded overflow-hidden" style={{ minHeight: "420px", background: "#f8f9fa" }}>
                {previewUrl && isPdf ? (
                  <iframe title="Lab report preview" src={previewUrl} style={{ width: "100%", height: "420px", border: "0" }} />
                ) : previewUrl ? (
                  <img src={previewUrl} alt={report.title} style={{ width: "100%", maxHeight: "420px", objectFit: "contain" }} />
                ) : (
                  <div className="p-4 text-center text-muted">Preview not available.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <form className="card shadow-sm border-0" onSubmit={handleSubmit}>
            <div className="card-body">
              <h5 className="mb-3">Doctor Review</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Short Review Summary</label>
                  <input
                    className="form-control"
                    value={formState.reviewSummary}
                    onChange={(event) => setFormState((current) => ({ ...current, reviewSummary: event.target.value }))}
                    placeholder="e.g. Mild infection, continue monitoring"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Recommended Follow-up Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formState.recommendedFollowUpDate}
                    onChange={(event) => setFormState((current) => ({ ...current, recommendedFollowUpDate: event.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Doctor Notes</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={formState.doctorReviewNotes}
                    onChange={(event) => setFormState((current) => ({ ...current, doctorReviewNotes: event.target.value }))}
                    placeholder="Explain findings, risk level, and what owner should do next."
                  />
                </div>
              </div>

              <hr className="my-4" />
              <h6 className="fw-bold">Optional Follow-up Prescription</h6>
              <p className="text-muted small mb-3">
                Fill the section below only when you want to convert this review into a new medical follow-up and prescription.
              </p>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Diagnosis</label>
                  <input
                    className="form-control"
                    value={formState.diagnosis}
                    onChange={(event) => setFormState((current) => ({ ...current, diagnosis: event.target.value }))}
                    placeholder="Diagnosis after reviewing lab report"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Update Allergies</label>
                  <input
                    className="form-control"
                    value={formState.allergies}
                    onChange={(event) => setFormState((current) => ({ ...current, allergies: event.target.value }))}
                    placeholder="Optional allergy update"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Prescription Valid Till</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formState.validateTill}
                    onChange={(event) => setFormState((current) => ({ ...current, validateTill: event.target.value }))}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Visit Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formState.visitDate}
                    onChange={(event) => setFormState((current) => ({ ...current, visitDate: event.target.value }))}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Treatment Suggestions</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formState.treatmentSuggestions}
                    onChange={(event) => setFormState((current) => ({ ...current, treatmentSuggestions: event.target.value }))}
                    placeholder="Medicine plan, diet advice, repeat tests, revisit instructions"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <h6 className="mb-0">Medicines</h6>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addPrescriptionRow}>
                  Add Medicine
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                {formState.prescriptions.map((item, index) => (
                  <div key={`${index}-${item.medicine}`} className="border rounded p-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <strong>Medicine #{index + 1}</strong>
                      {formState.prescriptions.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removePrescriptionRow(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <input
                          className="form-control"
                          placeholder="Medicine"
                          value={item.medicine}
                          onChange={(event) => updatePrescription(index, "medicine", event.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          className="form-control"
                          placeholder="Dosage"
                          value={item.dosage}
                          onChange={(event) => updatePrescription(index, "dosage", event.target.value)}
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          placeholder="Frequency/day"
                          value={item.frequency}
                          onChange={(event) => updatePrescription(index, "frequency", event.target.value ? Number(event.target.value) : "")}
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          placeholder="Duration days"
                          value={item.duration}
                          onChange={(event) => updatePrescription(index, "duration", event.target.value ? Number(event.target.value) : "")}
                        />
                      </div>
                      <div className="col-md-4">
                        <select
                          className="form-select"
                          value={item.meal}
                          onChange={(event) => updatePrescription(index, "meal", event.target.value)}
                        >
                          <option value="after">After Meal</option>
                          <option value="before">Before Meal</option>
                          <option value="any">Anytime</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <div className="d-flex flex-wrap gap-2">
                          {TIME_OPTIONS.map((option) => (
                            <label key={option.value} className="btn btn-sm btn-outline-secondary">
                              <input
                                type="checkbox"
                                className="form-check-input me-2"
                                checked={item.times.includes(option.value)}
                                onChange={() => togglePrescriptionTime(index, option.value)}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="col-12">
                        <input
                          className="form-control"
                          placeholder="Instructions"
                          value={item.instructions}
                          onChange={(event) => updatePrescription(index, "instructions", event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
              <small className="text-muted">
                If medicines are entered, backend creates a new follow-up medical record for the pet owner dashboard.
              </small>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PetLabTestReviewPage;

