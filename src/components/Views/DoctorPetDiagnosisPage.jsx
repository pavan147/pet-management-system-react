import React, { useEffect, useState } from "react";
import {
  createDoctorDiagnosis,
  getDoctorPetHistory,
  searchDoctorPets,
} from "../../services/PetService";
import "../Forms/forms.css";

const emptyPrescription = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  meal: "any",
  times: [],
};

const timeOptions = [
  { label: "Morning", value: "M" },
  { label: "Afternoon", value: "A" },
  { label: "Evening", value: "E" },
  { label: "Night", value: "N" },
];

const mealOptions = [
  { label: "Anytime", value: "any" },
  { label: "Before Meal", value: "before" },
  { label: "After Meal", value: "after" },
];

const DoctorPetDiagnosisPage = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [history, setHistory] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    allergies: "",
    diagnosis: "",
    treatmentSuggestions: "",
    validateTill: "",
    prescriptions: [{ ...emptyPrescription }],
  });

  const runSearch = async (nextQuery = query) => {
    try {
      setLoadingSearch(true);
      const results = await searchDoctorPets(nextQuery);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Failed to search pets for doctor", error);
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    runSearch("");
  }, []);

  const loadHistory = async (pet) => {
    try {
      setLoadingHistory(true);
      setMessage("");
      setSelectedPet(pet);
      const data = await getDoctorPetHistory(pet.petId);
      setHistory(data);
      setForm((prev) => ({ ...prev, allergies: data?.allergies || "" }));
    } catch (error) {
      console.error("Failed to load pet history", error);
      setHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const updatePrescription = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.prescriptions];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, prescriptions: next };
    });
  };

  const toggleTime = (index, timeValue) => {
    setForm((prev) => {
      const next = [...prev.prescriptions];
      const times = next[index].times || [];
      next[index] = {
        ...next[index],
        times: times.includes(timeValue)
          ? times.filter((t) => t !== timeValue)
          : [...times, timeValue],
      };
      return { ...prev, prescriptions: next };
    });
  };

  const addPrescription = () => {
    setForm((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { ...emptyPrescription }],
    }));
  };

  const removePrescription = (index) => {
    setForm((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, idx) => idx !== index),
    }));
  };

  const submitDiagnosis = async (event) => {
    event.preventDefault();
    if (!selectedPet?.petId) {
      return;
    }

    if (!form.diagnosis.trim()) {
      setMessage("Diagnosis is required.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      await createDoctorDiagnosis(selectedPet.petId, {
        petId: selectedPet.petId,
        allergies: form.allergies,
        diagnosis: form.diagnosis,
        treatmentSuggestions: form.treatmentSuggestions,
        validateTill: form.validateTill || null,
        prescriptions: form.prescriptions,
      });

      const refreshed = await getDoctorPetHistory(selectedPet.petId);
      setHistory(refreshed);
      setForm((prev) => ({
        ...prev,
        diagnosis: "",
        treatmentSuggestions: "",
        validateTill: "",
        prescriptions: [{ ...emptyPrescription }],
      }));
      setMessage("Diagnosis saved and history refreshed.");
    } catch (error) {
      console.error("Failed to save diagnosis", error);
      setMessage(error?.response?.data?.message || "Failed to save diagnosis.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registration-container simple-form-shell">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="simple-form-card">
              <div className="form-header text-center text-md-start">
                <h1 className="simple-form-title">Doctor Diagnosis From Pet History</h1>
                <p className="simple-form-subtitle">
                  Search owner pets, review previous diseases and prescriptions, then create a new diagnosis.
                </p>
              </div>

              <div className="form-section">
                <div className="section-title">Search Pet</div>
                <form
                  className="d-flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    runSearch();
                  }}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by pet name, owner, phone, email, or pet ID"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <button className="btn btn-primary" type="submit" disabled={loadingSearch}>
                    {loadingSearch ? "Searching..." : "Search"}
                  </button>
                </form>

                <div className="mt-3" style={{ maxHeight: "220px", overflowY: "auto" }}>
                  {searchResults.length === 0 ? (
                    <small className="text-muted">No pets found.</small>
                  ) : (
                    searchResults.map((pet) => (
                      <button
                        type="button"
                        key={pet.petId}
                        className={`btn btn-sm d-block w-100 text-start mb-2 ${selectedPet?.petId === pet.petId ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => loadHistory(pet)}
                      >
                        <div className="fw-semibold">{pet.petName} #{pet.petId}</div>
                        <small>{pet.ownerName} • {pet.ownerPhoneNumber || "No phone"} • Last Visit: {pet.lastVisitDate || "N/A"}</small>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {selectedPet && (
                <>
                  <div className="form-section">
                    <div className="section-title">Medical History</div>
                    {loadingHistory ? (
                      <div className="text-muted">Loading medical history...</div>
                    ) : !history ? (
                      <div className="text-muted">Unable to load history for this pet.</div>
                    ) : (
                      <>
                        <div className="medical-owner-panel mb-3">
                          <div className="medical-owner-grid">
                            <div className="medical-owner-item">
                              <span className="medical-owner-label">Owner</span>
                              <span className="medical-owner-value">{history.ownerName}</span>
                            </div>
                            <div className="medical-owner-item">
                              <span className="medical-owner-label">Pet</span>
                              <span className="medical-owner-value">{history.petName} ({history.petType})</span>
                            </div>
                            <div className="medical-owner-item">
                              <span className="medical-owner-label">Breed</span>
                              <span className="medical-owner-value">{history.breed || "N/A"}</span>
                            </div>
                            <div className="medical-owner-item">
                              <span className="medical-owner-label">Known Allergies</span>
                              <span className="medical-owner-value">{history.allergies || "Not recorded"}</span>
                            </div>
                          </div>
                        </div>

                        {history.medicalHistory?.length ? (
                          <div className="d-flex flex-column gap-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                            {history.medicalHistory.map((record) => (
                              <div className="border rounded p-2 bg-light" key={record.petMedicalId}>
                                <div className="fw-semibold">Visit: {record.visitDate || "N/A"}</div>
                                <small className="d-block">Disease / Diagnosis: {record.diagnosis || "N/A"}</small>
                                <small className="d-block">Treatment: {record.treatmentSuggestions || "N/A"}</small>
                                <small className="d-block">Valid Till: {record.validateTill || "N/A"}</small>
                                <small className="d-block mt-1">Prescriptions:</small>
                                {record.prescriptions?.length ? (
                                  record.prescriptions.map((prescription, idx) => (
                                    <small key={`${record.petMedicalId}-${idx}`} className="d-block text-muted">
                                      - {prescription.medicine || "Medicine"} {prescription.dosage ? `(${prescription.dosage})` : ""}
                                      {prescription.frequency ? `, ${prescription.frequency}/day` : ""}
                                      {prescription.duration ? `, ${prescription.duration} days` : ""}
                                      {prescription.times?.length ? `, ${prescription.times.join("/")}` : ""}
                                    </small>
                                  ))
                                ) : (
                                  <small className="text-muted">No prescriptions</small>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <small className="text-muted">No previous medical history for this pet.</small>
                        )}
                      </>
                    )}
                  </div>

                  <form onSubmit={submitDiagnosis}>
                    <div className="form-section">
                      <div className="section-title">Create New Diagnosis</div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Allergies</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={form.allergies}
                            onChange={(event) => setForm((prev) => ({ ...prev, allergies: event.target.value }))}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Valid Till</label>
                          <input
                            type="date"
                            className="form-control"
                            value={form.validateTill}
                            onChange={(event) => setForm((prev) => ({ ...prev, validateTill: event.target.value }))}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Diagnosis *</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={form.diagnosis}
                            onChange={(event) => setForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Treatment Suggestions</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={form.treatmentSuggestions}
                            onChange={(event) => setForm((prev) => ({ ...prev, treatmentSuggestions: event.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="section-title">Prescriptions</div>
                      {form.prescriptions.map((prescription, index) => (
                        <div key={index} className="border rounded p-3 mb-3">
                          <div className="row g-2">
                            <div className="col-md-6">
                              <input
                                className="form-control"
                                placeholder="Medicine"
                                value={prescription.medicine}
                                onChange={(event) => updatePrescription(index, "medicine", event.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <input
                                className="form-control"
                                placeholder="Dosage"
                                value={prescription.dosage}
                                onChange={(event) => updatePrescription(index, "dosage", event.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                placeholder="Frequency per day"
                                value={prescription.frequency}
                                onChange={(event) => updatePrescription(index, "frequency", event.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <input
                                type="number"
                                min="1"
                                className="form-control"
                                placeholder="Duration in days"
                                value={prescription.duration}
                                onChange={(event) => updatePrescription(index, "duration", event.target.value)}
                              />
                            </div>
                            <div className="col-md-6">
                              <select
                                className="form-control"
                                value={prescription.meal}
                                onChange={(event) => updatePrescription(index, "meal", event.target.value)}
                              >
                                {mealOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-6 d-flex flex-wrap gap-2 align-items-center">
                              {timeOptions.map((option) => (
                                <label key={option.value} className="small d-flex align-items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={(prescription.times || []).includes(option.value)}
                                    onChange={() => toggleTime(index, option.value)}
                                  />
                                  {option.label}
                                </label>
                              ))}
                            </div>
                            <div className="col-12">
                              <input
                                className="form-control"
                                placeholder="Special Instructions"
                                value={prescription.instructions}
                                onChange={(event) => updatePrescription(index, "instructions", event.target.value)}
                              />
                            </div>
                          </div>
                          {form.prescriptions.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger mt-2"
                              onClick={() => removePrescription(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}

                      <button type="button" className="btn btn-outline-primary" onClick={addPrescription}>
                        Add Prescription
                      </button>
                    </div>

                    {message && <div className="alert alert-info">{message}</div>}

                    <div className="d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? "Saving..." : "Save Diagnosis"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPetDiagnosisPage;

