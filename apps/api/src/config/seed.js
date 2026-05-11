import './env.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const seed = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`Seed script connected to: ${conn.connection.host}/${conn.connection.name}`);

  // Create super admin if not exists
  const email = 'superadmin@restaurant.com';
  const existingAdmin = await User.findOne({ email });
  
  if (!existingAdmin) {
    const password = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'Super Admin',
      email,
      password,
      role: 'superadmin',
    });
    console.log(`✅ Success: Super admin created (${email})`);
  } else {
    console.log(`ℹ️ Info: Super admin already exists (${email})`);
  }

  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });