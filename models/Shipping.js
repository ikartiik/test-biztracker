import mongoose from 'mongoose';

const ShipmentEntrySchema = new mongoose.Schema({
  quantityShipped: {
    type: Number,
    required: true,
    min: 1,
  },
  dateOfShipping: {
    type: Date,
    required: true,
  },
  remarks: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const ShippingSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    unique: true,
  },
  serialNumber: {
    type: String,
    unique: true,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 1,
  },
  quantityShipped: {
    type: Number,
    default: 0,
    min: 0,
  },
  quantityRemaining: {
    type: Number,
    default: function() {
      return this.totalQuantity - this.quantityShipped;
    },
  },
  source: {
    type: String,
    enum: ['Import', 'Local Purchase'],
    required: true,
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'sourceModel',
  },
  sourceModel: {
    type: String,
    required: true,
    enum: ['Import', 'Purchase'],
  },
  sourceSerialNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Not Shipped', 'Partially Shipped', 'Shipped'],
    default: 'Not Shipped',
  },
  shipmentEntries: [ShipmentEntrySchema],
  vendorName: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Pre-save middleware to auto-generate srNo, serialNumber and update status
ShippingSchema.pre('save', async function(next) {
  if (!this.srNo) {
    const lastShipping = await this.constructor.findOne().sort({ srNo: -1 });
    this.srNo = lastShipping ? lastShipping.srNo + 1 : 1;
  }

  if (!this.serialNumber) {
    this.serialNumber = `SHIP-${this.srNo.toString().padStart(4, '0')}`;
  }

  // Calculate total shipped quantity from shipment entries
  this.quantityShipped = this.shipmentEntries.reduce((total, entry) => total + entry.quantityShipped, 0);
  
  // Calculate remaining quantity
  this.quantityRemaining = this.totalQuantity - this.quantityShipped;

  // Update status based on quantities
  if (this.quantityShipped === 0) {
    this.status = 'Not Shipped';
  } else if (this.quantityShipped >= this.totalQuantity) {
    this.status = 'Shipped';
    this.quantityRemaining = 0;
  } else {
    this.status = 'Partially Shipped';
  }

  next();
});

export default mongoose.models.Shipping || mongoose.model('Shipping', ShippingSchema);