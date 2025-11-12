import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Student from '@/models/Student';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// PUT update student
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const body = await req.json();
    const { name, email, rollNo, branch, semester, password, isActive } = body;

    const { id } = await params;
    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Update fields
    if (name !== undefined) student.name = name;
    if (email !== undefined) student.email = email.toLowerCase();
    if (rollNo !== undefined) student.rollNo = rollNo;
    if (branch !== undefined) student.branch = branch;
    if (semester !== undefined) student.semester = parseInt(semester);
    if (isActive !== undefined) student.isActive = isActive;
    
    // Update password if provided
    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }

    await student.save();

    return NextResponse.json({
      message: 'Student updated successfully',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        branch: student.branch,
        semester: student.semester,
        isActive: student.isActive,
      },
    });
  } catch (error: any) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error: any) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete student' },
      { status: 500 }
    );
  }
}
