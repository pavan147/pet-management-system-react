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
import ReceptionistDashboard from "./components/Views/ReceptionistDashboard";
import LoginComponent from "./components/signin/LoginComponent";
import SuccessPage from "./components/Views/SuccessPage";
import PetMarketplace from "./components/Views/PetMarketplace";
import {
  isUserLoggedIn,
  getDefaultDashboardPath,
  isPetOwnerUser,
} from "./services/VeterinaryRegistrationService";
import PetDashboard from "./components/Views/dashboard";
import DoctorDashboard from "./components/Views/DoctorDashboard";

// Role-based home page routing
function RoleBasedHome() {
  return <Navigate to={getDefaultDashboardPath()} />;
}

function App() {
  const [count, setCount] = useState(0);

  function AuthenticatedRoute({children}){

    const isAuth = isUserLoggedIn();

    if(isAuth) {
      return children;
    }

    return <Navigate to="/login" />

  }

  function NonPetOwnerRoute({ children }) {
    const isAuth = isUserLoggedIn();

    if (!isAuth) {
      return <Navigate to="/login" />;
    }

    if (isPetOwnerUser()) {
      return <Navigate to={getDefaultDashboardPath()} replace />;
    }

    return children;
  }

  return (
    <>   
    
      <Header />
    <div className="app-bg">
      <div className="container text-center">
       
           <Routes>
             {/* Public Routes */}
             <Route path="/login" element={ <LoginComponent/> } />
             <Route path="/owner-registration" element={<OwnerRegistrationForm />} />
             
             {/* Role-based Dashboards */}
             <Route path="/receptionist-dashboard" element={<NonPetOwnerRoute><ReceptionistDashboard /></NonPetOwnerRoute>} />
             <Route path="/doctor-dashboard" element={<NonPetOwnerRoute><DoctorDashboard /></NonPetOwnerRoute>} />
             <Route path="/dashboard" element={ <AuthenticatedRoute><PetDashboard /></AuthenticatedRoute> } />
             
             {/* Home Route - Redirect based on role */}
             <Route path="/" element={<AuthenticatedRoute><RoleBasedHome /></AuthenticatedRoute>} />
             
             {/* Appointment Routes */}
              <Route path="/book-appointment" element={<AuthenticatedRoute><DoctorAppointmentForm /></AuthenticatedRoute>} /> 
              <Route path="/pet-marketplace" element={<AuthenticatedRoute><PetMarketplace /></AuthenticatedRoute>} />
              
              {/* Protected Routes - User must be logged in */ }
              <Route path="/SuccessPage" element={<AuthenticatedRoute><SuccessPage /></AuthenticatedRoute>} />
              <Route path="/pet-vaccination-record" element={<NonPetOwnerRoute><PetVaccinationRecord /></NonPetOwnerRoute>} />
              <Route path="/add-pet" element={<NonPetOwnerRoute><PetRegistrationForm /></NonPetOwnerRoute>} />
              <Route path="/pet-medical" element={<NonPetOwnerRoute><PetMedicalHistoryForm /></NonPetOwnerRoute>} />
              <Route path="/view-appointment" element={<NonPetOwnerRoute><ReceptionistQueue /></NonPetOwnerRoute>} />
              <Route path="/test" element={<AuthenticatedRoute><SuccessMessage status="owner" /></AuthenticatedRoute>} />
              <Route path="/register" element={<NonPetOwnerRoute><OwnerRegistrationForm /> </NonPetOwnerRoute>} />
           </Routes>
        
        </div>
         </div>
       <Footer/>
    </>
  );
}

export default App;
