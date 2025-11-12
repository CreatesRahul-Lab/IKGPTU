import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Faculty from '@/models/Faculty';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// PUT update faculty
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { name, email, password, isActive } = body;

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Update fields
    if (name !== undefined) faculty.name = name;
    if (email !== undefined) faculty.email = email.toLowerCase();
    if (isActive !== undefined) faculty.isActive = isActive;
    
    // Update password if provided
    if (password) {
      faculty.password = await bcrypt.hash(password, 10);
    }

    await faculty.save();

    return NextResponse.json({
      message: 'Faculty updated successfully',
      faculty: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        isActive: faculty.isActive,
      },
    });
  } catch (error: any) {
    console.error('Update faculty error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update faculty' },
      { status: 500 }
    );
  }
}

// DELETE faculty
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { id } = await params;
    const faculty = await Faculty.findByIdAndDelete(id);
    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Faculty deleted successfully' });
  } catch (error: any) {
    console.error('Delete faculty error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete faculty' },
      { status: 500 }
    );
  }
}
