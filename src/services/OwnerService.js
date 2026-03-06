import axios from "axios";

const BASE_URL = "http://localhost:8080/api/owners";

export const searchOwnerDetailsByEmailOrPhone = async (contact) => {
  let url = "";
  if (contact.includes("@")) {
    url = `${BASE_URL}/search?email=${encodeURIComponent(contact)}`;
  } else {
    url = `${BASE_URL}/search?phoneNumber=${encodeURIComponent(contact)}`;
  }

  try {
    const response = await axios.get(url);
    if (!response || response.status !== 200) {
      return null;
    }
    const data = await response.data;
    return {
      ownerName: data.ownerName || data.name,  
      address: data.address,
      email: data.email,
      phoneNumber: data.phoneNumber,
      pets: data.pets || []
    };
  } catch (error) {
    console.error("API error:", error);
    return null;
  }
};


    
   


  
 
 