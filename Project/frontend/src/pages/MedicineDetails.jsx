import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as api from "../services/api";
import MedicineDetails from "../components/medicines/MedicineDetails";
import LoadingState from "../components/common/LoadingState";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    api.getMedicineById(id).then((m) => {
      setMedicine(m);
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) return <LoadingState rows={4} />;

  if (!medicine) {
    return (
      <EmptyState title="Medicine not found" subtitle="The medicine you're looking for doesn't exist.">
        <Button variant="ghost" onClick={() => navigate("/medicines")}>Back to Medicines</Button>
      </EmptyState>
    );
  }

  return <MedicineDetails medicine={medicine} />;
}
