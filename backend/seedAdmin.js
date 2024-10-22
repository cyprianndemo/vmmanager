require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model'); 
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://21s01acs014:oevyJ1z5dLsYG4Tw@cluster0.0akv8.mongodb.net/vm_management?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, 
      socketTimeoutMS: 45000
    });

    const existingAdmin = await User.findOne({ email: 'admin123@admin.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash('_admin@123', 10);

    const adminUser = new User({
      username: 'admin',
      email: 'admin123@admin.com',
      password: hashedPassword,
      role: 'Admin',
      isAdmin: true, 
    });

    await adminUser.save();
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

seedAdmin();
