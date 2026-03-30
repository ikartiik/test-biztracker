import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  srNo: { type: String, required: true, unique: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  account: {
    type: String,
    enum: ['mashreq', 'hsbc', 'kar_fab', 'kar_liv', 'kar_mashreq', 'crown', 'sasco', 'other_fz', 'cash'],
    default: 'cash'
  },
  amount: { type: Number, required: true, min: 0 },
  sourceExpense: { type: String },
  creditAmount: { type: Number, default: 0, min: 0 },
  debitAmount: { type: Number, default: 0, min: 0 },
  balance: { type: Number, default: 0 },
  remark: { type: String, default: '' },
  comment: { type: String },
  date: { type: Date, default: Date.now },
  linkedPurchaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' }
}, { timestamps: true });

ExpenseSchema.pre('save', function(next) {
  if (!this.sourceExpense) this.sourceExpense = this.category;
  if (!this.comment && this.remark) this.comment = this.remark;
  
  if (this.type === 'income' && this.amount && !this.creditAmount) {
    this.creditAmount = this.amount;
    this.debitAmount = 0;
  } else if (this.type === 'expense' && this.amount && !this.debitAmount) {
    this.debitAmount = this.amount;
    this.creditAmount = 0;
  }
  next();
});

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

