import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Marks from '@/models/Marks';
import { cache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student']);
    
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const examType = searchParams.get('examType');

    // Check cache first
    const cacheKey = `marks:${user.id}:${subjectId || 'all'}:${examType || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();

    // Build query
    const query: any = {
      student: user.id,
    };

    if (subjectId) {
      query.subject = subjectId;
    }

    if (examType) {
      query.examType = examType;
    }

    // Fetch marks with optimized query
    const marks = await Marks.find(query)
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean()
      .exec();

    // Group marks by subject and exam type
    const groupedMarks: any = {};
    let totalObtained = 0;
    let totalMax = 0;

    marks.forEach((mark: any) => {
      const subjectKey = mark.subjectCode;
      
      if (!groupedMarks[subjectKey]) {
        groupedMarks[subjectKey] = {
          subjectId: mark.subject,
          subjectCode: mark.subjectCode,
          subjectName: mark.subjectName,
          marks: {},
          total: 0,
          maxTotal: 0,
        };
      }

      groupedMarks[subjectKey].marks[mark.examType] = {
        obtained: mark.obtainedMarks,
        total: mark.totalMarks,
        percentage: ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(2),
        remarks: mark.remarks,
        examDate: mark.examDate,
        uploadedBy: mark.uploadedByName,
        uploadedAt: mark.createdAt,
      };

      groupedMarks[subjectKey].total += mark.obtainedMarks;
      groupedMarks[subjectKey].maxTotal += mark.totalMarks;
      
      totalObtained += mark.obtainedMarks;
      totalMax += mark.totalMarks;
    });

    // Calculate percentages for each subject
    Object.keys(groupedMarks).forEach((key) => {
      const subject = groupedMarks[key];
      subject.percentage = subject.maxTotal > 0
        ? ((subject.total / subject.maxTotal) * 100).toFixed(2)
        : '0.00';
    });

    const response = {
      marks: Object.values(groupedMarks),
      summary: {
        totalObtained,
        totalMax,
        overallPercentage: totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : '0.00',
        totalSubjects: Object.keys(groupedMarks).length,
      },
    };

    // Cache for 5 minutes
    cache.set(cacheKey, response, 5 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Fetch student marks error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch marks' },
      { status: 500 }
    );
  }
}
