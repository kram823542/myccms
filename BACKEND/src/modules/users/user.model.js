import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },

    profilePhoto: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'BPM', 'CLF', 'EMPLOYEE'],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },

    // ✅ SPARSE INDEX BUG FIX: Empty strings को null में कन्वर्ट करने के लिए set लगा दिया गया है
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      set: (v) => (v === '' ? null : v),
    },
    mobile: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      set: (v) => (v === '' ? null : v),
    },

    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      default: null,
      index: true,
    },
    clfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CLF',
      default: null,
      index: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    bpmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    mustChangePassword: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ role: 1, status: 1 });
userSchema.index({ blockId: 1, role: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

export const User = mongoose.model('User', userSchema);