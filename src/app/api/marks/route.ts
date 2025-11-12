import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Marks from '@/models/Marks';
import Subject from '@/models/Subject';
import Student from '@/models/Student';
import { NotificationService } from '@/lib/notifications/notification-service';

export const dynamic = 'force-dynamic';

// POST - Upload marks
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['teacher', 'admin']);
    await connectDB();

    const body = await req.json();
    const { subjectId, examType, examDate, marks } = body;

    // Validate required fields
    if (!subjectId || !examType || !marks || marks.length === 0) {
      return NextResponse.json(
        { error: 'Subject, exam type, and marks data are required' },
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

    // Determine total marks based on exam type
    const totalMarks = examType === 'Assignment' ? 10 : 20;

    // Create marks records
    const marksRecords = [];
    for (const mark of marks) {
      const { studentId, obtainedMarks, remarks } = mark;

      // Validate obtained marks
      if (obtainedMarks < 0 || obtainedMarks > totalMarks) {
        continue; // Skip invalid marks
      }

      // Check if marks already exist
      const existingMarks = await Marks.findOne({
        student: studentId,
        subject: subjectId,
        examType,
      });

      if (existingMarks) {
        // Update existing marks
        existingMarks.obtainedMarks = obtainedMarks;
        existingMarks.remarks = remarks || '';
        existingMarks.examDate = examDate || new Date();
        existingMarks.uploadedBy = user.id;
        existingMarks.uploadedByName = user.name;
        await existingMarks.save();
        marksRecords.push(existingMarks);
      } else {
        // Create new marks
        const newMarks = new Marks({
          student: studentId,
          subject: subjectId,
          subjectCode: subject.courseCode,
          subjectName: subject.courseTitle,
          branch: subject.branch,
          semester: subject.semester,
          examType,
          totalMarks,
          obtainedMarks,
          uploadedBy: user.id,
          uploadedByName: user.name,
          remarks: remarks || '',
          examDate: examDate || new Date(),
        });

        await newMarks.save();
        marksRecords.push(newMarks);
      }

      // Send notification to student
      try {
        await NotificationService.notifyMarksAssigned(
          studentId,
          subject.courseTitle,
          obtainedMarks,
          totalMarks,
          examType
        );
      } catch (notifError) {
        console.error('Failed to send notification to student:', studentId, notifError);
        // Don't fail the entire request if notification fails
      }
    }

    return NextResponse.json(
      {
        message: `${examType} marks uploaded successfully`,
        marksUploaded: marksRecords.length,
        marks: marksRecords,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload marks error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload marks' },
      { status: 500 }
    );
  }
}

// GET - Fetch marks
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student', 'teacher', 'admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const examType = searchParams.get('examType');
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');

    const query: any = {};

    // For students, only show their marks
    if (user.role === 'student') {
      query.student = user.id;
    }

    if (subjectId) query.subject = subjectId;
    if (examType) query.examType = examType;
    if (branch) query.branch = branch;
    if (semester) query.semester = parseInt(semester);

    const marks = await Marks.find(query)
      .populate('student', 'name rollNo email')
      .populate('subject', 'courseCode courseTitle')
      .sort({ createdAt: -1 });

    return NextResponse.json({ marks });
  } catch (error: any) {
    console.error('Fetch marks error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch marks' },
      { status: 500 }
    );
  }
}
