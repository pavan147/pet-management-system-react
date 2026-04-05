import React, { useState, useEffect } from "react";
import { searchOwnerDetailsByEmailOrPhone } from "../../services/OwnerService";
import { saveVaccinationRecord } from "../../services/PetService";
import { getDefaultDashboardPath } from "../../services/VeterinaryRegistrationService";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import SuccessMessage from "../SuccessMessage";
import "./forms.css";

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
      setSelectedPet(pets[0].petIDFound);
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
        redirectTo={getDefaultDashboardPath()}
        delay={3000}
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
                <h2 className="simple-form-title">Pet Vaccination & Deworming Record</h2>
                <p className="simple-form-subtitle">Record vaccination details and certificate validity.</p>
              </div>
              <form onSubmit={handleSubmit} className="appointment-simple-form">
                <div className="form-section">
                  <h5 className="section-title">Find Owner</h5>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <label className="form-label">Search By</label>
                      <select
                        className="form-select"
                        value={searchType}
                        onChange={(e) => {
                          setSearchType(e.target.value);
                          setSearchValue("");
                          setPetList([]);
                          setSelectedPet("");
                          setErrors({});
                        }}
                        disabled={petList.length > 0}
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                      </select>
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">Owner Contact</label>
                      <input
                        type={searchType === "email" ? "email" : "tel"}
                        className={`form-control ${errors.searchValue ? "is-invalid" : ""}`}
                        placeholder={searchType === "email" ? "Enter email" : "Enter phone"}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        disabled={petList.length > 0}
                      />
                      {errors.searchValue && <div className="invalid-feedback d-block mt-2">{errors.searchValue}</div>}
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    {petList.length === 0 ? (
                      <button className="btn btn-primary" onClick={handleSearch} type="button">
                        Search Owner
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => {
                          setSearchType("email");
                          setSearchValue("");
                          setPetList([]);
                          setSelectedPet("");
                          setErrors({});
                        }}
                      >
                        Search Again
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h5 className="section-title">Select Pet</h5>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-6">
                      <label className="form-label">Pet</label>
                      <select
                        className={`form-select ${errors.selectedPet ? "is-invalid" : ""}`}
                        value={selectedPet}
                        onChange={(e) => setSelectedPet(e.target.value)}
                        disabled={petList.length === 0}
                      >
                        <option value="">Select Pet</option>
                        {petList.map((pet) => (
                          <option key={pet.petIDFound} value={pet.petIDFound}>
                            {pet.petNameFound}
                          </option>
                        ))}
                      </select>
                      {errors.selectedPet && <div className="invalid-feedback d-block mt-2">{errors.selectedPet}</div>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h5 className="section-title">Vaccination Details</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Vaccination</label>
                      <select
                        className={`form-select ${errors.vaccination ? "is-invalid" : ""}`}
                        value={vaccination}
                        onChange={(e) => setVaccination(e.target.value)}
                      >
                        <option value="">Select</option>
                        {vaccinationOptions.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      {errors.vaccination && <div className="invalid-feedback d-block mt-1">{errors.vaccination}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Vaccination Brand</label>
                      <input
                        type="text"
                        className={`form-control ${errors.vaccineName ? "is-invalid" : ""}`}
                        value={vaccineName}
                        onChange={(e) => setVaccineName(e.target.value)}
                        placeholder="Enter brand"
                      />
                      {errors.vaccineName && <div className="invalid-feedback d-block mt-1">{errors.vaccineName}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label">Doses</label>
                      <textarea
                        className={`form-control ${errors.brandAndDoses ? "is-invalid" : ""}`}
                        rows="2"
                        placeholder="Enter brand and doses"
                        value={brandAndDoses}
                        onChange={(e) => setBrandAndDoses(e.target.value)}
                      />
                      {errors.brandAndDoses && <div className="invalid-feedback d-block mt-1">{errors.brandAndDoses}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Vaccination Date</label>
                      <input
                        type="date"
                        className={`form-control ${errors.vaccinationDate ? "is-invalid" : ""}`}
                        value={vaccinationDate}
                        onChange={(e) => setVaccinationDate(e.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                      />
                      {errors.vaccinationDate && <div className="invalid-feedback d-block mt-1">{errors.vaccinationDate}</div>}
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Validity (Months)</label>
                      <input
                        type="number"
                        className={`form-control ${errors.durationMonths ? "is-invalid" : ""}`}
                        value={durationMonths}
                        min="1"
                        max="60"
                        onChange={(e) => setDurationMonths(e.target.value)}
                      />
                      {errors.durationMonths && <div className="invalid-feedback d-block mt-1">{errors.durationMonths}</div>}
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Valid Till</label>
                      <div className="form-control d-flex align-items-center">{validTill || "--"}</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        className={`form-control ${errors.weight ? "is-invalid" : ""}`}
                        placeholder="Enter weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        min="0"
                        step="0.1"
                      />
                      {errors.weight && <div className="invalid-feedback d-block mt-1">{errors.weight}</div>}
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <button type="submit" className="btn btn-primary btn-lg appointment-submit-btn" disabled={loading}>
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetVaccinationRecord;
