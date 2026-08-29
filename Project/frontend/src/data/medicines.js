// Mock medicine catalogue. Dates for batches are generated relative to "today"
// so expiry statuses stay realistic regardless of when the demo is run.
export const medicines = [
  { id: "med-001", name: "Paracetamol 500mg", generic: "Acetaminophen", category: "Analgesics", manufacturer: "Sun Pharma", dosage: "500 mg tab", unitPrice: 2.4, reorderLevel: 200, stock: 4820 },
  { id: "med-002", name: "Azithromycin 500mg", generic: "Azithromycin", category: "Antibiotics", manufacturer: "Cipla", dosage: "500 mg tab", unitPrice: 21.5, reorderLevel: 150, stock: 980 },
  { id: "med-003", name: "Amoxicillin 500mg", generic: "Amoxicillin", category: "Antibiotics", manufacturer: "Cadila", dosage: "500 mg cap", unitPrice: 9.8, reorderLevel: 180, stock: 1250 },
  { id: "med-004", name: "Metformin 500mg", generic: "Metformin HCl", category: "Diabetes", manufacturer: "USV", dosage: "500 mg tab", unitPrice: 3.2, reorderLevel: 220, stock: 2650 },
  { id: "med-005", name: "Atorvastatin 20mg", generic: "Atorvastatin Calcium", category: "Cardiovascular", manufacturer: "Lupin", dosage: "20 mg tab", unitPrice: 12.0, reorderLevel: 140, stock: 1120 },
  { id: "med-006", name: "Pantoprazole 40mg", generic: "Pantoprazole Sodium", category: "Gastrointestinal", manufacturer: "Alkem", dosage: "40 mg tab", unitPrice: 8.5, reorderLevel: 160, stock: 940 },
  { id: "med-007", name: "Cetirizine 10mg", generic: "Cetirizine HCl", category: "Antihistamine", manufacturer: "Dr. Reddy's", dosage: "10 mg tab", unitPrice: 1.9, reorderLevel: 200, stock: 320 },
  { id: "med-008", name: "Amlodipine 5mg", generic: "Amlodipine Besylate", category: "Cardiovascular", manufacturer: "Torrent", dosage: "5 mg tab", unitPrice: 4.6, reorderLevel: 180, stock: 1560 },
  { id: "med-009", name: "Insulin Glargine 100IU", generic: "Insulin Glargine", category: "Diabetes", manufacturer: "Sanofi", dosage: "3 mL pen", unitPrice: 540.0, reorderLevel: 60, stock: 45 },
  { id: "med-010", name: "Vitamin D3 60k IU", generic: "Cholecalciferol", category: "Vitamins & Supplements", manufacturer: "Zuventus", dosage: "60k IU tab", unitPrice: 18.0, reorderLevel: 120, stock: 780 },
  { id: "med-011", name: "Ambroxol 30mg", generic: "Ambroxol HCl", category: "Respiratory", manufacturer: "Mankind", dosage: "30 mg tab", unitPrice: 3.5, reorderLevel: 150, stock: 210 },
  { id: "med-012", name: "Diclofenac 50mg", generic: "Diclofenac Sodium", category: "Analgesics", manufacturer: "Novartis", dosage: "50 mg tab", unitPrice: 2.2, reorderLevel: 170, stock: 640 },
];

export const suppliers = [
  { id: "sup-001", name: "MediCore Distributors", contact: "Rahul Sharma", email: "sales@medicore.in", phone: "+91 98120 11442", medicinesSupplied: 14, outstanding: 245000, status: "Active" },
  { id: "sup-002", name: "PharmaLink Trading", contact: "Anita Desai", email: "orders@pharmalink.in", phone: "+91 99870 23551", medicinesSupplied: 22, outstanding: 0, status: "Active" },
  { id: "sup-003", name: "HealthBridge Supplies", contact: "Karan Mehta", email: "contact@healthbridge.in", phone: "+91 99200 88473", medicinesSupplied: 11, outstanding: 89000, status: "Active" },
  { id: "sup-004", name: "MedAxis Pharma", contact: "Sneha Rao", email: "info@medaxis.in", phone: "+91 98450 66238", medicinesSupplied: 9, outstanding: 0, status: "On Hold" },
  { id: "sup-005", name: "GlobalMed Traders", contact: "Vikram Singh", email: "buy@globalmed.in", phone: "+91 97690 77120", medicinesSupplied: 17, outstanding: 132000, status: "Active" },
];
