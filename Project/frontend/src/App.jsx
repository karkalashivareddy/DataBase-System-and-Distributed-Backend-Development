import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import MedicineDetails from "./pages/MedicineDetails";
import Batches from "./pages/Batches";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/medicines" element={<AppLayout />}>
        <Route index element={<Medicines />} />
        <Route path=":id" element={<MedicineDetails />} />
      </Route>
      <Route path="/batches" element={<AppLayout />}>
        <Route index element={<Batches />} />
      </Route>
      <Route path="/suppliers" element={<AppLayout />}>
        <Route index element={<Suppliers />} />
      </Route>
      <Route path="/purchases" element={<AppLayout />}>
        <Route index element={<Purchases />} />
      </Route>
      <Route path="/sales" element={<AppLayout />}>
        <Route index element={<Sales />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
