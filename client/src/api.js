import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const api = axios.create({ baseURL: API_URL });

export function authConfig() {
  const token = localStorage.getItem("unseen_admin_token");
  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
}
