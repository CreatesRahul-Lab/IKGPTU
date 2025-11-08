import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Faculty from '@/models/Faculty';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET all faculty
export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const faculty = await Faculty.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ faculty });
  } catch (error: any) {
    console.error('Fetch faculty error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch faculty' },
      { status: 500 }
    );
  }
}

// POST create new faculty
export async function POST(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingFaculty = await Faculty.findOne({ email: email.toLowerCase() });
    if (existingFaculty) {
      return NextResponse.json(
        { error: 'Faculty with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new faculty
    const faculty = await Faculty.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: 'Faculty created successfully',
        faculty: {
          _id: faculty._id,
          name: faculty.name,
          email: faculty.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create faculty error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create faculty' },
      { status: 500 }
    );
  }
}
