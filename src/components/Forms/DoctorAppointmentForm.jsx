import React, { useState } from "react";

const TIME_OPTIONS = [
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
  { label: "Evening", value: "evening" },
];

const DoctorAppointmentForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.phone) newErrors.phone = "Phone is required";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.time) newErrors.time = "Time is required";
    if (!form.reason) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setShowSuccess(true);
  };

  return (
    <div
      style={{
        background: "#f8f9fa",
        borderRadius: "16px",
        padding: "40px",
        minHeight: "100%",
        position: "relative",
      }}
    >
      <form onSubmit={handleSubmit}>
        <h2 className="mb-3 mt-3 text-center">
          Book Doctor Appointment
        </h2>
        {showSuccess && (
          <div className="alert alert-success text-center mb-3">
            Appointment booked successfully!
          </div>
        )}

        {/* Name */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label
                className="me-2 mb-0"
                htmlFor="name"
                style={{ minWidth: 110 }}
              >
                Full Name
              </label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && (
              <div className="invalid-feedback d-block mt-1">
                {errors.name}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Email */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label
                className="me-2 mb-0"
                htmlFor="email"
                style={{ minWidth: 110 }}
              >
                Email address
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <div className="invalid-feedback d-block mt-1">
                {errors.email}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Phone */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label
                className="me-2 mb-0"
                htmlFor="phone"
                style={{ minWidth: 110 }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && (
              <div className="invalid-feedback d-block mt-1">
                {errors.phone}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Date */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label
                className="me-2 mb-0"
                htmlFor="date"
                style={{ minWidth: 110 }}
              >
                Appointment Date
              </label>
              <input
                type="date"
                className={`form-control ${errors.date ? "is-invalid" : ""}`}
                id="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            {errors.date && (
              <div className="invalid-feedback d-block mt-1">
                {errors.date}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Time */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label
                className="me-2 mb-0"
                htmlFor="time"
                style={{ minWidth: 110 }}
              >
                Preferred Time
              </label>
              <select
                className={`form-select ${errors.time ? "is-invalid" : ""}`}
                id="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              >
                <option value="">Select Time</option>
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.time && (
              <div className="invalid-feedback d-block mt-1">
                {errors.time}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Reason */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-start">
              <label
                className="me-2 mb-0"
                htmlFor="reason"
                style={{ minWidth: 110, marginTop: "0.375rem" }}
              >
                Reason for Visit
              </label>
              <textarea
                className={`form-control ${errors.reason ? "is-invalid" : ""}`}
                id="reason"
                name="reason"
                rows="2"
                value={form.reason}
                onChange={handleChange}
              />
            </div>
            {errors.reason && (
              <div className="invalid-feedback d-block mt-1">
                {errors.reason}
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
            >
              Book Appointment
            </button>
          </div>
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default DoctorAppointmentForm;