import axios from "axios";

const OTP_BASE_URL = "http://localhost:8080/api/otp";

export const normalizePhoneNumber = (phoneNumber = "") => String(phoneNumber).replace(/\D/g, "");

export const getOtpReadyPhoneNumber = (phoneNumber = "") => {
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

  if (normalizedPhoneNumber.length <= 10) {
    return normalizedPhoneNumber;
  }

  return normalizedPhoneNumber.slice(-10);
};

export const isValidMobileNumber = (phoneNumber = "") => {
  return getOtpReadyPhoneNumber(phoneNumber).length === 10;
};

export const sendMobileOtp = async (phoneNumber) => {
  const response = await axios.post(
    `${OTP_BASE_URL}/send`,
    { phoneNumber: getOtpReadyPhoneNumber(phoneNumber) },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};

export const verifyMobileOtp = async (phoneNumber, otp) => {
  const response = await axios.post(
    `${OTP_BASE_URL}/verify`,
    {
      phoneNumber: getOtpReadyPhoneNumber(phoneNumber),
      otp: otp.trim(),
    },
    { headers: { "Content-Type": "application/json" } },
  );

  return response.data;
};