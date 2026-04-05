import React, { useState } from "react";
import { saveAppointment } from "../../services/PetService";
import { getDefaultDashboardPath } from "../../services/VeterinaryRegistrationService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import SuccessMessage from "../SuccessMessage";
import './forms.css';

const TIME_OPTIONS = [
  { label: "Morning (9 AM - 12 PM)", value: "morning" },
  { label: "Afternoon (12 PM - 5 PM)", value: "afternoon" },
  { label: "Evening (5 PM - 8 PM)", value: "evening" },
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
        redirectTo={getDefaultDashboardPath()}
        delay={3000}
      />
    );
  }

  return (
    <div className="appointment-container">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="form-wrapper appointment-simple-wrapper">
              <div className="section-header appointment-simple-header">
                <span className="icon" aria-hidden="true">📅</span>
                <div>
                  <h2>Book Doctor Appointment</h2>
                  <p className="form-subtitle mb-0">Fill in your details and preferred slot.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="appointment-simple-form">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="appointment-name">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        id="appointment-name"
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
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="appointment-email">
                        Email Address <span className="required">*</span>
                      </label>
                      <input
                        id="appointment-email"
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
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="appointment-phone">
                        Phone Number <span className="required">*</span>
                      </label>
                      <input
                        id="appointment-phone"
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
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="appointment-date">
                        Preferred Date <span className="required">*</span>
                      </label>
                      <input
                        id="appointment-date"
                        type="date"
                        className={`form-control ${errors.date ? "is-invalid" : ""}`}
                        name="date"
                        value={form.date}
                        onChange={handleChange}
                        required
                      />
                      {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="appointment-time">
                        Preferred Time <span className="required">*</span>
                      </label>
                      <select
                        id="appointment-time"
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
                  </div>

                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="appointment-address">
                        Address <span className="required">*</span>
                      </label>
                      <textarea
                        id="appointment-address"
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

                  <div className="col-12">
                    <div className="form-group">
                      <label className="form-label" htmlFor="appointment-reason">
                        Reason for Visit <span className="required">*</span>
                      </label>
                      <textarea
                        id="appointment-reason"
                        className={`form-control ${errors.reason ? "is-invalid" : ""}`}
                        name="reason"
                        rows="3"
                        placeholder="Describe the reason for visit"
                        value={form.reason}
                        onChange={handleChange}
                        required
                      />
                      {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg appointment-submit-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Booking...
                      </>
                    ) : (
                      "Confirm Appointment"
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

export default DoctorAppointmentForm;
