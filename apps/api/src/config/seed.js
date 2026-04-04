import './env.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Store from '../models/Store.js';

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Create super admin if not exists
  const existingAdmin = await User.findOne({ email: 'superadmin@restaurant.com' });
  if (!existingAdmin) {
    const password = await bcrypt.hash('Admin@123', 12);
    await User.create({
      name: 'Super Admin',
      email: 'superadmin@restaurant.com',
      password,
      role: 'SUPER_ADMIN',
    });
    console.log('Super admin created');
  }

  // Create a test customer linked to spice-garden store
  const store = await Store.findOne({ slug: 'spice-garden' });
  if (store) {
    const existingCustomer = await User.findOne({ email: 'customer@test.com' });
    if (!existingCustomer) {
      const password = await bcrypt.hash('Customer@123', 12);
      await User.create({
        storeId: store._id,
        name:    'Test Customer',
        email:   'customer@test.com',
        password,
        role:    'CUSTOMER',
      });
      console.log('Test customer created');
    }
  } else {
    console.log('Spice Garden store not found — create it first then re-run seed');
  }

  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });