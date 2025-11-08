import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const subjectId = searchParams.get('subjectId');

    if (!branch || !semester) {
      return NextResponse.json(
        { error: 'Branch and semester are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get all students for the branch and semester
    const students = await Student.find({
      branch,
      semester: parseInt(semester),
    }).select('_id name rollNo').lean();

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No students found for this branch and semester' },
        { status: 404 }
      );
    }

    // Build query for attendance records
    const attendanceQuery: any = {
      branch,
      semester: parseInt(semester),
    };

    // If specific subject is selected, filter by subject
    if (subjectId && subjectId !== 'all') {
      attendanceQuery.subject = subjectId;
    }

    // Get all attendance records for this branch and semester (and subject if specified)
    const attendanceRecords = await Attendance.find(attendanceQuery)
      .select('records')
      .lean();

    // Calculate attendance for each student
    const attendanceData = students.map((student: any) => {
      let totalClasses = 0;
      let attendedClasses = 0;

      // Count attendance across all records
      attendanceRecords.forEach((record: any) => {
        const studentRecord = record.records.find(
          (r: any) => r.studentId.toString() === student._id.toString()
        );

        if (studentRecord) {
          totalClasses++;
          if (studentRecord.status === 'P') {
            attendedClasses++;
          }
        }
      });

      // Calculate percentage: (attended / total) * 100
      const attendancePercentage = totalClasses > 0 
        ? (attendedClasses / totalClasses) * 100 
        : 0;

      return {
        studentId: student._id.toString(),
        name: student.name,
        rollNo: student.rollNo,
        totalClasses,
        attendedClasses,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100, // Round to 2 decimal places
      };
    });

    return NextResponse.json({
      success: true,
      attendanceData,
      summary: {
        totalStudents: students.length,
        goodAttendance: attendanceData.filter(s => s.attendancePercentage >= 75).length,
        lowAttendance: attendanceData.filter(s => s.attendancePercentage < 75).length,
        averageAttendance: attendanceData.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length,
      }
    });
  } catch (error: any) {
    console.error('Error compiling attendance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compile attendance' },
      { status: 500 }
    );
  }
}
