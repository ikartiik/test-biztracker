import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  company: { type: String, required: true },
  salespersonName: { type: String, required: true },
  contact: { type: String },
  email: { type: String }, // Remove required: true to make email optional
  address: { type: String},
  products: [{ type: String }]
}, { timestamps: true });

const PurchaseSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    // Remove required since we auto-generate
  },
  itemDescription: {
    type: String,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    // Remove required: true to make vendor optional
  },
  vendorName: {
    type: String,
    // Remove required: true to make vendorName optional
  },
  onlineLink: {
    type: String,
    default: '',
  },
  dateOfPurchase: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    // Remove required: true to make price optional
    min: 0,
  },
  currency: {
    type: String,
    enum: ['AED', 'USD', 'INR', 'HKD', 'GBP', 'EUR'],
    default: 'AED',
    required: true,
  },
  priceInAED: {
    type: Number,
    min: 0,
  },
  total: {
    type: Number,
    min: 0,
    // Remove required since we auto-calculate
  },
  totalInAED: {
    type: Number,
    min: 0,
    // Remove required since we auto-calculate
  },
  mediumOfPurchase: {
    type: String,
    enum: ['Local', 'Online'],
    required: true,
  },
  status: {
    type: String,
    enum: ['To Purchase', 'Purchased', 'Not Available'],
    required: true,
  },
  orderBy: {
    type: String,
    required: true,
    // Remove enum constraint to allow dynamic values
  },
  category: {
    type: String,
    enum: [
      'Networking',
      'Mobility/Tablets', 
      'Wearables',
      'Computer/Laptops',
      'Gaming and VR',
      'Storage',
      'Home/Smart Devices',
      'Computer Acc.',
      'Audio',
      'Mobile Accessories',
      'Computer Components',
      'Desktops and Monitors',
      'Other'
    ],
    required: true,
  },
  imeiSerialNumbers: [{
    type: String,
    default: '',
  }],
  paymentAccount: {
    type: String,
    enum: ['mashreq', 'hsbc', 'kar_fab', 'kar_liv', 'kar_mashreq', 'crown', 'sasco', 'other_fz', 'cash'],
  },
  srNo: {
    type: Number,
  },
  linkedExpenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
  },
  linkedPendingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pending',
  },
}, {
  timestamps: true,
});

// Pre-save middleware to auto-generate serial number and calculate AED amounts
PurchaseSchema.pre('save', async function(next) {
  // Auto-generate srNo
  if (!this.srNo) {
    const lastPurchase = await this.constructor.findOne().sort({ srNo: -1 });
    this.srNo = lastPurchase ? lastPurchase.srNo + 1 : 1;
  }

  // Auto-generate serialNumber if not provided
  if (!this.serialNumber) {
    this.serialNumber = `PUR-${this.srNo.toString().padStart(4, '0')}`;
  }

  // Currency conversion rates (you can make this dynamic later)
  const exchangeRates = {
    'AED': 1,
    'USD': 3.67,
    'INR': 0.044,
    'HKD': 0.47,
    'GBP': 4.63,
    'EUR': 3.98
  };

  // Calculate AED amounts and totals
  this.priceInAED = this.price * exchangeRates[this.currency];
  this.total = this.price * this.quantity;
  this.totalInAED = this.priceInAED * this.quantity;

  next();
});

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', VendorSchema);

export { Vendor };
export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);