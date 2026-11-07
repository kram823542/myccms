import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    clfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CLF',
      required: true,
    },
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    leaveType: {
      type: String,
      // ✅ NEW: TRAINING add kiya
      enum: ['Casual Leave', 'Medical Leave', 'Half Day', 'Emergency Leave', 'Training', 'Other'],
      required: true,
    },
    startDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    endDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    // ✅ Half Day ke liye Time (Agar leaveType 'Half Day' hai tabhi zaroori hai)
    startTime: {
      type: String, // e.g. "09:00 AM"
      default: null,
    },
    endTime: {
      type: String, // e.g. "01:00 PM"
      default: null,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewRemarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Leave = mongoose.model('Leave', leaveSchema);