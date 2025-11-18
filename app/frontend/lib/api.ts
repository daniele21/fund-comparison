import axios from 'axios'

// If VITE_API_BASE_URL is not set in the dev environment, default to the
// backend dev server commonly run on port 8001. This prevents the frontend
// from issuing requests to the Vite dev server (which returns 404) when the
// env var is missing.
const DEFAULT_API_BASE = 'http://localhost:8001'

// import.meta.env has no stable TypeScript type in some setups; use a safe cast
const metaEnv: any = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined
// The project uses VITE_API_BASE (see .env and README). Guard against
// accidental use of a different name like VITE_API_BASE_URL which would be
// undefined and cause requests to be sent to e.g. http://localhost:3000/undefined
const resolvedBaseUrl = metaEnv && metaEnv.VITE_API_BASE ? String(metaEnv.VITE_API_BASE) : DEFAULT_API_BASE

export const api = axios.create({
  baseURL: resolvedBaseUrl,
  withCredentials: true,
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Attach request id for debugging if server sends it
    const rid = err?.response?.headers?.['x-request-id']
    if (rid) console.warn('RequestId:', rid)
    return Promise.reject(err)
  }
)
