import { useState } from "react";
import { Routes, Route, Router } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Header from "./components/Commons/Header";
import OwnerRegistrationForm from "./components/signin/OwnerRegistrationForm";
import Footer from "./components/Commons/Footer";
import PetVaccinationRecord from "./components/Forms/PetVaccinationRecord ";
import PetRegistrationForm from "./components/Forms/PetRegistrationForm";
import SuccessMessage from "./components/SuccessMessage";
import PetMedicalHistoryForm from "./components/Forms/PetMedicalHistoryForm";
import AppointmentForm from "./components/Forms/DoctorAppointmentForm";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
    <div className="app-bg">
      <div class="container  text-center">
       
           <Routes>
              <Route path="/register" element={<OwnerRegistrationForm />} />
              <Route path="/pet-vaccination-record" element={<PetVaccinationRecord />} />
              <Route path="/add-pet" element={<PetRegistrationForm />} />
              <Route path="/test" element={<SuccessMessage status="owner" />} />
              <Route path="/pet-medical" element={<PetMedicalHistoryForm   />} />
              <Route path="/book-appointment" element={<DoctorAppointmentForm   />} />
           </Routes>
        
        </div>
         </div>
     <Footer/>
    </>
  );
}

export default App;
