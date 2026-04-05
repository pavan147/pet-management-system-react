import React, { useState } from "react";

// Dummy Data with more vaccinations and records
const petsData = [
  {
    id: 1,
    name: "Bella",
    species: "Dog",
    breed: "Labrador",
    age: 3,
    photo: "https://place-puppy.com/100x100",
    vaccinations: [
      { name: "Rabies", date: "2025-03-01", nextDue: "2026-03-01" },
      { name: "Parvo", date: "2025-02-15", nextDue: "2026-02-15" },
      { name: "Distemper", date: "2025-01-10", nextDue: "2026-01-10" },
      { name: "Hepatitis", date: "2025-04-01", nextDue: "2026-04-01" },
      { name: "Leptospirosis", date: "2025-05-01", nextDue: "2026-05-01" },
      { name: "Parainfluenza", date: "2025-06-01", nextDue: "2026-06-01" },
      { name: "Bordetella", date: "2025-07-01", nextDue: "2026-07-01" },
      { name: "Lyme", date: "2025-08-01", nextDue: "2026-08-01" },
      { name: "Canine Influenza", date: "2025-09-01", nextDue: "2026-09-01" },
      { name: "Corona", date: "2025-10-01", nextDue: "2026-10-01" },
    ],
    deworming: [
      { date: "2026-01-10", nextDue: "2026-07-10" },
      { date: "2025-07-10", nextDue: "2026-01-10" },
      { date: "2025-01-10", nextDue: "2025-07-10" },
    ],
    doctorVisits: [
      { date: "2026-02-20", reason: "Annual Checkup" },
      { date: "2025-08-10", reason: "Skin Allergy" },
      { date: "2025-05-15", reason: "Vaccination" },
      { date: "2025-03-10", reason: "Dental Cleaning" },
      { date: "2024-12-01", reason: "Ear Infection" },
    ],
  },
  {
    id: 2,
    name: "Milo",
    species: "Cat",
    breed: "Siamese",
    age: 2,
    photo: "https://placekitten.com/100/100",
    vaccinations: [
      { name: "Feline Distemper", date: "2025-04-10", nextDue: "2026-04-10" },
      { name: "Rabies", date: "2025-05-10", nextDue: "2026-05-10" },
      { name: "Feline Leukemia", date: "2025-06-10", nextDue: "2026-06-10" },
      { name: "Feline Calicivirus", date: "2025-07-10", nextDue: "2026-07-10" },
      { name: "Feline Herpesvirus", date: "2025-08-10", nextDue: "2026-08-10" },
      { name: "Chlamydia", date: "2025-09-10", nextDue: "2026-09-10" },
      { name: "Bordetella", date: "2025-10-10", nextDue: "2026-10-10" },
      { name: "FIV", date: "2025-11-10", nextDue: "2026-11-10" },
    ],
    deworming: [
      { date: "2025-12-01", nextDue: "2026-06-01" },
      { date: "2025-06-01", nextDue: "2025-12-01" },
    ],
    doctorVisits: [
      { date: "2026-03-15", reason: "Dental Cleaning" },
      { date: "2025-09-15", reason: "Vaccination" },
      { date: "2025-05-15", reason: "Checkup" },
    ],
  },
];

// Fallback image for pets
const fallbackImage = "https://via.placeholder.com/100?text=Pet";

// Pet List Component
const PetList = ({ pets, onSelect, selectedPetId }) => (
  <div>
    <h5 className="mb-3 fw-bold text-primary">Your Pets</h5>
    <ul className="list-group shadow-sm">
      {pets.map((pet) => (
        <li
          key={pet.id}
          className={`list-group-item d-flex align-items-center border-0 mb-2 rounded ${selectedPetId === pet.id ? "bg-primary text-white shadow" : "bg-light"}`}
          style={{ cursor: "pointer", transition: "0.2s" }}
          onClick={() => onSelect(pet)}
        >
          <img
            src={pet.photo}
            alt={pet.name}
            className="rounded-circle me-3 border border-2"
            width={50}
            height={50}
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
            style={{ objectFit: "cover", boxShadow: selectedPetId === pet.id ? "0 0 0 2px #0d6efd" : "" }}
          />
          <div>
            
<span className="fw-bold">{pet.name}</span>
            <br />
            <small className="text-muted">{pet.species}</small>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// Pet Details Component
const PetDetails = ({ pet }) => {
  const [tab, setTab] = useState("info");
  return (
    <div className="card shadow p-4">
      <div className="d-flex align-items-center mb-4">
        <img
          src={pet.photo}
          alt={pet.name}
          className="rounded-circle me-4 border border-3 border-primary"
          width={90}
          height={90}
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
          style={{ objectFit: "cover" }}
        />
        <div>
          <h3 className="fw-bold mb-1">{pet.name} <span className="fs-5 text-secondary">({pet.species})</span></h3>
          <div className="mb-1"><strong>Breed:</strong> {pet.breed}</div>
          <div><strong>Age:</strong> {pet.age} years</div>
        </div>
      </div>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>Info</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "vaccinations" ? "active" : ""}`} onClick={() => setTab("vaccinations")}>Vaccinations</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "deworming" ? "active" : ""}`} onClick={() => setTab("deworming")}>Deworming</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === "doctorVisits" ? "active" : ""}`} onClick={() => setTab("doctorVisits")}>Doctor Visits</button>
        </li>
      </ul>
      <div>
        {tab === "info" && (
          <div>
            <p><strong>Breed:</strong> {pet.breed}</p>
            <p><strong>Age:</strong> {pet.age} years</p>
          </div>
        )}
        {tab === "vaccinations" && (
          <div>
            <h6 className="fw-bold">Vaccinations</h6>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <ul className="list-group">
                {pet.vaccinations.map((v, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{v.name}</strong>: {v.date}
                    </span>
                    <span className="badge bg-info text-dark">Next Due: {v.nextDue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === "deworming" && (
          <div>
            <h6 className="fw-bold">Deworming</h6>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              <ul className="list-group">
                {pet.deworming.map((d, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{d.date}</span>
                    <span className="badge bg-info text-dark">Next Due: {d.nextDue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === "doctorVisits" && (
          <div>
            <h6 className="fw-bold">Doctor Visits</h6>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              <ul className="list-group">
                {pet.doctorVisits.map((visit, idx) => (
                  <li key={idx} className="list-group-item">
                    <span className="fw-bold">{visit.date}:</span> {visit.reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Alerts Panel Component
const AlertsPanel = ({ pets }) => {
  const today = new Date();
  const alerts = [];

  pets.forEach((pet) => {
    pet.vaccinations.forEach((v) => {
      const nextDue = new Date(v.nextDue);
      if (nextDue < today) {
        alerts.push(`${pet.name}: ${v.name} vaccination overdue!`);
      } else if ((nextDue - today) / (1000 * 60 * 60 * 24) < 30) {
        alerts.push(`${pet.name}: ${v.name} vaccination due soon (${v.nextDue})`);
      }
    });
    pet.deworming.forEach((d) => {
      const nextDue = new Date(d.nextDue);
      if (nextDue < today) {
        alerts.push(`${pet.name}: Deworming overdue!`);
      } else if ((nextDue - today) / (1000 * 60 * 60 * 24) < 30) {
        alerts.push(`${pet.name}: Deworming due soon (${d.nextDue})`);
      }
    });
  });

  return (
    <div className="card shadow p-3">
      <h5 className="mb-3 fw-bold text-danger">Alerts & Reminders</h5>
      {alerts.length === 0 ? (
        <div className="alert alert-success">No upcoming or overdue items.</div>
      ) : (
        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          <ul className="list-group">
            {alerts.map((alert, idx) => (
              <li key={idx} className="list-group-item list-group-item-danger">{alert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const PetDashboard = () => {
  const [selectedPet, setSelectedPet] = useState(petsData[0]);

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4">
        <div className="col-md-3">
          <div className="card shadow p-3">
            <PetList pets={petsData} onSelect={setSelectedPet} selectedPetId={selectedPet?.id} />
          </div>
        </div>
        <div className="col-md-6">
          {selectedPet ? (
            <PetDetails pet={selectedPet} />
          ) : (
            <div className="alert alert-info">Select a pet to view details</div>
          )}
        </div>

        <div className="col-md-3">
          <AlertsPanel pets={petsData} />
        </div>
      </div>
    </div>
  );
};

export default PetDashboard;