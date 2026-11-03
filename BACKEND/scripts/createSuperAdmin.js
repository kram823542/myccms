import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from '../src/modules/users/user.model.js';

// ✅ Path set karo taaki .env parent folder se load ho
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// 🔥 YAHAN APNI ID AUR PASSWORD HARDCODE KAREIN
const USERNAME = '@CLFSATBARWA';
const PASSWORD = 'KUNDAN@CLF'; // Minimum 8 characters
const NAME = 'Kundan Ram';

const run = async () => {
  if (PASSWORD.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    process.exit(1);
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('❌ MONGODB_URI not found in .env file. Please check your .env file at BACKEND/.env');
    process.exit(1);
  }

  try {
    // ✅ Connect to MongoDB Directly
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');

    const uname = USERNAME.toLowerCase();
    const existing = await User.findOne({ username: uname });

    if (existing) {
      console.log('🔍 User exists — updating password...');

      existing.password = PASSWORD; // Model ka pre-save hook isko hash kar dega
      existing.name = NAME;
      existing.role = 'SUPER_ADMIN';
      existing.status = 'ACTIVE';
      existing.mustChangePassword = false;
      existing.loginAttempts = 0;
      existing.lockUntil = null;
      await existing.save();

      console.log('═══════════════════════════════════════');
      console.log(`✅ Super Admin password RESET: ${uname}`);
      console.log(`   New Password: ${PASSWORD}`);
      console.log('═══════════════════════════════════════');
    } else {
      await User.create({
        username: uname,
        password: PASSWORD,
        role: 'SUPER_ADMIN',
        name: NAME,
        mustChangePassword: false,
        status: 'ACTIVE',
      });

      console.log('═══════════════════════════════════════');
      console.log(`✅ Super Admin CREATED: ${uname}`);
      console.log(`   Password: ${PASSWORD}`);
      console.log('═══════════════════════════════════════');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});