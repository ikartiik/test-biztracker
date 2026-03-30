import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
  serialNumber: { type: String },
  srNo: { type: Number },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  vendorName: { type: String, default: '' },
  itemDescription: { type: String, required: true },
  currency: { type: String, enum: ['USD', 'AED', 'EUR'], default: 'USD' },
  price: { type: Number, min: 0, default: 0 },
  quantity: { type: Number, min: 1, default: 1 },
  total: { type: Number, min: 0 },
  priceInAED: { type: Number, min: 0 },
  totalInAED: { type: Number, min: 0 },
  paymentAccount: {
    type: String,
    enum: ['mashreq', 'hsbc', 'kar_fab', 'kar_liv', 'kar_mashreq', 'crown', 'sasco', 'other_fz', 'cash'],
    default: 'cash'
  },
  category: { type: String, default: 'Other' },
  status: { type: String, enum: ['To Purchase', 'Purchased'], default: 'To Purchase' },
  orderBy: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderBy' },
  linkedExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  linkedPendingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pending' },
}, { timestamps: true });

PurchaseSchema.pre('save', function(next) {
  const exchangeRates = { USD: 3.67, AED: 1, EUR: 4.0 };
  const price = this.price || 0;
  this.priceInAED = price * (exchangeRates[this.currency] || 1);
  this.total = price * this.quantity;
  this.totalInAED = this.priceInAED * this.quantity;
  next();
});

export default mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
