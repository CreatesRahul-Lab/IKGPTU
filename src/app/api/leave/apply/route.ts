import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import { leaveRequestSchema } from '@/lib/validations/schemas';

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['student']);
    const body = await req.json();
    
    // Validate input
    const validatedData = leaveRequestSchema.parse(body);
    
    await connectDB();
    
    // Create leave request
    const leaveRequest = await LeaveRequest.create({
      studentId: user.id,
      studentName: user.name,
      rollNo: user.rollNo,
      branch: user.branch,
      semester: user.semester,
      leaveType: validatedData.leaveType,
      startDate: new Date(validatedData.startDate),
      endDate: new Date(validatedData.endDate),
      reason: validatedData.reason,
      documentUrl: validatedData.documentUrl,
      status: 'Pending',
    });
    
    return NextResponse.json(
      {
        message: 'Leave request submitted successfully',
        leaveRequest: {
          id: leaveRequest._id,
          leaveType: leaveRequest.leaveType,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          status: leaveRequest.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Leave request error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to submit leave request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['student']);
    const { searchParams } = new URL(req.url);
    
    const status = searchParams.get('status');
    
    await connectDB();
    
    const query: any = { studentId: user.id };
    if (status) query.status = status;
    
    const leaveRequests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .select('-studentId');
    
    return NextResponse.json({ leaveRequests });
  } catch (error: any) {
    console.error('Fetch leave requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}
