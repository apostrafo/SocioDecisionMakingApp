import axios from 'axios';

// Tiesioginis API URL
const API_URL = 'http://localhost:5001';

// Axios instancijos sukūrimas
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptorius užklausoms - prideda autorizacijos antraštę, jei vartotojas prisijungęs
api.interceptors.request.use(
  (config) => {
    const userJson = localStorage.getItem('user');
    
    if (userJson) {
      const user = JSON.parse(userJson);
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptorius atsakymams - tvarko 401 klaidas (neautorizuota)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Atsijungimas
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 