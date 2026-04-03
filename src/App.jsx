import { useState } from "react";
import { Routes, Route, Router, Navigate } from "react-router-dom";
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
import DoctorAppointmentForm from "./components/Forms/DoctorAppointmentForm";
import ReceptionistQueue from "./components/Views/ReceptionistQueue";
import LoginComponent from "./components/signin/LoginComponent";
import SuccessPage from "./components/Views/SuccessPage";
import { isUserLoggedIn } from "./services/VeterinaryRegistrationService";

function App() {
  const [count, setCount] = useState(0);

  function AuthenticatedRoute({children}){

    const isAuth = isUserLoggedIn();

    if(isAuth) {
      return children;
    }

    return <Navigate to="/login" />

  }

  return (
    <>
        <Header />
    <div className="app-bg">
      <div class="container  text-center">
       
           <Routes>
             
              <Route path="/login" element={ <LoginComponent/> } />
              <Route path="/register" element={<OwnerRegistrationForm />} />
              <Route path="/SuccessPage" element={<AuthenticatedRoute><SuccessPage /></AuthenticatedRoute>} />
              
              {/* Protected Routes - User must be logged in */}
              <Route path="/pet-vaccination-record" element={<AuthenticatedRoute><PetVaccinationRecord /></AuthenticatedRoute>} />
              <Route path="/add-pet" element={<AuthenticatedRoute><PetRegistrationForm /></AuthenticatedRoute>} />
              <Route path="/pet-medical" element={<AuthenticatedRoute><PetMedicalHistoryForm /></AuthenticatedRoute>} />
              <Route path="/book-appointment" element={<AuthenticatedRoute><DoctorAppointmentForm /></AuthenticatedRoute>} />
              <Route path="/view-appointment" element={<AuthenticatedRoute><ReceptionistQueue /></AuthenticatedRoute>} />
              <Route path="/test" element={<AuthenticatedRoute><SuccessMessage status="owner" /></AuthenticatedRoute>} />
           </Routes>
        
        </div>
         </div>
     <Footer/>
    </>
  );
}

export default App;
