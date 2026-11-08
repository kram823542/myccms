import mongoose from 'mongoose';
import crypto from 'crypto';
import { SystemState, BackupMetadata } from './system.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { createAudit } from '../../middlewares/audit.middleware.js';
import { logger } from '../../utils/logger.js';

export const PROTECTED_COLLECTIONS = ['users', 'systemstates', 'backupmetadatas'];

export const BROWSABLE_COLLECTIONS = [
  'users', 'blocks', 'clfs', 'clves', 'employees', 'actionplans', 'workdones',
  'attendances', 'advices', 'advice', 'topsheets', 'leaves', 'messages',
  'messagerecipients', 'auditlogs', 'lokoscrps', 'vos',
  'systemstates', 'backupmetadatas'
];

export const EDITABLE_COLLECTIONS = [
  'blocks', 'clfs', 'clves', 'employees', 'actionplans', 'workdones',
  'attendances', 'advices', 'advice', 'topsheets', 'leaves', 'messages',
  'messagerecipients', 'auditlogs', 'lokoscrps', 'vos', 'users'
];

export const getSystemState = async () => {
  let state = await SystemState.findById('singleton');
  if (!state) state = await SystemState.create({ _id: 'singleton' });
  return state;
};

export const toggleSystem = async (req, { isOffline, offlineMessage }) => {
  const state = await getSystemState();
  if (typeof isOffline !== 'boolean') throw ApiError.badRequest('isOffline must be true or false');

  state.isOffline = isOffline;
  if (offlineMessage !== undefined) {
    state.offlineMessage = String(offlineMessage || '').trim() || state.offlineMessage;
  }
  state.updatedBy = req.user._id;
  await state.save();

  await createAudit({
    req,
    action: isOffline ? 'SYSTEM_OFFLINE' : 'SYSTEM_ONLINE',
    targetType: 'SystemState',
    targetId: state._id,
    metadata: { message: state.offlineMessage },
  });

  return state;
};

export const generateBackup = async (req) => {
  const db = mongoose.connection.db;
  if (!db) throw ApiError.internal('Database not connected');

  const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);
  const targetCollections = existingCollections.filter(
    (name) => !PROTECTED_COLLECTIONS.includes(name) && !name.startsWith('system.')
  );

  const backupId = `backup_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const backupData = {
    backupId,
    createdAt: new Date().toISOString(),
    createdBy: { userId: req.user._id, username: req.user.username, name: req.user.name },
    collections: {},
    documentCounts: {},
  };

  let totalDocs = 0;
  let sizeBytes = 0;

  for (const collName of targetCollections) {
    try {
      const collection = db.collection(collName);
      const docs = await collection.find({}).toArray();
      const serialized = docs.map((doc) => serializeDocument(doc));
      backupData.collections[collName] = serialized;
      backupData.documentCounts[collName] = serialized.length;
      totalDocs += serialized.length;
      sizeBytes += Buffer.byteLength(JSON.stringify(serialized), 'utf8');
    } catch (err) {
      logger.warn(`Backup skip collection ${collName}: ${err.message}`);
    }
  }

  await BackupMetadata.create({
    backupId,
    collections: targetCollections,
    documentCounts: backupData.documentCounts,
    totalDocuments: totalDocs,
    sizeBytes,
    createdBy: req.user._id,
    createdByName: req.user.name || req.user.username,
  });

  const state = await getSystemState();
  state.lastBackupId = backupId;
  state.lastBackupAt = new Date();
  state.updatedBy = req.user._id;
  await state.save();

  await createAudit({
    req,
    action: 'DATABASE_BACKUP_DOWNLOADED',
    targetType: 'SystemState',
    targetId: state._id,
    metadata: { backupId, totalDocs, sizeBytes, collections: targetCollections.length },
  });

  return backupData;
};

// ✅ FIX: Wipe now drops collections completely instead of just deleting documents
export const wipeDatabase = async (req, { backupId }) => {
  if (!backupId) throw ApiError.badRequest('backupId is required. Download a fresh backup before wiping.');
  
  const state = await getSystemState();
  if (!state.lastBackupId || state.lastBackupId !== backupId) {
    throw ApiError.forbidden('Backup ID mismatch. Download a fresh backup first, then wipe.');
  }

  const backup = await BackupMetadata.findOne({ backupId });
  if (!backup) throw ApiError.notFound('Backup record not found.');

  const db = mongoose.connection.db;
  const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);
  const toDelete = existingCollections.filter(
    (name) => !PROTECTED_COLLECTIONS.includes(name) && !name.startsWith('system.')
  );

  const deletedCounts = {};

  for (const collName of toDelete) {
    try {
      const collection = db.collection(collName);
      const count = await collection.countDocuments({});
      
      // ✅ DROP the collection completely (removes data + indexes + storage)
      await collection.drop();
      deletedCounts[collName] = count;
    } catch (err) {
      // MongoDB throws error code 26 if collection doesn't exist, we ignore that
      if (err.code !== 26) {
        logger.warn(`Drop failed for ${collName}: ${err.message}`);
      }
    }
  }

  backup.wipedAt = new Date();
  await backup.save();

  state.lastWipeAt = new Date();
  state.updatedBy = req.user._id;
  await state.save();

  await createAudit({
    req,
    action: 'DATABASE_WIPED',
    targetType: 'SystemState',
    targetId: state._id,
    metadata: { backupId, deletedCounts, totalDeleted: Object.values(deletedCounts).reduce((a, b) => a + b, 0) },
  });

  return {
    success: true,
    backupId,
    deletedCounts,
    totalDeleted: Object.values(deletedCounts).reduce((a, b) => a + b, 0),
  };
};

// ✅ FIX: Restore now drops existing collections before recreating to ensure no ghost indexes remain
export const restoreDatabase = async (req, backupJson) => {
  if (!backupJson || !backupJson.collections) throw ApiError.badRequest('Invalid backup file format');

  const db = mongoose.connection.db;
  if (!db) throw ApiError.internal('Database not connected');

  const restoredCounts = {};
  const errors = [];

  // Step 1: Drop all collections (except protected) to clear old indexes
  const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);
  const toDrop = existingCollections.filter(
    (name) => !PROTECTED_COLLECTIONS.includes(name) && !name.startsWith('system.')
  );

  for (const collName of toDrop) {
    try {
      await db.collection(collName).drop();
    } catch (err) {
      if (err.code !== 26) logger.warn(`Restore drop failed for ${collName}: ${err.message}`);
    }
  }

  // Step 2: Restore from Backup
  for (const [collName, docs] of Object.entries(backupJson.collections)) {
    if (!Array.isArray(docs)) {
      errors.push(`${collName}: not an array`);
      continue;
    }
    if (PROTECTED_COLLECTIONS.includes(collName)) {
      logger.warn(`Restore skip protected collection: ${collName}`);
      continue;
    }

    try {
      const collection = db.collection(collName);
      if (docs.length > 0) {
        const deserialized = docs.map((doc) => deserializeDocument(doc));
        await collection.insertMany(deserialized, { ordered: false });
      }
      restoredCounts[collName] = docs.length;
    } catch (err) {
      logger.error(`Restore failed for ${collName}: ${err.message}`);
      errors.push(`${collName}: ${err.message}`);
    }
  }

  const state = await getSystemState();
  state.lastRestoreAt = new Date();
  state.updatedBy = req.user._id;
  await state.save();

  await createAudit({
    req,
    action: 'DATABASE_RESTORED',
    targetType: 'SystemState',
    targetId: state._id,
    metadata: { backupId: backupJson.backupId || 'unknown', restoredCounts, errors: errors.length },
  });

  return {
    success: errors.length === 0,
    restoredCounts,
    errors,
    totalRestored: Object.values(restoredCounts).reduce((a, b) => a + b, 0),
  };
};

export const listCollectionsWithCounts = async () => {
  const db = mongoose.connection.db;
  const existing = (await db.listCollections().toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith('system.'));

  const result = [];
  let totalDbSize = 0;
  let totalDocs = 0;

  for (const name of existing) {
    try {
      const stats = await db.command({ collStats: name });
      const count = stats.count || 0;
      const storageSize = stats.storageSize || 0;

      totalDbSize += storageSize;
      totalDocs += count;

      result.push({
        name,
        count,
        sizeBytes: stats.size || 0,
        storageSizeBytes: storageSize,
        editable: EDITABLE_COLLECTIONS.includes(name),
        protected: PROTECTED_COLLECTIONS.includes(name),
        browsable: BROWSABLE_COLLECTIONS.includes(name),
      });
    } catch (err) {
      logger.warn(`Stats failed for ${name}: ${err.message}`);
      result.push({ name, count: 0, sizeBytes: 0, storageSizeBytes: 0, editable: false, protected: true });
    }
  }

  return {
    collections: result.sort((a, b) => a.name.localeCompare(b.name)),
    stats: {
      totalCollections: result.length,
      totalDocuments: totalDocs,
      totalStorageBytes: totalDbSize,
    },
  };
};

export const listCollectionDocs = async (collName, { page = 1, limit = 50, search = '' }) => {
  if (!BROWSABLE_COLLECTIONS.includes(collName)) {
    throw ApiError.forbidden(`Collection "${collName}" is not browsable`);
  }

  const db = mongoose.connection.db;
  const collection = db.collection(collName);

  const filter = search
    ? {
        $or: [
          { name: new RegExp(search, 'i') },
          { username: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { code: new RegExp(search, 'i') },
        ],
      }
    : {};

  const skip = (Math.max(1, page) - 1) * Math.min(200, Math.max(1, limit));
  const take = Math.min(200, Math.max(1, limit));

  const [docs, total] = await Promise.all([
    collection.find(filter).sort({ _id: -1 }).skip(skip).limit(take).toArray(),
    collection.countDocuments(filter),
  ]);

  const masked = docs.map((doc) => maskSensitive(doc, collName));

  return {
    collection: collName,
    documents: masked.map((d) => serializeDocument(d)),
    pagination: { page, limit: take, total, pages: Math.ceil(total / take) },
  };
};

export const getSingleDoc = async (collName, docId) => {
  if (!BROWSABLE_COLLECTIONS.includes(collName)) throw ApiError.forbidden(`Not browsable`);
  const db = mongoose.connection.db;
  let objectId = new mongoose.Types.ObjectId(docId);
  const doc = await db.collection(collName).findOne({ _id: objectId });
  if (!doc) throw ApiError.notFound('Document not found');
  return serializeDocument(maskSensitive(doc, collName));
};

export const updateSingleDoc = async (req, collName, docId, updateData) => {
  if (!EDITABLE_COLLECTIONS.includes(collName) || PROTECTED_COLLECTIONS.includes(collName)) {
    throw ApiError.forbidden(`Collection "${collName}" cannot be edited from here`);
  }

  const db = mongoose.connection.db;
  let objectId = new mongoose.Types.ObjectId(docId);
  delete updateData._id;

  if (collName === 'users' && updateData.password) delete updateData.password;

  const deserialized = deserializeDocument(updateData);
  const result = await db.collection(collName).updateOne({ _id: objectId }, { $set: deserialized });
  
  if (result.matchedCount === 0) throw ApiError.notFound('Document not found');

  // ✅ Sync Name & Status between Users and Employees collections
  if (updateData.name || updateData.status) {
    if (collName === 'users') {
      const empUpdate = {};
      if (updateData.name) empUpdate.name = updateData.name;
      if (updateData.status) empUpdate.status = updateData.status;
      await db.collection('employees').updateOne({ userId: objectId }, { $set: empUpdate });
    } else if (collName === 'employees') {
      if (updateData.userId) {
        let userIdObj = updateData.userId;
        if (updateData.userId.value) userIdObj = new mongoose.Types.ObjectId(updateData.userId.value);
        const userUpdate = {};
        if (updateData.name) userUpdate.name = updateData.name;
        if (updateData.status) userUpdate.status = updateData.status;
        await db.collection('users').updateOne({ _id: userIdObj }, { $set: userUpdate });
      }
    }
  }

  await createAudit({
    req, action: 'DOCUMENT_UPDATED', targetType: collName, targetId: objectId, metadata: { fields: Object.keys(updateData) },
  });

  return { success: true, updated: result.modifiedCount };
};

export const deleteSingleDoc = async (req, collName, docId) => {
  if (!EDITABLE_COLLECTIONS.includes(collName) || PROTECTED_COLLECTIONS.includes(collName)) {
    throw ApiError.forbidden(`Collection "${collName}" cannot be deleted from here`);
  }
  if (collName === 'users') {
    throw ApiError.forbidden('Users cannot be deleted from system editor. Use user module.');
  }

  const db = mongoose.connection.db;
  let objectId = new mongoose.Types.ObjectId(docId);
  const result = await db.collection(collName).deleteOne({ _id: objectId });
  
  if (result.deletedCount === 0) throw ApiError.notFound('Document not found');

  await createAudit({ req, action: 'DOCUMENT_DELETED', targetType: collName, targetId: objectId });
  return { success: true, deleted: result.deletedCount };
};

// HELPERS
function serializeDocument(doc) {
  if (doc === null || doc === undefined) return doc;
  if (doc instanceof Date) return { __type: 'Date', value: doc.toISOString() };
  if (doc?._bsontype === 'ObjectId') return { __type: 'ObjectId', value: doc.toString() };
  if (Array.isArray(doc)) return doc.map(serializeDocument);
  if (typeof doc === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(doc)) out[k] = serializeDocument(v);
    return out;
  }
  return doc;
}

function deserializeDocument(doc) {
  if (doc === null || doc === undefined) return doc;
  if (Array.isArray(doc)) return doc.map(deserializeDocument);
  if (typeof doc === 'object') {
    if (doc.__type === 'Date') return new Date(doc.value);
    if (doc.__type === 'ObjectId') return new mongoose.Types.ObjectId(doc.value);
    const out = {};
    for (const [k, v] of Object.entries(doc)) out[k] = deserializeDocument(v);
    return out;
  }
  return doc;
}

function maskSensitive(doc, collName) {
  if (!doc) return doc;
  const masked = { ...doc };
  if (collName === 'users' && masked.password) masked.password = '***HASHED***';
  if (collName === 'employees') {
    if (masked.aadhaarNumber) masked.aadhaarNumber = 'XXXX-XXXX-XXXX';
    if (masked.bankDetails?.accountNumber) masked.bankDetails = { ...masked.bankDetails, accountNumber: 'XXXXXXXX' };
  }
  return masked;
}


/* ════════════════════════════════════════════
   DROP INDEXES — Cleans up unused storage
   ════════════════════════════════════════════ */
export const dropAllIndexes = async (req) => {
  const db = mongoose.connection.db;
  if (!db) throw ApiError.internal('Database not connected');

  const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);
  
  // System collections ko chhod kar baaki sabhi collections ke indexes drop karenge
  const targetCollections = existingCollections.filter(
    (name) => !name.startsWith('system.')
  );

  const droppedCounts = {};

  for (const collName of targetCollections) {
    try {
      const collection = db.collection(collName);
      const indexes = await collection.indexes();
      
      // _id index ko drop nahi kar sakte, isliye baaki indexes drop karenge
      const indexesToDrop = indexes.filter((idx) => idx.name !== '_id_').map((idx) => idx.name);
      
      if (indexesToDrop.length > 0) {
        await collection.dropIndexes(); // Ye saare indexes drop kar dega (except _id)
        droppedCounts[collName] = indexesToDrop.length;
      }
    } catch (err) {
      logger.warn(`Index drop failed for ${collName}: ${err.message}`);
    }
  }

  await createAudit({
    req,
    action: 'INDEXES_DROPPED',
    targetType: 'System',
    metadata: { droppedCounts, totalCollections: Object.keys(droppedCounts).length },
  });

  return {
    success: true,
    droppedCounts,
    message: 'Indexes dropped successfully. Storage reclaimed.'
  };
};