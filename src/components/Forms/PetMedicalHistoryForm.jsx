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

        {/* Owner Search */}
        {!owner && (
          <div className="form-group row mb-3">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="d-flex align-items-center">
                <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                  Owner (Phone/Email)
                </label>
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Enter owner's phone or email"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  disabled={!!owner}
                />
                <select
                  className="form-select w-auto me-2"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  disabled={!!owner}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleOwnerSearch}
                  disabled={!!owner}
                  type="button"
                >
                  Search Owner
                </button>
              </div>
              {errors.searchValue && (
                <div className="invalid-feedback d-block mt-1">
                  {errors.searchValue}
                </div>
              )}
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* Owner Info Card */}
        {owner && (
          <div className="form-group row mb-3">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="card border-success shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-success mb-3">
                    <i className="bi bi-person-check-fill me-2"></i>
                    Owner Found
                  </h5>
                  <div className="me-2">
                    <strong>Name:</strong>{" "}
                    <span className="ms-2">{owner.ownerName}</span>
                  </div>
                  <div className="me-2">
                    <strong>Email:</strong>{" "}
                    <span className="ms-2">{owner.email}</span>
                  </div>
                  <div className="mb-2">
                    <strong>Phone Number:</strong>{" "}
                    <span className="ms-2">{owner.phoneNumber}</span>
                  </div>
                  <div className="mb-2">
                    <strong>Address:</strong>{" "}
                    <span className="ms-2">{owner.address}</span>
                  </div>
                  <button
                    className="btn btn-link btn-sm mt-2 p-0"
                    type="button"
                    onClick={() => {
                      setOwner(null);
                      setSearchValue("");
                      setPetList([]);
                      setSelectedPet("");
                      setPetInfo(null);
                    }}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Search another owner
                  </button>
                </div>
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

        {/* Allergies */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label
                className="me-2 mb-0"
                style={{ minWidth: 110, marginTop: "0.375rem" }}
              >
                Allergies
              </label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="List allergies (comma separated or one per line)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
          </div>
          <div className="col-2"></div>
        </div>

        {/* Diagnosis */}
        <div className={`form-group row ${errors.diagnosis ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label
                className="me-2 mb-0"
                style={{ minWidth: 110, marginTop: "0.375rem" }}
              >
                Diagnosis
              </label>
              <textarea
                className={`form-control ${errors.diagnosis ? "is-invalid" : ""}`}
                rows="2"
                placeholder="Enter diagnosis/medical history"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
            {errors.diagnosis && (
              <div className="invalid-feedback d-block mt-1">
                {errors.diagnosis}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Prescription Section */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <h5 className="mb-3 fw-bold">Prescription</h5>
            {prescriptions.map((pres, idx) => (
              <div
                key={idx}
                className="mb-4 p-3"
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {/* Row 1: Medicine & Dosage */}
                <div className="row mb-2">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <label className="fw-bold mb-1">Medicine Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter medicine name"
                      value={pres.medicine}
                      onChange={(e) =>
                        handlePrescriptionChange(
                          idx,
                          "medicine",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-bold mb-1">Dosage</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., 5ml, 1 tab"
                      value={pres.dosage}
                      onChange={(e) =>
                        handlePrescriptionChange(idx, "dosage", e.target.value)
                      }
                    />
                  </div>
                </div>
                {/* Row 2: Frequency & Duration */}
                <div className="row mb-2">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <label className="fw-bold mb-1">Frequency (per day)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g., 2"
                      value={pres.frequency}
                      onChange={(e) =>
                        handlePrescriptionChange(
                          idx,
                          "frequency",
                          e.target.value,
                        )
                      }
                      min={1}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-bold mb-1">Duration (days)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g., 7"
                      value={pres.duration}
                      onChange={(e) =>
                        handlePrescriptionChange(
                          idx,
                          "duration",
                          e.target.value,
                        )
                      }
                      min={1}
                    />
                  </div>
                </div>
                {/* Row 3: Instructions & Time of Day */}
                <div className="row mb-2">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <label className="fw-bold mb-1">Instructions</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Special instructions"
                      value={pres.instructions}
                      onChange={(e) =>
                        handlePrescriptionChange(
                          idx,
                          "instructions",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="fw-bold mb-1">Time of Day</label>
                    <div className="d-flex flex-wrap">
                      {TIME_OPTIONS.map((opt) => (
                        <div key={opt.value} className="form-check me-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`time-${idx}-${opt.value}`}
                            checked={pres.times.includes(opt.value)}
                            onChange={() => handleTimeChange(idx, opt.value)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`time-${idx}-${opt.value}`}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Row 4: Meal & Remove button */}
                <div className="row align-items-center">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <label className="fw-bold mb-1">Meal Timing</label>
                    <select
                      className="form-select"
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

                  <div className="col-md-6 text-md-end">
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm mt-3 mt-md-0"
                        onClick={() => handleRemovePrescription(idx)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleAddPrescription}
            >
              Add Medicine
            </button>
            {errors.prescriptions && (
              <div className="invalid-feedback d-block mt-1">
                {errors.prescriptions}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>
        {/* Validate till */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label
                className="me-2 mb-0"
                style={{ minWidth: 130, marginTop: "0.375rem" }}
              >
                Validate Till
              </label>
              <input
                className="form-control"
                type="date"
                value={validateTill}
                onChange={(e) => setValidateTill(e.target.value)}
              />
            </div>
          </div>
          <div className="col-2"></div>
        </div>

        {/* Treatment Suggestions */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label
                className="me-2 mb-0"
                style={{ minWidth: 110, marginTop: "0.375rem" }}
              >
                Treatment Suggestions
              </label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="E.g., vaccination, surgery, follow-up, diet, etc."
                value={treatmentSuggestions}
                onChange={(e) => setTreatmentSuggestions(e.target.value)}
              />
            </div>
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mt-3">
          <div className="col-8"></div>
          <div className="col-2">
            <button
              type="submit"
              className="btn btn-primary w-100 button-color"
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
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default PetMedicalHistoryForm;