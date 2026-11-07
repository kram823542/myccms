import mongoose from 'mongoose';

// ✅ Sachiv/Adhyaksh/KoshaAdhyaksh — only name, village, phone
const memberSchema = {
  name: { type: String, trim: true },
  village: { type: String, trim: true },
  phone: { type: String, trim: true },
};

const voSchema = new mongoose.Schema(
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
    voName: { type: String, required: true, trim: true },

    // ✅ VO ka apna account (VO-level only)
    accountNumber: { type: String, trim: true },
    bankName: { type: String, trim: true },
    branch: { type: String, trim: true }, // ✅ NEW
    ifscCode: { type: String, trim: true, uppercase: true },

    // ✅ Members (no bank details)
    sachiv: memberSchema,
    adhyaksh: memberSchema,
    koshaAdhyaksh: memberSchema,

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

voSchema.index({ clfId: 1, voName: 1 });
voSchema.index({ clfId: 1, status: 1 });

export const VO = mongoose.model('VO', voSchema);