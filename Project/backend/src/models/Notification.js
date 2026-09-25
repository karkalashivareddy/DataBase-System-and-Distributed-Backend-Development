import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ["low", "expiry", "expired", "system", "sale", "purchase"], index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    entityType: { type: String, trim: true, maxlength: 40 },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    read: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
