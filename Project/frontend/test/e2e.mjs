import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const root = "C:/Users/karka/DataBase-System-and-Distributed-Backend-Development/Project";
const backendDir = `${root}/backend`;
const frontendDir = `${root}/frontend`;
const apiPort = 5011;
const webPort = 5174;
const apiBase = `http://127.0.0.1:${apiPort}/api`;
const webBase = `http://127.0.0.1:${webPort}`;
const password = process.env.E2E_PASSWORD;
const mongoUri = process.env.E2E_MONGODB_URI;

if (!password || !mongoUri) throw new Error("E2E_PASSWORD and E2E_MONGODB_URI are required");

const backend = spawn(process.execPath, ["src/server.js"], {
  cwd: backendDir,
  env: { ...process.env, PORT: String(apiPort), MONGODB_URI: mongoUri, JWT_SECRET: "e2e-only-secret-with-at-least-32-characters", CLIENT_ORIGIN: webBase },
  stdio: ["ignore", "pipe", "pipe"],
});
const frontend = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(webPort)], {
  cwd: frontendDir,
  env: { ...process.env, VITE_API_URL: apiBase },
  stdio: ["ignore", "pipe", "pipe"],
  shell: process.platform === "win32",
});
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const passedChecks = [];
let browser;
let failedCheck = "";

function pass(name) {
  passedChecks.push(name);
  console.log(`PASS ${name}`);
}

async function waitForServer(url, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      if (backend.exitCode !== null || frontend.exitCode !== null) throw new Error("A server exited before becoming ready");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function api(path, options = {}) {
  const response = await fetch(apiBase + path, options);
  const body = await response.json();
  if (!response.ok || body.success === false) throw new Error(`${path} ${response.status} ${JSON.stringify(body)}`);
  return body.data;
}

function auth(token, json = false) {
  return { ...(json ? { "Content-Type": "application/json" } : {}), Authorization: `Bearer ${token}` };
}

function day(offset) {
  const value = new Date();
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}

async function waitForOption(select, value) {
  await select.locator(`option[value="${value}"]`).waitFor({ state: "attached" });
}

async function waitForApi(page, predicate, action) {
  const responsePromise = page.waitForResponse(predicate, { timeout: 10000 });
  await action();
  const response = await responsePromise;
  assert.equal(response.status(), 200);
  return response.json();
}

async function loginPage(page, email) {
  await page.goto(`${webBase}/login`);
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await page.waitForURL("**/dashboard");
}

async function main() {
  await waitForServer(`${apiBase}/health`);
  await waitForServer(webBase);
  const login = await api("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@pharmastock.in", password }) });
  const supplier = await api("/suppliers", { method: "POST", headers: auth(login.token, true), body: JSON.stringify({ name: `E2E Supplier ${suffix}`, contact: "E2E Tester", status: "Active" }) });
  const medicine = await api("/medicines", { method: "POST", headers: auth(login.token, true), body: JSON.stringify({ name: `E2E Medicine ${suffix}`, generic: "E2E Generic", category: "Other", manufacturer: "E2E Manufacturer", unitPrice: 5, reorderLevel: 1 }) });
  const batchA = await api("/batches", { method: "POST", headers: auth(login.token, true), body: JSON.stringify({ medicineId: medicine.id, supplierId: supplier.id, batchNo: `E2E-A-${suffix}`, manufactureDate: day(-20), expiryDate: day(30), quantity: 100, costPerUnit: 2 }) });
  const batchB = await api("/batches", { method: "POST", headers: auth(login.token, true), body: JSON.stringify({ medicineId: medicine.id, supplierId: supplier.id, batchNo: `E2E-B-${suffix}`, manufactureDate: day(-20), expiryDate: day(90), quantity: 200, costPerUnit: 3 }) });
  const purchaseBatch = await api("/batches", { method: "POST", headers: auth(login.token, true), body: JSON.stringify({ medicineId: medicine.id, supplierId: supplier.id, batchNo: `E2E-P-${suffix}`, manufactureDate: day(-20), expiryDate: day(120), quantity: 10, costPerUnit: 2 }) });
  const expiredMedicine = await api("/medicines", { method: "POST", headers: auth(login.token, true), body: JSON.stringify({ name: `E2E Expired ${suffix}`, generic: "E2E Expired Generic", category: "Other", manufacturer: "E2E Manufacturer", unitPrice: 1, reorderLevel: 1 }) });
  const expiredBatch = await api("/batches", { method: "POST", headers: auth(login.token, true), body: JSON.stringify({ medicineId: expiredMedicine.id, supplierId: supplier.id, batchNo: `E2E-EXPIRED-${suffix}`, manufactureDate: day(-60), expiryDate: day(-1), quantity: 500, costPerUnit: 1 }) });

  browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const consoleErrors = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error" && !/status of 409/.test(message.text())) consoleErrors.push(message.text()); });

  const dashboardResponse = page.waitForResponse((response) => response.url().includes("/api/dashboard") && response.request().method() === "GET");
  await loginPage(page, "admin@pharmastock.in");
  const dashboardBody = await dashboardResponse;
  assert.equal(dashboardBody.status(), 200);
  assert.ok((await dashboardBody.json()).data.kpis);
  await page.getByText("Total Medicines", { exact: true }).waitFor();
  await page.getByText("Sales Trend", { exact: true }).waitFor();
  pass("Login");
  pass("Dashboard");

  await page.getByRole("link", { name: "Medicines", exact: true }).click();
  await page.waitForURL("**/medicines");
  await page.getByPlaceholder("Search medicines...").fill(medicine.name);
  await page.getByText(medicine.name, { exact: true }).first().waitFor();
  await page.getByText(medicine.name, { exact: true }).first().click();
  await page.waitForURL(`**/medicines/${medicine.id}`);
  await page.getByText(medicine.generic, { exact: false }).first().waitFor();
  pass("Medicines");

  await page.getByRole("link", { name: "Medicines", exact: true }).click();
  await page.getByRole("link", { name: "Suppliers", exact: true }).click();
  await page.waitForURL("**/suppliers");
  await page.getByPlaceholder("Search suppliers...").fill(supplier.name);
  await page.getByText(supplier.name, { exact: true }).first().click();
  await page.getByRole("dialog", { name: supplier.name }).waitFor({ state: "visible" });
  await page.getByRole("dialog", { name: supplier.name }).getByText("Contact", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Close dialog" }).click();
  pass("Suppliers");

  await page.getByRole("link", { name: "Batches", exact: true }).click();
  await page.waitForURL("**/batches");
  await page.getByPlaceholder("Search batch or medicine...").fill(batchA.batchNo);
  const batchRow = page.getByRole("row").filter({ hasText: batchA.batchNo });
  await batchRow.getByText("100", { exact: true }).waitFor();
  await page.getByRole("link", { name: "Expiry", exact: true }).click();
  await page.waitForURL("**/expiry");
  await page.getByPlaceholder("Search batch or medicine...").fill(expiredBatch.batchNo);
  const expiredRow = page.getByRole("row").filter({ hasText: expiredBatch.batchNo });
  await expiredRow.getByText("Expired", { exact: true }).first().waitFor();
  pass("Batches");

  await page.getByRole("link", { name: "Purchases", exact: true }).click();
  await page.waitForURL("**/purchases");
  await page.getByTestId("purchase-create").click();
  const purchaseDialog = page.getByRole("dialog", { name: "Record Purchase" });
  await purchaseDialog.waitFor({ state: "visible" });
  const purchaseMedicine = purchaseDialog.getByTestId("transaction-medicine");
  await waitForOption(purchaseMedicine, medicine.id);
  await purchaseMedicine.selectOption(medicine.id);
  const purchaseBatchSelect = purchaseDialog.getByTestId("transaction-batch");
  await waitForOption(purchaseBatchSelect, purchaseBatch.id);
  await purchaseBatchSelect.selectOption(purchaseBatch.id);
  const purchaseSupplier = purchaseDialog.getByTestId("transaction-supplier");
  await waitForOption(purchaseSupplier, supplier.id);
  await purchaseSupplier.selectOption(supplier.id);
  await purchaseDialog.getByTestId("transaction-quantity").fill("5");
  await purchaseDialog.getByTestId("transaction-unit-price").fill("2");
  await purchaseDialog.getByTestId("transaction-submit").click();
  await purchaseDialog.waitFor({ state: "hidden" });
  const purchases = await api(`/purchases?medicineId=${medicine.id}`, { headers: auth(login.token) });
  assert.ok(purchases.some((row) => row.batchId === purchaseBatch.id && row.quantity === 5));
  const purchasedBatch = (await api("/batches", { headers: auth(login.token) })).find((row) => row.id === purchaseBatch.id);
  assert.equal(purchasedBatch.quantity, 15);
  pass("Purchase");

  await page.getByRole("link", { name: "Sales", exact: true }).click();
  await page.waitForURL("**/sales");
  await page.getByTestId("sale-create").click();
  const saleDialog = page.getByRole("dialog", { name: "Record Sale" });
  await saleDialog.waitFor({ state: "visible" });
  const saleMedicine = saleDialog.getByTestId("transaction-medicine");
  await waitForOption(saleMedicine, medicine.id);
  await saleMedicine.selectOption(medicine.id);
  await saleDialog.getByTestId("transaction-customer").fill("E2E Customer");
  await saleDialog.getByTestId("transaction-quantity").fill("150");
  await saleDialog.getByTestId("transaction-submit").click();
  await saleDialog.waitFor({ state: "hidden" });
  const sales = await api("/sales", { headers: auth(login.token) });
  const sale = sales.find((row) => row.customer === "E2E Customer" && row.medicineId === medicine.id);
  assert.ok(sale);
  assert.deepEqual(sale.allocations.map((allocation) => [allocation.batchNo, allocation.quantity]), [[batchA.batchNo, 100], [batchB.batchNo, 50]]);
  const postSaleBatches = await api("/batches", { headers: auth(login.token) });
  assert.equal(postSaleBatches.find((row) => row.id === batchA.id).quantity, 0);
  assert.equal(postSaleBatches.find((row) => row.id === batchB.id).quantity, 150);
  assert.equal(postSaleBatches.find((row) => row.id === expiredBatch.id).quantity, 500);
  pass("Sale");
  pass("FEFO");

  const beforeInsufficient = await api("/batches", { headers: auth(login.token) });
  await page.getByTestId("sale-create").click();
  const insufficientDialog = page.getByRole("dialog", { name: "Record Sale" });
  await insufficientDialog.getByTestId("transaction-medicine").selectOption(medicine.id);
  await insufficientDialog.getByTestId("transaction-customer").fill("E2E Insufficient");
  await insufficientDialog.getByTestId("transaction-quantity").fill("999999");
  await insufficientDialog.getByTestId("transaction-submit").click();
  await page.getByRole("status").filter({ hasText: "Insufficient available stock" }).waitFor();
  await insufficientDialog.getByTestId("transaction-cancel").click();
  const afterInsufficient = await api("/batches", { headers: auth(login.token) });
  assert.deepEqual(afterInsufficient.map((row) => [row.id, row.quantity]), beforeInsufficient.map((row) => [row.id, row.quantity]));
  pass("Insufficient stock");

  await page.getByTestId("sale-create").click();
  const expiredDialog = page.getByRole("dialog", { name: "Record Sale" });
  const expiredSaleMedicine = expiredDialog.getByTestId("transaction-medicine");
  await waitForOption(expiredSaleMedicine, expiredMedicine.id);
  await expiredSaleMedicine.selectOption(expiredMedicine.id);
  await expiredDialog.getByTestId("transaction-customer").fill("E2E Expired");
  await expiredDialog.getByTestId("transaction-quantity").fill("1");
  await expiredDialog.getByTestId("transaction-submit").click();
  await page.getByRole("status").filter({ hasText: "Insufficient available stock" }).waitFor();
  await expiredDialog.getByTestId("transaction-cancel").click();
  assert.equal((await api("/batches", { headers: auth(login.token) })).find((row) => row.id === expiredBatch.id).quantity, 500);
  pass("Expired stock");

  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await page.waitForURL("**/analytics");
  await page.getByTestId("analytics-revenue").waitFor();
  await page.getByTestId("analytics-cogs").waitFor();
  await page.getByTestId("analytics-gross-profit").waitFor();
  await page.getByTestId("analytics-gross-margin").waitFor();
  const rangeValues = [];
  for (const range of ["7D", "30D", "90D", "6M", "1Y"]) {
    const body = await waitForApi(page, (response) => response.url().includes("/api/analytics") && response.url().includes("from="), () => page.getByTestId(`analytics-range-${range}`).click());
    assert.ok(body.data.summary);
    rangeValues.push(body.data.summary.revenue);
  }
  assert.ok(new Set(rangeValues).size > 1);
  pass("Analytics");

  await page.getByRole("link", { name: "Reports", exact: true }).click();
  await page.waitForURL("**/reports");
  const reportTypes = [["Sales Report", "sales"], ["Inventory Report", "inventory"], ["Purchase Report", "purchase"], ["Expiry Report", "expiry"], ["Low Stock Report", "low-stock"], ["Supplier Report", "supplier"]];
  for (const [label] of reportTypes) {
    await page.getByTestId("report-type").selectOption({ label });
    await page.getByTestId("report-generate").click();
    await page.getByText(`${label} — Preview`, { exact: true }).waitFor();
  }
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("report-export").click();
  const download = await downloadPromise;
  assert.ok(download.suggestedFilename().endsWith(".csv"));
  pass("Reports");

  const viewerContext = await browser.newContext();
  const viewerPage = await viewerContext.newPage();
  await loginPage(viewerPage, "sateesh@pharmastock.in");
  await viewerPage.getByRole("link", { name: "Purchases", exact: true }).click();
  await viewerPage.waitForURL("**/purchases");
  assert.equal(await viewerPage.getByTestId("purchase-create").count(), 0);
  const viewerForbiddenStatus = await viewerPage.evaluate(async () => {
    const token = window.localStorage.getItem("pharmastock.token");
    const response = await fetch("http://127.0.0.1:5011/api/purchases", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: "{}" });
    return response.status;
  });
  assert.equal(viewerForbiddenStatus, 403);
  await viewerContext.close();
  pass("RBAC");

  await page.getByTestId("account-menu").click();
  await page.getByTestId("logout").click();
  await page.waitForURL("**/login");
  await page.goto(`${webBase}/dashboard`);
  await page.waitForURL("**/login");
  pass("Logout");
  assert.equal(consoleErrors.length, 0, consoleErrors.join("\n"));
  console.log(`TOTAL TESTS ${passedChecks.length + 1}`);
  console.log(`PASSED ${passedChecks.length}`);
  console.log("FAILED 0");
  console.log("Browser E2E VERIFIED: YES");
}

try {
  await main();
} catch (error) {
  failedCheck = error instanceof Error ? error.message : String(error);
  console.error(`FAILED ${failedCheck}`);
  console.log(`TOTAL TESTS ${passedChecks.length + 1}`);
  console.log(`PASSED ${passedChecks.length}`);
  console.log("FAILED 1");
  console.log("Browser E2E VERIFIED: NO");
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  backend.kill();
  frontend.kill();
}
