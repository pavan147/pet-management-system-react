import axios from "axios";
import { getToken } from "./VeterinaryRegistrationService";

const BASE_URL = "http://localhost:8080/api/pets";




 

// ===== AXIOS INTERCEPTOR (IMPORTANT!) =====
// This adds token to EVERY request automatically
axios.interceptors.request.use(function (config) {
    
    config.headers['Authorization'] = getToken();

    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });
  

export const registerPet = async (petRegistrationDto, petPhoto) => {
  try {
    const formData = new FormData();
    formData.append("petRegistrationDto", JSON.stringify(petRegistrationDto));
    if (petPhoto) {
      formData.append("petPhoto", petPhoto);
    }

    const response = await axios.post(
      `${BASE_URL}/register`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (!response || response.status !== 200) {
      return null;
    }
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  }
};

// Get Dashboard Data
export const getDashboardData = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/dashboard`);
    if (!response || response.status !== 200) {
      throw new Error("Failed to fetch dashboard data");
    }
    return response.data;
  } catch (error) {
    console.error("Dashboard API error:", error);
    throw error;
  }
};



// Service function to save registration
export const saveVaccinationRecord = async (formData) => {
  const response = await axios.post(
  BASE_URL + "/vaccination-record",  formData,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};


export const savePetMedicalRecord = async (formData) => {

  const response = await axios.post(
  BASE_URL + "/medical-details",  formData,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;

};


export const saveteAppointment = async (formData) => {

  const response = await axios.post(
  BASE_URL + "/book-appointment",  formData,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;

};

// Fetch appointments by date (default: today)
export const fetchAppointments = (date) => {
  return axios.get(BASE_URL + `/appointments?date=${date}`);
};

// Update appointment status and action
export const updateAppointmentStatus = (id, status, action) => {
  return axios.put(BASE_URL + `/appointments/${id}/status`, { status, action });
};

export const checkOwnerRegistered = (email) => {
  return axios.get(`${BASE_URL}/owner/check?email=${encodeURIComponent(email)}`);
}


