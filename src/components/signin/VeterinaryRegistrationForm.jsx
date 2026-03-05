import React, { useState } from "react";
import { saveRegistration } from "../../services/VeterinaryRegistrationService";
 //import petBg from "..public/bkimg.jpg"; // Uncomment and update the path if you want a background

const VeterinaryRegistrationForm = () => {
  const [petType, setPetType] = useState("Dog");
  const [otherPetType, setOtherPetType] = useState("");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [petName, setPetName] = useState("");
  const [breed, setBreed] = useState("");
  const [address, setAddress] = useState("");
  const [registrationDate, setRegistrationDate] = useState("");
  const [errors, setErrors] = useState({});

  // Dummy handlers for OTP (replace with real logic as needed)
  const handleGetEmailOtp = (e) => {
    e.preventDefault();
    alert("OTP sent to email (demo)");
  };
  const handleGetPhoneOtp = (e) => {
    e.preventDefault();
    alert("OTP sent to phone (demo)");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      ownerName,
      email,
      phoneNumber: phone,
      password,
      confirmPassword,
      petName,
      petType,
      otherPetType,
      breed,
      address,
      registrationDate,
    };
    try {
      setErrors({}); // Clear previous errors
      const result = await saveRegistration(formData);
      alert("Registration successful! ID: " + result.id);
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data); // Set backend validation errors
      } else {
        alert("Registration failed: " + error.message);
      }
    }
  };
  return (
    <div
      style={{
         //backgroundImage: `url(${petBg})`,
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

        <div className={`form-group row ${errors.ownerName ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Owner Name
              </label>
              <input
                type="text"
                className={`form-control ${errors.ownerName ? "is-invalid" : ""}`}
                placeholder="Enter owner's name"
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
            {errors.ownerName && (
              <div className="invalid-feedback d-block mt-1">
                {errors.ownerName}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        <div className={`form-group row ${errors.phoneNumber ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Phone Number
              </label>
              <input
                type="tel"
                className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
                placeholder="Enter phone number"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {errors.phoneNumber && (
              <div className="invalid-feedback d-block mt-1">
                {errors.phoneNumber}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

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

        <div className={`form-group row ${errors.petType ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label className="me-3 mb-0" style={{ minWidth: 110, marginTop: "0.375rem" }}>
                Pet Type
              </label>
              <div className="d-flex flex-wrap">
                <div className="form-check me-3">
                  <input
                    className={`form-check-input ${errors.petType ? "is-invalid" : ""}`}
                    type="radio"
                    name="petType"
                    id="dog"
                    value="Dog"
                    checked={petType === "Dog"}
                    onChange={(e) => setPetType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="dog">
                    Dog
                  </label>
                </div>
                <div className="form-check me-3">
                  <input
                    className={`form-check-input ${errors.petType ? "is-invalid" : ""}`}
                    type="radio"
                    name="petType"
                    id="cat"
                    value="Cat"
                    checked={petType === "Cat"}
                    onChange={(e) => setPetType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="cat">
                    Cat
                  </label>
                </div>
                <div className="form-check me-3">
                  <input
                    className={`form-check-input ${errors.petType ? "is-invalid" : ""}`}
                    type="radio"
                    name="petType"
                    id="bird"
                    value="Bird"
                    checked={petType === "Bird"}
                    onChange={(e) => setPetType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="bird">
                    Bird
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className={`form-check-input ${errors.petType ? "is-invalid" : ""}`}
                    type="radio"
                    name="petType"
                    id="other"
                    value="Other"
                    checked={petType === "Other"}
                    onChange={(e) => setPetType(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="other">
                    Other
                  </label>
                </div>
              </div>
            </div>
            {errors.petType && (
              <div className="invalid-feedback d-block mt-1">
                {errors.petType}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Show input for Other pet type */}
        {petType === "Other" && (
          <div className={`form-group row ${errors.otherPetType ? "mb-1" : "mb-3"}`}>
            <div className="col-2"></div>
            <div className="col-8">
              <div className="d-flex align-items-center">
                <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                  Other Pet Type
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.otherPetType ? "is-invalid" : ""}`}
                  placeholder="Please specify"
                  value={otherPetType}
                  onChange={(e) => setOtherPetType(e.target.value)}
                />
              </div>
              {errors.otherPetType && (
                <div className="invalid-feedback d-block mt-1 ms-2">
                  {errors.otherPetType}
                </div>
              )}
            </div>
            <div className="col-2"></div>
          </div>
        )}

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

        <div className={`form-group row ${errors.address ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label className="me-2 mb-0" style={{ minWidth: 110, marginTop: "0.375rem" }}>
                Address
              </label>
              <textarea
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                rows="2"
                placeholder="Enter address"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            {errors.address && (
              <div className="invalid-feedback d-block mt-1">
                {errors.address}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Email with OTP */}
        <div className={`form-group row ${(errors.email || errors.emailOtp) ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center mb-2">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Email
              </label>
              <input
                type="email"
                className={`form-control me-2 ${errors.email ? "is-invalid" : ""}`}
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleGetEmailOtp}
              >
                Get OTP
              </button>
            </div>
            {errors.email && (
              <div className="invalid-feedback d-block mt-1 ms-2">
                {errors.email}
              </div>
            )}
            <div className="d-flex align-items-center mt-2">
              <small className="me-2" style={{ minWidth: 110 }}>
                Email OTP
              </small>
              <input
                type="text"
                className={`form-control w-auto ${errors.emailOtp ? "is-invalid" : ""}`}
                placeholder="Enter OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
              />
            </div>
            {errors.emailOtp && (
              <div className="invalid-feedback d-block mt-1 ms-2">
                {errors.emailOtp}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Phone Number with OTP */}
        <div className={`form-group row ${(errors.phone || errors.phoneOtp) ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center mb-2">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Phone (OTP)
              </label>
              <input
                type="tel"
                className={`form-control me-2 ${errors.phone ? "is-invalid" : ""}`}
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={handleGetPhoneOtp}
              >
                Get OTP
              </button>
            </div>
            {errors.phone && (
              <div className="invalid-feedback d-block mt-1 ms-2">
                {errors.phone}
              </div>
            )}
            <div className="d-flex align-items-center mt-2">
              <small className="me-2" style={{ minWidth: 110 }}>
                Phone OTP
              </small>
              <input
                type="text"
                className={`form-control w-auto ${errors.phoneOtp ? "is-invalid" : ""}`}
                placeholder="Enter OTP"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
              />
            </div>
            {errors.phoneOtp && (
              <div className="invalid-feedback d-block mt-1 ms-2">
                {errors.phoneOtp}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Password */}
        <div className={`form-group row ${errors.password ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Password
              </label>
              <input
                type="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errors.password && (
              <div className="invalid-feedback d-block mt-1">
                {errors.password}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Confirm Password */}
        <div className={`form-group row ${errors.confirmPassword ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Confirm Password
              </label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {errors.confirmPassword && (
              <div className="invalid-feedback d-block mt-1">
                {errors.confirmPassword}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        <div className="form-group row mt-3">
          <div className="col-8"></div>
          <div className="col-2">
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
