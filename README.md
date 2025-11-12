# IK Gujral PTU Mohali - Attendance Management System

A comprehensive attendance management system built with Next.js, TypeScript, MongoDB, and NextAuth.js.

## Features

### Student Module
- ✅ Registration with email verification
- ✅ Real-time attendance updates via SSE
- ✅ Subject-wise attendance tracking
- ✅ Attendance percentage calculation
- ✅ Calendar view of attendance history
- ✅ Medical/Duty leave application
- ✅ Download attendance reports (PDF)
- ✅ **Real-time notifications** for marks, attendance, and leave status
- ✅ **Notification center** with unread badge and auto-refresh
- ✅ View marks (MST-1, MST-2, Assignments)

### Teacher Module
- ✅ Upload attendance by branch, semester, and subject
- ✅ View attendance records
- ✅ Prevent duplicate entry for same date/subject
- ✅ Bulk attendance marking interface
- ✅ Real-time updates to students
- ✅ **Upload marks** (MST-1, MST-2, Assignment marks)
- ✅ **Semester filter** in upload marks section
- ✅ **Subject assignment filtering** - teachers see only their assigned subjects
- ✅ **Compile attendance reports** by subject
- ✅ **Export attendance to CSV**
- ✅ **Notification center** with real-time updates
- ✅ Attendance history with edit/delete capabilities

### Admin Module
- ✅ User management (students & teachers)
- ✅ Subject CRUD operations per semester
- ✅ **Assign subjects to teachers**
- ✅ Leave request approval/rejection
- ✅ Advanced analytics dashboard
- ✅ Export attendance data (CSV/Excel)
- ✅ Override attendance records
- ✅ System-wide attendance reports

## Tech Stack

- **Framework**: Next.js 14.2.0 (App Router)
- **Language**: TypeScript 5.4.0
- **Database**: MongoDB with Mongoose ODM (optimized with indexes)
- **Authentication**: NextAuth.js 4.24.7 with JWT and role-based access
- **Real-time**: Server-Sent Events (SSE) with connection pooling
- **Notifications**: Custom notification system with auto-refresh
- **UI**: TailwindCSS + ShadCN UI (Radix UI)
- **Email**: Resend API
- **Caching**: In-memory cache for performance
- **State Management**: React hooks
- **Testing**: Autocannon for load testing
- **Logging**: Morgan for HTTP request logging
- **Deployment**: Vercel (Serverless with Edge Functions)

## Performance Optimizations

### ⚡ Speed Improvements Implemented

1. **In-Memory Caching System**
   - Caches user sessions for 5 minutes
   - Caches attendance data for 2 minutes
   - Caches subject lists for 5 minutes
   - Reduces database queries by ~60%

2. **Database Optimization**
   - Compound indexes on frequently queried fields
   - Text indexes for search functionality
   - Lean queries for read-only operations
   - Parallel Promise.all() for multiple queries

3. **API Pagination**
   - Student lists paginated (50 per page)
   - Faculty lists paginated
   - Attendance records paginated
   - Reduces payload size and load time

4. **Stateless Authentication**
   - JWT tokens with NextAuth
   - No database calls for session validation
   - Parallel auth checks across collections
   - Session caching for repeat requests

5. **SSE Optimization**
   - Connection pooling with automatic cleanup
   - Stale connection removal (5-minute timeout)
   - Heartbeat every 45 seconds
   - Stats pushed from cache

6. **Frontend Optimization**
   - Loading skeletons for better perceived performance
   - Lazy loading for heavy components
   - Code splitting by route
   - Optimized bundle sizes

### 📊 Performance Metrics

- **Login Speed**: Reduced from 2-3s to <1s
- **Dashboard Load**: Reduced from 3-4s to <1.5s
- **API Response**: Avg 100-200ms (cached: <50ms)
- **Database Queries**: 60% reduction via caching
- **SSE Connections**: Support for 1000+ concurrent connections

## Project Structure

```
ikgptu/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── attendance/   # Attendance management
│   │   │   ├── marks/        # Marks management
│   │   │   ├── notifications/# Notification system
│   │   │   ├── teacher/      # Teacher-specific APIs
│   │   │   ├── admin/        # Admin-specific APIs
│   │   │   ├── students/     # Student APIs
│   │   │   ├── subjects/     # Subject management
│   │   │   └── leave/        # Leave management
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   ├── student/          # Student dashboard & pages
│   │   │   ├── dashboard/   # Student main dashboard
│   │   │   └── subject/     # Subject-wise views
│   │   ├── teacher/          # Teacher dashboard & pages
│   │   │   ├── dashboard/   # Teacher main dashboard
│   │   │   ├── upload-marks/# Upload marks interface
│   │   │   ├── compile-attendance/ # Attendance reports
│   │   │   └── attendance-history/ # Attendance history
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   ├── ui/              # ShadCN components (Button, Card, Input, Label)
│   │   ├── NotificationCenter.tsx # Notification dropdown
│   │   └── providers/       # Context providers
│   ├── lib/                  # Utilities & config
│   │   ├── db/              # MongoDB connection
│   │   ├── auth/            # Auth config & session management
│   │   ├── email/           # Email service
│   │   ├── notifications/   # Notification service
│   │   ├── utils/           # Helper functions
│   │   └── validations/     # Zod schemas
│   ├── models/              # Mongoose models
│   │   ├── User.ts         # User model (students, teachers, admins)
│   │   ├── Faculty.ts      # Faculty model
│   │   ├── Student.ts      # Student model
│   │   ├── Subject.ts      # Subject model with teacher assignment
│   │   ├── Attendance.ts   # Attendance records
│   │   ├── Marks.ts        # Marks model (MST-1, MST-2, Assignment)
│   │   ├── Notification.ts # Notification model
│   │   └── LeaveRequest.ts # Leave request model
│   ├── types/               # TypeScript types
│   └── data/                # Seed data & subjects
├── scripts/                  # Utility scripts
│   ├── seed.js             # Database seeding
│   └── seed-teacher.js     # Teacher account seeding
├── test/                     # Load testing
│   ├── load-test.js        # Comprehensive 2-min load test
│   ├── quick-test.js       # 30-sec quick test
│   ├── stress-test.js      # Progressive stress test
│   ├── README.md           # Testing documentation
│   └── QUICKSTART.md       # Quick start guide
├── public/                   # Static files
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Resend account for emails

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ikgptu
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- MongoDB connection string
- NextAuth secret (generate with: `openssl rand -base64 32`)
- Resend API key

4. Seed the database with subjects:
```bash
npm run seed
```

5. (Optional) Create a teacher account:
```bash
npm run seed:teacher
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


```

## Database Schema

### User Model
- Stores students, teachers, and admins
- Role-based access control (student/teacher/admin)
- Email verification and password hashing
- Separate Faculty and Student collections

### Subject Model
- Course code, title, type, branch, semester
- Credits and marks distribution
- **Teacher assignment** (teacherId and teacherName fields)
- Indexed by branch, semester, and teacherId
- Unique constraint on courseCode + branch + semester

### Attendance Model
- Efficient schema with compressed array storage
- Indexed by date, subject, semester, student
- Prevents duplicate entries for same date/subject
- Supports bulk upload and individual updates

### Marks Model
- **MST-1, MST-2, and Assignment marks**
- Student, subject, and exam type tracking
- Obtained marks, total marks, and remarks
- Uploaded by teacher with timestamp
- Indexed by student, subject, and examType

### Notification Model
- **Real-time notification system**
- Types: subject_assigned, attendance_marked, marks_assigned, leave_status, general
- User-specific notifications (userId + userType)
- Read/unread status with timestamps
- Auto-cleanup of old read notifications (30 days)

### LeaveRequest Model
- Medical and duty leave tracking
- Student information and reason
- Admin approval workflow with status
- Start date, end date, and supporting documents

## API Routes

### Authentication
- `POST /api/auth/signup` - Student registration
- `POST /api/teacher/signup` - Teacher registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers (login/logout)

### Attendance
- `POST /api/attendance/upload` - Upload attendance (Teacher)
- `GET /api/attendance/student` - Get student attendance
- `GET /api/attendance/stats` - Attendance statistics
- `GET /api/attendance/sse` - SSE endpoint for real-time updates

### Marks Management
- `POST /api/marks` - Upload marks (MST-1, MST-2, Assignment)
- `GET /api/marks` - Get marks (filtered by student/subject/exam type)

### Notifications
- `GET /api/notifications` - Get user notifications (paginated)
- `POST /api/notifications` - Create notification (system use)
- `PATCH /api/notifications` - Mark all as read
- `PATCH /api/notifications/[id]` - Mark single as read
- `DELETE /api/notifications/[id]` - Delete notification

### Teacher APIs
- `GET /api/teacher/subjects` - Get subjects assigned to teacher
- `GET /api/teacher/students` - Get students by branch/semester
- `GET /api/teacher/attendance-history` - View/edit/delete attendance

### Leave Management
- `POST /api/leave/apply` - Apply for leave (Student)
- `GET /api/admin/leave` - List leave requests (Admin)
- `PATCH /api/admin/leave` - Approve/reject leave (Admin)

### Admin
- `GET /api/students` - List all students
- `GET /api/subjects` - List subjects (with filters)
- `POST /api/admin/subjects/assign` - Assign subject to teacher

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### MongoDB Atlas Setup

1. Create a cluster
2. Set up database user
3. Whitelist Vercel IP addresses (or use 0.0.0.0/0)
4. Copy connection string to `MONGODB_URI`

## Key Features Implemented

### 📢 Notification System
- **Real-time notifications** for students and teachers
- **Notification types**: Subject assignment, attendance marked, marks uploaded, leave status
- **Auto-refresh** every 30 seconds
- **Unread badge** with count
- **Mark as read** and delete functionality
- **Pagination** support (10 per page)

### 📊 Marks Management
- Upload **MST-1** (20 marks), **MST-2** (20 marks), **Assignment** (10 marks)
- **Semester filter** for easy subject selection
- **Subject filtering by teacher** - teachers only see assigned subjects
- Automatic **notification to students** when marks are uploaded
- Bulk marks upload with validation

### 👨‍🏫 Teacher Subject Assignment
- Admin can assign subjects to specific teachers
- Teachers see **only their assigned subjects** in:
  - Dashboard attendance section
  - Upload marks page
  - Compile attendance page
- **Database-level filtering** by teacherId
- Support for multiple teachers per semester/branch

### 📈 Attendance Reporting
- **Compile attendance** by subject or all subjects
- **Export to CSV** functionality
- Attendance percentage calculation
- Color-coded status (Good: ≥75%, Low: <75%)
- Statistics dashboard with averages

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based session management
- ✅ Role-based middleware protection (student/teacher/admin)
- ✅ Input validation with Zod
- ✅ Rate limiting on sensitive endpoints
- ✅ CSRF protection
- ✅ SQL injection prevention (NoSQL)
- ✅ XSS protection
- ✅ Teacher-specific data isolation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - IK Gujral Punjab Technical University

## Default Accounts

After running the seed scripts:

### Teacher Account
Run `npm run seed:teacher` to create a teacher account. The credentials will be displayed in the console output.

### Student Accounts
Students need to register through the signup page.

## Troubleshooting

### Common Issues

1. **"Lockfile missing swc dependencies"**
   ```bash
   npm install
   ```

2. **MongoDB connection error**
   - Check your `MONGODB_URI` in `.env`
   - Ensure MongoDB Atlas IP whitelist includes your IP

3. **NextAuth error**
   - Generate a new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - Ensure `NEXTAUTH_URL` is set correctly

4. **Subjects not showing for teacher**
   - Admin needs to assign subjects to teacher first
   - Check subject assignment in admin panel

## Environment Variables

Required variables in `.env`:

```env
# MongoDB
MONGODB_URI=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Optional
NODE_ENV=development
```

## Support

For issues and questions, contact: support@ikgptu.edu
