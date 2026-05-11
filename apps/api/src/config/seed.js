import './env.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const seed = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`Seed script connected to: ${conn.connection.host}/${conn.connection.name}`);

  // Reset super admin if it exists (to fix the double-hashing bug)
  await User.deleteOne({ email });
  
  await User.create({
    name: 'Super Admin',
    email,
    password: 'Admin@123', // Model hook will hash this once
    role: 'superadmin',
  });
  console.log(`✅ Success: Super admin created/reset (${email})`);

  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });