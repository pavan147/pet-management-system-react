import React, { useState } from "react";
import { savePetMedicalRecord } from "../../services/PetService";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import SuccessMessage from "../SuccessMessage";

// const MOCK_OWNERS = [
//   {
//     id: "owner1",
//     ownerName: "John Doe",
//     address: "123 Main St, City",
//     email: "john@example.com",
//     phoneNumber: "1234567890",
//     pets: [
//       {
//         id: "pet1",
//         petName: "Buddy",
//         species: "Dog",
//         breed: "Golden Retriever",
//         age: 5,
//       },
//       {
//         id: "pet2",
//         petName: "Mittens",
//         species: "Cat",
//         breed: "Siamese",
//         age: 3,
//       },
//     ],
//   },
//   {
//     id: "owner2",
//     ownerName: "Jane Smith",
//     address: "456 Oak Ave, Town",
//     email: "jane@example.com",
//     phoneNumber: "0987654321",
//     pets: [
//       {
//         id: "pet3",
//         petName: "Max",
//         species: "Dog",
//         breed: "Bulldog",
//         age: 2,
//       },
//     ],
//   },
// ];

const TIME_OPTIONS = [
  { label: "Morning", value: "M" },
  { label: "Afternoon", value: "A" },
  { label: "Evening", value: "E" },
  { label: "Night", value: "N" },
];

const MEAL_OPTIONS = [
  { label: "Anytime", value: "any" },
  { label: "Before Meal", value: "before" },
  { label: "After Meal", value: "after" },
];

const PetMedicalHistoryForm = () => {
  const [searchType, setSearchType] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [owner, setOwner] = useState(null);
  const [petList, setPetList] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [petInfo, setPetInfo] = useState(null);

  const [allergies, setAllergies] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptions, setPrescriptions] = useState([
    {
      medicine: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      times: [],
      meal: "any",
    },
  ]);
  const [treatmentSuggestions, setTreatmentSuggestions] = useState("");
  const [errors, setErrors] = useState({});
  const [validateTill, setValidateTill] = useState("");

  const initialPrescriptions = [
    {
      medicine: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      times: [],
      meal: "any",
    },
  ];

  const { handleSubmit: submitForm, loading, showSuccess, setShowSuccess } = useFormSubmit(
    (formData) => savePetMedicalRecord(formData),
    {
      resetForm: () => {
        setAllergies("");
        setDiagnosis("");
        setPrescriptions(initialPrescriptions);
        setTreatmentSuggestions("");
        setValidateTill("");
        setSearchValue("");
        setOwner(null);
        setPetList([]);
        setSelectedPet("");
        setPetInfo(null);
      },
    }
  );

  // Mock search
  const handleOwnerSearch = async (e) => {
    e.preventDefault();
    setOwner(null);
    setPetList([]);
    setSelectedPet("");
    setPetInfo(null);
    setErrors({});
    if (!searchValue) {
      setErrors({ searchValue: "Please enter owner's email or phone." });
      return;
    }
    let foundOwner;
        foundOwner = await searchOwnerDetailsByEmailOrPhone(searchValue);   
      
      if (foundOwner && foundOwner.pets) {
        setOwner(foundOwner);
        setPetList(foundOwner.pets);
    } else {
      setErrors({ searchValue: "Owner not found." });
    }
  };

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
      updated[index].times = times.filter((t) => t !== timeValue);
    } else {
      updated[index].times = [...times, timeValue];
    }
    setPrescriptions(updated);
  };

  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        medicine: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        times: [],
        meal: "any"
      },
    ]);
  };

  const handleRemovePrescription = (index) => {
    const updated = prescriptions.filter((_, i) => i !== index);
    setPrescriptions(updated);
  };

  // Print all details in handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      ownerContact : searchValue,
      allergies,
      diagnosis,
      prescriptions,
      treatmentSuggestions,
      validateTill,
      petId: selectedPet,
    };
    await submitForm(formData);
  };

  if (showSuccess) {
    return (
      <SuccessMessage
        status="medical"
        redirectTo="/dashboard"
        delay={3000}
      />
    );
  }

  return (
    <div className="registration-container">
      <div className="registration-gradient-bg"></div>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
        <div className="registration-card">
          {/* Form Header */}
          <div className="form-header">
            <h1 className="form-title">
              <i className="bi bi-stethoscope me-2"></i>
              Pet Medical History & Prescription
            </h1>
            <p className="form-subtitle">
              Complete medical records and prescription for pet care
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* ========== SECTION 1: OWNER SEARCH ========== */}
            {!owner && (
              <div className="form-section">
                <div className="section-title">
                  <i className="bi bi-search"></i> Step 1: Find Owner
                </div>
                <div className="mb-3">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "12px", alignItems: "end" }}>
                    <div>
                      <label className="form-label">Owner's Contact Information</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter email or phone number"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleOwnerSearch(e)}
                      />
                      {errors.searchValue && (
                        <div className="invalid-feedback d-block mt-2">
                          <i className="bi bi-exclamation-circle me-2"></i>
                          {errors.searchValue}
                        </div>
                      )}
                    </div>
                    <button
                      className="btn"
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        fontWeight: 600,
                        padding: "12px 24px",
                      }}
                      onClick={handleOwnerSearch}
                      type="button"
                    >
                      <i className="bi bi-search me-2"></i>Search
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========== SECTION 2: OWNER INFO ========== */}
            {owner && (
              <div className="form-section" style={{ borderColor: "#10b981", borderWidth: "2px" }}>
                <div className="section-title">
                  <i className="bi bi-person-check-fill" style={{ color: "#10b981" }}></i> Owner Information
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "16px"
                }}>
                  <div>
                    <label className="form-label small">Owner Name</label>
                    <div style={{ padding: "10px", background: "#f0fdf4", borderRadius: "8px", fontWeight: 500 }}>
                      {owner.ownerName}
                    </div>
                  </div>
                  <div>
                    <label className="form-label small">Phone Number</label>
                    <div style={{ padding: "10px", background: "#f0fdf4", borderRadius: "8px", fontWeight: 500 }}>
                      {owner.phoneNumber}
                    </div>
                  </div>
                  <div>
                    <label className="form-label small">Email</label>
                    <div style={{ padding: "10px", background: "#f0fdf4", borderRadius: "8px", fontWeight: 500 }}>
                      {owner.email}
                    </div>
                  </div>
                  <div>
                    <label className="form-label small">Address</label>
                    <div style={{ padding: "10px", background: "#f0fdf4", borderRadius: "8px", fontWeight: 500 }}>
                      {owner.address}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{
                    border: "1px solid #667eea",
                    color: "#667eea",
                    background: "transparent",
                    fontWeight: 600,
                  }}
                  type="button"
                  onClick={() => {
                    setOwner(null);
                    setSearchValue("");
                    setPetList([]);
                    setSelectedPet("");
                    setPetInfo(null);
                  }}
                >
                  <i className="bi bi-arrow-left me-2"></i>Change Owner
                </button>
              </div>
            )}

            {/* ========== SECTION 3: PET SELECTION ========== */}
            {petList.length > 0 && (
              <div className="form-section">
                <div className="section-title">
                  <i className="bi bi-paw-fill"></i> Step 2: Select Pet
                </div>
                <div className="mb-3">
                  <label className="form-label">Select a Pet</label>
                  <select
                    className={`form-control ${errors.selectedPet ? "is-invalid" : ""}`}
                    value={selectedPet}
                    onChange={(e) => handleSelectPet(e.target.value)}
                  >
                    <option value="">-- Choose Pet --</option>
                    {petList.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        🐾 {pet.petName} ({pet.species} - {pet.breed})
                      </option>
                    ))}
                  </select>
                  {errors.selectedPet && (
                    <div className="invalid-feedback d-block">
                      {errors.selectedPet}
                    </div>
                  )}
                </div>

                {/* Pet Information Card */}
                {petInfo && (
                  <div style={{
                    padding: "16px",
                    background: "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
                    borderRadius: "12px",
                    border: "1px solid #667eea",
                    marginTop: "12px"
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "#667eea", fontWeight: 600, marginBottom: "4px" }}>PET NAME</div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
                          {petInfo.petName}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#667eea", fontWeight: 600, marginBottom: "4px" }}>SPECIES</div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
                          {petInfo.species}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#667eea", fontWeight: 600, marginBottom: "4px" }}>BREED</div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
                          {petInfo.breed}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "#667eea", fontWeight: 600, marginBottom: "4px" }}>AGE</div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
                          {petInfo.age} years
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========== SECTION 4: MEDICAL INFORMATION ========== */}
            {owner && selectedPet && (
              <>
                <div className="form-section">
                  <div className="section-title">
                    <i className="bi bi-clipboard-pulse"></i> Step 3: Medical History
                  </div>

                  {/* Allergies */}
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-exclamation-triangle me-2" style={{ color: "#f59e0b" }}></i>
                      Allergies
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="List allergies separated by commas or one per line (e.g., Penicillin, Dairy, Wheat)"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                    />
                  </div>

                  {/* Diagnosis */}
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-stethoscope me-2" style={{ color: "#0dcaf0" }}></i>
                      Diagnosis <span className="required">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.diagnosis ? "is-invalid" : ""}`}
                      rows="3"
                      placeholder="Describe the pet's condition, symptoms, and medical findings..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                    />
                    {errors.diagnosis && (
                      <div className="invalid-feedback d-block">
                        {errors.diagnosis}
                      </div>
                    )}
                  </div>
                </div>

                {/* ========== SECTION 5: PRESCRIPTIONS ========== */}
                <div className="form-section">
                  <div className="section-title">
                    <i className="bi bi-capsule me-2"></i>
                    Step 4: Prescriptions ({prescriptions.length})
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    {prescriptions.map((pres, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#ffffff",
                          borderRadius: "12px",
                          border: "2px solid #e5e7eb",
                          padding: "20px",
                          marginBottom: "16px",
                          transition: "all 250ms ease",
                        }}
                        className="medicine-card"
                      >
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "16px",
                          paddingBottom: "12px",
                          borderBottom: "1px solid #e5e7eb",
                        }}>
                          <h6 style={{ margin: 0, color: "#667eea", fontWeight: 700 }}>
                            <i className="bi bi-capsule"></i> Medicine #{idx + 1}
                          </h6>
                          {prescriptions.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                background: "#fee2e2",
                                color: "#ef4444",
                                border: "none",
                                fontWeight: 600,
                              }}
                              onClick={() => handleRemovePrescription(idx)}
                            >
                              <i className="bi bi-trash3 me-1"></i>Remove
                            </button>
                          )}
                        </div>

                        {/* Row 1: Medicine & Dosage */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                          <div>
                            <label className="form-label small">Medicine Name <span className="required">*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g., Amoxicillin, Aspirin"
                              value={pres.medicine}
                              onChange={(e) =>
                                handlePrescriptionChange(idx, "medicine", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="form-label small">Dosage <span className="required">*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g., 5ml, 1 tab, 250mg"
                              value={pres.dosage}
                              onChange={(e) =>
                                handlePrescriptionChange(idx, "dosage", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Row 2: Frequency & Duration */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                          <div>
                            <label className="form-label small">Frequency (per day) <span className="required">*</span></label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="1, 2, 3, etc."
                              value={pres.frequency}
                              onChange={(e) =>
                                handlePrescriptionChange(idx, "frequency", e.target.value)
                              }
                              min={1}
                            />
                          </div>
                          <div>
                            <label className="form-label small">Duration (days) <span className="required">*</span></label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="7, 14, 30, etc."
                              value={pres.duration}
                              onChange={(e) =>
                                handlePrescriptionChange(idx, "duration", e.target.value)
                              }
                              min={1}
                            />
                          </div>
                        </div>

                        {/* Row 3: Time of Day */}
                        <div style={{ marginBottom: "16px" }}>
                          <label className="form-label small">Time of Day <span className="required">*</span></label>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                            {TIME_OPTIONS.map((opt) => (
                              <label key={opt.value} style={{
                                padding: "10px",
                                border: pres.times.includes(opt.value) ? "2px solid #667eea" : "2px solid #e5e7eb",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: pres.times.includes(opt.value) ? 600 : 500,
                                background: pres.times.includes(opt.value) ? "#f0f4ff" : "#ffffff",
                                textAlign: "center",
                                transition: "all 150ms ease",
                              }}>
                                <input
                                  type="checkbox"
                                  style={{ marginRight: "6px" }}
                                  checked={pres.times.includes(opt.value)}
                                  onChange={() => handleTimeChange(idx, opt.value)}
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Row 4: Meal Timing & Instructions */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                          <div>
                            <label className="form-label small">Meal Timing</label>
                            <select
                              className="form-control"
                              value={pres.meal}
                              onChange={(e) =>
                                handlePrescriptionChange(idx, "meal", e.target.value)
                              }
                            >
                              {MEAL_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="form-label small">Special Instructions</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g., Take with food, avoid dairy"
                              value={pres.instructions}
                              onChange={(e) =>
                                handlePrescriptionChange(idx, "instructions", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.prescriptions && (
                    <div className="invalid-feedback d-block mb-3">
                      {errors.prescriptions}
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{
                      border: "2px solid #667eea",
                      color: "#667eea",
                      background: "#f0f4ff",
                      fontWeight: 600,
                      padding: "10px 16px",
                    }}
                    onClick={handleAddPrescription}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Add Medicine
                  </button>
                </div>

                {/* ========== SECTION 6: RECOMMENDATIONS & VALIDITY ========== */}
                <div className="form-section">
                  <div className="section-title">
                    <i className="bi bi-book-half"></i> Step 5: Additional Information
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Treatment Suggestions & Recommendations
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="E.g., Vaccination schedule, post-op care, diet recommendations, follow-up appointment, lifestyle changes..."
                      value={treatmentSuggestions}
                      onChange={(e) => setTreatmentSuggestions(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-calendar-event me-2" style={{ color: "#764ba2" }}></i>
                      Prescription Valid Till
                    </label>
                    <input
                      className="form-control"
                      type="date"
                      value={validateTill}
                      onChange={(e) => setValidateTill(e.target.value)}
                    />
                  </div>
                </div>

                {/* ========== SUBMIT BUTTON ========== */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "30px" }}>
                  <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                    style={{
                      background: loading
                        ? "#ccc"
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      border: "none",
                      fontWeight: 600,
                      padding: "12px 32px",
                      borderRadius: "10px",
                      cursor: loading ? "not-allowed" : "pointer",
                      minWidth: "200px",
                      transition: "all 250ms ease",
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          style={{ width: "16px", height: "16px" }}
                        ></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Medical History
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PetMedicalHistoryForm;