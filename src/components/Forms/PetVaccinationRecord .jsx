import React, { useState } from "react";

const vaccinationOptions = [
  "Rabies",
  "Distemper",
  "Parvovirus",
  "Hepatitis",
  "Leptospirosis",
  "Deworming",
  "Other",
];

const PetVaccinationRecord = () => {
  const [searchType, setSearchType] = useState("email");
  const [searchValue, setSearchValue] = useState("");
  const [petName, setPetName] = useState("");
  const [vaccination, setVaccination] = useState("");
  const [brandAndDoses, setBrandAndDoses] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [weight, setWeight] = useState("");
  const [durationMonths, setDurationMonths] = useState(12);
  const [validTill, setValidTill] = useState("");
  const [errors, setErrors] = useState({});

  // Calculate valid till date whenever vaccinationDate or durationMonths changes
  React.useEffect(() => {
    if (vaccinationDate && durationMonths) {
      const date = new Date(vaccinationDate);
      date.setMonth(date.getMonth() + Number(durationMonths));
      setValidTill(date.toISOString().slice(0, 10));
    } else {
      setValidTill("");
    }
  }, [vaccinationDate, durationMonths]);

  // Dummy search handler
  const handleSearch = (e) => {
    e.preventDefault();
    alert(
      `Searching for pet with ${searchType}: ${searchValue}, Pet Name: ${petName} (Demo)`
    );
    // Implement actual search logic here
  };

  // Dummy submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate fields as needed
    const newErrors = {};
    if (!searchValue) newErrors.searchValue = "Required";
    if (!petName) newErrors.petName = "Required";
    if (!vaccination) newErrors.vaccination = "Select vaccination";
    if (!brandAndDoses) newErrors.brandAndDoses = "Required";
    if (!weight) newErrors.weight = "Required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Record saved! (Demo)");
      // Implement actual save logic here
    }
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
        <h2 className="mb-3 mt-3 text-center">Pet Vaccination & Deworming Record</h2>

        {/* Search Section */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Search By
            </label>
            <select
              className="form-select w-auto me-2"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
            <input
              type={searchType === "email" ? "email" : "tel"}
              className={`form-control me-2 ${errors.searchValue ? "is-invalid" : ""}`}
              placeholder={searchType === "email" ? "Enter email" : "Enter phone"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <input
              type="text"
              className={`form-control me-2 ${errors.petName ? "is-invalid" : ""}`}
              placeholder="Pet Name"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
            />
            <button className="btn btn-outline-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
          <div className="col-2"></div>
        </div>
        {(errors.searchValue || errors.petName) && (
          <div className="row mb-2">
            <div className="col-2"></div>
            <div className="col-8">
              {errors.searchValue && (
                <div className="invalid-feedback d-block">{errors.searchValue}</div>
              )}
              {errors.petName && (
                <div className="invalid-feedback d-block">{errors.petName}</div>
              )}
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* Vaccination Dropdown */}
        <div className={`form-group row ${errors.vaccination ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Vaccination
            </label>
            <select
              className={`form-select ${errors.vaccination ? "is-invalid" : ""}`}
              value={vaccination}
              onChange={(e) => setVaccination(e.target.value)}
            >
              <option value="">Select</option>
              {vaccinationOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="col-2"></div>
        </div>
        {errors.vaccination && (
          <div className="row mb-2">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="invalid-feedback d-block">{errors.vaccination}</div>
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* Brand and Doses */}
        <div className={`form-group row ${errors.brandAndDoses ? "mb-1" : "mb-3"}`}>
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Brand & Doses
            </label>
            <textarea
              className={`form-control ${errors.brandAndDoses ? "is-invalid" : ""}`}
              rows="2"
              placeholder="Enter brand and doses"
              value={brandAndDoses}
              onChange={(e) => setBrandAndDoses(e.target.value)}
            />
          </div>
          <div className="col-2"></div>
        </div>
        {errors.brandAndDoses && (
          <div className="row mb-2">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="invalid-feedback d-block">{errors.brandAndDoses}</div>
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* Vaccination Date */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Vaccination Date
            </label>
            <input
              type="date"
              className="form-control w-auto"
              value={vaccinationDate}
              onChange={(e) => setVaccinationDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
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
              className={`form-control w-auto ${errors.weight ? "is-invalid" : ""}`}
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

        {/* Duration and Valid Till */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Validate Till
            </label>
            <input
              type="number"
              className="form-control w-auto me-2"
              value={durationMonths}
              min="1"
              max="60"
              onChange={(e) => setDurationMonths(e.target.value)}
              style={{ width: 80 }}
            />
            <span className="me-2">Month(s)</span>
            <span>
              <b>Valid Till:</b>{" "}
              <span className="badge bg-success">{validTill || "--"}</span>
            </span>
          </div>
          <div className="col-2"></div>
        </div>

        {/* Submit */}
        <div className="form-group row mt-3">
          <div className="col-8"></div>
          <div className="col-2">
            <button type="submit" className="btn btn-primary w-100">
              Save Record
            </button>
          </div>
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default PetVaccinationRecord;