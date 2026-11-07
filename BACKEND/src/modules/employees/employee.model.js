import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    joiningDate: { type: Date, required: true },

    // Sensitive - Encrypted
    aadhaarNumber: { type: String },
    bankDetails: {
      bankName: { type: String, trim: true },
      accountNumber: { type: String },
      branch: { type: String, trim: true },
      ifsc: { type: String, trim: true, uppercase: true },
    },

    workLocation: {
      panchayat: { type: String, required: true, trim: true },
    },

    profilePhoto: { type: String, default: null },

    // ✅ NAYA: Plain text password save karne ke liye
    tempPassword: { type: String, default: null }, 

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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

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

// ✅ FIX: Ek CLF ke andar employee code unique hoga, alag CLF me same code chalega
employeeSchema.index({ clfId: 1, employeeCode: 1 }, { unique: true });
employeeSchema.index({ clfId: 1, status: 1 });

export const Employee = mongoose.model('Employee', employeeSchema);