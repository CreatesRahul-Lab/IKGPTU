import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import Student from '@/models/Student';
import { studentSignupSchema } from '@/lib/validations/schemas';
import { sendWelcomeEmail } from '@/lib/email/email-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = studentSignupSchema.parse(body);
    
    await connectDB();
    
    // Check if email already exists
    const existingEmail = await Student.findOne({ 
      email: validatedData.email.toLowerCase() 
    });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Check if roll number already exists
    const existingRollNo = await Student.findOne({ 
      rollNo: validatedData.rollNo.toUpperCase() 
    });
    
    if (existingRollNo) {
      return NextResponse.json(
        { error: 'Roll number already registered' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Create student
    const student = await Student.create({
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      rollNo: validatedData.rollNo.toUpperCase(),
      branch: validatedData.branch,
      semester: validatedData.semester,
      password: hashedPassword,
      isActive: true,
      emailVerified: false,
    });
    
    // Send welcome email (don't await to avoid blocking)
    sendWelcomeEmail(
      student.email,
      student.name,
      student.rollNo
    ).catch(console.error);
    
    return NextResponse.json(
      {
        message: 'Registration successful! Please login.',
        user: {
          id: student._id,
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
    console.error('Signup error:', error);
    
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
