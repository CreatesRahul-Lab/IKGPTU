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

### Teacher Module
- ✅ Upload attendance by branch, semester, and subject
- ✅ View attendance records
- ✅ Prevent duplicate entry for same date/subject
- ✅ Bulk attendance marking interface
- ✅ Real-time updates to students

### Admin Module
- ✅ User management (students & teachers)
- ✅ Subject CRUD operations per semester
- ✅ Leave request approval/rejection
- ✅ Advanced analytics dashboard
- ✅ Export attendance data (CSV/Excel)
- ✅ Override attendance records
- ✅ System-wide attendance reports

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with role-based access
- **Real-time**: Server-Sent Events (SSE)
- **UI**: TailwindCSS + ShadCN UI
- **Email**: Resend
- **State Management**: React Query
- **Deployment**: Vercel (Serverless)

## Project Structure

```
ikgptu/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── (auth)/            # Auth pages (login/signup)
│   │   ├── student/           # Student dashboard
│   │   ├── teacher/           # Teacher dashboard
│   │   ├── admin/             # Admin panel
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # ShadCN components
│   │   ├── student/          # Student components
│   │   ├── teacher/          # Teacher components
│   │   ├── admin/            # Admin components
│   │   └── shared/           # Shared components
│   ├── lib/                   # Utilities & config
│   │   ├── db/               # Database connection
│   │   ├── auth/             # Auth config
│   │   ├── email/            # Email service
│   │   ├── utils/            # Helper functions
│   │   └── validations/      # Zod schemas
│   ├── models/               # Mongoose models
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript types
│   └── data/                 # Seed data
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

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### User Model
- Stores students, teachers, and admins
- Role-based access control
- Separate collections per semester for students

### Subject Model
- Course code, title, type, branch, semester
- Credits and marks distribution

### Attendance Model
- Efficient schema with compressed array storage
- Indexed by date, subject, semester
- Prevents duplicate entries

### LeaveRequest Model
- Medical and duty leave tracking
- Admin approval workflow

## API Routes

### Authentication
- `POST /api/auth/signup` - Student registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Attendance
- `POST /api/attendance/upload` - Upload attendance (Teacher)
- `GET /api/attendance/student` - Get student attendance
- `GET /api/attendance/stats` - Attendance statistics
- `GET /api/attendance/sse` - SSE endpoint for real-time updates

### Leave Management
- `POST /api/leave/apply` - Apply for leave (Student)
- `GET /api/leave/list` - List leave requests (Admin)
- `PATCH /api/leave/approve` - Approve/reject leave (Admin)

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/subjects` - CRUD subjects
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/export` - Export attendance data

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

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based session management
- ✅ Role-based middleware protection
- ✅ Input validation with Zod
- ✅ Rate limiting on sensitive endpoints
- ✅ CSRF protection
- ✅ SQL injection prevention (NoSQL)
- ✅ XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - IK Gujral Punjab Technical University

## Support

For issues and questions, contact: support@ikgptu.edu
