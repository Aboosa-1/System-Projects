/**
 * App Configuration
 *
 * Frontend:
 *   https://system-projects.vercel.app
 *
 * Backend:
 *   https://graduation-project-system.vercel.app
 *
 * Student, Admin, and Staff are served from the same Frontend origin.
 */

const isLocalDev = ['localhost', '127.0.0.1'].includes(
  window.location.hostname
);

// Frontend URLs
const DEV_FRONTEND_BASE_URL = 'http://localhost:5500';
const PROD_FRONTEND_BASE_URL = 'https://system-projects.vercel.app';

function resolveFrontendBaseUrl() {
  return isLocalDev
    ? DEV_FRONTEND_BASE_URL
    : PROD_FRONTEND_BASE_URL;
}

const AppConfig = {
  // =========================
  // Backend API
  // =========================
  API_BASE_URL: 'https://graduation-project-system.vercel.app/api',

  // =========================
  // Frontend
  // =========================
  FRONTEND_BASE_URL: resolveFrontendBaseUrl(),

  // =========================
  // Admin Dashboard
  // =========================
  get ADMIN_DASHBOARD_URL() {
    return this.FRONTEND_BASE_URL + '/admin/pages/dashboard/index.html';
  },

  // =========================
  // Staff Dashboard
  // =========================
  get STAFF_DASHBOARD_URL() {
    return this.FRONTEND_BASE_URL + '/staff/pages/dashboard/index.html';
  },

  // =========================
  // Build redirect URL
  // =========================
  buildCrossOriginRedirect(baseUrl, token, user) {
    if (
      typeof baseUrl !== 'string' ||
      !/^https?:\/\//i.test(baseUrl)
    ) {
      throw new Error(
        'Invalid dashboard URL: ' + baseUrl
      );
    }

    const params = new URLSearchParams();

    params.set('token', token);
    params.set('user', JSON.stringify(user || {}));

    return baseUrl + '?' + params.toString();
  }
};
