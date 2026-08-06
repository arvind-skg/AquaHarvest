import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor (future auth token)
api.interceptors.request.use((config) => config, (error) => Promise.reject(error));

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ── Assessment APIs ──────────────────────────────────────────────
export const createFullAssessment = (payload) =>
  api.post('/assessment/complete/', payload);

export const getAssessments = () =>
  api.get('/assessment/');

export const getAssessmentById = (id) =>
  api.get(`/assessment/${id}/`);

// ── Predict only (no save) ───────────────────────────────────────
export const predictMethod = (payload) =>
  api.post('/predict/', payload);

// ── Report APIs ──────────────────────────────────────────────────
export const getReport = (id) =>
  api.get(`/report/${id}/`);

export const getPdfReportUrl = (id) =>
  `http://127.0.0.1:8000/api/report/${id}/pdf/`;

export default api;
