import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const SuccessMessage = ({
  status,
  message: customMessage,
  redirectTo,
  delay = 3000, // milliseconds before redirect
  onClose,
  showRedirectText = true,
}) => {
  const navigate = useNavigate();

  let message = customMessage || "";
  let linkText = "";

  // If custom message provided, use it; otherwise use status-based messages
  if (!customMessage) {
    switch (status) {
      case "owner":
        message = "Owner registered successfully!";
        linkText = "Login";
        break;
      case "profile":
        message = "Profile updated successfully!";
        linkText = "Go to Dashboard";
        break;
      case "password":
        message = "Password changed successfully!";
        linkText = "Return to Login";
        break;
      case "appointment":
        message = "Appointment booked successfully!";
        linkText = "Continue";
        break;
      case "pet":
        message = "Pet registered successfully!";
        linkText = "Continue";
        break;
      case "medical":
        message = "Medical history saved successfully!";
        linkText = "Continue";
        break;
      case "vaccination":
        message = "Vaccination record saved successfully!";
        linkText = "Continue";
        break;
      default:
        message = "Operation completed successfully!";
        linkText = "Continue";
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(redirectTo);
    }, delay);
    return () => clearTimeout(timer);
  }, [navigate, redirectTo, delay]);

  return (
    <div className="container mt-5">
      <div className="alert alert-success shadow d-flex justify-content-between align-items-center" role="alert" style={{ fontSize: "1.1rem" }}>
        <div>
          <i className="bi bi-check-circle-fill me-2" style={{ fontSize: "1.5rem", color: "#198754" }}></i>
          {message}
          {showRedirectText && (
            <span className="ms-2 text-muted" style={{ fontSize: "0.95rem" }}>
              Redirecting to <b>{linkText}</b>...
            </span>
          )}
        </div>
        {onClose && (
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
        )}
      </div>
    </div>
  );
};

SuccessMessage.propTypes = {
  status: PropTypes.string,
  message: PropTypes.string,
  redirectTo: PropTypes.string,
  delay: PropTypes.number,
  onClose: PropTypes.func,
  showRedirectText: PropTypes.bool,
};

export default SuccessMessage;