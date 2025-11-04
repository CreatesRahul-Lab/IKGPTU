import { z } from 'zod';

// Student Signup Schema
export const studentSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  rollNo: z.string().min(5, 'Roll number is required').toUpperCase(),
  branch: z.enum(['BTCS', 'BTAI', 'BBA', 'BCA']),
  semester: z.number().int().min(1).max(8),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Teacher Create Schema
export const teacherCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  employeeId: z.string().min(3),
  department: z.string().min(2),
  password: z.string().min(6),
});

// Attendance Upload Schema
export const attendanceUploadSchema = z.object({
  date: z.string().or(z.date()),
  subjectId: z.string(),
  subjectCode: z.string(),
  subjectName: z.string(),
  branch: z.enum(['BTCS', 'BTAI', 'BBA', 'BCA']),
  semester: z.number().int().min(1).max(8),
  records: z.array(
    z.object({
      studentId: z.string(),
      rollNo: z.string(),
      name: z.string(),
      status: z.enum(['P', 'A', 'L']),
    })
  ),
  academicYear: z.string(),
});

// Leave Request Schema
export const leaveRequestSchema = z.object({
  leaveType: z.enum(['Medical', 'Duty']),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  reason: z.string().min(10).max(500),
  documentUrl: z.string().url().optional(),
});

// Leave Approval Schema
export const leaveApprovalSchema = z.object({
  leaveId: z.string(),
  status: z.enum(['Approved', 'Rejected']),
  comments: z.string().max(500).optional(),
});

// Subject Create Schema
export const subjectCreateSchema = z.object({
  courseCode: z.string().min(3).toUpperCase(),
  courseTitle: z.string().min(3),
  courseType: z.string(),
  branch: z.enum(['BTCS', 'BTAI', 'BBA', 'BCA']),
  semester: z.number().int().min(1).max(8),
  credits: z.number().int().min(0).default(4),
  internalMarks: z.number().int().min(0).default(40),
  externalMarks: z.number().int().min(0).default(60),
  totalMarks: z.number().int().min(0).default(100),
  isLab: z.boolean().default(false),
  isElective: z.boolean().default(false),
});

export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TeacherCreateInput = z.infer<typeof teacherCreateSchema>;
export type AttendanceUploadInput = z.infer<typeof attendanceUploadSchema>;
export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
export type LeaveApprovalInput = z.infer<typeof leaveApprovalSchema>;
export type SubjectCreateInput = z.infer<typeof subjectCreateSchema>;
