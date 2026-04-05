import React, { useState } from "react";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
import { registerPet } from "../../services/PetService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import SuccessMessage from "../SuccessMessage";

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
        redirectTo="/dashboard"
        delay={3000}
      />
    );
  }

  return (
    <div
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "16px",
        padding: "40px",
        minHeight: "100%",
        position: "relative",
      }}
    >
      <form onSubmit={handleSubmit}>
        <h2 className="mb-3 mt-3 text-center">Pet Registration</h2>

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
                  value={ownerContact}
                  onChange={(e) => setOwnerContact(e.target.value)}
                  disabled={!!owner}
                />
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleOwnerSearch}
                  disabled={!!owner}
                  type="button"
                >
                  Search Owner
                </button>
                {owner && (
                  <button
                    className="btn btn-link btn-sm ms-2"
                    type="button"
                    onClick={() => {
                      setOwner(null);
                      setOwnerContact("");
                    }}
                  >
                    Change
                  </button>
                )}
              </div>
              {ownerSearchError && (
                <div className="invalid-feedback d-block mt-1">
                  {ownerSearchError}
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
                      setOwnerContact("");
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

        {/* Pet Name */}
        <div className={`form-group row ${errors.petName ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Pet Name
              </label>
              <input
                type="text"
                className={`form-control ${errors.petName ? "is-invalid" : ""}`}
                placeholder="Enter pet's name"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </div>
            {errors.petName && (
              <div className="invalid-feedback d-block mt-1">
                {errors.petName}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Pet Type */}
        <div className={`form-group row ${errors.petType ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Pet Type
              </label>
              <select
                className={`form-control ${errors.petType ? "is-invalid" : ""}`}
                value={petType}
                onChange={(e) => setPetType(e.target.value)}
              >
                <option value="">Select pet type</option>
                {PET_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {errors.petType && (
              <div className="invalid-feedback d-block mt-1">
                {errors.petType}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Other Pet Type */}
        {petType === "Other" && (
          <div
            className={`form-group row ${errors.otherPetType ? "mb-1" : "mb-3"}`}
          >
            <div className="col-2"></div>
            <div className="col-8">
              <div className="d-flex align-items-center">
                <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                  Other Pet Type
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.otherPetType ? "is-invalid" : ""}`}
                  placeholder="Specify pet type"
                  value={otherPetType}
                  onChange={(e) => setOtherPetType(e.target.value)}
                />
              </div>
              {errors.otherPetType && (
                <div className="invalid-feedback d-block mt-1">
                  {errors.otherPetType}
                </div>
              )}
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* Breed */}
        <div className={`form-group row ${errors.breed ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Breed
              </label>
              <input
                type="text"
                className={`form-control ${errors.breed ? "is-invalid" : ""}`}
                placeholder="Enter breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>
            {errors.breed && (
              <div className="invalid-feedback d-block mt-1">
                {errors.breed}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Color */}
        <div className={`form-group row ${errors.color ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Color
              </label>
              <input
                type="text"
                className={`form-control ${errors.color ? "is-invalid" : ""}`}
                placeholder="Enter color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            {errors.color && (
              <div className="invalid-feedback d-block mt-1">
                {errors.color}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Sex */}
        <div className={`form-group row ${errors.sex ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Sex
              </label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className={`form-check-input ${errors.sex ? "is-invalid" : ""}`}
                    type="radio"
                    name="sex"
                    id="sexMale"
                    value="Male"
                    checked={sex === "Male"}
                    onChange={(e) => setSex(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="sexMale">
                    Male
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className={`form-check-input ${errors.sex ? "is-invalid" : ""}`}
                    type="radio"
                    name="sex"
                    id="sexFemale"
                    value="Female"
                    checked={sex === "Female"}
                    onChange={(e) => setSex(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="sexFemale">
                    Female
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className={`form-check-input ${errors.sex ? "is-invalid" : ""}`}
                    type="radio"
                    name="sex"
                    id="sexOther"
                    value="Other"
                    checked={sex === "Other"}
                    onChange={(e) => setSex(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="sexOther">
                    Other
                  </label>
                </div>
              </div>
            </div>
            {errors.sex && (
              <div className="invalid-feedback d-block mt-1">{errors.sex}</div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Weight */}
        <div className={`form-group row ${errors.weight ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Weight (kg)
            </label>
            <input
              type="number"
              className={`form-control  ${errors.weight ? "is-invalid" : ""}`}
              placeholder="Enter weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>
          <div className="col-2"></div>
        </div>
        {errors.weight && (
          <div className="row mb-2">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="invalid-feedback d-block">{errors.weight}</div>
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* Registration Date (DOB) and Age */}
        <div
          className={`form-group row ${errors.registrationDate ? "mb-1" : "mb-3"}`}
        >
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                DOB
              </label>
              <input
                type="date"
                className={`form-control me-2 ${errors.dob ? "is-invalid" : ""}`}
                value={dob}
                onChange={(e) => setdob(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                style={{ maxWidth: 200 }}
              />
              <span>
                <b>Age:</b>{" "}
                <span className="badge bg-success">
                  {dob ? calculateAge(dob) : "" || "--"}
                </span>
              </span>
            </div>
          </div>
          <div className="col-2"></div>
        </div>

        {/* Description */}
        <div
          className={`form-group row ${errors.description ? "mb-1" : "mb-3"}`}
        >
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Description
              </label>
              <textarea
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                style={{ resize: "vertical" }}
              />
            </div>
            {errors.description && (
              <div className="invalid-feedback d-block mt-1">
                {errors.description}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Pet Photo */}
        <div className={`form-group row ${errors.petPhoto ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Pet Photo
              </label>
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
            </div>
            {petPhotoPreview && (
              <div className="mt-2">
                <img
                  src={petPhotoPreview}
                  alt="Pet Preview"
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
            {errors.petPhoto && (
              <div className="invalid-feedback d-block mt-1">
                {errors.petPhoto}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mt-3">
          <div className="col-8"></div>
          <div className="col-2">
            <button
              type="submit"
              className="btn btn-primary w-100"
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
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default PetRegistrationForm;
