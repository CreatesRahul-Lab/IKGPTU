const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ikgptu_attendance';

// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    rollNo: { type: String, sparse: true, uppercase: true },
    employeeId: { type: String, sparse: true },
    branch: { type: String, enum: ['BTCS', 'BTES', 'BTAM', 'BTOE', 'BBA', 'BCA'] },
    semester: { type: Number, min: 1, max: 8 },
    department: { type: String },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedTeacher() {
  try {
    console.log('🌱 Starting teacher account creation...');
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if teacher already exists
    const existingTeacher = await User.findOne({ email: 'teacher@ikgptu.ac.in' });
    
    if (existingTeacher) {
      console.log('⚠️  Teacher account already exists!');
      console.log('   Email: teacher@ikgptu.ac.in');
      console.log('   Password: teacher123');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('teacher123', 12);

    // Create teacher account
    const teacher = await User.create({
      name: 'Dr. Faculty Member',
      email: 'teacher@ikgptu.ac.in',
      password: hashedPassword,
      role: 'teacher',
      employeeId: 'EMP001',
      department: 'Computer Science',
      isActive: true,
      emailVerified: true,
    });

    console.log('✅ Teacher account created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Email: teacher@ikgptu.ac.in');
    console.log('   Password: teacher123');
    console.log('   Role: Teacher');
    console.log('\n✅ You can now login with these credentials!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating teacher account:', error);
    process.exit(1);
  }
}

// Run the seed function
seedTeacher();
