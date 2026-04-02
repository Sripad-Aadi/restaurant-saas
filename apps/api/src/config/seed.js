require('dotenv').config({ path: './apps/api/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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
    // No storeId for Super Admin
  });

  console.log('✅ Super admin created');
  console.log('   Email:    superadmin@restaurant.com');
  console.log('   Password: Admin@123');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });