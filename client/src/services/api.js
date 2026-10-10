
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Authentication
export const registerUser = (data) =>
  api.post("/auth/register", data);

export const verifyEmail = (data) =>
  api.post("/auth/verify-email", data);

export const resendOTP = (data) =>
  api.post("/auth/resend-otp", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const logoutUser = () =>
  api.post("/auth/logout");

// Users
export const getMyProfile = () =>
  api.get("/users/me");

export const getAllUsers = () =>
  api.get("/users");

export const searchUsers = (search) =>
  api.get("/users/search", {
    params: { search },
  });

// Chats
export const getMyChats = () =>
  api.get("/chats");

export const createPrivateChat = (userId) =>
  api.post("/chats/private", { userId });

export const createGroupChat = (groupName, members) =>
  api.post("/chats/group", { groupName, members });

// Messages
export const getMessages = (userId) =>
  api.get(`/messages/chat/${userId}`);

export const sendMessage = (receiver, message) =>
  api.post("/messages", {
    receiver,
    message,
    messageType: "text",
  });

export default api;