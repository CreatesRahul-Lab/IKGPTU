import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Attendance from '@/models/Attendance';
import Subject from '@/models/Subject';
import User from '@/models/User';
import { attendanceUploadSchema } from '@/lib/validations/schemas';
import { getAcademicYear } from '@/lib/utils/helpers';
import { broadcastToClients } from '@/lib/sse-manager';

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['teacher', 'admin']);
    const body = await req.json();
    
    // Validate input
    const validatedData = attendanceUploadSchema.parse(body);
    
    await connectDB();
    
    // Check if attendance already exists for this date/subject/semester
    const existingAttendance = await Attendance.findOne({
      date: new Date(validatedData.date),
      subject: validatedData.subjectId,
      semester: validatedData.semester,
      branch: validatedData.branch,
    });
    
    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already uploaded for this date and subject' },
        { status: 400 }
      );
    }
    
    // Verify subject exists
    const subject = await Subject.findById(validatedData.subjectId);
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }
    
    // Create attendance record
    const attendance = await Attendance.create({
      date: new Date(validatedData.date),
      subject: validatedData.subjectId,
      subjectCode: validatedData.subjectCode,
      subjectName: validatedData.subjectName,
      branch: validatedData.branch,
      semester: validatedData.semester,
      uploadedBy: user.id,
      uploadedByName: user.name,
      records: validatedData.records,
      academicYear: validatedData.academicYear || getAcademicYear(),
    });
    
    // Broadcast to SSE clients
    broadcastToClients({
      type: 'attendance_uploaded',
      data: {
        branch: attendance.branch,
        semester: attendance.semester,
        subject: attendance.subjectName,
        date: attendance.date,
      },
    });
    
    return NextResponse.json(
      {
        message: 'Attendance uploaded successfully',
        attendance: {
          id: attendance._id,
          date: attendance.date,
          subject: attendance.subjectName,
          totalPresent: attendance.totalPresent,
          totalAbsent: attendance.totalAbsent,
          totalStudents: attendance.totalStudents,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Attendance upload error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to upload attendance' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['teacher', 'admin']);
    const { searchParams } = new URL(req.url);
    
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const subjectId = searchParams.get('subjectId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    await connectDB();
    
    const query: any = {};
    
    if (branch) query.branch = branch;
    if (semester) query.semester = parseInt(semester);
    if (subjectId) query.subject = subjectId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .select('-records'),
      Attendance.countDocuments(query),
    ]);
    
    return NextResponse.json({
      attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}
