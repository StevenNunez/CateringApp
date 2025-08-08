
import axios from "axios";

const api = axios.create({
  baseURL: "https://us-central1-catering-app-ls.cloudfunctions.net/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Solicitud enviada:", config.method, config.url, config.data);
    return config;
  },
  (error) => {
    console.error("Error en interceptor:", error);
    return Promise.reject(error);
  }
);

export default api;