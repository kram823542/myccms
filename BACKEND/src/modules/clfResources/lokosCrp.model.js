import mongoose from 'mongoose';

const lokosCrpSchema = new mongoose.Schema(
  {
    clfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CLF',
      required: true,
      index: true,
    },
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    mobile: { type: String, required: true, trim: true },

    // ✅ Bank details (flat, no branch)
    accountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    branch: { type: String, trim: true }, // ✅ NEW
    ifscCode: { type: String, trim: true, uppercase: true },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

lokosCrpSchema.index({ clfId: 1, name: 1 });
lokosCrpSchema.index({ clfId: 1, status: 1 });

export const LokosCrp = mongoose.model('LokosCrp', lokosCrpSchema);