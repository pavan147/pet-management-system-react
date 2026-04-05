import React, { useState } from "react";
import { saveAppointment } from "../../services/PetService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import SuccessMessage from "../SuccessMessage";
import './forms.css';

const TIME_OPTIONS = [
  { label: "🌅 Morning (9 AM - 12 PM)", value: "morning" },
  { label: "☀️ Afternoon (12 PM - 5 PM)", value: "afternoon" },
  { label: "🌆 Evening (5 PM - 8 PM)", value: "evening" },
];

const DoctorAppointmentForm = () => {
  const initialForm = {
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    reason: "",
    address: "",
  };

  const [form, setForm] = useState(initialForm);
  
  const { handleSubmit: submitForm, loading, showSuccess, errors, setShowSuccess } = useFormSubmit(
    (data) => saveAppointment(data),
    {
      resetForm: () => setForm(initialForm),
    }
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitForm(form);
  };

  if (showSuccess) {
    return (
      <SuccessMessage
        status="appointment"
        redirectTo="/dashboard"
        delay={3000}
      />
    );
  }

  return (
    <div className="appointment-container">
      <div className="container mt-5 pt-5 pb-5">
        <div className="row">
          <div className="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
            <div className="appointment-card">
              {/* Header */}
              <div className="form-header">
                <h2 className="form-title">
                  📅 Book Doctor Appointment
                </h2>
                <p className="form-subtitle">Schedule your pet's veterinary checkup</p>
              </div>

              <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-person-fill"></i> Your Information
                  </h5>

                  {/* Name */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Full Name</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Email Address</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Phone Number</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      name="phone"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  {/* Address */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Address</span>
                      <span className="required">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.address ? "is-invalid" : ""}`}
                      name="address"
                      rows="2"
                      placeholder="Enter your address"
                      value={form.address}
                      onChange={handleChange}
                      required
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>
                </div>

                <div className="form-section">
                  <h5 className="section-title">
                    <i className="bi bi-calendar-event"></i> Appointment Details
                  </h5>

                  {/* Date */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Preferred Date</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${errors.date ? "is-invalid" : ""}`}
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                    {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                  </div>

                  {/* Time */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Preferred Time</span>
                      <span className="required">*</span>
                    </label>
                    <select
                      className={`form-control ${errors.time ? "is-invalid" : ""}`}
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a time slot</option>
                      {TIME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.time && <div className="invalid-feedback">{errors.time}</div>}
                  </div>

                  {/* Reason */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Reason for Visit</span>
                      <span className="required">*</span>
                    </label>
                    <textarea
                      className={`form-control ${errors.reason ? "is-invalid" : ""}`}
                      name="reason"
                      rows="3"
                      placeholder="Describe the reason for visit (e.g., vaccination, checkup, etc.)"
                      value={form.reason}
                      onChange={handleChange}
                      required
                    />
                    {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Booking...
                    </>
                  ) : (
                    "✓ Confirm Appointment"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentForm;
