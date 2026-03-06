import axios from "axios";

const BASE_URL = "http://localhost:8080/api/pets";

export const registerPet = async (petRegistrationDto) => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, petRegistrationDto);
    if (!response || response.status !== 200) {
      return null;
    }
    return response.data; // OwnerResponseDto
  } catch (error) {
    console.error("API error:", error);
    return null;
  }
};