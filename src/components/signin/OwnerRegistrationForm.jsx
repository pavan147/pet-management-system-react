import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { saveRegistration } from "../../services/VeterinaryRegistrationService";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
//import petBg from "..public/bkimg.jpg"; // Uncomment and update the path if you want a background
import debounce from "lodash.debounce";
import SuccessMessage from "../SuccessMessage";

const OwnerRegistrationForm = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [phoneNumberExists, setPhoneNumberExist] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Pre-fill form with data from appointment if available
  useEffect(() => {
    if (location.state?.prefillData) {
      const { ownerName: name, email: emailData, phone: phoneData, address: addressData } = location.state.prefillData;
      if (name) setOwnerName(name);
      if (emailData) setEmail(emailData);
      if (phoneData) setPhone(phoneData);
      if (addressData) setAddress(addressData);
    }
  }, [location.state]);

    const checkPhoneNumberAlreadyExists = async (phoneNumber) => {
    try {
     
      const response = await searchOwnerDetailsByEmailOrPhone(phoneNumber); // Implement this API call in your service
      return response; // Assuming the API returns { exists: true/false }
    } catch (error) {
      console.error("Error checking email:", error);
      return false; // Default to false on error to allow registration attempt
    }
  };

  // Debounced version of the check function
  const debouncedCheckPhoneNumber = useCallback(
    debounce(async (phoneNumberToCheck) => {
      if (phoneNumberToCheck) {
        const exists = await checkPhoneNumberAlreadyExists(phoneNumberToCheck);
        setPhoneNumberExist(exists ? true : false);
      }
    }, 2000), // 500ms debounce
    [],
  );

  // useEffect to trigger check when email changes
  useEffect(() => {
    debouncedCheckPhoneNumber(phone);
    // Cancel debounce on unmount
    return debouncedCheckPhoneNumber.cancel;
  }, [phone, debouncedCheckPhoneNumber]);

  const checkEmailAlreadyExists = async (email) => {
    try {
     
      const response = await searchOwnerDetailsByEmailOrPhone(email); // Implement this API call in your service
      return response; // Assuming the API returns { exists: true/false }
    } catch (error) {
      console.error("Error checking email:", error);
      return false; // Default to false on error to allow registration attempt
    }
  };

  // Debounced version of the check function
  const debouncedCheckEmail = useCallback(
    debounce(async (emailToCheck) => {
      if (emailToCheck) {
        const exists = await checkEmailAlreadyExists(emailToCheck);
        setEmailExists(exists ? true : false);
      }
    }, 2000), // 500ms debounce
    [],
  );

  // useEffect to trigger check when email changes
  useEffect(() => {
    debouncedCheckEmail(email);
    // Cancel debounce on unmount
    return debouncedCheckEmail.cancel;
  }, [email, debouncedCheckEmail]);

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
    if(!emailExists) {
    const formData = {
      ownerName,
      email,
      phoneNumber: phone,
      password,
      confirmPassword,
      address,
    };
    try {
      setErrors({}); // Clear previous errors
      const result = await saveRegistration(formData);
      setShowSuccess(true);
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data); // Set backend validation errors
      } else {
        alert("Registration failed: " + error.message);
      }
    }
  }
  };

  if (showSuccess) {
    return (
        <SuccessMessage
        status="owner"
        redirectTo="/register"
        delay={3000} // 3 seconds before redirect
      />
      
    );
  }
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
        <h2 className="mb-3 mt-3 text-center">Pet Owner Registration</h2>

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
                value={ownerName}
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

        <div className={`form-group row ${errors.address ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label
                className="me-2 mb-0"
                style={{ minWidth: 110, marginTop: "0.375rem" }}
              >
                Address
              </label>
              <textarea
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                rows="2"
                placeholder="Enter address"
                value={address}
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
        <div
          className={`form-group row ${errors.email || errors.emailOtp ? "mb-1" : "mb-3"}`}
        >
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
            { emailExists && (
              <div className="invalid-feedback d-block mt-1 ms-2">
                <p>Email already exists please use a different email.</p>
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
        <div
          className={`form-group row ${errors.phone || errors.phoneOtp ? "mb-1" : "mb-3"}`}
        >
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center mb-2">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Phone Number
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
            {errors.phoneNumber && (
              <div className="invalid-feedback d-block mt-1 ms-2">
                {errors.phoneNumber}
              </div>
            )}

            {phoneNumberExists && (
              <div className="invalid-feedback d-block mt-1 ms-2">
                <p>Phone number already exists. Please use a different phone number.</p>
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
        <div
          className={`form-group row ${errors.confirmPassword ? "mb-1" : "mb-3"}`}
        >
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
            <button type="submit" className="btn btn-primary w-100 button-color">
              Register Pet
            </button>
          </div>
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default OwnerRegistrationForm;
