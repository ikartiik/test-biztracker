import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  srNo: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  account: {
    type: String,
    enum: ['mashreq', 'hsbc', 'crown', 'sasco', 'other_fz', 'cash'],
    default: 'cash',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  sourceExpense: {
    type: String,
    default: function() {
      return this.category;
    },
  },
  creditAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  debitAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  remark: {
    type: String,
    default: '',
  },
  comment: {
    type: String,
    default: function() {
      return this.remark;
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to sync fields
ExpenseSchema.pre('save', function(next) {
  // Sync sourceExpense with category if not provided
  if (!this.sourceExpense) {
    this.sourceExpense = this.category;
  }
  
  // Sync comment with remark if not provided
  if (!this.comment && this.remark) {
    this.comment = this.remark;
  }
  
  // Set credit/debit amounts based on type if not provided
  if (this.type === 'income' && !this.creditAmount && this.amount) {
    this.creditAmount = this.amount;
    this.debitAmount = 0;
  } else if (this.type === 'expense' && !this.debitAmount && this.amount) {
    this.debitAmount = this.amount;
    this.creditAmount = 0;
  }
  
  next();
});

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);