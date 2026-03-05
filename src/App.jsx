import { useState } from "react";
import { Routes, Route, Router } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Header from "./components/Commons/Header";
import VeterinaryRegistrationForm from "./components/signin/VeterinaryRegistrationForm";
import Footer from "./components/Commons/Footer";
import PetVaccinationRecord from "./components/Forms/PetVaccinationRecord ";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />

      <div class="container-fluid text-center">
       
           <Routes>
              <Route path="/register" element={<VeterinaryRegistrationForm />} />
              <Route path="/pet-vaccination-record" element={<PetVaccinationRecord />} />
           </Routes>
        
        </div>
         
     <Footer/>
    </>
  );
}

export default App;
