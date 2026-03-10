import React, { useState } from "react";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
// import { saveMedicalHistory } from "../../services/PetMedicalHistoryService";
import SuccessMessage from "../SuccessMessage";

const TIME_OPTIONS = [
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
  { label: "Evening", value: "evening" },
  { label: "Night", value: "night" },
];

const PetMedicalHistoryForm = () => {
  const [searchType, setSearchType] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [petList, setPetList] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [petInfo, setPetInfo] = useState(null);

  // Medical fields
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptions, setPrescriptions] = useState([
    { medicine: "", dosage: "", frequency: "", duration: "", instructions: "", times: [] },
  ]);
  const [treatmentSuggestions, setTreatmentSuggestions] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Search owner and pets
  const handleSearch = async (e) => {
    e.preventDefault();
    setErrors({});
    setOwnerInfo(null);
    setPetList([]);
    setSelectedPet("");
    setPetInfo(null);

    if (!searchValue) {
      setErrors({ searchValue: "Email or Phone Number is Required" });
      return;
    }

    const owner = await searchOwnerDetailsByEmailOrPhone(searchValue);
    if (owner) {
      setOwnerInfo(owner);
      if (owner.pets && owner.pets.length > 0) {
        setPetList(owner.pets);
      } else {
        setErrors({ searchValue: "No pets found for this owner." });
      }
    } else {
      setErrors({ searchValue: "Owner not found." });
    }
  };

  // Select pet and show info
  const handleSelectPet = (petId) => {
    setSelectedPet(petId);
    const pet = petList.find((p) => p.id === petId);
    setPetInfo(pet || null);
  };

  // Prescription handlers
  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleTimeChange = (index, timeValue) => {
    const updated = [...prescriptions];
    const times = updated[index].times || [];
    if (times.includes(timeValue)) {
      updated[index].times = times.filter(t => t !== timeValue);
    } else {
      updated[index].times = [...times, timeValue];
    }
    setPrescriptions(updated);
  };

  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medicine: "", dosage: "", frequency: "", duration: "", instructions: "", times: [] },
    ]);
  };

  const handleRemovePrescription = (index) => {
    const updated = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updated);
  };

  // Submit medical history
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!ownerInfo) newErrors.searchValue = "Please search owner first.";
    if (!selectedPet) newErrors.selectedPet = "Please select a pet.";
    if (!diagnosis) newErrors.diagnosis = "Diagnosis is required.";
    if (prescriptions.some(p => !p.medicine)) newErrors.prescriptions = "Medicine name is required for all prescriptions.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const formData = {
      ownerId: ownerInfo.id,
      petId: selectedPet,
      diagnosis,
      prescriptions,
      treatmentSuggestions,
    };

    try {
      // Uncomment and use your API
      // await saveMedicalHistory(formData);
      setShowSuccess(true);
    } catch (error) {
      alert("Failed to save medical history: " + error.message);
    }
  };

  if (showSuccess) {
    return (
      <SuccessMessage
        status="pet-medical"
        redirectTo="/pet-medical-history"
        delay={3000}
      />
    );
  }

  return (
    <div
      style={{
        background: "#f8f9fa",
        borderRadius: "16px",
        padding: "40px",
        minHeight: "100%",
        position: "relative",
      }}
    >
      <form onSubmit={handleSubmit}>
        <h2 className="mb-3 mt-3 text-center">
          Pet Medical History & Prescription
        </h2>

        {/* Search Section */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Search By
              </label>
              <select
                className="form-select w-auto me-2"
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setSearchValue("");
                  setOwnerInfo(null);
                  setPetList([]);
                  setSelectedPet("");
                  setPetInfo(null);
                  setErrors({});
                }}
                disabled={ownerInfo}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
              <input
                type={searchType === "email" ? "email" : "tel"}
                className={`form-control me-2 ${errors.searchValue ? "is-invalid" : ""}`}
                placeholder={
                  searchType === "email" ? "Enter email" : "Enter phone"
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ maxWidth: 220 }}
                disabled={ownerInfo}
              />
              {ownerInfo ? (
                <a
                  href="#"
                  className="ms-2"
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    color: "#0d6efd",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchType("email");
                    setSearchValue("");
                    setOwnerInfo(null);
                    setPetList([]);
                    setSelectedPet("");
                    setPetInfo(null);
                    setErrors({});
                  }}
                >
                  Search Again
                </a>
              ) : (
                <button
                  className="btn btn-outline-primary"
                  onClick={handleSearch}
                >
                  Search
                </button>
              )}
            </div>
            {errors.searchValue && (
              <div className="invalid-feedback d-block">
                {errors.searchValue}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Owner Info */}
        {ownerInfo && (
          <div className="form-group row mb-3">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="card p-3 mb-2">
                <b>Owner:</b> {ownerInfo.ownerName} <br />
                <b>Email:</b> {ownerInfo.email} <br />
                <b>Phone:</b> {ownerInfo.phone}
              </div>
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* Pet Dropdown & Info */}
        {petList.length > 0 && (
          <div className="form-group row mb-3">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="d-flex align-items-center mb-2">
                <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                  Select Pet
                </label>
                <select
                  className={`form-select ${errors.selectedPet ? "is-invalid" : ""}`}
                  style={{ minWidth: 120, maxWidth: 200 }}
                  value={selectedPet}
                  onChange={(e) => handleSelectPet(e.target.value)}
                >
                  <option value="">Select Pet</option>
                  {petList.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.petName}
                    </option>
                  ))}
                </select>
              </div>
              {errors.selectedPet && (
                <div className="invalid-feedback d-block">
                  {errors.selectedPet}
                </div>
              )}
              {petInfo && (
                <div className="card p-3">
                  <b>Pet Name:</b> {petInfo.petName} <br />
                  <b>Species:</b> {petInfo.species} <br />
                  <b>Breed:</b> {petInfo.breed} <br />
                  <b>Age:</b> {petInfo.age}
                </div>
              )}
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* Diagnosis */}
        <div className={`form-group row ${errors.diagnosis ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label className="me-2 mb-0" style={{ minWidth: 110, marginTop: "0.375rem" }}>Diagnosis</label>
              <textarea
                className={`form-control ${errors.diagnosis ? "is-invalid" : ""}`}
                rows="2"
                placeholder="Enter diagnosis/medical history"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
              />
            </div>
            {errors.diagnosis && <div className="invalid-feedback d-block mt-1">{errors.diagnosis}</div>}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Prescription Table */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <label className="mb-2" style={{ minWidth: 110 }}>Prescription</label>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency (per day)</th>
                  <th>Duration (days)</th>
                  <th>Instructions</th>
                  <th>Time of Day</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((pres, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        className={`form-control ${errors.prescriptions ? "is-invalid" : ""}`}
                        style={{ minWidth: 200, width: "100%" }}
                        placeholder="Medicine name"
                        value={pres.medicine}
                        onChange={e => handlePrescriptionChange(idx, "medicine", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dosage (e.g., 5ml, 1 tab)"
                        value={pres.dosage}
                        onChange={e => handlePrescriptionChange(idx, "dosage", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Times/day"
                        value={pres.frequency}
                        onChange={e => handlePrescriptionChange(idx, "frequency", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Duration"
                        value={pres.duration}
                        onChange={e => handlePrescriptionChange(idx, "duration", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Instructions"
                        value={pres.instructions}
                        onChange={e => handlePrescriptionChange(idx, "instructions", e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="d-flex flex-wrap
">
                        {TIME_OPTIONS.map(opt => (
                          <div key={opt.value} className="form-check me-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`time-${idx}-${opt.value}`}
                              checked={pres.times.includes(opt.value)}
                              onChange={() => handleTimeChange(idx, opt.value)}
                            />
                            <label className="form-check-label" htmlFor={`time-${idx}-${opt.value}`}>
                              {opt.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      {prescriptions.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemovePrescription(idx)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleAddPrescription}
            >
              Add Medicine
            </button>
            {errors.prescriptions && <div className="invalid-feedback d-block mt-1">{errors.prescriptions}</div>}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Treatment Suggestions */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label className="me-2 mb-0" style={{ minWidth: 110, marginTop: "0.375rem" }}>Treatment Suggestions</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="E.g., vaccination, surgery, follow-up, diet, etc."
                value={treatmentSuggestions}
                onChange={e => setTreatmentSuggestions(e.target.value)}
              />
            </div>
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mt-3">
          <div className="col-8"></div>
          <div className="col-2">
            <button type="submit" className="btn btn-primary w-100 button-color">
              Save Medical History
            </button>
          </div>
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default PetMedicalHistoryForm;