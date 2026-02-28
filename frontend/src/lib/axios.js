import axios from "axios";

// VITE_BACKEND_URL is set in Vercel dashboard when deploying frontend separately.
// Leave it empty when deploying as a monolith on Render (uses same origin).
const backendOrigin =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.MODE === "development" ? "http://localhost:5001" : "");

export const axiosInstance = axios.create({
  baseURL: `${backendOrigin}/api`,
  withCredentials: true,
});
