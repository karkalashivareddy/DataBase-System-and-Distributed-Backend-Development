import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Medicine from "../models/Medicine.js";
import Supplier from "../models/Supplier.js";
import Batch from "../models/Batch.js";
import Purchase from "../models/Purchase.js";
import Sale from "../models/Sale.js";

// ---------------------------------------------------------------------------
// DEVELOPMENT SEED SCRIPT
// Populates `pharma_stock_management` with demo data derived from the React
// frontend's existing mock data. This is INTENDED FOR DEVELOPMENT / DEMO ONLY.
// It is idempotent: it clears the seed collections first, then re-inserts.
// Passwords are stored as bcrypt hashes, never plaintext.
// ---------------------------------------------------------------------------

const COLLECTIONS = [
  "users",
  "medicines",
  "suppliers",
  "batches",
  "purchases",
  "sales",
  "notifications",
  "auditlogs",
  "inventoryadjustments",
];

async function clearCollections() {
  await Promise.all(
    COLLECTIONS.map((c) => mongoose.connection.db.collection(c).deleteMany({}))
  );
  console.log("Cleared existing seed collections");
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmt(d) {
  return d.toISOString().slice(0, 10);
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

async function seedCore() {
  const commonPassword = process.env.SEED_PASSWORD;
  if (!commonPassword || commonPassword.length < 8) throw new Error("SEED_PASSWORD must be set to a value of at least 8 characters");
  const hash = await bcrypt.hash(commonPassword, 10);

  const users = await User.insertMany([
    {
      name: "Karkala Shiva Reddy",
      email: "karkala@pharmastock.in",
      password: hash,
      role: "Admin",
      phone: "+91 99999 00001",
      status: "Active",
      joined: "2025-01-10",
    },
    {
      name: "Paripalli Navadeep",
      email: "navadeep@pharmastock.in",
      password: hash,
      role: "Inventory Manager",
      phone: "+91 99999 00002",
      status: "Active",
      joined: "2025-02-01",
    },
    {
      name: "Dr. R. Sateesh Kumar",
      email: "sateesh@pharmastock.in",
      password: hash,
      role: "Viewer",
      phone: "+91 99999 00003",
      status: "Active",
      joined: "2025-03-12",
    },
    {
      name: "Priya Nair",
      email: "priya@pharmastock.in",
      password: hash,
      role: "Pharmacist",
      phone: "+91 99999 00004",
      status: "Active",
      joined: "2025-04-05",
    },
    {
      name: "Arjun Reddi",
      email: "arjun@pharmastock.in",
      password: hash,
      role: "Sales Staff",
      phone: "+91 99999 00005",
      status: "Inactive",
      joined: "2025-05-20",
    },
    {
      name: "PharmaStock Admin",
      email: "admin@pharmastock.in",
      password: hash,
      role: "Admin",
      phone: "+91 99999 00000",
      status: "Active",
      joined: "2025-01-05",
    },
  ]);
  console.log(`Users: ${users.length} inserted`);

  // ---------- Medicines ----------
  const medicines = await Medicine.insertMany([
    { name: "Paracetamol 500mg", generic: "Acetaminophen", category: "Analgesics", manufacturer: "Sun Pharma", dosage: "500 mg tab", unitPrice: 2.4, reorderLevel: 200 },
    { name: "Azithromycin 500mg", generic: "Azithromycin", category: "Antibiotics", manufacturer: "Cipla", dosage: "500 mg tab", unitPrice: 21.5, reorderLevel: 150 },
    { name: "Amoxicillin 500mg", generic: "Amoxicillin", category: "Antibiotics", manufacturer: "Cadila", dosage: "500 mg cap", unitPrice: 9.8, reorderLevel: 180 },
    { name: "Metformin 500mg", generic: "Metformin HCl", category: "Diabetes", manufacturer: "USV", dosage: "500 mg tab", unitPrice: 3.2, reorderLevel: 220 },
    { name: "Atorvastatin 20mg", generic: "Atorvastatin Calcium", category: "Cardiovascular", manufacturer: "Lupin", dosage: "20 mg tab", unitPrice: 12.0, reorderLevel: 140 },
    { name: "Pantoprazole 40mg", generic: "Pantoprazole Sodium", category: "Gastrointestinal", manufacturer: "Alkem", dosage: "40 mg tab", unitPrice: 8.5, reorderLevel: 160 },
    { name: "Cetirizine 10mg", generic: "Cetirizine HCl", category: "Antihistamine", manufacturer: "Dr. Reddy's", dosage: "10 mg tab", unitPrice: 1.9, reorderLevel: 200 },
    { name: "Amlodipine 5mg", generic: "Amlodipine Besylate", category: "Cardiovascular", manufacturer: "Torrent", dosage: "5 mg tab", unitPrice: 4.6, reorderLevel: 180 },
    { name: "Insulin Glargine 100IU", generic: "Insulin Glargine", category: "Diabetes", manufacturer: "Sanofi", dosage: "3 mL pen", unitPrice: 540.0, reorderLevel: 60 },
    { name: "Vitamin D3 60k IU", generic: "Cholecalciferol", category: "Vitamins & Supplements", manufacturer: "Zuventus", dosage: "60k IU tab", unitPrice: 18.0, reorderLevel: 120 },
    { name: "Ambroxol 30mg", generic: "Ambroxol HCl", category: "Respiratory", manufacturer: "Mankind", dosage: "30 mg tab", unitPrice: 3.5, reorderLevel: 150 },
    { name: "Diclofenac 50mg", generic: "Diclofenac Sodium", category: "Analgesics", manufacturer: "Novartis", dosage: "50 mg tab", unitPrice: 2.2, reorderLevel: 170 },
  ]);
  console.log(`Medicines: ${medicines.length} inserted`);

  // ---------- Suppliers ----------
  const suppliers = await Supplier.insertMany([
    { name: "MediCore Distributors", contact: "Rahul Sharma", email: "sales@medicore.in", phone: "+91 98120 11442", status: "Active" },
    { name: "PharmaLink Trading", contact: "Anita Desai", email: "orders@pharmalink.in", phone: "+91 99870 23551", status: "Active" },
    { name: "HealthBridge Supplies", contact: "Karan Mehta", email: "contact@healthbridge.in", phone: "+91 99200 88473", status: "Active" },
    { name: "MedAxis Pharma", contact: "Sneha Rao", email: "info@medaxis.in", phone: "+91 98450 66238", status: "On Hold" },
    { name: "GlobalMed Traders", contact: "Vikram Singh", email: "buy@globalmed.in", phone: "+91 97690 77120", status: "Active" },
  ]);
  console.log(`Suppliers: ${suppliers.length} inserted`);

  // ---------- Batches ----------
  const expiryOffsets = [90, 320, 18, 400, 6, 300, 12, 45, 14, 25, 3, 75];
  const quantities = [3200, 1620, 120, 860, 380, 2650, 210, 940, 320, 1560, 45, 780];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  const batchDocs = medicines.map((m, i) => {
    const batchNo = `${m.name.split(" ")[0].slice(0, 3).toUpperCase()}-${2400 + i}`;
    return {
      batchNo,
      medicine: m._id,
      supplier: suppliers[i % suppliers.length]._id,
      manufactureDate: fmt(addDays(base, -30 - i * 40)),
      expiryDate: fmt(addDays(base, expiryOffsets[i])),
      quantity: quantities[i],
      costPerUnit: Math.round(m.unitPrice * 0.85 * 100) / 100,
    };
  });

  const batches = await Batch.insertMany(batchDocs);
  console.log(`Batches: ${batches.length} inserted`);

  // ---------- Purchases ----------
  const purchaseStatuses = ["Paid", "Paid", "Partially Paid", "Paid", "Paid", "Pending"];
  const purchaseQtys = [500, 800, 1000, 300, 600, 1200, 400, 750];

  const purchaseDocs = Array.from({ length: 18 }, (_, i) => {
    const medicine = medicines[i % medicines.length];
    const batch = batches[i % batches.length];
    const quantity = purchaseQtys[i % purchaseQtys.length];
    const unitCost = Math.round(medicine.unitPrice * 0.82 * 100) / 100;
    return {
      purchaseNo: `PO-2025-${String(1000 + i)}`,
      supplier: suppliers[i % suppliers.length]._id,
      medicine: medicine._id,
      batch: batch._id,
      quantity,
      unitCost,
      total: roundMoney(quantity * unitCost),
      paidAmount: purchaseStatuses[i % purchaseStatuses.length] === "Paid" ? roundMoney(quantity * unitCost) : purchaseStatuses[i % purchaseStatuses.length] === "Partially Paid" ? roundMoney(quantity * unitCost * 0.5) : 0,
      date: fmt(addDays(base, -i * 9)),
      status: purchaseStatuses[i % purchaseStatuses.length],
      createdBy: users[i % users.length]._id,
    };
  });
  const purchases = await Purchase.insertMany(purchaseDocs);
  console.log(`Purchases: ${purchases.length} inserted`);

  // ---------- Sales ----------
  const saleQtys = [60, 120, 40, 210, 95, 150, 75, 12];

  const saleDocs = Array.from({ length: 20 }, (_, i) => {
    const medicine = medicines[i % medicines.length];
    const batch = batches[i % batches.length];
    const quantity = saleQtys[i % saleQtys.length];
    return {
      saleNo: `INV-2025-${String(5000 + i)}`,
      medicine: medicine._id,
      batch: batch._id,
      allocations: [{ batch: batch._id, batchNo: batch.batchNo, quantity, unitCost: batch.costPerUnit }],
      quantity,
      unitPrice: medicine.unitPrice,
      total: roundMoney(quantity * medicine.unitPrice),
      customer: ["City Meds", "LifeCare Pharmacy", "Apollo Retail", "Wellness Plus", "CarePoint Distributors", "Walk-in"][i % 6],
      date: fmt(addDays(base, -i * 6)),
      status: i % 9 === 0 ? "Refunded" : "Completed",
      createdBy: users[i % users.length]._id,
    };
  });
  const sales = await Sale.insertMany(saleDocs);
  console.log(`Sales: ${sales.length} inserted`);
}

export async function runSeed() {
  try {
    if (process.env.SEED_CONFIRM !== "RESET" && !process.argv.includes("--force")) {
      throw new Error("Refusing to clear existing data. Set SEED_CONFIRM=RESET or pass --force explicitly.");
    }
    console.log("Connecting to MongoDB...");
    await connectDB();
    await clearCollections();
    await seedCore();
    console.log("\nSeed complete.");
    console.log("Expected collection counts:");
    console.log("  users      6");
    console.log("  medicines 12");
    console.log("  suppliers  5");
    console.log("  batches   12");
    console.log("  purchases 18");
    console.log("  sales     20");
  } catch (err) {
    console.error("\nSeed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

// Run directly: `npm run seed`
if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  await runSeed();
}
