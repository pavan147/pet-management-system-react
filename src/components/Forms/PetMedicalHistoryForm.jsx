import React, { useState } from "react";
import { savePetMedicalRecord } from "../../services/PetService";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
import { getDefaultDashboardPath } from "../../services/VeterinaryRegistrationService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import SuccessMessage from "../SuccessMessage";
import "./forms.css";

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

  const { handleSubmit: submitForm, loading, showSuccess } = useFormSubmit(
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
    const foundOwner = await searchOwnerDetailsByEmailOrPhone(searchValue);

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
        redirectTo={getDefaultDashboardPath()}
        delay={3000}
      />
    );
  }

  return (
    <div className="registration-container simple-form-shell">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-md-11">
            <div className="simple-form-card">
          {/* Form Header */}
          <div className="form-header text-center text-md-start">
            <h1 className="simple-form-title">Pet Medical History & Prescription</h1>
            <p className="simple-form-subtitle">
              Keep consultation notes, prescription details, and follow-up plan in one place.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="appointment-simple-form">
            {/* ========== SECTION 1: OWNER SEARCH ========== */}
            <div className="form-section">
              <div className="section-title">Find Owner</div>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <label className="form-label">Owner Email or Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter email or phone number"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleOwnerSearch(e)}
                  />
                  {errors.searchValue && (
                    <div className="invalid-feedback d-block mt-2">{errors.searchValue}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <button className="btn btn-primary w-100" onClick={handleOwnerSearch} type="button">
                    Search Owner
                  </button>
                </div>
              </div>

              {owner && (
                <div className="medical-owner-panel mt-3">
                  <div className="medical-owner-grid">
                    <div className="medical-owner-item">
                      <span className="medical-owner-label">Owner Name</span>
                      <span className="medical-owner-value">{owner.ownerName}</span>
                    </div>
                    <div className="medical-owner-item">
                      <span className="medical-owner-label">Phone</span>
                      <span className="medical-owner-value">{owner.phoneNumber}</span>
                    </div>
                    <div className="medical-owner-item">
                      <span className="medical-owner-label">Email</span>
                      <span className="medical-owner-value">{owner.email}</span>
                    </div>
                    <div className="medical-owner-item">
                      <span className="medical-owner-label">Address</span>
                      <span className="medical-owner-value">{owner.address}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-sm mt-3"
                    type="button"
                    onClick={() => {
                      setOwner(null);
                      setSearchValue("");
                      setPetList([]);
                      setSelectedPet("");
                      setPetInfo(null);
                    }}
                  >
                    Change Owner
                  </button>
                </div>
              )}
            </div>

            {petList.length > 0 && (
              <div className="form-section">
                <div className="section-title">Select Pet</div>
                <div className="mb-3">
                  <label className="form-label">Pet</label>
                  <select
                    className={`form-control ${errors.selectedPet ? "is-invalid" : ""}`}
                    value={selectedPet}
                    onChange={(e) => handleSelectPet(e.target.value)}
                  >
                    <option value="">Choose pet</option>
                    {petList.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.petName} ({pet.species} - {pet.breed})
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
                  <div className="medical-pet-info">
                    <div className="medical-pet-grid">
                      <div className="medical-pet-item">
                        <div className="medical-pet-label">Pet Name</div>
                        <div className="medical-pet-value">{petInfo.petName}</div>
                      </div>
                      <div className="medical-pet-item">
                        <div className="medical-pet-label">Species</div>
                        <div className="medical-pet-value">{petInfo.species}</div>
                      </div>
                      <div className="medical-pet-item">
                        <div className="medical-pet-label">Breed</div>
                        <div className="medical-pet-value">{petInfo.breed}</div>
                      </div>
                      <div className="medical-pet-item">
                        <div className="medical-pet-label">Age</div>
                        <div className="medical-pet-value">{petInfo.age} years</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {owner && selectedPet && (
              <>
                <div className="form-section">
                  <div className="section-title">Medical Assessment</div>

                  {/* Allergies */}
                  <div className="form-group">
                    <label className="form-label">Allergies</label>
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
                    <label className="form-label">Diagnosis <span className="required">*</span></label>
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

                <div className="form-section">
                  <div className="section-title">Prescriptions ({prescriptions.length})</div>

                  <div className="medical-prescription-list">
                    {prescriptions.map((pres, idx) => (
                      <div key={idx} className="medicine-card medical-medicine-card">
                        <div className="medical-medicine-header">
                          <h6 className="medical-medicine-title">Medicine #{idx + 1}</h6>
                          {prescriptions.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemovePrescription(idx)}
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="row g-3 mb-3">
                          <div className="col-md-6">
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
                          <div className="col-md-6">
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

                        <div className="row g-3 mb-3">
                          <div className="col-md-6">
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
                          <div className="col-md-6">
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

                        <div className="mb-3">
                          <label className="form-label small">Time of Day <span className="required">*</span></label>
                          <div className="medical-time-grid">
                            {TIME_OPTIONS.map((opt) => (
                              <label
                                key={opt.value}
                                className={`medical-time-pill ${pres.times.includes(opt.value) ? "active" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={pres.times.includes(opt.value)}
                                  onChange={() => handleTimeChange(idx, opt.value)}
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="row g-3">
                          <div className="col-md-6">
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
                          <div className="col-md-6">
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
                    className="btn btn-outline-primary"
                    onClick={handleAddPrescription}
                  >
                    Add Medicine
                  </button>
                </div>

                <div className="form-section">
                  <div className="section-title">Additional Notes</div>

                  <div className="form-group">
                    <label className="form-label">Treatment Suggestions & Recommendations</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="E.g., Vaccination schedule, post-op care, diet recommendations, follow-up appointment, lifestyle changes..."
                      value={treatmentSuggestions}
                      onChange={(e) => setTreatmentSuggestions(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prescription Valid Till</label>
                    <input
                      className="form-control"
                      type="date"
                      value={validateTill}
                      onChange={(e) => setValidateTill(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg appointment-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Medical History"
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetMedicalHistoryForm;