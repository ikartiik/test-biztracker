import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  company: { type: String, required: true, unique: true },
  salespersonName: { type: String, required: true },
  contact: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);
