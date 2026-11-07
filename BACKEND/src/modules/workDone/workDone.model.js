import mongoose from 'mongoose';

const workDoneSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true,
    },
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
    },
    date: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 3000 },

    // ✅ CHANGED: Image ab optional hai
    imageUrl: { type: String, default: null },
    imagePublicId: { type: String, default: null },

    submittedAt: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 1000 },

    version: { type: Number, default: 1 },
    rejectionHistory: [
      {
        reason: String,
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rejectedAt: Date,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

workDoneSchema.index({ clfId: 1, status: 1, date: -1 });
workDoneSchema.index({ employeeId: 1, date: -1 });

export const WorkDone = mongoose.model('WorkDone', workDoneSchema);