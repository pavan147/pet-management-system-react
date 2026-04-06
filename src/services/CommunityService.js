import axios from "axios";
import { getToken } from "./VeterinaryRegistrationService";

const BASE_URL = "http://localhost:8080/api/community";

const communityApi = axios.create({
  baseURL: BASE_URL,
});

communityApi.interceptors.request.use(
  (config) => {
    config.headers.Authorization = getToken();
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchCommunityFeed = async ({ category, keyword, page = 0, size = 10 } = {}) => {
  const response = await communityApi.get("/posts", {
    params: {
      category: category || undefined,
      keyword: keyword || undefined,
      page,
      size,
    },
  });
  return response.data;
};

export const fetchLostPetsFeed = async ({ page = 0, size = 10 } = {}) => {
  const response = await communityApi.get("/posts/lost-pets", {
    params: { page, size },
  });
  return response.data;
};

export const createCommunityPost = async (payload, photoFile) => {
  const formData = new FormData();
  formData.append("post", JSON.stringify(payload));
  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await communityApi.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const fetchCommunityPostById = async (postId) => {
  const response = await communityApi.get(`/posts/${postId}`);
  return response.data;
};

export const addCommentToPost = async (postId, comment) => {
  const response = await communityApi.post(`/posts/${postId}/comments`, { comment });
  return response.data;
};

export const deleteCommunityPost = async (postId) => {
  await communityApi.delete(`/posts/${postId}`);
};

export const fetchPostPhotoBlob = async (postId) => {
  const response = await communityApi.get(`/posts/${postId}/photo`, {
    responseType: "blob",
  });

  return URL.createObjectURL(response.data);
};

