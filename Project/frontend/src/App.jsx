import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import MedicineDetails from "./pages/MedicineDetails";
import Batches from "./pages/Batches";
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
