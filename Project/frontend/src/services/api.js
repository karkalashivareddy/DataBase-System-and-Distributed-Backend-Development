// Service layer for PharmaStock.
// Currently backed by frontend demo data, but structured so each function can
// be swapped to a fetch() call against the Express backend later without
// touching the UI components. These are NOT real backend API calls.
import { users as demoUsers, demoCredentials } from "../data/users";
import {
  getKpis,
  getSalesTrend,
  getCategoryDistribution,
  getStockHealth,
  getExpiryTimeline,
  getLowStockAlerts,
  getExpiringSoon,
  getNotifications as dataGetNotifications,
  getSearchIndex,
} from "../data/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export { API_BASE_URL };

// Small helper to simulate network latency so dashboard loading states are visible.
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- Auth (frontend-only demo; real JWT lives on the backend) ----------
export async function login(email, password) {
  await delay();
  const creds = demoCredentials;
  if (email === creds.email && password === creds.password) {
    return { token: "demo-token-0000", user: demoUsers[0] };
  }
  const err = new Error("Invalid email or password");
  err.status = 401;
  throw err;
}

// ---------- Dashboard ----------
export async function getDashboardStats() {
  await delay();
  return {
    kpis: getKpis(),
    salesTrend: getSalesTrend(),
    category: getCategoryDistribution(),
    stockHealth: getStockHealth(),
    expiryTimeline: getExpiryTimeline(),
  };
}

export async function getDashboardSales() {
  await delay(150);
  return getSalesTrend();
}

export async function getInventoryHealth() {
  await delay(150);
  return getStockHealth();
}

export async function getExpirySummary() {
  await delay(150);
  return getExpiryTimeline();
}

export async function getDashboardData() {
  await delay();
  return {
    kpis: getKpis(),
    salesTrend: getSalesTrend(),
    category: getCategoryDistribution(),
    stockHealth: getStockHealth(),
    expiryTimeline: getExpiryTimeline(),
    lowStockAlerts: getLowStockAlerts(),
    expiringSoon: getExpiringSoon(),
    notifications: dataGetNotifications(),
    searchIndex: getSearchIndex(),
  };
}

export async function getNotifications() {
  await delay(120);
  return dataGetNotifications();
}
