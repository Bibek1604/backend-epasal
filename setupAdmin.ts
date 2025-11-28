/**
 * Setup script to create initial admin accounts
 * Run: npm run setup-admin
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from './src/models/Admin';

dotenv.config();

const createAdmins = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const mongoURI = process.env.NODE_ENV === 'production'
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI;

    await mongoose.connect(mongoURI as string);
    console.log('✅ Connected to MongoDB');

    // Check if admins already exist
    const existingCount = await Admin.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} admin(s) already exist`);
      const response = await new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('Do you want to add more admins? (yes/no): ', (answer: string) => {
          rl.close();
          resolve(answer.toLowerCase() === 'yes');
        });
      });
      if (!response) {
        await mongoose.connection.close();
        process.exit(0);
      }
    }

    // Create sample admins
    const admins = [
      {
        adminId: 'ADMIN001',
        email: 'admin@epasaley.com',
        password: 'ePasaley@SecureAdmin2025!',
        name: 'Admin User',
        role: 'super_admin' as const,
      },
    ];

    console.log('\n📝 Creating admin accounts...\n');

    for (const adminData of admins) {
      const existingAdmin = await Admin.findOne({
        $or: [{ adminId: adminData.adminId }, { email: adminData.email }],
      });

      if (existingAdmin) {
        console.log(`⏭️  Admin "${adminData.adminId}" already exists, skipping...`);
        continue;
      }

      const newAdmin = new Admin(adminData);
      await newAdmin.save();
      console.log(`✅ Created: ${adminData.adminId} (${adminData.email})`);
    }

    console.log('\n✨ Setup complete!\n');
    console.log('Admin credentials:');
    console.log('─'.repeat(50));
    admins.forEach((admin) => {
      console.log(`ID: ${admin.adminId}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Password: ${admin.password}`);
      console.log(`Role: ${admin.role}`);
      console.log('─'.repeat(50));
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
};

createAdmins();
