import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Subject from '@/models/Subject';
import { calculateAttendancePercentage } from '@/lib/utils/helpers';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student']);
    
    await connectDB();
    
    // Get all subjects for student's branch and semester
    const subjects = await Subject.find({
      branch: user.branch,
      semester: user.semester,
    }).sort({ courseCode: 1 });
    
    // Get attendance for each subject
    const stats = await Promise.all(
      subjects.map(async (subject) => {
        const attendanceRecords = await Attendance.find({
          subject: subject._id,
          branch: user.branch,
          semester: user.semester,
          'records.studentId': user.id,
        });
        
        const totalClasses = attendanceRecords.length;
        const presentClasses = attendanceRecords.filter((record) => {
          const studentRecord = record.records.find(
            (r) => r.studentId === user.id
          );
          return studentRecord?.status === 'P' || studentRecord?.status === 'L';
        }).length;
        
        const percentage = calculateAttendancePercentage(
          presentClasses,
          totalClasses
        );
        
        return {
          subject: {
            id: subject._id,
            code: subject.courseCode,
            name: subject.courseTitle,
            type: subject.courseType,
            isLab: subject.isLab,
          },
          totalClasses,
          presentClasses,
          absentClasses: totalClasses - presentClasses,
          percentage,
        };
      })
    );
    
    // Calculate overall stats
    const totalClasses = stats.reduce((sum, s) => sum + s.totalClasses, 0);
    const totalPresent = stats.reduce((sum, s) => sum + s.presentClasses, 0);
    const overallPercentage = calculateAttendancePercentage(
      totalPresent,
      totalClasses
    );
    
    return NextResponse.json({
      subjects: stats,
      overall: {
        totalClasses,
        presentClasses: totalPresent,
        absentClasses: totalClasses - totalPresent,
        percentage: overallPercentage,
      },
    });
  } catch (error: any) {
    console.error('Fetch attendance stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch attendance stats' },
      { status: 500 }
    );
  }
}
