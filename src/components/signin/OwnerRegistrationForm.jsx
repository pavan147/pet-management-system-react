import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { saveRegistration, getDefaultDashboardPath } from "../../services/VeterinaryRegistrationService";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
import {
  getOtpReadyPhoneNumber,
  isValidMobileNumber,
  sendMobileOtp,
  verifyMobileOtp,
} from "../../services/OtpService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import debounce from "lodash.debounce";
import SuccessMessage from "../SuccessMessage";
import "../Forms/forms.css";

const OwnerRegistrationForm = () => {
  const location = useLocation();
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState("idle");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [phoneOtpFeedback, setPhoneOtpFeedback] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [phoneNumberExists, setPhoneNumberExist] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const { handleSubmit: submitForm, loading } = useFormSubmit(
    (formData) => saveRegistration(formData),
    {}
  );

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
      const response = await searchOwnerDetailsByEmailOrPhone(phoneNumber);
      return response;
    } catch (error) {
      console.error("Error checking phone:", error);
      return false;
    }
  };

  const debouncedCheckPhoneNumber = useCallback(
    debounce(async (phoneNumberToCheck) => {
      if (phoneNumberToCheck) {
        const exists = await checkPhoneNumberAlreadyExists(phoneNumberToCheck);
        setPhoneNumberExist(exists ? true : false);
      }
    }, 1500),
    [],
  );

  useEffect(() => {
    debouncedCheckPhoneNumber(phone);
    return debouncedCheckPhoneNumber.cancel;
  }, [phone, debouncedCheckPhoneNumber]);

  const checkEmailAlreadyExists = async (email) => {
    try {
      const response = await searchOwnerDetailsByEmailOrPhone(email);
      return response;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const debouncedCheckEmail = useCallback(
    debounce(async (emailToCheck) => {
      if (emailToCheck) {
        const exists = await checkEmailAlreadyExists(emailToCheck);
        setEmailExists(exists ? true : false);
      }
    }, 1500),
    [],
  );

  useEffect(() => {
    debouncedCheckEmail(email);
    return debouncedCheckEmail.cancel;
  }, [email, debouncedCheckEmail]);

  const getOtpErrorMessage = (error, fallbackMessage) => {
    return error.response?.data?.message || error.response?.data?.error || fallbackMessage;
  };

  const handlePhoneChange = (event) => {
    const nextPhoneNumber = event.target.value;

    setPhone(nextPhoneNumber);

    setPhoneOtp("");
    setPhoneOtpSent(false);
    setPhoneOtpFeedback(null);

    setPhoneVerificationStatus("idle");
  };

  const handleGetPhoneOtp = async (e) => {
    e.preventDefault();

    const normalizedPhoneNumber = getOtpReadyPhoneNumber(phone);

    if (!isValidMobileNumber(phone)) {
      setPhoneOtpFeedback({
        type: "danger",
        message: "Enter a valid 10-digit mobile number first.",
      });
      return;
    }

    if (phoneNumberExists) {
      setPhoneOtpFeedback({
        type: "danger",
        message: "This phone number is already registered. Please use a different number.",
      });
      return;
    }

    try {
      setPhoneOtpLoading(true);
      setPhoneOtpFeedback(null);
      const response = await sendMobileOtp(normalizedPhoneNumber);
      setPhoneOtpSent(true);
      setPhoneVerificationStatus("sent");
      setPhoneOtpFeedback({
        type: "success",
        message: response.message || "OTP sent successfully.",
      });
    } catch (error) {
      setPhoneVerificationStatus("idle");
      setPhoneOtpFeedback({
        type: "danger",
        message: getOtpErrorMessage(error, "Failed to send OTP. Please try again."),
      });
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();

    const normalizedPhoneNumber = getOtpReadyPhoneNumber(phone);

    if (!isValidMobileNumber(phone)) {
      setPhoneOtpFeedback({
        type: "danger",
        message: "Enter a valid 10-digit mobile number first.",
      });
      return;
    }

    if (!phoneOtp.trim()) {
      setPhoneOtpFeedback({
        type: "danger",
        message: "Enter the OTP to verify your mobile number.",
      });
      return;
    }

    try {
      setPhoneOtpLoading(true);
      setPhoneOtpFeedback(null);
      const response = await verifyMobileOtp(normalizedPhoneNumber, phoneOtp);

      if (!response.verified) {
        setPhoneOtpFeedback({
          type: "danger",
          message: "OTP verification failed. Please check the code and try again.",
        });
        return;
      }

      setPhoneVerificationStatus("verified");
      setPhoneOtpSent(false);
      setPhoneOtpFeedback({
        type: "success",
        message: "Mobile number verified successfully.",
      });
    } catch (error) {
      setPhoneOtpFeedback({
        type: "danger",
        message: getOtpErrorMessage(error, "Failed to verify OTP. Please try again."),
      });
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedPhoneNumber = getOtpReadyPhoneNumber(phone);

    const clientErrors = {};

    if (emailExists) {
      clientErrors.email = "This email is already registered. Please use a different email.";
    }

    if (phoneNumberExists) {
      clientErrors.phoneNumber = "This phone number is already registered. Please use a different number.";
    }

    if (!isValidMobileNumber(phone)) {
      clientErrors.phoneNumber = "Please enter a valid 10-digit mobile number.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const formData = {
      ownerName,
      email,
      phoneNumber: normalizedPhoneNumber,
      password,
      confirmPassword,
      address,
    };

    try {
      setErrors({});
      await submitForm(formData);
      setShowSuccess(true);
    } catch (error) {
      if (error.response?.data) {
        const apiErrors = error.response.data;
        if (typeof apiErrors === "object") {
          setErrors(apiErrors);
        } else {
          setErrors({ error: "Registration failed. Please try again." });
        }
      } else {
        alert("Registration failed: " + error.message);
      }
    }
  };

  if (showSuccess) {
    const redirectPath = location.state?.returnTo || getDefaultDashboardPath();
    return (
      <SuccessMessage
        status="owner"
        message={location.state?.returnTo ? "Registration successful! Redirecting back to appointments..." : "Owner registered successfully!"}
        redirectTo={redirectPath}
        delay={2000}
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
                <h2 className="simple-form-title">Owner Registration</h2>
                <p className="simple-form-subtitle">Complete your profile to manage your pet's healthcare.</p>
              </div>

              <form onSubmit={handleSubmit} className="appointment-simple-form">
                  {errors.error && (
                    <div className="alert alert-danger" role="alert">{errors.error}</div>
                  )}
                {/* Personal Information Section */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-person-fill"></i> Personal Information
                  </h5>

                  {/* Owner Name */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Full Name</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.ownerName ? "is-invalid" : ""}`}
                      placeholder="Enter your full name"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                    />
                    {errors.ownerName && (
                      <div className="invalid-feedback">{errors.ownerName}</div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Address</span>
                      <span className="required">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.address ? "is-invalid" : ""}`}
                      rows="3"
                      placeholder="Enter your complete address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-envelope-fill"></i> Contact Information
                  </h5>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Email Address</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""} ${emailExists ? "is-invalid" : ""}`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    {emailExists && (
                      <div className="alert alert-danger alert-sm">
                        This email is already registered. Please use a different email.
                      </div>
                    )}
                  </div>

                  {/* Phone Number with OTP */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Phone Number</span>
                      <span className="required">*</span>
                    </label>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">Mobile OTP is optional. You can verify now or later from the dashboard.</small>
                      {phoneVerificationStatus === "verified" && (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">Verified</span>
                      )}
                    </div>
                    <div className="input-group mb-2">
                      <input
                        type="tel"
                        className={`form-control ${errors.phone || errors.phoneNumber ? "is-invalid" : ""} ${phoneNumberExists ? "is-invalid" : ""}`}
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={handlePhoneChange}
                        required
                      />
                      <button
                        className="btn btn-outline-primary"
                        type="button"
                        onClick={handleGetPhoneOtp}
                        disabled={phoneOtpLoading || phoneVerificationStatus === "verified"}
                      >
                        {phoneOtpLoading && phoneVerificationStatus !== "verified" ? "Sending..." : "Send OTP"}
                      </button>
                    </div>
                    {(errors.phone || errors.phoneNumber) && (
                      <div className="invalid-feedback">{errors.phone || errors.phoneNumber}</div>
                    )}
                    {phoneNumberExists && (
                      <div className="alert alert-danger alert-sm">
                        This phone number is already registered. Please use a different number.
                      </div>
                    )}

                    {phoneOtpFeedback && (
                      <div className={`alert alert-${phoneOtpFeedback.type} alert-sm mb-2`}>
                        {phoneOtpFeedback.message}
                      </div>
                    )}

                    {(phoneOtpSent || phoneOtp) && phoneVerificationStatus !== "verified" && (
                      <div className="form-group mb-0">
                        <label className="form-label small mb-2">Mobile OTP</label>
                        <div className="input-group">
                          <input
                            type="text"
                            className={`form-control ${errors.phoneOtp ? "is-invalid" : ""}`}
                            placeholder="Enter OTP received"
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value)}
                            disabled={phoneVerificationStatus === "verified"}
                          />
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={handleVerifyPhoneOtp}
                            disabled={phoneOtpLoading || phoneVerificationStatus === "verified"}
                          >
                            {phoneOtpLoading && phoneVerificationStatus !== "verified" ? "Verifying..." : phoneVerificationStatus === "verified" ? "Verified" : "Verify OTP"}
                          </button>
                        </div>
                        {errors.phoneOtp && <div className="invalid-feedback d-block">{errors.phoneOtp}</div>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Section */}
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-lock-fill"></i> Security
                  </h5>

                  {/* Password */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Password</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Confirm Password</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword}</div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg appointment-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Registering...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center mt-4 pt-3 border-top">
                  <p className="text-muted mb-0">
                    Already registered? <a href="#/login" className="register-link">Sign in here</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerRegistrationForm;
