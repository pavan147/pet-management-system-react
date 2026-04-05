import React, { useState, useEffect } from "react";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
import { saveVaccinationRecord } from "../../services/PetService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import SuccessMessage from "../SuccessMessage";

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
  const [petList, setPetList] = useState([]); // List of pets after search
  const [selectedPet, setSelectedPet] = useState(""); // Selected pet name
  const [vaccination, setVaccination] = useState("");
  const [brandAndDoses, setBrandAndDoses] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [weight, setWeight] = useState("");
  const [durationMonths, setDurationMonths] = useState(12);
  const [validTill, setValidTill] = useState("");
  const [errors, setErrors] = useState({});
  const [vaccineName, setVaccineName] = useState("");

  const { handleSubmit: submitForm, loading, showSuccess } = useFormSubmit(
    (formData) => saveVaccinationRecord(formData),
    {
      resetForm: () => {
        setVaccination("");
        setBrandAndDoses("");
        setVaccinationDate(new Date().toISOString().slice(0, 10));
        setWeight("");
        setDurationMonths(12);
        setValidTill("");
        setVaccineName("");
        setSearchType("email");
        setSearchValue("");
        setPetList([]);
        setSelectedPet("");
      },
    }
  );

  // Calculate valid till date whenever vaccinationDate or durationMonths changes
  useEffect(() => {
    if (vaccinationDate && durationMonths) {
      const date = new Date(vaccinationDate);
      date.setMonth(date.getMonth() + Number(durationMonths));
      setValidTill(date.toISOString().slice(0, 10));
    } else {
      setValidTill("");
    }
  }, [vaccinationDate, durationMonths]);

  // Mock search handler (replace with real API call)
  const handleSearch = async (e) => {
    e.preventDefault();
    setErrors({});
    setPetList([]);
    setSelectedPet("");
    if (!searchValue) {
      setErrors({ searchValue: "Email or Phone Number is Required" });
      return;
    }

    const owner = await searchOwnerDetailsByEmailOrPhone(searchValue);
    // Simulate API call
    // Replace this with your actual fetch logic
    let pets = [];
    if (owner && owner.pets) {
      pets = owner.pets.map((pet) => ({
        petNameFound: pet.petName,
        petIDFound: pet.id,
      }));
    }
    if (pets.length === 0) {
      setErrors({ searchValue: "No pets found for this user." });
      setPetList([]);
      setSelectedPet("");
    } else {
      setPetList(pets);
      setSelectedPet(pets[0]);
    }
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      petId: selectedPet,
      ownerContact: searchValue,
      vaccination,
      vaccineName,
      brandAndDoses,
      durationMonths,
      vaccinationDate,
      weight,
      validTill,
    };
    await submitForm(formData);
  };

  if (showSuccess) {
    return (
      <SuccessMessage
        status="vaccination"
        redirectTo="/dashboard"
        delay={3000}
      />
    );
  }

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
          Pet Vaccination & Deworming Record
        </h2>

        {/* Search Section */}
        <div className="form-group row mb-3">
          <div className="col-2"></div>
          <div className="col-8">
            <div className="d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Search By
              </label>
              <select
                className="form-select w-auto me-2"
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setSearchValue("");
                  setPetList([]);
                  setSelectedPet("");
                  setErrors({});
                }}
                disabled={petList.length > 0} // Disable after search
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
              <input
                type={searchType === "email" ? "email" : "tel"}
                className={`form-control me-2 ${errors.searchValue ? "is-invalid" : ""}`}
                placeholder={
                  searchType === "email" ? "Enter email" : "Enter phone"
                }
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ maxWidth: 220 }}
                disabled={petList.length > 0} // Disable after search
              />
              {petList.length > 0 && (
                <select
                  className={`form-select me-2 ${errors.selectedPet ? "is-invalid" : ""}`}
                  style={{ minWidth: 120, maxWidth: 200 }}
                  value={selectedPet}
                  onChange={(e) => setSelectedPet(e.target.value)}
                >
                  <option value="">Select Pet</option>
                  {petList.map((pet) => (
                    <option key={pet} value={pet.petIDFound}>
                      {pet.petNameFound}
                    </option>
                  ))}
                </select>
              )}

              {petList.length === 0 ? (
                <button
                  className="btn btn-outline-primary"
                  onClick={handleSearch}
                >
                  Search
                </button>
              ) : (
                <a
                  href="#"
                  className="ms-2"
                  style={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    color: "#0d6efd",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchType("email");
                    setSearchValue("");
                    setPetList([]);
                    setSelectedPet("");
                    setErrors({});
                  }}
                >
                  Search Again
                </a>
              )}
            </div>
            {/* Error messages below the row */}
            {errors.searchValue && (
              <div className="invalid-feedback d-block">
                {errors.searchValue}
              </div>
            )}
            {errors.selectedPet && (
              <div className="invalid-feedback d-block">
                {errors.selectedPet}
              </div>
            )}
          </div>
          <div className="col-2"></div>
        </div>

        {/* Vaccination Dropdown */}
        <div
          className={`form-group row ${errors.vaccination ? "mb-0" : "mb-3"}`}
        >
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
          <div className="row mb-0">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="invalid-feedback d-block">
                {errors.vaccination}
              </div>
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/* VaccinationBrand text field */}
        <div
          className={`form-group row ${errors.vaccineName ? "mb-0" : "mb-3"}`}
        >
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Vaccination Brand
            </label>
            <input
              type="text"
              className={`form-control ${errors.vaccineName ? "is-invalid" : ""}`}
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              placeholder="Enter brand"
            />
          </div>
          <div className="col-2"></div>
        </div>
        {errors.vaccineName && (
          <div className="row mb-0">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="invalid-feedback d-block">
                {errors.vaccineName}
              </div>
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {/*   Doses */}
        <div
          className={`form-group row ${errors.brandAndDoses ? "mb-0" : "mb-3"}`}
        >
          <div className="col-2"></div>
          <div className="col-8 d-flex align-items-center">
            <label className="me-2 mb-0" style={{ minWidth: 110 }}>
              Doses
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
          <div className="row mb-0">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="invalid-feedback d-block">
                {errors.brandAndDoses}
              </div>
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
               className={`form-control ${errors.vaccinationDate ? "is-invalid" : ""}`}
              value={vaccinationDate}
              onChange={(e) => setVaccinationDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />

            <div className="col-8 d-flex align-items-center">
              <label className="me-2 mb-0" style={{ minWidth: 110 }}>
                Validate Till <span className="me-2">Month(s)</span>
              </label>
              <input
                type="number"               
                className={`form-control w-auto me-2 ${errors.vaccinationDate ? "is-invalid w-auto me-2" : ""}`}
                value={durationMonths}
                min="1"
                max="60"
                onChange={(e) => setDurationMonths(e.target.value)}
                style={{ width: 80 }}
              />
              <span>
                <b>Valid Till:</b>{" "}
                <span className="badge bg-success">{validTill || "--"}</span>
              </span>
            </div>
          </div>

          <div className="col-2"></div>
        </div>

        {errors.vaccinationDate && (
          <div className="row mb-2">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="invalid-feedback d-block">{errors.vaccinationDate}</div>
            </div>
            <div className="col-2"></div>
          </div>
        )}

        {errors.durationMonths && (
          <div className="row mb-2">
            <div className="col-2"></div>
            <div className="col-8">
              <div className="invalid-feedback d-block">{errors.durationMonths}</div>
            </div>
            <div className="col-2"></div>
          </div>
        )}

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

        {/* Submit */}
        <div className="form-group row mt-3">
          <div className="col-8"></div>
          <div className="col-2">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                "Save Record"
              )}
            </button>
          </div>
          <div className="col-2"></div>
        </div>
      </form>
    </div>
  );
};

export default PetVaccinationRecord;
