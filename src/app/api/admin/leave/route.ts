import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import Student from '@/models/Student';
import { leaveApprovalSchema } from '@/lib/validations/schemas';
import { sendLeaveStatusEmail } from '@/lib/email/email-service';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);
    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get('status');
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    await connectDB();
    
    const query: any = {};
    if (status) query.status = status;
    if (branch) query.branch = branch;
    if (semester) query.semester = parseInt(semester);
    
    const skip = (page - 1) * limit;
    
    const [leaveRequests, total] = await Promise.all([
      LeaveRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LeaveRequest.countDocuments(query),
    ]);
    
    return NextResponse.json({
      leaveRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Fetch leave requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireRole(['admin']);
    const body = await req.json();
    
    // Validate input
    const validatedData = leaveApprovalSchema.parse(body);
    
    await connectDB();
    
    // Find leave request
    const leaveRequest = await LeaveRequest.findById(validatedData.leaveId);
    
    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }
    
    if (leaveRequest.status !== 'Pending') {
      return NextResponse.json(
        { error: 'Leave request already processed' },
        { status: 400 }
      );
    }
    
    // Update leave request
    leaveRequest.status = validatedData.status;
    leaveRequest.reviewedBy = admin.id as any;
    leaveRequest.reviewedByName = admin.name || 'Admin';
    leaveRequest.reviewedAt = new Date();
    leaveRequest.reviewComments = validatedData.comments;
    
    await leaveRequest.save();
    
    // Get student details for email
    const student = await Student.findById(leaveRequest.studentId);
    
    if (student) {
      // Send email notification (don't await)
      sendLeaveStatusEmail(
        student.email,
        student.name,
        leaveRequest.leaveType,
        validatedData.status,
        validatedData.comments
      ).catch(console.error);
    }
    
    return NextResponse.json({
      message: `Leave request ${validatedData.status.toLowerCase()} successfully`,
      leaveRequest: {
        id: leaveRequest._id,
        status: leaveRequest.status,
        reviewedBy: leaveRequest.reviewedByName,
        reviewedAt: leaveRequest.reviewedAt,
      },
    });
  } catch (error: any) {
    console.error('Leave approval error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to process leave request' },
      { status: 500 }
    );
  }
}
