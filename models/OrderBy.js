import mongoose from 'mongoose';

const OrderBySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    default: 'system',
  },
}, {
  timestamps: true,
});

// Initialize default order by options
OrderBySchema.statics.initializeDefaults = async function() {
  const defaultOptions = ['Khushal', 'Gajendra', 'Rishabh', 'Nisha', 'Meet'];
  
  for (const name of defaultOptions) {
    await this.findOneAndUpdate(
      { name },
      { name, isActive: true, createdBy: 'system' },
      { upsert: true, new: true }
    );
  }
};

export default mongoose.models.OrderBy || mongoose.model('OrderBy', OrderBySchema);