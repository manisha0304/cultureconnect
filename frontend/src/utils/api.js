import axios from 'axios';

// ✅ IMPORTANT: use relative /api (Vite proxy will handle backend)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= EVENTS =================
export const getEvents = (params) => api.get('/events', { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const getCategories = () => api.get('/events/categories');
export const getStates = () => api.get('/events/states');
export const getRegions = () => api.get('/events/regions');
export const getEventManagers = (eventId) =>
  api.get(`/events/${eventId}/managers`);

// ================= BOOKINGS =================
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my-bookings');
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const confirmBooking = (id, paymentId) =>
  api.patch(`/bookings/${id}/confirm`, { paymentId });
export const cancelBooking = (id) =>
  api.patch(`/bookings/${id}/cancel`);

// ================= PAYMENTS =================
export const createPaymentOrder = (data) =>
  api.post('/payments/create-order', data);
export const verifyPayment = (data) =>
  api.post('/payments/verify', data);
export const getRazorpayKey = () => api.get('/payments/key');

export default api;
