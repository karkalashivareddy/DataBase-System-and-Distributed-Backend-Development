import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    batchNo: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 80 },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true, index: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
    manufactureDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0, default: 0, validate: { validator: Number.isInteger, message: "Quantity must be an integer" } },
    costPerUnit: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

batchSchema.virtual("status").get(function getStatus() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(this.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const days = Math.round((expiry - today) / 86400000);
  if (days < 0) return "Expired";
  if (this.quantity <= 0) return "Depleted";
  if (days <= 30) return "Near Expiry";
  return "Active";
});

batchSchema.pre("validate", function validateDates(next) {
  if (this.expiryDate && this.manufactureDate && this.expiryDate <= this.manufactureDate) {
    next(new Error("Expiry date must be after the manufacture date"));
    return;
  }
  next();
});

batchSchema.index({ expiryDate: 1, quantity: 1 });
batchSchema.index({ medicine: 1, expiryDate: 1, quantity: 1 });

export default mongoose.models.Batch || mongoose.model("Batch", batchSchema);
