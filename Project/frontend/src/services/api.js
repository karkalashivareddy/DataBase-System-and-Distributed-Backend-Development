const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "pharmastock.token";

export { API_BASE_URL };

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function token() {
  return typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
}

function queryString(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== "All") search.set(key, value);
  }
  const result = search.toString();
  return result ? `?${result}` : "";
}

async function request(path, options = {}) {
  const headers = { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) };
  const accessToken = token();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new ApiError(body.error?.message || "Request failed", response.status, body.error?.code, body.error?.details);
  }
  return body.data;
}

export function login(email, password) {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function updateProfile(data) {
  return request("/auth/me", { method: "PATCH", body: JSON.stringify(data) });
}

export function changePassword(data) {
  return request("/auth/change-password", { method: "POST", body: JSON.stringify(data) });
}

export function getDashboardData() {
  return request("/dashboard");
}

export function getDashboardStats() {
  return getDashboardData().then((data) => data.kpis);
}

export function getDashboardSales() {
  return getDashboardData().then((data) => data.salesTrend);
}

export function getInventoryHealth() {
  return getDashboardData().then((data) => data.stockHealth);
}

export function getExpirySummary() {
  return getDashboardData().then((data) => data.expiryTimeline);
}

export function getAnalytics({ from, to } = {}) {
  return request(`/analytics${queryString({ from, to })}`);
}

export function getMedicines(params) {
  return request(`/medicines${queryString(params)}`);
}

export function getMedicineById(id) {
  return request(`/medicines/${encodeURIComponent(id)}`);
}

export function createMedicine(data) {
  return request("/medicines", { method: "POST", body: JSON.stringify(data) });
}

export function updateMedicine(id, data) {
  return request(`/medicines/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteMedicine(id) {
  return request(`/medicines/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getBatches(params) {
  return request(`/batches${queryString(params)}`);
}

export function getBatchById(id) {
  return request(`/batches/${encodeURIComponent(id)}`);
}

export function getBatchesByMedicine(medicineId) {
  return getBatches({ medicineId, limit: 100 });
}

export function createBatch(data) {
  return request("/batches", { method: "POST", body: JSON.stringify(data) });
}

export function updateBatch(id, data) {
  return request(`/batches/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteBatch(id) {
  return request(`/batches/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getSuppliers(params) {
  return request(`/suppliers${queryString(params)}`);
}

export function getSupplierById(id) {
  return request(`/suppliers/${encodeURIComponent(id)}`);
}

export function createSupplier(data) {
  return request("/suppliers", { method: "POST", body: JSON.stringify(data) });
}

export function updateSupplier(id, data) {
  return request(`/suppliers/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteSupplier(id) {
  return request(`/suppliers/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getPurchases(params) {
  return request(`/purchases${queryString(params)}`);
}

export function getPurchaseById(id) {
  return request(`/purchases/${encodeURIComponent(id)}`);
}

export function createPurchase(data) {
  return request("/purchases", { method: "POST", body: JSON.stringify(data) });
}

export function getSales(params) {
  return request(`/sales${queryString(params)}`);
}

export function getSaleById(id) {
  return request(`/sales/${encodeURIComponent(id)}`);
}

export function createSale(data) {
  return request("/sales", { method: "POST", body: JSON.stringify(data) });
}

export function refundSale(id) {
  return request(`/sales/${encodeURIComponent(id)}/refund`, { method: "POST" });
}

export function getUsers() {
  return request("/users");
}

export function getUserById(id) {
  return getUsers().then((users) => users.find((user) => user.id === id) || null);
}

export function createUser(data) {
  return request("/users", { method: "POST", body: JSON.stringify(data) });
}

export function updateUser(id, data) {
  return request(`/users/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function getNotifications(params) {
  return request(`/notifications${queryString(params)}`);
}

export function markNotificationRead(id) {
  return request(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
}

export function search(query) {
  return request(`/search${queryString({ q: query })}`);
}

export function getReport(type, params) {
  return request(`/reports${queryString({ type, ...params })}`);
}

export function getAuditLogs(params) {
  return request(`/audit-logs${queryString(params)}`);
}
