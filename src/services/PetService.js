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


export const saveAppointment = async (formData) => {

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

// Download Prescription PDF for a specific medical record
export const downloadPrescriptionPdf = async (petId, petMedicalId) => {
  const response = await axios.get(
    `${BASE_URL}/medical-details/prescription-pdf`,
    {
      params: { petId, petMedicalId },
      responseType: "blob",
    }
  );

  // Build a filename from the Content-Disposition header or fall back to a default
  const contentDisposition = response.headers["content-disposition"];
  let fileName = `pet_${petId}_medical_${petMedicalId}_prescription.pdf`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (match && match[1]) {
      fileName = match[1].replace(/['"]/g, "");
    }
  }

  // Create a temporary anchor element to trigger the browser download
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getMedicalChatThread = async (petId) => {
  const response = await axios.get(`${BASE_URL}/medical-chat/${petId}`);
  return response.data;
};

export const searchMedicalChatPets = async (query) => {
  const response = await axios.get(`${BASE_URL}/medical-chat/search`, {
    params: { query },
  });
  return response.data;
};

export const sendMedicalChatMessage = async (petId, payload) => {
  const response = await axios.post(`${BASE_URL}/medical-chat/${petId}/messages`, payload, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const uploadMedicalChatImages = async (petId, files, message, emergency) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (message) {
    formData.append("message", message);
  }
  formData.append("emergency", `${Boolean(emergency)}`);

  const response = await axios.post(`${BASE_URL}/medical-chat/${petId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getMedicalChatImageUrl = (imageId) => `${BASE_URL}/medical-chat/images/${imageId}`;

export const getMedicalChatImageBlob = async (imageId) => {
  const response = await axios.get(`${BASE_URL}/medical-chat/images/${imageId}`, {
    responseType: "blob",
  });
  return response.data;
};

export const getEmergencyMedicalFeed = async () => {
  const response = await axios.get(`${BASE_URL}/medical-chat/emergency-feed`);
  return response.data;
};


