import mongoose from 'mongoose';

const adviceSchema = new mongoose.Schema(
  {
    adviceType: { type: String, enum: ['SALARY', 'EXPENSE'], required: true, index: true },
    adviceNumber: { type: String, default: '', trim: true, index: true },
    adviceDate: { type: String, required: true },

    // ✅ CLF Bank Details
    clfBankDetails: {
      accountName: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      branch: { type: String },
      ifscCode: { type: String },
    },

    createdByRole: { type: String, enum: ['CLF', 'BPM', 'SUPER_ADMIN'], required: true },
    createdByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdByName: { type: String },

    clfId: { type: mongoose.Schema.Types.ObjectId, ref: 'CLF', required: true, index: true },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },

    bankName: { type: String, default: '' },
    branch: { type: String, default: '' },

    employees: [
      {
        sl: { type: Number },
        name: { type: String, required: true },
        designation: { type: String, trim: true, default: '' }, // ✅ NEW: Designation Short
        month: { type: String }, // Can hold single or multiple months e.g., "Jun26, Jul26"
        bankAccountNumber: { type: String, default: '' },
        bankName: { type: String, default: '' },
        branch: { type: String, default: '' },
        ifscCode: { type: String, default: '' },
        amount: { type: Number, required: true, min: 0 },
      },
    ],

    totalAmount: { type: Number, required: true, min: 0 },
    totalRows: { type: Number, required: true },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

// ✅ FIXED: Blank ("") adviceNumber pe unique error nahi aayega
adviceSchema.index(
  { clfId: 1, adviceNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { 
      // Sirf un documents pe unique lagega jinka adviceNumber khali string se bada ho
      adviceNumber: { $type: 'string', $gt: '' } 
    },
  }
);

adviceSchema.index({ clfId: 1, adviceType: 1, createdAt: -1 });
adviceSchema.index({ blockId: 1, adviceType: 1, createdAt: -1 });
adviceSchema.index({ isDeleted: 1, createdAt: -1 });

export const Advice = mongoose.model('Advice', adviceSchema);