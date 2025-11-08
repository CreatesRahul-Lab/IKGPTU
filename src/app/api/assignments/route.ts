import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Assignment from '@/models/Assignment';
import Subject from '@/models/Subject';

export const dynamic = 'force-dynamic';

// POST - Create assignment
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['teacher', 'admin']);
    await connectDB();

    const body = await req.json();
    const { title, description, subjectId, totalMarks, dueDate } = body;

    // Validate required fields
    if (!title || !description || !subjectId || !dueDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Fetch subject details
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    const assignment = new Assignment({
      title,
      description,
      subject: subjectId,
      subjectCode: subject.courseCode,
      subjectName: subject.courseTitle,
      branch: subject.branch,
      semester: subject.semester,
      totalMarks: totalMarks || 10,
      dueDate: new Date(dueDate),
      createdBy: user.id,
      createdByName: user.name,
    });

    await assignment.save();

    return NextResponse.json(
      {
        message: 'Assignment created successfully',
        assignment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create assignment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

// GET - Fetch assignments
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'teacher', 'admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');

    const query: any = {};

    // For students, filter by their branch and semester
    if (user.role === 'student') {
      query.branch = user.branch;
      query.semester = user.semester;
    } else {
      if (branch) query.branch = branch;
      if (semester) query.semester = parseInt(semester);
    }

    if (subjectId) query.subject = subjectId;

    const assignments = await Assignment.find(query)
      .populate('subject', 'courseCode courseTitle')
      .sort({ dueDate: -1 });

    // For students, add submission status
    if (user.role === 'student') {
      const assignmentsWithStatus = assignments.map((assignment) => {
        const submission = assignment.submissions.find(
          (sub: any) => sub.student.toString() === user.id
        );
        return {
          ...assignment.toObject(),
          hasSubmitted: !!submission,
          submission: submission || null,
        };
      });
      return NextResponse.json({ assignments: assignmentsWithStatus });
    }

    return NextResponse.json({ assignments });
  } catch (error: any) {
    console.error('Fetch assignments error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}
