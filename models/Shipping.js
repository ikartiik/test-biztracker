import mongoose from 'mongoose';

const ShippingSchema = new mongoose.Schema({
  srNo: { type: Number, unique: true },
  serialNumber: { type: String },
  sourceId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'sourceModel' },
  sourceModel: { type: String, enum: ['Import', 'Purchase'], required: true },
  itemDescription: { type: String, required: true },
  totalQuantity: { type: Number, min: 0 },
  quantityShipped: { type: Number, min: 0, default: 0 },
  quantityRemaining: { type: Number, min: 0 },
  shipmentEntries: [{
    quantityShipped: { type: Number, min: 0 },
    dateOfShipping: { type: Date, default: Date.now },
    remarks: { type: String }
  }],
  source: { type: String },
  status: { type: String, enum: ['Pending', 'Shipped'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' }
}, { timestamps: true });

ShippingSchema.pre('save', async function(next) {
  if (!this.srNo || this.isNew) {
    const last = await this.constructor.findOne().sort({ srNo: -1 });
    this.srNo = last ? last.srNo + 1 : 1;
  }
  
  if (!this.serialNumber && this.srNo) {
    this.serialNumber = `SH-${String(this.srNo).padStart(4, '0')}`;
  }
  
  this.quantityShipped = this.shipmentEntries.reduce((total, entry) => total + entry.quantityShipped, 0);
  this.quantityRemaining = this.totalQuantity - this.quantityShipped;
  
  next();
});

export default mongoose.models.Shipping || mongoose.model('Shipping', ShippingSchema);

