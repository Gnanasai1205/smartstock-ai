import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API}/api`, 
});

export default api;
