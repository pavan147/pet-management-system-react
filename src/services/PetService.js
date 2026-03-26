import axios from "axios";

const BASE_URL = "http://localhost:8080/api/pets";

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
