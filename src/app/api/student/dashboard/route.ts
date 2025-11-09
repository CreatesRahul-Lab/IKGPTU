import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Subject from '@/models/Subject';
import Attendance from '@/models/Attendance';
import { cache, cacheKeys } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student']);
    
    // Check cache first
    const cacheKey = `dashboard:student:${user.id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    await connectDB();
    
    // Use aggregation pipeline for optimal performance
    const [subjects, attendanceStats] = await Promise.all([
      // Fetch subjects with lean() for better performance
      Subject.find({
        branch: user.branch,
        semester: user.semester,
      })
        .select('courseCode courseTitle courseType credits isLab isElective')
        .lean()
        .exec(),
      
      // Aggregation pipeline to calculate attendance stats
      Attendance.aggregate([
        {
          $match: {
            branch: user.branch,
            semester: user.semester,
            'records.studentId': user.id,
          },
        },
        {
          $unwind: '$records',
        },
        {
          $match: {
            'records.studentId': user.id,
          },
        },
        {
          $group: {
            _id: '$subject',
            subjectCode: { $first: '$subjectCode' },
            subjectName: { $first: '$subjectName' },
            totalClasses: { $sum: 1 },
            presentCount: {
              $sum: {
                $cond: [
                  { $in: ['$records.status', ['P', 'L']] },
                  1,
                  0,
                ],
              },
            },
            absentCount: {
              $sum: {
                $cond: [{ $eq: ['$records.status', 'A'] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            subjectId: '$_id',
            subjectCode: 1,
            subjectName: 1,
            totalClasses: 1,
            presentCount: 1,
            absentCount: 1,
            percentage: {
              $cond: [
                { $eq: ['$totalClasses', 0] },
                0,
                {
                  $multiply: [
                    { $divide: ['$presentCount', '$totalClasses'] },
                    100,
                  ],
                },
              ],
            },
          },
        },
      ]).exec(),
    ]);
    
    // Merge subjects with attendance stats
    const attendanceMap = new Map(
      attendanceStats.map((stat: any) => [stat.subjectId.toString(), stat])
    );
    
    const subjectsWithAttendance = subjects.map((subject: any) => {
      const stats = attendanceMap.get(subject._id.toString());
      return {
        ...subject,
        attendance: stats
          ? {
              total: stats.totalClasses,
              present: stats.presentCount,
              absent: stats.absentCount,
              percentage: Math.round(stats.percentage * 100) / 100,
            }
          : null,
      };
    });
    
    // Calculate overall stats
    const totalClasses = attendanceStats.reduce(
      (sum: number, stat: any) => sum + stat.totalClasses,
      0
    );
    const totalPresent = attendanceStats.reduce(
      (sum: number, stat: any) => sum + stat.presentCount,
      0
    );
    const totalAbsent = attendanceStats.reduce(
      (sum: number, stat: any) => sum + stat.absentCount,
      0
    );
    
    const response = {
      user: {
        name: user.name,
        rollNo: user.rollNo,
        branch: user.branch,
        semester: user.semester,
      },
      stats: {
        totalClasses,
        present: totalPresent,
        absent: totalAbsent,
        leave: 0, // Calculate if you have leave data
        percentage:
          totalClasses > 0
            ? Math.round((totalPresent / totalClasses) * 100 * 100) / 100
            : 0,
      },
      subjects: subjectsWithAttendance,
    };
    
    // Cache for 1 minute
    cache.set(cacheKey, response, 60 * 1000);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
