import mongoose from 'mongoose';

const topSheetSchema = new mongoose.Schema({
  clfId: { type: mongoose.Schema.Types.ObjectId, ref: 'CLF', required: true, index: true },
  month: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  adviceCount: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // ✅ 16MB FIX: सिर्फ हलकी समरी स्टोर होगी (पूरी डीप नेस्टेड एरे नहीं)
  advices: [
    {
      adviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advice' },
      adviceNumber: { type: String },
      designation: { type: String },
      totalAmount: { type: Number },
      totalEmployeesCount: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

export const TopSheet = mongoose.model('TopSheet', topSheetSchema);