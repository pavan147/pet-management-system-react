
import axios from "axios";
const AUTH_REST_API_BASE_URL = "http://localhost:8080/api/auth";
// Service function to save registration
export const saveRegistration = async (formData) => {
  const response = await axios.post(
    "http://localhost:8080/api/registrations",
    formData,
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
};

export const loginAPICall = (usernameOrEmail, password) => axios.post(AUTH_REST_API_BASE_URL + '/login', { usernameOrEmail, password});

export const storeToken = (token) => localStorage.setItem("token", token);

export const getToken = () => localStorage.getItem("token");

export const saveLoggedInUser = (username, role) => {
    sessionStorage.setItem("authenticatedUser", username);
    sessionStorage.setItem("role", role);
}


export const isUserLoggedIn = () => {

    const token = localStorage.getItem("token");

    if(token == null) {
        return false;
    }    
    else {
        return true;
    }   
}


export const getLoggedInUser = () => {
    const username = sessionStorage.getItem("authenticatedUser");
    return username;
}

export const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
}

export const isAdminUser = () => {

    let role = sessionStorage.getItem("role");

    if(role != null && role === 'ROLE_ADMIN'){
        return true;
    }else{
        return false;
    }

}

export const isReceptionistUser = () => {
    let role = sessionStorage.getItem("role");
    return role != null && role === 'ROLE_RECEPTIONIST';
}

export const isDoctorUser = () => {
    let role = sessionStorage.getItem("role");
    return role != null && role === 'ROLE_DOCTOR';
}

export const isPetOwnerUser = () => {
    let role = sessionStorage.getItem("role");
    return role != null && role === 'ROLE_PET_OWNER';
}

export const getDefaultDashboardPath = () => {
    if (isReceptionistUser()) {
        return '/receptionist-dashboard';
    }

    if (isDoctorUser()) {
        return '/doctor-dashboard';
    }

    return '/dashboard';
}

export const getUserRole = () => {
    return sessionStorage.getItem("role");
}
