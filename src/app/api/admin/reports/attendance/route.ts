import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import Subject from '@/models/Subject';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');

    // Build query filters
    const attendanceFilter: any = {};
    const studentFilter: any = { isActive: true };
    
    if (branch && branch !== 'ALL') {
      attendanceFilter.branch = branch;
      studentFilter.branch = branch;
    }
    if (semester && semester !== 'ALL') {
      attendanceFilter.semester = parseInt(semester);
      studentFilter.semester = parseInt(semester);
    }

    // Get all attendance records
    const allAttendance = await Attendance.find(attendanceFilter);
    
    // Get all students
    const allStudents = await Student.find(studentFilter).select('name rollNo branch semester');
    
    // Get all subjects
    const allSubjects = await Subject.find(
      branch && branch !== 'ALL' ? { branch } : {}
    );

    // Calculate overall stats
    let totalClasses = 0;
    let totalPresent = 0;
    const studentAttendance: { [key: string]: { present: number; total: number } } = {};

    allAttendance.forEach((record) => {
      record.records.forEach((r) => {
        const studentId = r.studentId.toString();
        if (!studentAttendance[studentId]) {
          studentAttendance[studentId] = { present: 0, total: 0 };
        }
        studentAttendance[studentId].total++;
        totalClasses++;
        if (r.status === 'P' || r.status === 'L') {
          studentAttendance[studentId].present++;
          totalPresent++;
        }
      });
    });

    const averagePercentage =
      totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;

    // Branch-wise stats
    const branchStats: { [key: string]: { students: Set<string>; present: number; total: number } } = {};
    
    allAttendance.forEach((record) => {
      if (!branchStats[record.branch]) {
        branchStats[record.branch] = { students: new Set(), present: 0, total: 0 };
      }
      record.records.forEach((r) => {
        branchStats[record.branch].students.add(r.studentId.toString());
        branchStats[record.branch].total++;
        if (r.status === 'P' || r.status === 'L') {
          branchStats[record.branch].present++;
        }
      });
    });

    const byBranch = Object.entries(branchStats).map(([branch, stats]) => ({
      branch,
      totalStudents: stats.students.size,
      averagePercentage: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
    }));

    // Subject-wise stats
    const subjectStats: { [key: string]: { present: number; total: number; subject: any } } = {};
    
    allAttendance.forEach((record) => {
      const subjectId = record.subject.toString();
      if (!subjectStats[subjectId]) {
        const subject = allSubjects.find(s => s._id.toString() === subjectId);
        subjectStats[subjectId] = { present: 0, total: 0, subject };
      }
      record.records.forEach((r) => {
        subjectStats[subjectId].total++;
        if (r.status === 'P' || r.status === 'L') {
          subjectStats[subjectId].present++;
        }
      });
    });

    const bySubject = Object.entries(subjectStats)
      .filter(([_, stats]) => stats.subject)
      .map(([_, stats]) => ({
        subjectName: stats.subject.courseTitle,
        subjectCode: stats.subject.courseCode,
        branch: stats.subject.branch,
        semester: stats.subject.semester,
        totalClasses: stats.total,
        averagePercentage: stats.total > 0 ? (stats.present / stats.total) * 100 : 0,
      }))
      .sort((a, b) => a.subjectCode.localeCompare(b.subjectCode));

    // Low attendance students (< 75%)
    const lowAttendance = allStudents
      .map((student) => {
        const attendance = studentAttendance[student._id.toString()];
        if (!attendance || attendance.total === 0) return null;
        
        const percentage = (attendance.present / attendance.total) * 100;
        if (percentage >= 75) return null;

        return {
          studentName: student.name,
          rollNo: student.rollNo,
          branch: student.branch,
          semester: student.semester,
          percentage,
        };
      })
      .filter((s) => s !== null)
      .sort((a: any, b: any) => a.percentage - b.percentage);

    return NextResponse.json({
      overall: {
        totalStudents: allStudents.length,
        totalClasses,
        totalPresent,
        averagePercentage,
      },
      byBranch,
      bySubject,
      lowAttendance,
    });
  } catch (error: any) {
    console.error('Fetch attendance report error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch attendance report' },
      { status: 500 }
    );
  }
}
