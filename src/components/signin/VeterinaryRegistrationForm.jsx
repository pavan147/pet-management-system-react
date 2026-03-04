import React, { useState } from "react";
// import petBg from "../assets/pet-bg.png"; // Uncomment and update the path if you want a background

const VeterinaryRegistrationForm = () => {
  const [petType, setPetType] = useState("Dog");
  const [otherPetType, setOtherPetType] = useState("");

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
      <form>
        <h2 className="mb-4 text-center">Pet Registration</h2>

        <div className="form-group row mb-2">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Owner Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter owner's name"
              required
            />
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mb-2">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Phone Number
            </label>
            <input
              type="tel"
              className="form-control"
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mb-2">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Pet Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter pet's name"
              required
            />
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mb-2">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Pet Type
            </label>
            <div className="d-flex flex-wrap">
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="petType"
                  id="dog"
                  value="Dog"
                  checked={petType === "Dog"}
                  onChange={() => setPetType("Dog")}
                />
                <label className="form-check-label" htmlFor="dog">
                  Dog
                </label>
              </div>
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="petType"
                  id="cat"
                  value="Cat"
                  checked={petType === "Cat"}
                  onChange={() => setPetType("Cat")}
                />
                <label className="form-check-label" htmlFor="cat">
                  Cat
                </label>
              </div>
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="petType"
                  id="bird"
                  value="Bird"
                  checked={petType === "Bird"}
                  onChange={() => setPetType("Bird")}
                />
                <label className="form-check-label" htmlFor="bird">
                  Bird
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="petType"
                  id="other"
                  value="Other"
                  checked={petType === "Other"}
                  onChange={() => setPetType("Other")}
                />
                <label className="form-check-label" htmlFor="other">
                  Other
                </label>
              </div>
            </div>
          </div>
          <div className="col-2"></div>
        </div>

        {/* Show input for Other pet type */}
        {petType === "Other" && (
          <div className="form-group row mb-2">
            <div className="col-2"></div>
            <div className="col-8 d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Other Pet Type
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Please specify"
                value={otherPetType}
                onChange={(e) => setOtherPetType(e.target.value)}
                required
              />
            </div>
            <div className="col-2"></div>
          </div>
        )}

        <div className="form-group row mb-2">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Breed
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter breed"
              required
            />
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mb-2">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Address
            </label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Enter address"
              required
            />
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mb-2">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Registration <br />
              Date
            </label>
            <input type="date" className="form-control " required />
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mt-3">
          <div className="col-2"></div>
          <div className="col-8">
            <button type="submit" className="btn btn-primary w-100">
              Register Pet
            </button>
          </div>
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default VeterinaryRegistrationForm;
