# IK Gujral PTU Attendance Management System
## Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Features Implementation](#features-implementation)
6. [Installation Guide](#installation-guide)
7. [Deployment Guide](#deployment-guide)
8. [Usage Guide](#usage-guide)

---

## 🎯 Project Overview

A comprehensive attendance management system for IK Gujral Punjab Technical University with:
- **Real-time updates** via Server-Sent Events (SSE)
- **Role-based access control** (Student, Teacher, Admin)
- **Automated email notifications**
- **Subject-wise attendance tracking**
- **Leave management system**
- **Analytics dashboard**

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, ShadCN UI
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT
- **Email**: Resend API
- **Real-time**: Server-Sent Events (SSE)
- **Deployment**: Vercel

---

## 🏗️ Architecture

### Project Structure
```
ikgptu/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/   # NextAuth handlers
│   │   │   │   └── signup/          # Student registration
│   │   │   ├── attendance/
│   │   │   │   ├── upload/          # Upload attendance (Teacher)
│   │   │   │   ├── student/         # Get student attendance
│   │   │   │   ├── stats/           # Attendance statistics
│   │   │   │   └── sse/             # SSE real-time endpoint
│   │   │   ├── leave/
│   │   │   │   └── apply/           # Apply for leave
│   │   │   ├── admin/
│   │   │   │   └── leave/           # Admin leave management
│   │   │   └── subjects/            # Subject CRUD
│   │   ├── (auth)/
│   │   │   ├── login/               # Login page
│   │   │   └── signup/              # Signup page
│   │   ├── student/                  # Student dashboard
│   │   ├── teacher/                  # Teacher dashboard
│   │   ├── admin/                    # Admin panel
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Landing page
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── ui/                      # ShadCN UI components
│   │   ├── providers/               # Context providers
│   │   ├── student/                 # Student components
│   │   ├── teacher/                 # Teacher components
│   │   └── admin/                   # Admin components
│   ├── lib/
│   │   ├── db/
│   │   │   └── mongodb.ts           # DB connection
│   │   ├── auth/
│   │   │   ├── auth-options.ts     # NextAuth config
│   │   │   └── session.ts          # Session helpers
│   │   ├── email/
│   │   │   └── email-service.ts    # Email functions
│   │   ├── utils/
│   │   │   └── helpers.ts          # Utility functions
│   │   ├── validations/
│   │   │   └── schemas.ts          # Zod schemas
│   │   └── utils.ts                # Common utilities
│   ├── models/                      # Mongoose models
│   │   ├── User.ts
│   │   ├── Subject.ts
│   │   ├── Attendance.ts
│   │   └── LeaveRequest.ts
│   ├── hooks/                       # Custom React hooks
│   ├── types/                       # TypeScript types
│   │   └── next-auth.d.ts          # NextAuth type extensions
│   └── data/
│       └── subjects.ts              # Seed data (B.Tech subjects)
├── public/                          # Static assets
├── .env.example                     # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md
```

---

## 💾 Database Schema

### 1. User Model
```typescript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: 'student' | 'teacher' | 'admin',
  
  // Student fields
  rollNo?: String (unique, indexed),
  branch?: 'BTCS' | 'BTES' | 'BTAM' | 'BTOE' | 'BBA' | 'BCA',
  semester?: Number (1-8),
  
  // Teacher fields
  employeeId?: String (unique),
  department?: String,
  
  isActive: Boolean,
  emailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- email (unique)
- rollNo (sparse, unique)
- { branch, semester, role }
```

### 2. Subject Model
```typescript
{
  _id: ObjectId,
  courseCode: String (e.g., 'BTCS301-18'),
  courseTitle: String,
  courseType: String,
  branch: String,
  semester: Number,
  credits: Number,
  internalMarks: Number,
  externalMarks: Number,
  totalMarks: Number,
  isLab: Boolean,
  isElective: Boolean,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { courseCode, branch, semester } (unique)
- { branch, semester }
```

### 3. Attendance Model
```typescript
{
  _id: ObjectId,
  date: Date (indexed),
  subject: ObjectId (ref: Subject),
  subjectCode: String,
  subjectName: String,
  branch: String,
  semester: Number,
  uploadedBy: ObjectId (ref: User),
  uploadedByName: String,
  records: [{
    studentId: String,
    rollNo: String,
    name: String,
    status: 'P' | 'A' | 'L'
  }],
  totalPresent: Number,
  totalAbsent: Number,
  totalStudents: Number,
  academicYear: String (e.g., '2024-2025'),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { date, subject, semester, branch } (unique)
- { 'records.studentId', date }
- { branch, semester, date }
- { academicYear, branch, semester }
```

### 4. LeaveRequest Model
```typescript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  studentName: String,
  rollNo: String,
  branch: String,
  semester: Number,
  leaveType: 'Medical' | 'Duty',
  startDate: Date,
  endDate: Date,
  reason: String,
  documentUrl?: String,
  status: 'Pending' | 'Approved' | 'Rejected',
  reviewedBy?: ObjectId (ref: User),
  reviewedByName?: String,
  reviewedAt?: Date,
  reviewComments?: String,
  createdAt: Date,
  updatedAt: Date
}

Indexes:
- { studentId, status, createdAt }
- { status, createdAt }
- { branch, semester, status }
```

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/signup
Body: { name, email, rollNo, branch, semester, password }
Response: { message, user }

POST /api/auth/[...nextauth]
NextAuth handlers (login, session, etc.)
```

### Attendance Management
```
POST /api/attendance/upload (Teacher)
Body: { date, subjectId, subjectCode, subjectName, branch, semester, records[], academicYear }
Response: { message, attendance }

GET /api/attendance/student (Student)
Query: ?subjectId=xxx&startDate=xxx&endDate=xxx
Response: { attendance[], stats }

GET /api/attendance/stats (Student)
Response: { subjects[], overall: { totalClasses, percentage } }

GET /api/attendance/sse (Student)
Server-Sent Events endpoint for real-time updates
```

### Leave Management
```
POST /api/leave/apply (Student)
Body: { leaveType, startDate, endDate, reason, documentUrl? }
Response: { message, leaveRequest }

GET /api/leave/apply (Student)
Query: ?status=Pending
Response: { leaveRequests[] }

GET /api/admin/leave (Admin)
Query: ?status=Pending&branch=BTCS&semester=3&page=1
Response: { leaveRequests[], pagination }

PATCH /api/admin/leave (Admin)
Body: { leaveId, status, comments? }
Response: { message, leaveRequest }
```

### Subject Management
```
GET /api/subjects
Query: ?branch=BTCS&semester=3
Response: { subjects[] }

POST /api/subjects (Admin)
Body: { courseCode, courseTitle, branch, semester, ... }
Response: { message, subject }
```

---

## ✨ Features Implementation

### 1. Real-time Updates (SSE)

**Server Side** (`/api/attendance/sse/route.ts`):
```typescript
// Maintains open connections
const connections = new Map<string, ReadableStreamDefaultController>();

// Sends events to connected clients
export function broadcastToClients(message: any, filter?: Function) {
  connections.forEach((controller, connectionId) => {
    const data = `data: ${JSON.stringify(message)}\n\n`;
    controller.enqueue(new TextEncoder().encode(data));
  });
}
```

**Client Side** (React Hook):
```typescript
useEffect(() => {
  const eventSource = new EventSource('/api/attendance/sse');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'attendance_uploaded') {
      // Refetch attendance data
      queryClient.invalidateQueries(['attendance']);
    }
  };
  
  return () => eventSource.close();
}, []);
```

### 2. Attendance Calculation

```typescript
export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100 * 100) / 100;
}

// Usage in API
const stats = subjects.map(subject => {
  const attendanceRecords = await Attendance.find({ subject._id });
  const presentClasses = records.filter(r => r.status === 'P' || r.status === 'L').length;
  const percentage = calculateAttendancePercentage(presentClasses, records.length);
  return { subject, percentage };
});
```

### 3. Role-based Access Control

**Middleware Protection**:
```typescript
export async function requireRole(roles: ('student' | 'teacher' | 'admin')[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect('/unauthorized');
  }
  return user;
}

// Usage in API routes
const user = await requireRole(['teacher', 'admin']);
```

### 4. Email Notifications

```typescript
// Welcome email on signup
sendWelcomeEmail(user.email, user.name, user.rollNo);

// Leave status update
sendLeaveStatusEmail(student.email, student.name, leaveType, status, comments);

// Low attendance alert
sendAttendanceAlert(student.email, student.name, subject, percentage);
```

### 5. Duplicate Prevention

```typescript
// Prevent duplicate attendance upload
const existingAttendance = await Attendance.findOne({
  date: new Date(validatedData.date),
  subject: validatedData.subjectId,
  semester: validatedData.semester,
  branch: validatedData.branch,
});

if (existingAttendance) {
  return NextResponse.json({ error: 'Already uploaded' }, { status: 400 });
}
```

---

## 📦 Installation Guide

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Resend account for emails

### Step 1: Clone and Install
```powershell
# Navigate to project directory
cd c:\Users\HP\ikgptu

# Install dependencies
npm install
```

### Step 2: Environment Variables
Create `.env` file:
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ikgptu_attendance?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@ikgptu.edu

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

Generate `NEXTAUTH_SECRET`:
```powershell
# Using OpenSSL (if available)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3: Seed Database
```powershell
npm run seed
```

### Step 4: Run Development Server
```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment Guide

### MongoDB Atlas Setup

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free M0 cluster
   - Choose region closest to your Vercel deployment

2. **Create Database User**:
   - Database Access → Add New Database User
   - Choose password authentication
   - Save credentials

3. **Network Access**:
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
   - Or whitelist Vercel IP addresses

4. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy connection string
   - Replace `<password>` with your password

### Resend Email Setup

1. Go to [Resend](https://resend.com)
2. Sign up and verify your domain (or use test domain)
3. Create API key
4. Copy API key for environment variables

### Vercel Deployment

1. **Push to GitHub**:
```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Import to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Environment Variables**:
   Add all variables from `.env`:
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (use your Vercel URL)
   - `NEXTAUTH_SECRET`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL`
   - `NODE_ENV=production`

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

### Post-Deployment

1. **Seed Production Database**:
```powershell
# Connect to production DB
MONGODB_URI=<production-uri> npm run seed
```

2. **Create Admin Account**:
   Manually insert admin user in MongoDB:
```javascript
db.users.insertOne({
  name: "Admin",
  email: "admin@ikgptu.edu",
  password: "$2a$12$hashed_password", // Use bcrypt
  role: "admin",
  isActive: true,
  emailVerified: true
});
```

3. **Test All Features**:
   - Student signup/login
   - Teacher login
   - Upload attendance
   - SSE real-time updates
   - Email delivery

---

## 📖 Usage Guide

### For Students

1. **Signup**:
   - Navigate to `/signup`
   - Fill: Name, Email, Roll No, Branch, Semester, Password
   - Receive welcome email
   - Login with credentials

2. **Dashboard**:
   - View overall attendance percentage
   - See subject-wise breakdown
   - Real-time updates when attendance is marked

3. **View Attendance**:
   - Select subject
   - View calendar with P/A markers
   - Filter by date range

4. **Apply for Leave**:
   - Navigate to Leave section
   - Select Medical or Duty leave
   - Choose dates and provide reason
   - Upload document (optional)
   - Track approval status

### For Teachers

1. **Login**:
   - Admin creates teacher account
   - Login with provided credentials

2. **Upload Attendance**:
   - Select Branch (BTCS, BTES, etc.)
   - Select Semester (1-8)
   - Select Date
   - Select Subject
   - Student list loads automatically
   - Mark P (Present) or A (Absent)
   - Submit
   - Students get real-time notification

3. **View Records**:
   - Filter by branch, semester, subject, date
   - View attendance statistics
   - Export as CSV

### For Admins

1. **Dashboard**:
   - Total students, teachers
   - Overall attendance statistics
   - Recent activity

2. **User Management**:
   - View all students/teachers
   - Create teacher accounts
   - Suspend/activate users

3. **Subject Management**:
   - Add/Edit/Delete subjects
   - Assign to branch and semester

4. **Leave Approval**:
   - View pending leave requests
   - Approve or reject
   - Add comments
   - System sends email to student

5. **Analytics**:
   - Branch-wise statistics
   - Semester-wise reports
   - Subject-wise attendance trends
   - Export data as CSV/Excel

---

## 🔒 Security Best Practices

1. **Password Hashing**: bcryptjs with salt rounds = 12
2. **JWT Tokens**: Secure, httpOnly cookies
3. **Input Validation**: Zod schemas on all inputs
4. **Rate Limiting**: Implement on sensitive endpoints
5. **CORS**: Configured for production domain only
6. **Environment Variables**: Never commit `.env`
7. **MongoDB Injection**: Mongoose sanitization
8. **XSS Protection**: React auto-escaping

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Error
**Solution**: Check MONGODB_URI, network access, and cluster status

### Issue: NextAuth Session Not Working
**Solution**: Verify NEXTAUTH_URL and NEXTAUTH_SECRET are set correctly

### Issue: SSE Not Connecting
**Solution**: Ensure route is not cached, check browser console for errors

### Issue: Emails Not Sending
**Solution**: Verify RESEND_API_KEY and domain verification

---

## 📝 Next Steps & Enhancements

1. **QR Code Attendance**: Generate QR for each class
2. **Face Recognition**: AI-based attendance marking
3. **Mobile App**: React Native app
4. **Push Notifications**: Web push for updates
5. **Biometric Integration**: Fingerprint support
6. **Advanced Analytics**: ML-based insights
7. **Bulk Import**: CSV import for students
8. **Attendance Reports**: PDF generation
9. **Parent Portal**: Parents can view attendance
10. **SMS Notifications**: Low attendance alerts

---

## 📞 Support

For issues or questions:
- **Email**: support@ikgptu.edu
- **GitHub**: Create an issue
- **Documentation**: Check README.md

---

## 📄 License

MIT License - IK Gujral Punjab Technical University

---

**Built with ❤️ for IK Gujral PTU by GitHub Copilot**
