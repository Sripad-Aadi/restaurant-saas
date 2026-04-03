import './env.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'superadmin@restaurant.com' });
  if (existing) {
    console.log('Super admin already exists');
    process.exit(0);
  }

  const password = await bcrypt.hash('Admin@123', 12);
  await User.create({
    name: 'Super Admin',
    email: 'superadmin@restaurant.com',
    password,
    role: 'SUPER_ADMIN',
  });

  console.log('Super admin created');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });