export const users = [
  {
    id: "usr-001",
    name: "Karkala Shiva Reddy",
    email: "karkala@pharmastock.in",
    role: "Admin",
    phone: "+91 99999 00001",
    status: "Active",
    joined: "2025-01-10",
    avatar: "KS",
  },
  {
    id: "usr-002",
    name: "Paripalli Navadeep",
    email: "navadeep@pharmastock.in",
    role: "Inventory Manager",
    phone: "+91 99999 00002",
    status: "Active",
    joined: "2025-02-01",
    avatar: "PN",
  },
  {
    id: "usr-003",
    name: "Dr. Sateesh Kumar",
    email: "sateesh@pharmastock.in",
    role: "Viewer",
    phone: "+91 99999 00003",
    status: "Active",
    joined: "2025-03-12",
    avatar: "SK",
  },
  {
    id: "usr-004",
    name: "Priya Nair",
    email: "priya@pharmastock.in",
    role: "Pharmacist",
    phone: "+91 99999 00004",
    status: "Active",
    joined: "2025-04-05",
    avatar: "PN",
  },
  {
    id: "usr-005",
    name: "Arjun Reddi",
    email: "arjun@pharmastock.in",
    role: "Sales Staff",
    phone: "+91 99999 00005",
    status: "Inactive",
    joined: "2025-05-20",
    avatar: "AR",
  },
];

export const currentUser = users[0];

// Demo credentials for the login screen. This is a frontend-only demo and
// must never be treated as real security.
export const demoCredentials = {
  email: "admin@pharmastock.in",
  password: "pharma123",
  user: currentUser,
};
