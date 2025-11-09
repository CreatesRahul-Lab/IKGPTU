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
// BTCS Subjects (Semesters 1-8)
const BTCSSubjects = [
  // Semester 1
  { courseCode: 'BTPH101-23', courseTitle: 'Engineering Physics', courseType: 'Basic Science Course', credits: 4, branch: 'BTCS', semester: 1, isLab: false, isElective: false },
  { courseCode: 'BTPH102-23', courseTitle: 'Engineering Physics Lab', courseType: 'Basic Science Course', credits: 1, branch: 'BTCS', semester: 1, isLab: true, isElective: false },
  { courseCode: 'BTAM101-23', courseTitle: 'Engineering Mathematics-I', courseType: 'Basic Science Course', credits: 4, branch: 'BTCS', semester: 1, isLab: false, isElective: false },
  { courseCode: 'BTEE101-18', courseTitle: 'Basic Electrical Engineering', courseType: 'Engineering Science Course', credits: 4, branch: 'BTCS', semester: 1, isLab: false, isElective: false },
  { courseCode: 'BTEE102-18', courseTitle: 'Basic Electrical Engineering Lab', courseType: 'Engineering Science Course', credits: 1, branch: 'BTCS', semester: 1, isLab: true, isElective: false },
  { courseCode: 'BTME101-21', courseTitle: 'Engineering Graphics & Design', courseType: 'Engineering Science Course', credits: 3, branch: 'BTCS', semester: 1, isLab: true, isElective: false },
  { courseCode: 'BMPD101-18', courseTitle: 'Mentoring and Professional Development', courseType: 'MPD', credits: 0, branch: 'BTCS', semester: 1, isLab: true, isElective: false },
  // Semester 2
  { courseCode: 'BTCH101-23', courseTitle: 'Chemistry-I', courseType: 'Basic Science Course', credits: 4, branch: 'BTCS', semester: 2, isLab: false, isElective: false },
  { courseCode: 'BTCH102-18', courseTitle: 'Chemistry-I Lab', courseType: 'Basic Science Course', credits: 1, branch: 'BTCS', semester: 2, isLab: true, isElective: false },
  { courseCode: 'BTAM201-23', courseTitle: 'Engineering Mathematics-II', courseType: 'Basic Science Course', credits: 4, branch: 'BTCS', semester: 2, isLab: false, isElective: false },
  { courseCode: 'BTPS101-18', courseTitle: 'Programming for Problem Solving', courseType: 'Engineering Science Course', credits: 3, branch: 'BTCS', semester: 2, isLab: false, isElective: false },
  { courseCode: 'BTPS102-18', courseTitle: 'Programming for Problem Solving Lab', courseType: 'Engineering Science Course', credits: 2, branch: 'BTCS', semester: 2, isLab: true, isElective: false },
  { courseCode: 'BTMP101-18', courseTitle: 'Workshop / Manufacturing Practices', courseType: 'Engineering Science Course', credits: 3, branch: 'BTCS', semester: 2, isLab: true, isElective: false },
  { courseCode: 'BTHU101-18', courseTitle: 'English', courseType: 'Humanities & Social Sciences', credits: 2, branch: 'BTCS', semester: 2, isLab: false, isElective: false },
  { courseCode: 'BTHU102-18', courseTitle: 'English Lab', courseType: 'Humanities & Social Sciences', credits: 1, branch: 'BTCS', semester: 2, isLab: true, isElective: false },
  { courseCode: 'BMPD201-18', courseTitle: 'Mentoring and Professional Development', courseType: 'MPD', credits: 0, branch: 'BTCS', semester: 2, isLab: true, isElective: false },
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

// BTAI Subjects (Semesters 1-8)
const BTAISubjects = [
  // Semester 1
  { courseCode: 'BTCH101-23', courseTitle: 'Chemistry-I', courseType: 'Basic Science Course', credits: 4, branch: 'BTAI', semester: 1, isLab: false, isElective: false },
  { courseCode: 'BTCH102-18', courseTitle: 'Chemistry-I Lab', courseType: 'Basic Science Course', credits: 1, branch: 'BTAI', semester: 1, isLab: true, isElective: false },
  { courseCode: 'BTAM101-23', courseTitle: 'Engineering Mathematics-I', courseType: 'Basic Science Course', credits: 4, branch: 'BTAI', semester: 1, isLab: false, isElective: false },
  { courseCode: 'BTPS101-18', courseTitle: 'Programming for Problem Solving', courseType: 'Engineering Science Course', credits: 3, branch: 'BTAI', semester: 1, isLab: false, isElective: false },
  { courseCode: 'BTPS102-18', courseTitle: 'Programming for Problem Solving Lab', courseType: 'Engineering Science Course', credits: 2, branch: 'BTAI', semester: 1, isLab: true, isElective: false },
  { courseCode: 'BTMP101-18', courseTitle: 'Workshop / Manufacturing Practices', courseType: 'Engineering Science Course', credits: 3, branch: 'BTAI', semester: 1, isLab: true, isElective: false },
  { courseCode: 'BTHU101-18', courseTitle: 'English', courseType: 'Humanities & Social Sciences', credits: 2, branch: 'BTAI', semester: 1, isLab: false, isElective: false },
  { courseCode: 'BTHU102-18', courseTitle: 'English Lab', courseType: 'Humanities & Social Sciences', credits: 1, branch: 'BTAI', semester: 1, isLab: true, isElective: false },
  { courseCode: 'BMPD101-18', courseTitle: 'Mentoring and Professional Development', courseType: 'MPD', credits: 0, branch: 'BTAI', semester: 1, isLab: true, isElective: false },
  // Semester 2
  { courseCode: 'BTPH101-23', courseTitle: 'Engineering Physics', courseType: 'Basic Science Course', credits: 4, branch: 'BTAI', semester: 2, isLab: false, isElective: false },
  { courseCode: 'BTPH102-23', courseTitle: 'Engineering Physics Lab', courseType: 'Basic Science Course', credits: 1, branch: 'BTAI', semester: 2, isLab: true, isElective: false },
  { courseCode: 'BTAM201-23', courseTitle: 'Engineering Mathematics-II', courseType: 'Basic Science Course', credits: 4, branch: 'BTAI', semester: 2, isLab: false, isElective: false },
  { courseCode: 'BTEE101-18', courseTitle: 'Basic Electrical Engineering', courseType: 'Engineering Science Course', credits: 4, branch: 'BTAI', semester: 2, isLab: false, isElective: false },
  { courseCode: 'BTEE102-18', courseTitle: 'Basic Electrical Engineering Lab', courseType: 'Engineering Science Course', credits: 1, branch: 'BTAI', semester: 2, isLab: true, isElective: false },
  { courseCode: 'BTME101-21', courseTitle: 'Engineering Graphics & Design', courseType: 'Engineering Science Course', credits: 3, branch: 'BTAI', semester: 2, isLab: true, isElective: false },
  { courseCode: 'BMPD201-18', courseTitle: 'Mentoring and Professional Development', courseType: 'MPD', credits: 0, branch: 'BTAI', semester: 2, isLab: true, isElective: false },
  // Semester 3
  { courseCode: 'BTES301-18', courseTitle: 'Digital Electronics', courseType: 'Engineering Science Course', branch: 'BTAI', semester: 3, credits: 4, internalMarks: 40, externalMarks: 60, totalMarks: 100, isLab: false, isElective: false },
  { courseCode: 'BTCS301-18', courseTitle: 'Data structure & Algorithms', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 3, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS302-18', courseTitle: 'Object Oriented Programming', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 3, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTAM302-23', courseTitle: 'Mathematics-III* (Probability and Statistics)', courseType: 'Basic Science Course', branch: 'BTAI', semester: 3, credits: 4, isLab: false, isElective: false },
  { courseCode: 'HSMC101/102-18', courseTitle: 'Foundation Course in Humanities (Development of Societies/Philosophy)', courseType: 'Humanities & Social Sciences Including Management Courses', branch: 'BTAI', semester: 3, credits: 3, isLab: false, isElective: false },
  { courseCode: 'BTES302-18', courseTitle: 'Digital Electronics Lab', courseType: 'Engineering Science Course', branch: 'BTAI', semester: 3, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS303-18', courseTitle: 'Data structure & Algorithms Lab', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 3, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS304-18', courseTitle: 'Object Oriented Programming lab.', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 3, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS305-18', courseTitle: 'IT Workshop**', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 3, credits: 2, isLab: true, isElective: false },
  // Semester 4
  { courseCode: 'BTCS401-18', courseTitle: 'Discrete Mathematics', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 4, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTES401-18', courseTitle: 'Computer Organization & Architecture', courseType: 'Engineering Science Course', branch: 'BTAI', semester: 4, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS402-18', courseTitle: 'Operating Systems', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 4, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS403-18', courseTitle: 'Design & Analysis of Algorithms', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 4, credits: 4, isLab: false, isElective: false },
  { courseCode: 'HSMC122-18', courseTitle: 'Universal Human Values 2', courseType: 'Humanities & Social Sciences Including Management Courses', branch: 'BTAI', semester: 4, credits: 3, isLab: false, isElective: false },
  { courseCode: 'EVS101-18', courseTitle: 'Environmental Sciences', courseType: 'Mandatory Courses', branch: 'BTAI', semester: 4, credits: 3, isLab: false, isElective: false },
  { courseCode: 'BTES402-18', courseTitle: 'Computer Organization & Architecture Lab', courseType: 'Engineering Science Course', branch: 'BTAI', semester: 4, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS404-18', courseTitle: 'Operating Systems Lab', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 4, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS405-18', courseTitle: 'Design & Analysis of Algorithms Lab', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 4, credits: 2, isLab: true, isElective: false },
  // Semester 5
  { courseCode: 'BTES501-18', courseTitle: 'Enterprise Resource Planning', courseType: 'Engineering Science Course', branch: 'BTAI', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS501-18', courseTitle: 'Database Management Systems', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS502-18', courseTitle: 'Formal Language & Automata Theory', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS503-18', courseTitle: 'Software Engineering', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS504-18', courseTitle: 'Computer Networks', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 5, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCSXXX-18', courseTitle: 'Elective-I', courseType: 'Professional Elective', branch: 'BTAI', semester: 5, credits: 4, isLab: false, isElective: true },
  { courseCode: 'MC', courseTitle: 'Constitution of India/ Essence of Indian Traditional Knowledge', courseType: 'Mandatory Courses', branch: 'BTAI', semester: 5, credits: 0, isLab: false, isElective: false },
  { courseCode: 'BTCS505-18', courseTitle: 'Database Management Systems Lab', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 5, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS506-18', courseTitle: 'Software Engineering Lab', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 5, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS507-18', courseTitle: 'Computer Networks Lab', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 5, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCSXXX-18L', courseTitle: 'Elective-I Lab', courseType: 'Professional Elective', branch: 'BTAI', semester: 5, credits: 2, isLab: true, isElective: true },
  // Semester 6
  { courseCode: 'BTCS601-18', courseTitle: 'Compiler Design', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 6, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS602-18', courseTitle: 'Artificial Intelligence', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 6, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCSUUU-18', courseTitle: 'Elective-II', courseType: 'Professional Elective Courses', branch: 'BTAI', semester: 6, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCSYYY-18', courseTitle: 'Elective-III', courseType: 'Professional Elective Courses', branch: 'BTAI', semester: 6, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTOE***', courseTitle: 'Open Elective-I', courseType: 'Open Elective Courses', branch: 'BTAI', semester: 6, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCS603-18', courseTitle: 'Project-I', courseType: 'Project', branch: 'BTAI', semester: 6, credits: 2, isLab: false, isElective: false },
  { courseCode: 'BTCS604-18', courseTitle: 'Compiler Design Lab', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 6, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCS605-18', courseTitle: 'Artificial Intelligence Lab', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 6, credits: 2, isLab: true, isElective: false },
  { courseCode: 'BTCSUUU-18L', courseTitle: 'Elective-II lab', courseType: 'Professional Elective Courses', branch: 'BTAI', semester: 6, credits: 2, isLab: true, isElective: true },
  { courseCode: 'BTCSYYY-18L', courseTitle: 'Elective-III lab', courseType: 'Professional Elective Courses', branch: 'BTAI', semester: 6, credits: 2, isLab: true, isElective: true },
  // Semester 7
  { courseCode: 'BTCS701-18', courseTitle: 'Network Security and Cryptography', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 7, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCS702-18', courseTitle: 'Data Mining and Data Warehousing', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 7, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTOE***-7', courseTitle: 'Open Elective-II', courseType: 'Open Elective Courses', branch: 'BTAI', semester: 7, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCSZZZ-18', courseTitle: 'Elective- IV', courseType: 'Professional Elective', branch: 'BTAI', semester: 7, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCSTTT-18', courseTitle: 'Elective-V', courseType: 'Professional Elective Courses', branch: 'BTAI', semester: 7, credits: 4, isLab: false, isElective: true },
  { courseCode: 'BTCS703-18', courseTitle: 'Project-II', courseType: 'Project', branch: 'BTAI', semester: 7, credits: 4, isLab: false, isElective: false },
  { courseCode: 'BTCSZZZ-18L', courseTitle: 'Elective- IV lab', courseType: 'Professional Elective', branch: 'BTAI', semester: 7, credits: 2, isLab: true, isElective: true },
  { courseCode: 'BTCSTTT-18L', courseTitle: 'Elective- V lab', courseType: 'Professional Elective', branch: 'BTAI', semester: 7, credits: 2, isLab: true, isElective: true },
  // Semester 8
  { courseCode: 'BTCS801-18', courseTitle: 'Semester Training', courseType: 'Professional Core Courses', branch: 'BTAI', semester: 8, credits: 16, internalMarks: 300, externalMarks: 200, totalMarks: 500, isLab: false, isElective: false },
];

const BBASubjects = [
  // Semester 1
  { courseCode: 'BBA101-18', courseTitle: 'Principles and Practices of Management', courseType: 'Core Theory 1', branch: 'BBA', semester: 1, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBA102-18', courseTitle: 'Basic Accounting', courseType: 'Core Theory 2', branch: 'BBA', semester: 1, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBAGE101-18', courseTitle: 'Managerial Economics I', courseType: 'General Elective 1', branch: 'BBA', semester: 1, credits: 6, isLab: false, isElective: true },
  { courseCode: 'BTHU103/18', courseTitle: 'English', courseType: 'AECC', branch: 'BBA', semester: 1, credits: 1, isLab: false, isElective: false },
  { courseCode: 'BTHU104/18', courseTitle: 'English Practical/Laboratory', courseType: 'AECC', branch: 'BBA', semester: 1, credits: 1, isLab: true, isElective: false },
  { courseCode: 'HVPE101-18', courseTitle: 'Human Values, De-addiction and Traffic Rules', courseType: 'AECC', branch: 'BBA', semester: 1, credits: 3, isLab: false, isElective: false },
  { courseCode: 'HVPE102-18', courseTitle: 'Human Values, De-addiction and Traffic Rules (Lab/Seminar)', courseType: 'AECC', branch: 'BBA', semester: 1, credits: 1, isLab: true, isElective: false },
  { courseCode: 'BMPD102-18', courseTitle: 'Mentoring and Professional Development', courseType: 'Mentoring and Professional Development', branch: 'BBA', semester: 1, credits: 1, isLab: true, isElective: false },
  // Semester 2
  { courseCode: 'BBA201-18', courseTitle: 'Business Statistics', courseType: 'Core Theory 3', branch: 'BBA', semester: 2, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBA202-18', courseTitle: 'Business Environment', courseType: 'Core Theory 4', branch: 'BBA', semester: 2, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBAGE201-18', courseTitle: 'Managerial Economics II', courseType: 'General Elective 2', branch: 'BBA', semester: 2, credits: 6, isLab: false, isElective: true },
  { courseCode: 'EVS102-18', courseTitle: 'Environmental Studies', courseType: 'AECC', branch: 'BBA', semester: 2, credits: 2, isLab: false, isElective: false },
  { courseCode: 'BMPD202-18', courseTitle: 'Mentoring and Professional Development', courseType: 'Mentoring and Professional Development', branch: 'BBA', semester: 2, credits: 1, isLab: true, isElective: false },
  // Semester 3
  { courseCode: 'BBA301-18', courseTitle: 'Organizational Behaviour', courseType: 'Core Theory 5', branch: 'BBA', semester: 3, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBA302-18', courseTitle: 'Marketing Management', courseType: 'Core Theory 6', branch: 'BBA', semester: 3, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBA303-18', courseTitle: 'Cost & Management Accounting', courseType: 'Core Theory 7', branch: 'BBA', semester: 3, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBAGE301-18', courseTitle: 'Production and Operation Management', courseType: 'General Elective 3', branch: 'BBA', semester: 3, credits: 6, isLab: false, isElective: true },
  { courseCode: 'BBASEC301-18', courseTitle: 'IT Tools for Business', courseType: 'Skill Enhancement Course 1', branch: 'BBA', semester: 3, credits: 2, isLab: false, isElective: false },
  { courseCode: 'BMPD302-18', courseTitle: 'Mentoring and Professional Development', courseType: 'Mentoring and Professional Development', branch: 'BBA', semester: 3, credits: 1, isLab: true, isElective: false },
  // Semester 4
  { courseCode: 'BBA401-18', courseTitle: 'Business Research Methods', courseType: 'Core Theory 8', branch: 'BBA', semester: 4, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBA402-18', courseTitle: 'Human Resource Management', courseType: 'Core Theory 9', branch: 'BBA', semester: 4, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBA403-18', courseTitle: 'Financial Management', courseType: 'Core Theory 10', branch: 'BBA', semester: 4, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBAGE401-18', courseTitle: 'Entrepreneurship Development', courseType: 'General Elective 4', branch: 'BBA', semester: 4, credits: 6, isLab: false, isElective: true },
  { courseCode: 'BBASEC401-18', courseTitle: 'Business Ethics & Corporate Social Responsibility', courseType: 'Skill Enhancement Course 2', branch: 'BBA', semester: 4, credits: 2, isLab: false, isElective: false },
  { courseCode: 'BMPD402-18', courseTitle: 'Mentoring and Professional Development', courseType: 'Mentoring and Professional Development', branch: 'BBA', semester: 4, credits: 1, isLab: true, isElective: false },
  // Semester 5
  { courseCode: 'BBA501-18', courseTitle: 'Operation Research', courseType: 'Core Theory 11', branch: 'BBA', semester: 5, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBA502-18', courseTitle: 'Mercantile Law', courseType: 'Core Theory 12', branch: 'BBA', semester: 5, credits: 6, isLab: false, isElective: false },
  { courseCode: 'DSE-1', courseTitle: 'Elective I', courseType: 'Discipline Specific Elective 1', branch: 'BBA', semester: 5, credits: 6, isLab: false, isElective: true },
  { courseCode: 'DSE-2', courseTitle: 'Elective II', courseType: 'Discipline Specific Elective 2', branch: 'BBA', semester: 5, credits: 6, isLab: false, isElective: true },
  { courseCode: 'BMPD502-18', courseTitle: 'Mentoring and Professional Development', courseType: 'Mentoring and Professional Development', branch: 'BBA', semester: 5, credits: 1, isLab: true, isElective: false },
  // Semester 6
  { courseCode: 'BBA601-18', courseTitle: 'Strategy Management', courseType: 'Core Theory 13', branch: 'BBA', semester: 6, credits: 6, isLab: false, isElective: false },
  { courseCode: 'BBA602-18', courseTitle: 'Company Law', courseType: 'Core Theory 14', branch: 'BBA', semester: 6, credits: 6, isLab: false, isElective: false },
  { courseCode: 'DSE-3', courseTitle: 'Elective III', courseType: 'Discipline Specific Elective 3', branch: 'BBA', semester: 6, credits: 6, isLab: false, isElective: true },
  { courseCode: 'DSE-4', courseTitle: 'Elective IV', courseType: 'Discipline Specific Elective 4', branch: 'BBA', semester: 6, credits: 6, isLab: false, isElective: true },
  { courseCode: 'BMPD602-18', courseTitle: 'Mentoring and Professional Development', courseType: 'Mentoring and Professional Development', branch: 'BBA', semester: 6, credits: 1, isLab: true, isElective: false },
];

const BCASubjects = [
  // Semester 1
  { courseCode: 'UGCC2501', courseTitle: 'Mathematics', courseType: 'Core Course (CC)', branch: 'BCA', semester: 1, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGSEC2501', courseTitle: 'Problem Solving Techniques', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 1, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGSEC2502', courseTitle: 'Problem Solving Techniques Laboratory', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 1, credits: 2, isLab: true, isElective: false },
  { courseCode: 'UGCC2502', courseTitle: 'Computer Architecture', courseType: 'Core Course (CC)', branch: 'BCA', semester: 1, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2503', courseTitle: 'Office Automation', courseType: 'Core Course (CC)', branch: 'BCA', semester: 1, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGAEC2501', courseTitle: 'General English  - I', courseType: 'Ability Enhancement Course (AEC)', branch: 'BCA', semester: 1, credits: 2, isLab: false, isElective: false },
  { courseCode: 'UGMDE2501', courseTitle: 'Indian Knowledge System', courseType: 'Multi-Disciplinary Elective (MDE)', branch: 'BCA', semester: 1, credits: 1, isLab: false, isElective: true },
  { courseCode: 'UGVAC2501', courseTitle: 'Environmental Science and Sustainability', courseType: 'Value Added Course (VAC)', branch: 'BCA', semester: 1, credits: 2, isLab: false, isElective: false },
  { courseCode: 'HVPE101-18', courseTitle: 'Human Values, De-addiction and Traffic Rules', courseType: 'Core Course (CC)', branch: 'BCA', semester: 1, credits: 3, isLab: false, isElective: false },
  { courseCode: 'HVPE102-18', courseTitle: 'Human Values, De-addiction and Traffic Rules (Lab/Seminar)', courseType: 'Core Course (CC)', branch: 'BCA', semester: 1, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGAEC2502', courseTitle: 'Additional Indian/Foreign Language (Optional)', courseType: 'Ability Enhancement Course (AEC)', branch: 'BCA', semester: 1, credits: 1, isLab: false, isElective: true },
  // Semester 2
  { courseCode: 'UGCC2504', courseTitle: 'Fundamentals of Statistics', courseType: 'Core Course (CC)', branch: 'BCA', semester: 2, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2505', courseTitle: 'Fundamentals of Statistics Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 2, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGCC2506', courseTitle: 'Data Structures  - I', courseType: 'Core Course (CC)', branch: 'BCA', semester: 2, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2507', courseTitle: 'Data Structures  - I Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 2, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGCC2508', courseTitle: 'Operating Systems', courseType: 'Core Course (CC)', branch: 'BCA', semester: 2, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2509', courseTitle: 'Operating Systems Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 2, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGSEC2503', courseTitle: 'Object Oriented Programming using C++', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 2, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGSEC2504', courseTitle: 'Object Oriented Programming using C++ Laboratory', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 2, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGSEC2505', courseTitle: 'Web Technologies', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 2, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGSEC2506', courseTitle: 'Web Technologies Laboratory', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 2, credits: 1, isLab: true, isElective: false },
  { courseCode: 'EMC-101-25', courseTitle: 'Entrepreneurship Setup and Launch', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 2, credits: 2, isLab: true, isElective: false },
  { courseCode: 'UGVAC2502', courseTitle: 'Indian Constitution', courseType: 'Value Added Course (VAC)', branch: 'BCA', semester: 2, credits: 1, isLab: false, isElective: false },
  { courseCode: 'UGAEC2503', courseTitle: 'Additional Indian/Foreign Language (Optional)', courseType: 'Ability Enhancement Course (AEC)', branch: 'BCA', semester: 2, credits: 1, isLab: false, isElective: true },
  // Semester 3
  { courseCode: 'UGCC2510', courseTitle: 'Data Structures  - II', courseType: 'Core Course (CC)', branch: 'BCA', semester: 3, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2511', courseTitle: 'Data Structures  - II Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 3, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGCC2512', courseTitle: 'Database Management System  - I', courseType: 'Core Course (CC)', branch: 'BCA', semester: 3, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2513', courseTitle: 'Database Management System  - I Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 3, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGSEC2507', courseTitle: 'Python Programming', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 3, credits: 2, isLab: false, isElective: false },
  { courseCode: 'UGSEC2508', courseTitle: 'Python Programming Laboratory', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 3, credits: 2, isLab: true, isElective: false },
  { courseCode: 'UGCC2514', courseTitle: 'Software Engineering', courseType: 'Core Course (CC)', branch: 'BCA', semester: 3, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2515', courseTitle: 'Software Engineering Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 3, credits: 1, isLab: true, isElective: false },
  { courseCode: 'BCA-PE-I', courseTitle: 'Professional Elective  - I', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 3, credits: 3, isLab: false, isElective: true },
  { courseCode: 'BCA-PE-I-LAB', courseTitle: 'Professional Elective  - I Laboratory', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 3, credits: 1, isLab: true, isElective: true },
  { courseCode: 'UGVAC2503', courseTitle: 'Yoga/Sports/NCC/NSS/Disaster Management', courseType: 'Value Added Course (VAC)', branch: 'BCA', semester: 3, credits: 1, isLab: true, isElective: false },
  // Semester 4
  { courseCode: 'UGCC2516', courseTitle: 'Entrepreneurship and Startup Ecosystem', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 2, isLab: false, isElective: false },
  { courseCode: 'UGCC2517', courseTitle: 'Computer Networks  - I', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2518', courseTitle: 'Computer Networks  - I Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGCC2519', courseTitle: 'Design and Analysis of Algorithms', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2520', courseTitle: 'Design and Analysis of Algorithms Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGCC2521', courseTitle: 'Artificial Intelligence', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2522', courseTitle: 'Artificial Intelligence Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGCC2523', courseTitle: 'Database Management System  - II', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2524', courseTitle: 'Database Management System  - II Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 4, credits: 1, isLab: true, isElective: false },
  { courseCode: 'BCA-PE-II', courseTitle: 'Professional Elective  - II', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 4, credits: 3, isLab: false, isElective: true },
  { courseCode: 'BCA-PE-II-LAB', courseTitle: 'Professional Elective  - II Laboratory', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 4, credits: 1, isLab: true, isElective: true },
  { courseCode: 'UGSEC2509', courseTitle: 'Design Thinking and Innovation', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 4, credits: 1, isLab: false, isElective: false },
  // Semester 5
  { courseCode: 'UGCC2525', courseTitle: 'Computer Networks  - II', courseType: 'Core Course (CC)', branch: 'BCA', semester: 5, credits: 3, isLab: false, isElective: false },
  { courseCode: 'UGCC2526', courseTitle: 'Computer Networks   II Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 5, credits: 1, isLab: true, isElective: false },
  { courseCode: 'BCA-PE-III', courseTitle: 'Professional Elective   III', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 5, credits: 3, isLab: false, isElective: true },
  { courseCode: 'BCA-PE-III-LAB', courseTitle: 'Professional Elective  - III Laboratory', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 5, credits: 1, isLab: true, isElective: true },
  { courseCode: 'BCA-PE-IV', courseTitle: 'Professional Elective  - IV', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 5, credits: 3, isLab: false, isElective: true },
  { courseCode: 'BCA-PE-IV-LAB', courseTitle: 'Professional Elective  - IV Laboratory', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 5, credits: 1, isLab: true, isElective: true },
  { courseCode: 'BCA-PE-V', courseTitle: 'Professional Elective  - V', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 5, credits: 3, isLab: false, isElective: true },
  { courseCode: 'BCA-PE-V-LAB', courseTitle: 'Professional Elective  - V Laboratory', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 5, credits: 1, isLab: true, isElective: true },
  { courseCode: 'UGSEC2510', courseTitle: 'Internship/Capstone Project', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 5, credits: 1, isLab: true, isElective: false },
  { courseCode: 'UGSEC2511', courseTitle: 'Minor Project', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 5, credits: 2, isLab: true, isElective: false },
  // Semester 6
  { courseCode: 'UGCC2527', courseTitle: 'Cyber Security', courseType: 'Core Course (CC)', branch: 'BCA', semester: 6, credits: 2, isLab: false, isElective: false },
  { courseCode: 'UGCC2528', courseTitle: 'Cyber Security Laboratory', courseType: 'Core Course (CC)', branch: 'BCA', semester: 6, credits: 1, isLab: true, isElective: false },
  { courseCode: 'BCA-PE-VI', courseTitle: 'Professional Elective  - VI', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 6, credits: 3, isLab: false, isElective: true },
  { courseCode: 'BCA-PE-VI-LAB', courseTitle: 'Professional Elective  - VI Laboratory', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 6, credits: 1, isLab: true, isElective: true },
  { courseCode: 'BCA-PE-VII', courseTitle: 'Professional Elective  - VII', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 6, credits: 3, isLab: false, isElective: true },
  { courseCode: 'BCA-PE-VII-LAB', courseTitle: 'Professional Elective  - VII Laboratory', courseType: 'Discipline Specific Elective (DSE)', branch: 'BCA', semester: 6, credits: 1, isLab: true, isElective: true },
  { courseCode: 'UGAEC2504', courseTitle: 'Soft Skills', courseType: 'Ability Enhancement Course (AEC)', branch: 'BCA', semester: 6, credits: 1, isLab: false, isElective: false },
  { courseCode: 'UGSEC2512', courseTitle: 'Major Project', courseType: 'Skill Enhancement Course (SEC)', branch: 'BCA', semester: 6, credits: 4, isLab: true, isElective: false },
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
    
    // Add BTCS subjects (Semesters 1-8)
    allSubjects.push(...BTCSSubjects);
    
    // Add BTAI subjects (Semesters 1-8)
    allSubjects.push(...BTAISubjects);

    // Add BBA subjects
    allSubjects.push(...BBASubjects);

    // Add BCA subjects
    allSubjects.push(...BCASubjects);

    // Insert all subjects
    console.log('📚 Inserting subjects for BTCS, BTAI, BBA, and BCA branches...');
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
