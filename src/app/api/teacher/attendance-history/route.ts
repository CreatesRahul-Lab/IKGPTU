import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Subject from '@/models/Subject';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// GET - Fetch attendance history for teacher
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    if (!['teacher', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Teachers and Admins only' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const subjectId = searchParams.get('subjectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = {};
    if (branch) query.branch = branch;
    if (semester) query.semester = parseInt(semester);
    if (subjectId) query.subject = subjectId;
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Fetch attendance records with pagination
    const skip = (page - 1) * limit;
    const totalRecords = await Attendance.countDocuments(query);
    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('subject', 'courseCode courseTitle')
      .lean();

    return NextResponse.json({
      success: true,
      records: attendanceRecords,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRecords / limit),
        totalRecords,
        hasMore: page * limit < totalRecords
      }
    });
  } catch (error: any) {
    console.error('Attendance history fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch attendance history' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an attendance record
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    if (!['teacher', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Teachers and Admins only' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const attendanceId = searchParams.get('id');

    if (!attendanceId) {
      return NextResponse.json(
        { error: 'Attendance ID is required' },
        { status: 400 }
      );
    }

    const attendance = await Attendance.findByIdAndDelete(attendanceId);

    if (!attendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error: any) {
    console.error('Attendance delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete attendance record' },
      { status: 500 }
    );
  }
}

// PATCH - Update an attendance record
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    if (!['teacher', 'admin'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Teachers and Admins only' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { attendanceId, records, reason } = body;

    if (!attendanceId || !records) {
      return NextResponse.json(
        { error: 'Attendance ID and records are required' },
        { status: 400 }
      );
    }

    // Find and update the attendance record
    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    // Update records
    attendance.records = records;
    
    // Recalculate counts
    attendance.totalPresent = records.filter((r: any) => r.status === 'P').length;
    attendance.totalAbsent = records.filter((r: any) => r.status === 'A').length;
    attendance.totalStudents = records.length;

    await attendance.save();

    return NextResponse.json({
      success: true,
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error: any) {
    console.error('Attendance update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update attendance record' },
      { status: 500 }
    );
  }
}
