// modules/system/system.model.js
import mongoose from 'mongoose';

// ✅ Global system state (single doc)
const systemStateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'singleton' },
    isOffline: { type: Boolean, default: false },
    offlineMessage: { type: String, default: 'System is under maintenance. Please try again later.' },
    lastBackupId: { type: String, default: null },
    lastBackupAt: { type: Date, default: null },
    lastRestoreAt: { type: Date, default: null },
    lastWipeAt: { type: Date, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

export const SystemState = mongoose.model('SystemState', systemStateSchema);

// ✅ Backup metadata (audit trail of every backup)
const backupMetadataSchema = new mongoose.Schema(
  {
    backupId: { type: String, required: true, unique: true, index: true },
    collections: { type: [String], required: true },
    documentCounts: { type: Object, default: {} },
    totalDocuments: { type: Number, default: 0 },
    sizeBytes: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
    restoredAt: { type: Date, default: null },
    wipedAt: { type: Date, default: null },
  },
  { versionKey: false }
);

backupMetadataSchema.index({ createdAt: -1 });
// ✅ Auto cleanup after 30 days
backupMetadataSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

export const BackupMetadata = mongoose.model('BackupMetadata', backupMetadataSchema);