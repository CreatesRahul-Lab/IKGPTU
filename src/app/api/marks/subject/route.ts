import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Marks from '@/models/Marks';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['teacher', 'admin']);
    
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const examType = searchParams.get('examType');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Build query
    const query: any = {
      subject: subjectId,
    };

    if (examType) {
      query.examType = examType;
    }

    // Fetch marks
    const marks = await Marks.find(query)
      .populate('student', 'name rollNo email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Group by exam type
    const groupedByExam: any = {
      'MST-1': [],
      'MST-2': [],
      'Assignment': [],
    };

    marks.forEach((mark: any) => {
      groupedByExam[mark.examType].push({
        id: mark._id,
        student: {
          id: mark.student._id,
          name: mark.student.name,
          rollNo: mark.student.rollNo,
          email: mark.student.email,
        },
        obtainedMarks: mark.obtainedMarks,
        totalMarks: mark.totalMarks,
        percentage: ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(2),
        remarks: mark.remarks,
        examDate: mark.examDate,
        uploadedAt: mark.createdAt,
      });
    });

    return NextResponse.json({
      marks: groupedByExam,
      stats: {
        'MST-1': {
          count: groupedByExam['MST-1'].length,
          avgPercentage: calculateAverage(groupedByExam['MST-1']),
        },
        'MST-2': {
          count: groupedByExam['MST-2'].length,
          avgPercentage: calculateAverage(groupedByExam['MST-2']),
        },
        'Assignment': {
          count: groupedByExam['Assignment'].length,
          avgPercentage: calculateAverage(groupedByExam['Assignment']),
        },
      },
    });
  } catch (error: any) {
    console.error('Fetch marks error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch marks' },
      { status: 500 }
    );
  }
}

function calculateAverage(marks: any[]): string {
  if (marks.length === 0) return '0.00';
  
  const sum = marks.reduce((acc, mark) => acc + parseFloat(mark.percentage), 0);
  return (sum / marks.length).toFixed(2);
}
