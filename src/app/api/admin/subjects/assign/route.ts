import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Subject from '@/models/Subject';
import Faculty from '@/models/Faculty';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// POST - Assign subject to faculty
export async function POST(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const body = await req.json();
    const { subjectId, teacherId } = body;

    console.log('Assignment request:', { subjectId, teacherId });

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    // If teacherId is null or "unassign", unassign the subject
    if (!teacherId || teacherId === 'unassign') {
      const subject = await Subject.findByIdAndUpdate(
        subjectId,
        {
          teacherId: null,
          teacherName: null,
        },
        { new: true }
      );

      if (!subject) {
        return NextResponse.json(
          { error: 'Subject not found' },
          { status: 404 }
        );
      }

      console.log('Subject unassigned:', subject);

      return NextResponse.json({
        message: 'Subject unassigned successfully',
        subject,
      });
    }

    // Verify teacher exists
    const teacher = await Faculty.findById(teacherId);
    if (!teacher) {
      console.log('Teacher not found:', teacherId);
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    console.log('Found teacher:', { id: teacher._id, name: teacher.name });

    // Update subject
    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      {
        teacherId: new mongoose.Types.ObjectId(teacherId),
        teacherName: teacher.name,
      },
      { new: true }
    );

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    console.log('Subject assigned:', { 
      id: subject._id, 
      courseCode: subject.courseCode,
      teacherId: subject.teacherId,
      teacherName: subject.teacherName 
    });

    return NextResponse.json({
      message: 'Subject assigned successfully',
      subject,
    });
  } catch (error: any) {
    console.error('Assign subject error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to assign subject' },
      { status: 500 }
    );
  }
}

// DELETE - Unassign subject from faculty
export async function DELETE(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      {
        teacherId: null,
        teacherName: null,
      },
      { new: true }
    );

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Subject unassigned successfully',
      subject,
    });
  } catch (error: any) {
    console.error('Unassign subject error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unassign subject' },
      { status: 500 }
    );
  }
}
