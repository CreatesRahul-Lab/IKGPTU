import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import { calculateAttendancePercentage } from '@/lib/utils/helpers';
import { cache, cacheKeys } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student']);
    const { searchParams } = new URL(req.url);
    
    const subjectId = searchParams.get('subjectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Check cache first
    const cacheKey = cacheKeys.attendance(user.id, subjectId || 'all');
    if (!startDate && !endDate) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }
    
    await connectDB();
    
    const query: any = {
      branch: user.branch,
      semester: user.semester,
      'records.studentId': user.id.toString(),
    };
    
    if (subjectId) {
      query.subject = subjectId;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Optimized query with lean() for better performance
    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .select('date subject subjectCode subjectName records')
      .lean()
      .exec();
    
    // Process records to extract student's attendance
    const processedRecords = attendanceRecords.map((record) => {
      const studentRecord = record.records.find(
        (r) => r.studentId.toString() === user.id.toString()
      );
      
      return {
        id: record._id,
        date: record.date,
        subject: {
          id: record.subject,
          code: record.subjectCode,
          name: record.subjectName,
        },
        status: studentRecord?.status || 'A',
      };
    });
    
    // Calculate statistics if subject-specific
    let stats = null;
    if (subjectId && processedRecords.length > 0) {
      const totalClasses = processedRecords.length;
      const presentClasses = processedRecords.filter(
        (r) => r.status === 'P' || r.status === 'L'
      ).length;
      const percentage = calculateAttendancePercentage(
        presentClasses,
        totalClasses
      );
      
      stats = {
        totalClasses,
        presentClasses,
        absentClasses: totalClasses - presentClasses,
        percentage,
      };
    }
    
    const response = {
      attendance: processedRecords,
      stats,
    };
    
    // Cache response for 2 minutes if no date filter
    if (!startDate && !endDate) {
      cache.set(cacheKey, response, 2 * 60 * 1000);
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Fetch student attendance error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}
