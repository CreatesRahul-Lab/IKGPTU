import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Student from '@/models/Student';
import Faculty from '@/models/Faculty';
import Subject from '@/models/Subject';
import Attendance from '@/models/Attendance';
import LeaveRequest from '@/models/LeaveRequest';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    // Get total counts
    const [
      totalStudents,
      totalFaculty,
      totalSubjects,
      activeStudents,
      activeFaculty,
      pendingLeaveRequests
    ] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Subject.countDocuments(),
      Student.countDocuments({ isActive: true }),
      Faculty.countDocuments({ isActive: true }),
      LeaveRequest.countDocuments({ status: 'pending' })
    ]);

    // Calculate overall attendance percentage
    const attendanceRecords = await Attendance.find();
    let totalClasses = 0;
    let totalPresent = 0;

    attendanceRecords.forEach(record => {
      record.records.forEach(studentRecord => {
        totalClasses++;
        if (studentRecord.status === 'P' || studentRecord.status === 'L') {
          totalPresent++;
        }
      });
    });

    const overallAttendance = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

    // Calculate students with low attendance (below 75%)
    const students = await Student.find({ isActive: true });
    let lowAttendanceCount = 0;

    for (const student of students) {
      const studentAttendance = await Attendance.find({
        branch: student.branch,
        semester: student.semester,
        'records.studentId': student._id
      });

      let studentTotal = 0;
      let studentPresent = 0;

      studentAttendance.forEach(record => {
        const studentRecord = record.records.find(
          r => r.studentId.toString() === student._id.toString()
        );
        if (studentRecord) {
          studentTotal++;
          if (studentRecord.status === 'P' || studentRecord.status === 'L') {
            studentPresent++;
          }
        }
      });

      const percentage = studentTotal > 0 ? (studentPresent / studentTotal) * 100 : 0;
      if (percentage < 75 && studentTotal > 0) {
        lowAttendanceCount++;
      }
    }

    return NextResponse.json({
      totalStudents,
      totalFaculty,
      totalSubjects,
      overallAttendance,
      activeStudents,
      activeFaculty,
      pendingLeaveRequests,
      lowAttendanceStudents: lowAttendanceCount
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
