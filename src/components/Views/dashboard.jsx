import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData, downloadPrescriptionPdf } from "../../services/PetService";
import {
  getOtpReadyPhoneNumber,
  isValidMobileNumber,
  sendMobileOtp,
  verifyMobileOtp,
} from "../../services/OtpService";

const getOtpErrorMessage = (error, fallbackMessage) => {
  return error.response?.data?.message || error.response?.data?.error || fallbackMessage;
};

const getOwnerPhoneVerificationStatus = (owner) => owner?.phoneVerified === true;

// Utility function to calculate days remaining
const getDaysRemaining = (validTillDate) => {
  const today = new Date();
  const expiry = new Date(validTillDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Utility function to get vaccination status badge
const getVaccinationStatus = (validTillDate) => {
  const daysRemaining = getDaysRemaining(validTillDate);
  if (daysRemaining < 0) {
    return { status: "overdue", color: "danger", text: "Overdue" };
  } else if (daysRemaining <= 30) {
    return { status: "warning", color: "warning", text: `Due in ${daysRemaining} days` };
  }
  return { status: "active", color: "success", text: `Valid (${daysRemaining} days)` };
};

const getPrescriptionValidity = (validTillDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(validTillDate);
  expiry.setHours(0, 0, 0, 0);

  if (Number.isNaN(expiry.getTime())) {
    return { isExpired: false, text: "N/A", color: "secondary" };
  }

  if (expiry < today) {
    return { isExpired: true, text: "Expired", color: "danger" };
  }

  return { isExpired: false, text: validTillDate, color: "success" };
};

// Utility function to convert base64 to image data URL
const getPhotoDataUrl = (base64, contentType) => {
  if (!base64 || !contentType) {
    return null;
  }
  return `data:${contentType};base64,${base64}`;
};

// Owner Info Card Component
const OwnerCard = ({ owner, onPhoneVerified }) => {
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState(null);
  const phoneVerified = getOwnerPhoneVerificationStatus(owner);

  useEffect(() => {
    setShowVerificationForm(false);
    setPhoneOtp("");
    setOtpSent(false);
    setOtpFeedback(null);
  }, [owner]);

  const handleSendOtp = async () => {
    const normalizedPhoneNumber = getOtpReadyPhoneNumber(owner?.phoneNumber || "");

    if (!isValidMobileNumber(owner?.phoneNumber || "")) {
      setOtpFeedback({
        type: "danger",
        message: "A valid mobile number is required before sending OTP.",
      });
      return;
    }

    try {
      setOtpLoading(true);
      setOtpFeedback(null);
      const response = await sendMobileOtp(normalizedPhoneNumber);
      setOtpSent(true);
      setShowVerificationForm(true);
      setOtpFeedback({
        type: "success",
        message: response.message || "OTP sent successfully.",
      });
    } catch (error) {
      setOtpFeedback({
        type: "danger",
        message: getOtpErrorMessage(error, "Failed to send OTP. Please try again."),
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedPhoneNumber = getOtpReadyPhoneNumber(owner?.phoneNumber || "");

    if (!phoneOtp.trim()) {
      setOtpFeedback({
        type: "danger",
        message: "Enter the OTP received on your mobile number.",
      });
      return;
    }

    try {
      setOtpLoading(true);
      setOtpFeedback(null);
      const response = await verifyMobileOtp(normalizedPhoneNumber, phoneOtp);

      if (!response.verified) {
        setOtpFeedback({
          type: "danger",
          message: response.message || "OTP verification failed. Please check the code and try again.",
        });
        return;
      }

      setPhoneOtp("");
      setOtpSent(false);
      setShowVerificationForm(false);
      setOtpFeedback({
        type: "success",
        message: response.message || "Mobile number verified successfully.",
      });

      if (onPhoneVerified) {
        await onPhoneVerified();
      }
    } catch (error) {
      setOtpFeedback({
        type: "danger",
        message: getOtpErrorMessage(error, "Failed to verify OTP. Please try again."),
      });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4 border-0" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-white bg-opacity-25 rounded-circle p-3 me-3">
            <i className="bi bi-person fs-4"></i>
          </div>
          <div>
            <h4 className="mb-0">{owner.ownerName}</h4>
            <small className="text-white text-opacity-75">Pet Owner</small>
          </div>
        </div>
        <div className="row g-2 fs-6">
          <div className="col-6">
            <strong>📧</strong> {owner.email}
          </div>
          <div className="col-6">
            <strong>📱</strong> {owner.phoneNumber}
            <span className={`badge ms-2 ${phoneVerified ? "text-bg-success" : "text-bg-warning text-dark"}`}>
              {phoneVerified ? "✓ Verified" : "Not verified"}
            </span>
          </div>
          <div className="col-12">
            <strong>📍</strong> {owner.address}
          </div>
        </div>

        {!phoneVerified && (
          <div className="mt-3 p-3 rounded-3" style={{ backgroundColor: "rgba(255, 255, 255, 0.16)" }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
              <div>
                <div className="fw-semibold">Mobile OTP verification is still pending.</div>
                <small className="text-white text-opacity-75">You can continue using the dashboard and verify your mobile number whenever needed.</small>
              </div>
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={handleSendOtp}
                disabled={otpLoading}
              >
                {otpLoading ? "Sending..." : otpSent ? "Resend OTP" : "Verify mobile"}
              </button>
            </div>

            {otpFeedback && (
              <div className={`alert alert-${otpFeedback.type} py-2 px-3 mt-3 mb-0`}>
                {otpFeedback.message}
              </div>
            )}

            {(showVerificationForm || otpSent || phoneOtp) && (
              <div className="input-group input-group-sm mt-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter OTP"
                  value={phoneOtp}
                  onChange={(event) => setPhoneOtp(event.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Alerts & Notifications Component
const AlertsNotifications = ({ vaccinations, medicalRecords, pets }) => {
  const today = new Date();
  const alerts = [];

  // Check vaccinations
  vaccinations.forEach((vac) => {
    const daysRemaining = getDaysRemaining(vac.validTill);
    const pet = pets.find((p) => p.id === vac.petId);
    
    if (daysRemaining < 0) {
      alerts.push({
        type: "danger",
        icon: "🔴",
        title: `${vac.vaccination} - OVERDUE`,
        subtitle: `${pet?.petName || "Pet"} - ${Math.abs(daysRemaining)} days overdue`,
        date: vac.validTill,
        severity: 3,
      });
    } else if (daysRemaining <= 7) {
      alerts.push({
        type: "danger",
        icon: "⚠️",
        title: `${vac.vaccination} - URGENT`,
        subtitle: `${pet?.petName || "Pet"} - Due in ${daysRemaining} days`,
        date: vac.validTill,
        severity: 3,
      });
    } else if (daysRemaining <= 30) {
      alerts.push({
        type: "warning",
        icon: "⏰",
        title: `${vac.vaccination} - Due Soon`,
        subtitle: `${pet?.petName || "Pet"} - Due in ${daysRemaining} days`,
        date: vac.validTill,
        severity: 2,
      });
    }
  });

  // Check medical records
  medicalRecords.forEach((record) => {
    const validateTill = new Date(record.validateTill);
    const daysRemaining = Math.ceil((validateTill - today) / (1000 * 60 * 60 * 24));
    const pet = pets.find((p) => p.id === record.petId);
    
    if (daysRemaining <= 7) {
      alerts.push({
        type: "info",
        icon: "📋",
        title: `Medical Check-up Expires`,
        subtitle: `${pet?.petName || "Pet"} - ${record.diagnosis}`,
        date: record.validateTill,
        severity: 1,
      });
    }
  });

  // Sort alerts by severity (highest first) and date
  alerts.sort((a, b) => {
    if (a.severity !== b.severity) {
      return b.severity - a.severity;
    }
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <div className="sticky-top" style={{ top: "20px" }}>
      {/* Pets Gallery */}
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-header bg-white">
          <h6 className="mb-0 fw-bold">🐾 Your Pets</h6>
        </div>
        <div className="card-body p-2">
          <div className="d-flex gap-2 flex-wrap">
            {pets.map((pet) => (
              <div key={pet.id} className="text-center" style={{ flex: "0 0 calc(50% - 8px)" }}>
                {pet.photoBase64 && pet.photoContentType ? (
                  <img
                    src={getPhotoDataUrl(pet.photoBase64, pet.photoContentType)}
                    alt={pet.petName}
                    className="rounded-circle border-2 border-primary shadow-sm"
                    style={{ width: "60px", height: "60px", objectFit: "cover" }}
                    title={pet.petName}
                  />
                ) : (
                  <div 
                    className="rounded-circle border-2 border-primary shadow-sm mx-auto d-flex align-items-center justify-content-center"
                    style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                    title={pet.petName}
                  >
                    <span>🐾</span>
                  </div>
                )}
                <small className="d-block mt-2 fw-bold text-truncate">{pet.petName}</small>
                <small className="text-muted text-truncate">{pet.petType}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-3">
        <div className="card-header bg-gradient text-white" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
          <h5 className="mb-0">
            <i className="bi bi-bell"></i> 🔔 Health Alerts
          </h5>
        </div>
        <div className="card-body p-0">
          {alerts.length === 0 ? (
            <div className="p-3">
              <div className="alert alert-success mb-0">
                <i className="bi bi-check-circle"></i> All vaccinations up to date!
              </div>
            </div>
          ) : (
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`border-start border-4 p-3 border-bottom ${
                    alert.type === "danger" ? "bg-danger bg-opacity-10" : alert.type === "warning" ? "bg-warning bg-opacity-10" : "bg-info bg-opacity-10"
                  }`}
                  style={{ borderColor: alert.type === "danger" ? "#dc3545" : alert.type === "warning" ? "#ffc107" : "#0dcaf0" }}
                >
                  <div className="d-flex gap-2">
                    <span className="fs-5">{alert.icon}</span>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold">{alert.title}</h6>
                      <small className="text-muted d-block">{alert.subtitle}</small>
                      <small className="text-secondary">📅 {alert.date}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="mb-3 fw-bold">📊 Quick Stats</h6>
          <div className="mb-2">
            <small className="text-muted">Due Vaccinations</small>
            <div className="progress" role="progressbar">
              <div
                className="progress-bar bg-danger"
                style={{
                  width: `${
                    (alerts.filter((a) => a.type === "danger").length /
                      (vaccinations.length || 1)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            <small className="fw-bold">{alerts.filter((a) => a.type === "danger").length}</small>
          </div>
          <div className="mb-2">
            <small className="text-muted">Warning Vaccinations</small>
            <div className="progress" role="progressbar">
              <div
                className="progress-bar bg-warning"
                style={{
                  width: `${
                    (alerts.filter((a) => a.type === "warning").length /
                      (vaccinations.length || 1)) *
                    100
                  }%`,
                }}
              ></div>
            </div>
            <small className="fw-bold">{alerts.filter((a) => a.type === "warning").length}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

// Pet Info Card Component
const PetCard = ({ pet, vaccinations, medicalRecords }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const handleDownloadPdf = async (petId, petMedicalId, diagnosis) => {
    setDownloadingId(petMedicalId);
    setDownloadError(null);
    try {
      await downloadPrescriptionPdf(petId, petMedicalId);
    } catch (err) {
      console.error("PDF download error:", err);
      setDownloadError(`Failed to download prescription for "${diagnosis}". Please try again.`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white border-bottom pt-4 pb-3">
        <div className="d-flex align-items-center">
          {pet.photoBase64 && pet.photoContentType ? (
            <img
              src={getPhotoDataUrl(pet.photoBase64, pet.photoContentType)}
              alt={pet.petName}
              className="rounded-circle me-3 border border-3 border-primary shadow-sm"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
            />
          ) : (
            <div 
              className="rounded-circle overflow-hidden me-3 border border-3 border-secondary shadow-sm"
              style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <span className="fs-1">🐾</span>
            </div>
          )}
          <div>
            <h4 className="mb-1 text-primary">{pet.petName}</h4>
            <p className="mb-0 text-muted">{pet.petType} • {pet.breed}</p>
            <small className="text-success">Registered: {pet.registrationDate}</small>
          </div>
        </div>
      </div>

      <div className="card-body">
        {/* Tabs */}
        <ul className="nav nav-tabs mb-3" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              📋 Info
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "vaccinations" ? "active" : ""}`}
              onClick={() => setActiveTab("vaccinations")}
            >
              💉 Vaccinations ({vaccinations.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "medical" ? "active" : ""}`}
              onClick={() => setActiveTab("medical")}
            >
              🏥 Medical Records ({medicalRecords.length})
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "info" && (
            <div className="py-2">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong className="text-muted d-block mb-1">Pet Type</strong>
                  <p>{pet.petType}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong className="text-muted d-block mb-1">Breed</strong>
                  <p>{pet.breed}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong className="text-muted d-block mb-1">Registration ID</strong>
                  <p>{pet.id}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong className="text-muted d-block mb-1">Registration Date</strong>
                  <p>{pet.registrationDate}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "vaccinations" && (
            <div className="py-2">
              {vaccinations.length === 0 ? (
                <div className="alert alert-info">No vaccinations recorded yet.</div>
              ) : (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {vaccinations.map((vac, idx) => {
                    const statusInfo = getVaccinationStatus(vac.validTill);
                    return (
                      <div key={idx} className="border-start border-4 ps-3 mb-3 pb-3" style={{ borderColor: `var(--bs-${statusInfo.color})` }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1 fw-bold">{vac.vaccination}</h6>
                            <small className="text-muted">
                              Date: <strong>{vac.vaccinationDate}</strong> | Weight: <strong>{vac.weight}kg</strong>
                            </small>
                            <br />
                            <small className="text-muted">Brand: {vac.brandAndDoses}</small>
                          </div>
                          <span className={`badge bg-${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <div className="mt-2">
                          <small className="text-secondary">Valid Till: {vac.validTill}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "medical" && (
            <div className="py-2">
              {downloadError && (
                <div className="alert alert-danger alert-dismissible fade show py-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {downloadError}
                  <button
                    type="button"
                    className="btn-close btn-sm"
                    onClick={() => setDownloadError(null)}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              {medicalRecords.length === 0 ? (
                <div className="alert alert-info">No medical records yet.</div>
              ) : (
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {medicalRecords.map((record, idx) => {
                    const validity = getPrescriptionValidity(record.validateTill);
                    return (
                    <div key={idx} className="card border-0 shadow-sm mb-3" style={{ borderLeft: "4px solid #6c63ff" }}>
                      <div className="card-body">
                        {/* Header row */}
                        <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                          <h6 className="fw-bold mb-0">
                            <span className="me-2">📅</span>{record.visitDate}
                          </h6>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className={`badge bg-${validity.color} rounded-pill`}>
                              {validity.isExpired ? "Expired" : `Valid till: ${validity.text}`}
                            </span>
                            {/* Download PDF button */}
                            <button
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              style={{ fontSize: "0.78rem", whiteSpace: "nowrap" }}
                              onClick={() => handleDownloadPdf(record.petId, record.petMedicalId, record.diagnosis)}
                              disabled={downloadingId === record.petMedicalId}
                              title={`Download prescription PDF for: ${record.diagnosis}`}
                            >
                              {downloadingId === record.petMedicalId ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  <span>Downloading…</span>
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-file-earmark-pdf-fill"></i>
                                  <span>Download PDF</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Diagnosis */}
                        <p className="mb-2">
                          <strong>Diagnosis:</strong>{" "}
                          <span className="text-danger fw-semibold">{record.diagnosis}</span>
                        </p>

                        {record.allergies && (
                          <p className="mb-2">
                            <strong>Allergies:</strong> {record.allergies}
                          </p>
                        )}

                        <p className="mb-2">
                          <strong>Treatment:</strong> {record.treatmentSuggestions}
                        </p>

                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div className="mt-2 p-2 rounded" style={{ background: "#f8f9ff", border: "1px solid #e0e0ff" }}>
                            <strong className="text-muted">
                              <i className="bi bi-capsule me-1"></i>Prescriptions:
                            </strong>
                            <ul className="small mt-1 mb-0">
                              {record.prescriptions.map((med, midx) => (
                                <li key={midx}>
                                  <strong>{med.medicine}</strong> — {med.dosage},{" "}
                                  {med.frequency}× daily, after {med.meal}, for {med.duration} days
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const PetDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading pet dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !dashboardData) {
    return (
      <div className="container-fluid mt-4">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error Loading Dashboard</h5>
          <p>{error || "Failed to fetch dashboard data"}</p>
          <button className="btn btn-outline-danger btn-sm" onClick={fetchDashboardData}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const { owner, pets, vaccinations, medicalRecords, appointments } = dashboardData;

  return (
    <div className="container-fluid mt-4 pb-5">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">🐕 Pet Dashboard</h2>
        <p className="text-muted">Manage your pet's health and records</p>
      </div>

      <div className="row g-4">
        {/* Left Sidebar - Alerts */}
        <div className="col-lg-3">
          <AlertsNotifications vaccinations={vaccinations} medicalRecords={medicalRecords} pets={pets} />
        </div>

        {/* Main Content - Right Side */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm mb-4" style={{ background: "linear-gradient(120deg, #f0f8ff 0%, #e6fff4 100%)" }}>
            <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h5 className="fw-bold mb-1">🛍️ Pet Marketplace</h5>
                <p className="text-muted mb-0">Explore accessories with sample prices and purchase them when you visit the hospital.</p>
              </div>
              <Link to="/pet-marketplace" className="btn btn-primary">
                Browse Marketplace
              </Link>
            </div>
          </div>

          {/* Owner Info */}
          <OwnerCard owner={owner} onPhoneVerified={fetchDashboardData} />

          {/* Pets Section */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3">Your Pets</h5>
            <div className="row g-4">
              {pets.length === 0 ? (
                <div className="col-12">
                  <div className="alert alert-info">No pets registered yet.</div>
                </div>
              ) : (
                pets.map((pet) => {
                  const petVaccinations = vaccinations.filter((v) => v.petId === pet.id);
                  const petRecords = medicalRecords.filter((r) => r.petId === pet.id);
                  return (
                    <div key={pet.id} className="col-12">
                      <PetCard
                        pet={pet}
                        vaccinations={petVaccinations}
                        medicalRecords={petRecords}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Health Summary */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-0 text-center">
                <div className="card-body">
                  <h2 className="text-primary mb-0">{pets.length}</h2>
                  <p className="text-muted mb-0">Total Pets</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 text-center">
                <div className="card-body">
                  <h2 className="text-success mb-0">{vaccinations.length}</h2>
                  <p className="text-muted mb-0">Vaccinations</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 text-center">
                <div className="card-body">
                  <h2 className="text-warning mb-0">{medicalRecords.length}</h2>
                  <p className="text-muted mb-0">Medical Records</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-sm border-0 text-center">
                <div className="card-body">
                  <h2 className="text-info mb-0">{appointments.length}</h2>
                  <p className="text-muted mb-0">Appointments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDashboard;