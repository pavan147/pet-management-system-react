import React, { useState } from "react";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
import { registerPet } from "../../services/PetService";
// import { savePetRegistration } from "../../services/PetRegistrationService"; // Uncomment and update if you have a service
// import { searchOwnerByContact } from "../../services/OwnerService"; // Uncomment and update if you have a service
// import petBg from "..public/bkimg.jpg"; // Uncomment and update the path if you want a background

const PET_TYPE_OPTIONS = ["Dog", "Cat", "Bird", "Other"];

const searchOwner = async (contact) => {
  // Simulate API delay
  const owner = await searchOwnerDetailsByEmailOrPhone(contact);
  // Demo: If contact is "demo@email.com" or "1234567890", return a fake owner
  if (owner) {
    return {
      ownerName: owner.ownerName,
      address: owner.address,
    };
  }
  // Not found
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

  const handleOwnerSearch = async (e) => {
    e.preventDefault();
    setOwner(null);
    setOwnerSearchError("");
    if (!ownerContact) {
      setOwnerSearchError("Please enter phone or email to search.");
      return;
    }
    try {
      // const foundOwner = await searchOwnerByContact(ownerContact); // Use your real service here
      const foundOwner = await searchOwner(ownerContact); // Demo
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
      // Get days in previous month
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Only show positive age
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
    const formData = {
      petName,
      petType,
      otherPetType: petType === "Other" ? otherPetType : "",
      breed,
      sex,
      color,
      description,
      dob,
      weight,
      ownerContact
    };
    try {
      setErrors({});
       const result = await registerPet(formData);
      if (result) {
        alert("Pet registered successfully!");  
      }
       
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        alert("Registration failed: " + error.message);
      }
    }
  };

  return (
    <div
      style={{
        // backgroundImage: `url(${petBg})`,
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

        {/* Owner Info */}
        {owner && (
          <>
            <div className="form-group row mb-3">
              <div className="col-2"></div>
              <div className="col-8">
                <div className="d-flex align-items-center">
                  <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                    Owner Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={owner.ownerName}
                    readOnly
                    disabled
                  />
                </div>
              </div>
              <div className="col-2"></div>
            </div>
            <div className="form-group row mb-3">
              <div className="col-2"></div>
              <div className="col-8">
                <div className="d-flex align-items-center">
                  <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                    Address
                  </label>
                  <textarea
                    className="form-control"
                    value={owner.address}
                    readOnly
                    disabled
                  />
                </div>
              </div>
              <div className="col-2"></div>
            </div>
          </>
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
                    name="
sex"
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

        {/* Registration Date */}
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
                className={`form-control ${errors.registrationDate ? "is-invalid" : ""}`}
                value={dob}
                onChange={(e) => setRegistrationDate(e.target.value)}
              />
            </div>
            {errors.registrationDate && (
              <div className="invalid-feedback d-block mt-1">
                {errors.registrationDate}
              </div>
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
                max = {new Date().toISOString().split("T")[0]}
               style={{ maxWidth: 200 }}
              />
              {/* <input
                type="text"
                className="form-control"
                value={registrationDate ? calculateAge(registrationDate) : ""}
                placeholder="Age"
                readOnly
                style={{ maxWidth: 100 }}
              /> */}

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

        <div className="form-group row mt-3">
          <div className="col-8"></div>
          <div className="col-2">
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!owner}
            >
              Register Pet
            </button>
          </div>
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default PetRegistrationForm;
