import React, { useState } from "react";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
import { registerPet } from "../../services/PetService";
import { getDefaultDashboardPath } from "../../services/VeterinaryRegistrationService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import SuccessMessage from "../SuccessMessage";
import "./forms.css";

const PET_TYPE_OPTIONS = ["Dog", "Cat", "Bird", "Other"];

const searchOwner = async (contact) => {
  const owner = await searchOwnerDetailsByEmailOrPhone(contact);
  if (owner) {
    return {
      ownerName: owner.ownerName,
      address: owner.address,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
    };
  }
  return null;
};

const PetRegistrationForm = () => {
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [otherPetType, setOtherPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [dob, setdob] = useState("");
  const [weight, setWeight] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [owner, setOwner] = useState(null);
  const [ownerSearchError, setOwnerSearchError] = useState("");
  const [errors, setErrors] = useState({});
  const [petPhoto, setPetPhoto] = useState(null);
  const [petPhotoPreview, setPetPhotoPreview] = useState(null);

  const { handleSubmit: submitForm, loading, showSuccess, setShowSuccess } = useFormSubmit(
    async (data) => {
      if (!owner) {
        throw new Error("Please search and select an owner before registering the pet.");
      }
      const petRegistrationDto = {
        ...data,
        otherPetType: data.petType === "Other" ? data.otherPetType : "",
        ownerContact,
      };
      await registerPet(petRegistrationDto, petPhoto);
    },
    {
      resetForm: () => {
        setPetName("");
        setPetType("");
        setOtherPetType("");
        setBreed("");
        setSex("");
        setColor("");
        setDescription("");
        setdob("");
        setWeight("");
        setOwner(null);
        setOwnerContact("");
        setPetPhoto(null);
        setPetPhotoPreview(null);
      },
    }
  );

  const handleOwnerSearch = async (e) => {
    e.preventDefault();
    setOwner(null);
    setOwnerSearchError("");
    if (!ownerContact) {
      setOwnerSearchError("Please enter phone or email to search.");
      return;
    }
    try {
      const foundOwner = await searchOwner(ownerContact);
      if (foundOwner) {
        setOwner(foundOwner);
        setOwnerSearchError("");
      } else {
        setOwnerSearchError("Owner not found.");
      }
    } catch (err) {
      setOwnerSearchError("Error searching owner.");
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years < 0) return "";

    return `${years} yrs, ${months} mos, ${days} days`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!owner) {
      setOwnerSearchError(
        "Please search and select an owner before registering the pet.",
      );
      return;
    }

    const petData = {
      petName,
      petType,
      otherPetType: petType === "Other" ? otherPetType : "",
      breed,
      sex,
      color,
      description,
      dob,
      weight,
      ownerContact,
    };

    await submitForm(petData);
  };

  if (showSuccess) {
    return (
      <SuccessMessage
        status="pet"
        redirectTo={getDefaultDashboardPath()}
        delay={3000}
      />
    );
  }

  return (
    <div className="registration-container simple-form-shell">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9 col-md-10">
            <div className="simple-form-card">
              <div className="form-header text-center text-md-start">
                <h2 className="simple-form-title">Pet Registration</h2>
                <p className="simple-form-subtitle">Add pet profile details and link with owner.</p>
              </div>
              <form onSubmit={handleSubmit} className="appointment-simple-form">
                {!owner ? (
                  <div className="form-section">
                    <h5 className="section-title">Owner Search</h5>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-9">
                        <label className="form-label">Owner (Phone/Email)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter owner's phone or email"
                          value={ownerContact}
                          onChange={(e) => setOwnerContact(e.target.value)}
                        />
                        {ownerSearchError && (
                          <div className="invalid-feedback d-block mt-1">{ownerSearchError}</div>
                        )}
                      </div>
                      <div className="col-md-3">
                        <button
                          className="btn btn-outline-secondary w-100"
                          onClick={handleOwnerSearch}
                          type="button"
                        >
                          Search Owner
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="form-section">
                    <h5 className="section-title">
                      <i className="bi bi-person-check-fill"></i> Owner Found
                    </h5>
                    <div className="row g-2 mb-2">
                      <div className="col-md-6"><strong>Name:</strong> {owner.ownerName}</div>
                      <div className="col-md-6"><strong>Email:</strong> {owner.email}</div>
                      <div className="col-md-6"><strong>Phone:</strong> {owner.phoneNumber}</div>
                      <div className="col-md-6"><strong>Address:</strong> {owner.address}</div>
                    </div>
                    <button
                      className="btn btn-link btn-sm px-0"
                      type="button"
                      onClick={() => {
                        setOwner(null);
                        setOwnerContact("");
                      }}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Search another owner
                    </button>
                  </div>
                )}

                <div className="form-section">
                  <h5 className="section-title">Pet Details</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Pet Name</label>
                      <input
                        type="text"
                        className={`form-control ${errors.petName ? "is-invalid" : ""}`}
                        placeholder="Enter pet's name"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                      />
                      {errors.petName && <div className="invalid-feedback d-block mt-1">{errors.petName}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Pet Type</label>
                      <select
                        className={`form-control ${errors.petType ? "is-invalid" : ""}`}
                        value={petType}
                        onChange={(e) => setPetType(e.target.value)}
                      >
                        <option value="">Select pet type</option>
                        {PET_TYPE_OPTIONS.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.petType && <div className="invalid-feedback d-block mt-1">{errors.petType}</div>}
                    </div>

                    {petType === "Other" && (
                      <div className="col-md-6">
                        <label className="form-label">Other Pet Type</label>
                        <input
                          type="text"
                          className={`form-control ${errors.otherPetType ? "is-invalid" : ""}`}
                          placeholder="Specify pet type"
                          value={otherPetType}
                          onChange={(e) => setOtherPetType(e.target.value)}
                        />
                        {errors.otherPetType && (
                          <div className="invalid-feedback d-block mt-1">{errors.otherPetType}</div>
                        )}
                      </div>
                    )}

                    <div className="col-md-6">
                      <label className="form-label">Breed</label>
                      <input
                        type="text"
                        className={`form-control ${errors.breed ? "is-invalid" : ""}`}
                        placeholder="Enter breed"
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                      />
                      {errors.breed && <div className="invalid-feedback d-block mt-1">{errors.breed}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Color</label>
                      <input
                        type="text"
                        className={`form-control ${errors.color ? "is-invalid" : ""}`}
                        placeholder="Enter color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      />
                      {errors.color && <div className="invalid-feedback d-block mt-1">{errors.color}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        className={`form-control ${errors.weight ? "is-invalid" : ""}`}
                        placeholder="Enter weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        min="0"
                        step="0.1"
                      />
                      {errors.weight && <div className="invalid-feedback d-block mt-1">{errors.weight}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">DOB</label>
                      <input
                        type="date"
                        className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                        value={dob}
                        onChange={(e) => setdob(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                      />
                      <div className="mt-2 text-muted">
                        <strong>Age:</strong> <span className="badge bg-success">{dob ? calculateAge(dob) : "--"}</span>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Sex</label>
                      <div className="d-flex flex-wrap gap-3">
                        <div className="form-check form-check-inline mb-0">
                          <input
                            className={`form-check-input ${errors.sex ? "is-invalid" : ""}`}
                            type="radio"
                            name="sex"
                            id="sexMale"
                            value="Male"
                            checked={sex === "Male"}
                            onChange={(e) => setSex(e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="sexMale">Male</label>
                        </div>
                        <div className="form-check form-check-inline mb-0">
                          <input
                            className={`form-check-input ${errors.sex ? "is-invalid" : ""}`}
                            type="radio"
                            name="sex"
                            id="sexFemale"
                            value="Female"
                            checked={sex === "Female"}
                            onChange={(e) => setSex(e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="sexFemale">Female</label>
                        </div>
                        <div className="form-check form-check-inline mb-0">
                          <input
                            className={`form-check-input ${errors.sex ? "is-invalid" : ""}`}
                            type="radio"
                            name="sex"
                            id="sexOther"
                            value="Other"
                            checked={sex === "Other"}
                            onChange={(e) => setSex(e.target.value)}
                          />
                          <label className="form-check-label" htmlFor="sexOther">Other</label>
                        </div>
                      </div>
                      {errors.sex && <div className="invalid-feedback d-block mt-1">{errors.sex}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea
                        className={`form-control ${errors.description ? "is-invalid" : ""}`}
                        placeholder="Enter description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        style={{ resize: "vertical" }}
                      />
                      {errors.description && (
                        <div className="invalid-feedback d-block mt-1">{errors.description}</div>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Pet Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        className={`form-control ${errors.petPhoto ? "is-invalid" : ""}`}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setPetPhoto(file);
                          setPetPhotoPreview(file ? URL.createObjectURL(file) : null);
                        }}
                      />
                      {petPhotoPreview && (
                        <div className="mt-2">
                          <img
                            src={petPhotoPreview}
                            alt="Pet Preview"
                            style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "8px" }}
                          />
                        </div>
                      )}
                      {errors.petPhoto && <div className="invalid-feedback d-block mt-1">{errors.petPhoto}</div>}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg appointment-submit-btn"
                    disabled={!owner || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering...
                      </>
                    ) : (
                      "Register Pet"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetRegistrationForm;
