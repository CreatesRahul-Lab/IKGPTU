import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Assignment from '@/models/Assignment';
import Marks from '@/models/Marks';

export const dynamic = 'force-dynamic';

// POST - Submit assignment (for students)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(['student']);
    await connectDB();

    const { id } = params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      (sub: any) => sub.student.toString() === user.id
    );

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Assignment already submitted' },
        { status: 400 }
      );
    }

    // Add submission
    assignment.submissions.push({
      student: user.id,
      studentName: user.name,
      rollNo: user.rollNo,
      submittedAt: new Date(),
    } as any);

    await assignment.save();

    return NextResponse.json({
      message: 'Assignment submitted successfully',
      assignment,
    });
  } catch (error: any) {
    console.error('Submit assignment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit assignment' },
      { status: 500 }
    );
  }
}

// PATCH - Grade assignment (for teachers)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole(['teacher', 'admin']);
    await connectDB();

    const body = await req.json();
    const { studentId, obtainedMarks, feedback } = body;

    const { id } = params;
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Find submission
    const submission = assignment.submissions.find(
      (sub: any) => sub.student.toString() === studentId
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission with marks
    submission.obtainedMarks = obtainedMarks;
    submission.feedback = feedback || '';
    submission.isGraded = true;

    await assignment.save();

    // Also create a marks entry for the assignment
    let marksEntry = await Marks.findOne({
      student: studentId,
      subject: assignment.subject,
      examType: 'Assignment',
    });

    if (marksEntry) {
      marksEntry.obtainedMarks = obtainedMarks;
      marksEntry.remarks = feedback || '';
    } else {
      marksEntry = new Marks({
        student: studentId,
        subject: assignment.subject,
        subjectCode: assignment.subjectCode,
        subjectName: assignment.subjectName,
        branch: assignment.branch,
        semester: assignment.semester,
        examType: 'Assignment',
        totalMarks: assignment.totalMarks,
        obtainedMarks,
        uploadedBy: user.id,
        uploadedByName: user.name,
        remarks: feedback || '',
        examDate: new Date(),
      });
    }

    await marksEntry.save();

    return NextResponse.json({
      message: 'Assignment graded successfully',
      assignment,
    });
  } catch (error: any) {
    console.error('Grade assignment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grade assignment' },
      { status: 500 }
    );
  }
}
