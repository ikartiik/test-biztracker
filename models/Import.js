import mongoose from 'mongoose';

const ImportItemSchema = new mongoose.Schema({
  itemDescription: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const ImportSchema = new mongoose.Schema({
  srNo: {
    type: Number,
    unique: true,
  },
  serialNumber: {
    type: String,
    unique: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  vendorName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  items: [ImportItemSchema],
  invoiceNumber: {
    type: String,
    required: true,
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  trackingLink: {
    type: String,
    default: '',
  },
  dateOfShipping: {
    type: Date,
    required: true,
  },
  dateOfReceiving: {
    type: Date,
  },
  amountDutyPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentMode: {
    type: String,
    enum: ['mashreq', 'hsbc', 'crown', 'sasco', 'other_fz', 'cash'],
    default: 'cash',
  },
  bankName: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Received', 'Enroute'],
    required: true,
    default: 'Enroute',
  },
  invoiceUpload: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Pre-save middleware to auto-generate srNo and serialNumber
ImportSchema.pre('save', async function(next) {
  if (!this.srNo) {
    const lastImport = await this.constructor.findOne().sort({ srNo: -1 });
    this.srNo = lastImport ? lastImport.srNo + 1 : 1;
  }

  if (!this.serialNumber) {
    this.serialNumber = `IMP-${this.srNo.toString().padStart(4, '0')}`;
  }

  next();
});

export default mongoose.models.Import || mongoose.model('Import', ImportSchema);