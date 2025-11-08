import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET all students
export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const students = await Student.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error('Fetch students error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST create new student
export async function POST(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const body = await req.json();
    const { name, email, rollNo, branch, semester, password } = body;

    // Validate required fields
    if (!name || !email || !rollNo || !branch || !semester || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email or roll number already exists
    const existingStudent = await Student.findOne({
      $or: [{ email: email.toLowerCase() }, { rollNo }],
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this email or roll number already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const student = await Student.create({
      name,
      email: email.toLowerCase(),
      rollNo,
      branch,
      semester: parseInt(semester),
      password: hashedPassword,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: 'Student created successfully',
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
          branch: student.branch,
          semester: student.semester,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}
