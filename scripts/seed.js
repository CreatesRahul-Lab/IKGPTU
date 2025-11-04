const mongoose = require('mongoose');
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

// Import subjects data - we'll define it here since we can't import TS in Node directly
const BTECHSubjects = [
  // Semester 3
  { courseCode: 'BTES301-18', courseTitle: 'Digital Electronics', courseType: 'Engineering Science Course', branch: 'BTCS', semester: 3, credits: 4, internalMarks: 40, externalMarks: 60, totalMarks: 100, isLab: false, isElective: false },
  { courseCode: 'BTCS301-18', courseTitle: 'Data structure & Algorithms', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 3, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS302-18', courseTitle: 'Object Oriented Programming', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 3, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTAM302-23', courseTitle: 'Mathematics-III* (Probability and Statistics)', courseType: 'Basic Science Course', branch: 'BTCS', semester: 3, credits: 4, isLab: false, isElective: false },
  { courseCode: 'HSMC101/102-18', courseTitle: 'Foundation Course in Humanities (Development of Societies/Philosophy)', courseType: 'Humanities & Social Sciences Including Management Courses', branch: 'BTCS', semester: 3, credits: 3, isLab: false, isElective: false },
  { courseCode: 'BTES302-18', courseTitle: 'Digital Electronics Lab', courseType: 'Engineering Science Course', branch: 'BTCS', semester: 3, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS303-18', courseTitle: 'Data structure & Algorithms Lab', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 3, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS304-18', courseTitle: 'Object Oriented Programming lab.', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 3, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS305-18', courseTitle: 'IT Workshop**', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 3, credits: 2, isLab: true, isElective: false },
  // Semester 4
  { courseCode: 'BTCS401-18', courseTitle: 'Discrete Mathematics', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 4, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTES401-18', courseTitle: 'Computer Organization & Architecture', courseType: 'Engineering Science Course', branch: 'BTCS', semester: 4, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS402-18', courseTitle: 'Operating Systems', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 4, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS403-18', courseTitle: 'Design & Analysis of Algorithms', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 4, credits: 4, isLab: false, isElective: false },
  { courseCode: 'HSMC122-18', courseTitle: 'Universal Human Values 2', courseType: 'Humanities & Social Sciences Including Management Courses', branch: 'BTCS', semester: 4, credits: 3, isLab: false, isElective: false },
  { courseCode: 'EVS101-18', courseTitle: 'Environmental Sciences', courseType: 'Mandatory Courses', branch: 'BTCS', semester: 4, credits: 3, isLab: false, isElective: false },
  { courseCode: 'BTES402-18', courseTitle: 'Computer Organization & Architecture Lab', courseType: 'Engineering Science Course', branch: 'BTCS', semester: 4, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS404-18', courseTitle: 'Operating Systems Lab', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 4, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS405-18', courseTitle: 'Design & Analysis of Algorithms Lab', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 4, credits: 2, isLab: true, isElective: false },
  // Semester 5
  { courseCode: 'BTES501-18', courseTitle: 'Enterprise Resource Planning', courseType: 'Engineering Science Course', branch: 'BTCS', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS501-18', courseTitle: 'Database Management Systems', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS502-18', courseTitle: 'Formal Language & Automata Theory', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS503-18', courseTitle: 'Software Engineering', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS504-18', courseTitle: 'Computer Networks', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCSXXX-18', courseTitle: 'Elective-I', courseType: 'Professional Elective', branch: 'BTCS', semester: 5, credits: 4, isLab: false, isElective: true },
  { courseCode: 'MC', courseTitle: 'Constitution of India/ Essence of Indian Traditional Knowledge', courseType: 'Mandatory Courses', branch: 'BTCS', semester: 5, credits: 0, isLab: false, isElective: false },
  { courseCode: 'BTCS505-18', courseTitle: 'Database Management Systems Lab', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 5, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS506-18', courseTitle: 'Software Engineering Lab', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 5, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS507-18', courseTitle: 'Computer Networks Lab', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 5, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCSXXX-18L', courseTitle: 'Elective-I Lab', courseType: 'Professional Elective', branch: 'BTCS', semester: 5, credits: 2, isLab: true, isElective: true },
  // Semester 6
  { courseCode: 'BTCS601-18', courseTitle: 'Compiler Design', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 6, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS602-18', courseTitle: 'Artificial Intelligence', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 6, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCSUUU-18', courseTitle: 'Elective-II', courseType: 'Professional Elective Courses', branch: 'BTCS', semester: 6, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCSYYY-18', courseTitle: 'Elective-III', courseType: 'Professional Elective Courses', branch: 'BTCS', semester: 6, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTOE***', courseTitle: 'Open Elective-I', courseType: 'Open Elective Courses', branch: 'BTCS', semester: 6, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCS603-18', courseTitle: 'Project-I', courseType: 'Project', branch: 'BTCS', semester: 6, credits: 2, isLab: false, isElective: false },
  { courseCode: 'BTCS604-18', courseTitle: 'Compiler Design Lab', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 6, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS605-18', courseTitle: 'Artificial Intelligence Lab', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 6, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCSUUU-18L', courseTitle: 'Elective-II lab', courseType: 'Professional Elective Courses', branch: 'BTCS', semester: 6, credits: 2, isLab: true, isElective: true },
  { courseCode: 'BTCSYYY-18L', courseTitle: 'Elective-III lab', courseType: 'Professional Elective Courses', branch: 'BTCS', semester: 6, credits: 2, isLab: true, isElective: true },
  // Semester 7
  { courseCode: 'BTCS701-18', courseTitle: 'Network Security and Cryptography', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 7, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS702-18', courseTitle: 'Data Mining and Data Warehousing', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 7, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTOE***-7', courseTitle: 'Open Elective-II', courseType: 'Open Elective Courses', branch: 'BTCS', semester: 7, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCSZZZ-18', courseTitle: 'Elective- IV', courseType: 'Professional Elective', branch: 'BTCS', semester: 7, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCSTTT-18', courseTitle: 'Elective-V', courseType: 'Professional Elective Courses', branch: 'BTCS', semester: 7, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCS703-18', courseTitle: 'Project-II', courseType: 'Project', branch: 'BTCS', semester: 7, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCSZZZ-18L', courseTitle: 'Elective- IV lab', courseType: 'Professional Elective', branch: 'BTCS', semester: 7, credits: 2, isLab: true, isElective: true },
  { courseCode: 'BTCSTTT-18L', courseTitle: 'Elective- V lab', courseType: 'Professional Elective', branch: 'BTCS', semester: 7, credits: 2, isLab: true, isElective: true },
  // Semester 8
  { courseCode: 'BTCS801-18', courseTitle: 'Semester Training', courseType: 'Professional Core Courses', branch: 'BTCS', semester: 8, credits: 16, internalMarks: 300, externalMarks: 200, totalMarks: 500, isLab: false, isElective: false },
];

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ikgptu_attendance';

// Subject Schema (copy from model)
const SubjectSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    courseTitle: {
      type: String,
      required: true,
      trim: true,
    },
    courseType: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
      enum: ['BTCS', 'BTAI', 'BBA', 'BCA'],
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    credits: {
      type: Number,
      default: 4,
    },
    internalMarks: {
      type: Number,
      default: 40,
    },
    externalMarks: {
      type: Number,
      default: 60,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    isLab: {
      type: Boolean,
      default: false,
    },
    isElective: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

SubjectSchema.index({ branch: 1, semester: 1 });
SubjectSchema.index({ courseCode: 1, branch: 1, semester: 1 }, { unique: true });

const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

async function seedSubjects() {
  try {
    console.log('🌱 Starting database seed...');
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing subjects
    console.log('🗑️  Clearing existing subjects...');
    await Subject.deleteMany({});
    console.log('✅ Existing subjects cleared');

    // Create subjects for all branches
    const allSubjects = [];
    const branches = ['BTCS', 'BTAI']; // Both tech branches get the same subjects
    
    branches.forEach(branch => {
      const branchSubjects = BTECHSubjects.map(subject => ({
        ...subject,
        branch: branch
      }));
      allSubjects.push(...branchSubjects);
    });

    // Insert all subjects
    console.log('📚 Inserting subjects for BTCS and BTAI branches...');
    const insertedSubjects = await Subject.insertMany(allSubjects);
    console.log(`✅ Successfully inserted ${insertedSubjects.length} subjects`);

    // Display summary
    const subjectsBySemester = await Subject.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log('\n📊 Summary by Semester:');
    subjectsBySemester.forEach((item) => {
      console.log(`   Semester ${item._id}: ${item.count} subjects`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedSubjects();
