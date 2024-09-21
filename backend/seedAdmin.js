require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model'); // Adjust the path as needed
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    // Connect to your MongoDB database
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://21s01acs014:oevyJ1z5dLsYG4Tw@cluster0.0akv8.mongodb.net/vm_management?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000
    });

    // Check if the admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin123@admin.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('_admin@123', 10);

    // Create a new admin user with isAdmin set to true
    const adminUser = new User({
      username: 'admin',
      email: 'admin123@admin.com',
      password: hashedPassword,
      role: 'Admin',
      isAdmin: true, // Set isAdmin to true
    });

    // Save the admin user to the database
    await adminUser.save();
    console.log('Admin user created successfully.');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

seedAdmin();
