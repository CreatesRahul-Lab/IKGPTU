import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import dbConnect from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Marks from '@/models/Marks';
import LeaveRequest from '@/models/LeaveRequest';

export const dynamic = 'force-dynamic';

interface Activity {
  id: string;
  type: 'attendance' | 'marks' | 'leave';
  action: string;
  description: string;
  actor: string;
  timestamp: Date;
  details?: any;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const limit = 20; // Get last 20 activities
    const activities: Activity[] = [];

    // Fetch recent attendance uploads
    const recentAttendance = await Attendance.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    recentAttendance.forEach((att: any) => {
      activities.push({
        id: att._id.toString(),
        type: 'attendance',
        action: 'Attendance Uploaded',
        description: `${att.uploadedByName} uploaded attendance for ${att.subjectName} (${att.branch} - Sem ${att.semester})`,
        actor: att.uploadedByName,
        timestamp: att.createdAt,
        details: {
          subject: att.subjectName,
          subjectCode: att.subjectCode,
          branch: att.branch,
          semester: att.semester,
          date: att.date,
          totalPresent: att.totalPresent,
          totalAbsent: att.totalAbsent,
          totalStudents: att.totalStudents,
        },
      });
    });

    // Fetch recent marks uploads
    const recentMarks = await Marks.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    recentMarks.forEach((mark: any) => {
      activities.push({
        id: mark._id.toString(),
        type: 'marks',
        action: 'Marks Uploaded',
        description: `${mark.uploadedByName} uploaded ${mark.examType} marks for ${mark.subjectName} (${mark.branch} - Sem ${mark.semester})`,
        actor: mark.uploadedByName,
        timestamp: mark.createdAt,
        details: {
          subject: mark.subjectName,
          subjectCode: mark.subjectCode,
          branch: mark.branch,
          semester: mark.semester,
          examType: mark.examType,
        },
      });
    });

    // Fetch recent leave requests
    const recentLeaves = await LeaveRequest.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    recentLeaves.forEach((leave: any) => {
      let action = 'Leave Request';
      let description = '';
      
      if (leave.status === 'Pending') {
        action = 'Leave Request Submitted';
        description = `${leave.studentName} (${leave.rollNo}) submitted a ${leave.leaveType} leave request`;
      } else if (leave.status === 'Approved') {
        action = 'Leave Request Approved';
        description = `${leave.reviewedByName} approved ${leave.studentName}'s ${leave.leaveType} leave request`;
      } else if (leave.status === 'Rejected') {
        action = 'Leave Request Rejected';
        description = `${leave.reviewedByName} rejected ${leave.studentName}'s ${leave.leaveType} leave request`;
      }

      activities.push({
        id: leave._id.toString(),
        type: 'leave',
        action,
        description,
        actor: leave.status === 'Pending' ? leave.studentName : leave.reviewedByName || leave.studentName,
        timestamp: leave.status === 'Pending' ? leave.createdAt : (leave.reviewedAt || leave.createdAt),
        details: {
          student: leave.studentName,
          rollNo: leave.rollNo,
          branch: leave.branch,
          semester: leave.semester,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate,
          status: leave.status,
        },
      });
    });

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    return NextResponse.json({ 
      success: true, 
      activities: limitedActivities,
      total: limitedActivities.length 
    });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities', details: error.message },
      { status: 500 }
    );
  }
}
