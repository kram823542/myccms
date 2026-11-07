import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const result = await mongoose.connection.collection('employees').updateMany(
      { tempPassword: { $exists: true } },
      { $unset: { tempPassword: '' } }
    );
    console.log(`Removed stored temporary passwords from ${result.modifiedCount} employee records.`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(`Employee password cleanup failed: ${error.message}`);
  process.exitCode = 1;
});
