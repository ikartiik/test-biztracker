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
<<<<<<< HEAD
  if (!this.srNo) {
    const lastShipping = await this.constructor.findOne().sort({ srNo: -1 });
    this.srNo = lastShipping ? lastShipping.srNo + 1 : 1;
=======
  if (!this.srNo || this.isNew) {
    // Use a more robust approach to avoid duplicate srNo
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const lastShipping = await this.constructor.findOne().sort({ srNo: -1 }).select('srNo').lean();
        const newSrNo = lastShipping ? lastShipping.srNo + 1 : 1;

        // Check if this srNo already exists (in case of race condition)
        const existing = await this.constructor.findOne({ srNo: newSrNo }).select('_id').lean();

        if (!existing) {
          this.srNo = newSrNo;
          break;
        }

        attempts++;
        // If srNo exists, try again with the next number
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error, retry
          attempts++;
          continue;
        }
        throw error;
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique srNo after multiple attempts');
    }
>>>>>>> blackboxai/login-mongodb-fix
  }

  if (!this.serialNumber) {
    this.serialNumber = `SHIP-${this.srNo.toString().padStart(4, '0')}`;
  }

  // Calculate total shipped quantity from shipment entries
  this.quantityShipped = this.shipmentEntries.reduce((total, entry) => total + entry.quantityShipped, 0);
<<<<<<< HEAD
  
=======

>>>>>>> blackboxai/login-mongodb-fix
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