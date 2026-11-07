import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
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
    status: {
      type: String,
      // ✅ NEW: TRAINING status add kiya
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'TRAINING'],
      required: true,
    },
    source: {
      type: String,
      // ✅ FIX #16: LEAVE_APPROVAL add
      enum: ['WORK_DONE_APPROVAL', 'MANUAL', 'LEAVE_APPROVAL'],
      default: 'WORK_DONE_APPROVAL',
    },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    markedAt: { type: Date, default: Date.now },
    workDoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkDone' },

    // ✅ FIX #16: remarks field add (Leave approval ke liye zaroori)
    remarks: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true, versionKey: false }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ clfId: 1, date: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema);