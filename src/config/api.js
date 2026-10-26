/**
 * Central API base URL configuration.
 * When deployed on Vercel, configure VITE_API_URL in project environment variables:
 * e.g., https://pm-shri-backend.onrender.com
 * Defaults to http://localhost:5000 for local development.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
