import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Commons/Header";
import OwnerRegistrationForm from "./components/signin/OwnerRegistrationForm";
import Footer from "./components/Commons/Footer";
import PetVaccinationRecord from "./components/Forms/PetVaccinationRecord ";
import PetRegistrationForm from "./components/Forms/PetRegistrationForm";
import SuccessMessage from "./components/SuccessMessage";
import PetMedicalHistoryForm from "./components/Forms/PetMedicalHistoryForm";
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
import CommunityPage from "./components/Community/CommunityPage";
import PetMedicalChatPage from "./components/Views/PetMedicalChatPage";

// Role-based home page routing
function RoleBasedHome() {
  return <Navigate to={getDefaultDashboardPath()} />;
}

function RequireAuth() {
  return isUserLoggedIn() ? <Outlet /> : <Navigate to="/login" />;
}

function RequireNonPetOwner() {
  if (!isUserLoggedIn()) {
    return <Navigate to="/login" />;
  }

  if (isPetOwnerUser()) {
    return <Navigate to={getDefaultDashboardPath()} replace />;
  }

  return <Outlet />;
}

function App() {
  return (
    <>   
    
      <Header />
    <div className="app-bg">
      <div className="container text-center">
       
           <Routes>
             {/* Public Routes */}
             <Route path="/login" element={ <LoginComponent/> } />
             <Route path="/owner-registration" element={<OwnerRegistrationForm />} />
             
             <Route element={<RequireAuth />}>
               {/* Role-based Dashboards */}
               <Route path="/dashboard" element={<PetDashboard />} />

               {/* Home Route - Redirect based on role */}
               <Route path="/" element={<RoleBasedHome />} />

               {/* Appointment Routes */}
               <Route path="/book-appointment" element={<DoctorAppointmentForm />} />
               <Route path="/pet-marketplace" element={<PetMarketplace />} />
               <Route path="/community" element={<CommunityPage />} />
               <Route path="/community/lost-pets" element={<CommunityPage lostPetsOnly />} />
               <Route path="/pet-medical-chat/:petId" element={<PetMedicalChatPage />} />
               <Route path="/SuccessPage" element={<SuccessPage />} />
               <Route path="/test" element={<SuccessMessage status="owner" />} />

               <Route element={<RequireNonPetOwner />}>
                 <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
                 <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                 <Route path="/pet-vaccination-record" element={<PetVaccinationRecord />} />
                 <Route path="/add-pet" element={<PetRegistrationForm />} />
                 <Route path="/pet-medical" element={<PetMedicalHistoryForm />} />
                 <Route path="/view-appointment" element={<ReceptionistQueue />} />
                 <Route path="/register" element={<OwnerRegistrationForm />} />
               </Route>
             </Route>
           </Routes>
        
        </div>
         </div>
       <Footer/>
    </>
  );
}

export default App;
