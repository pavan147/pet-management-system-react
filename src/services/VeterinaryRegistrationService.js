
import axios from "axios";

// Service function to save registration
export const saveRegistration = async (formData) => {
  const response = await axios.post(
    "http://localhost:8080/api/registrations",
    formData,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};