import mongoose from 'mongoose';

const PendingSchema = new mongoose.Schema({
  srNo: {
    type: String,
    required: true,
    unique: true,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  qtyPending: {
    type: Number,
    required: true,
    min: 1,
  },
  shipment: {
    type: String,
    enum: ['Import', 'Local Purchase'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Not Urgent', 'Urgent', 'Critical'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Received', 'Shipped', 'Partially Shipped', 'Enroute'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

export default mongoose.models.Pending || mongoose.model('Pending', PendingSchema);