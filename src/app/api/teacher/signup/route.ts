import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import Faculty from '@/models/Faculty';
import { z } from 'zod';

const teacherSignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = teacherSignupSchema.parse(body);
    
    await connectDB();
    
    // Check if email already exists
    const existingEmail = await Faculty.findOne({ 
      email: validatedData.email.toLowerCase() 
    });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Create faculty
    const faculty = await Faculty.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      isActive: true,
      emailVerified: false,
    });
    
    return NextResponse.json(
      {
        message: 'Faculty registration successful! Please login.',
        user: {
          id: faculty._id,
          name: faculty.name,
          email: faculty.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Teacher signup error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
