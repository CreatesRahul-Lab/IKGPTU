import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import Student from '@/models/Student';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// PUT update leave request status
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(['admin']);
    await connectDB();

    const body = await req.json();
    const { status, reviewComments } = body;

    const { id } = await params;
    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Update status
    leaveRequest.status = status;
    leaveRequest.reviewedBy = new mongoose.Types.ObjectId(admin.id);
    leaveRequest.reviewedByName = admin.name || 'Admin';
    if (reviewComments) {
      leaveRequest.reviewComments = reviewComments;
    }
    leaveRequest.reviewedAt = new Date();

    await leaveRequest.save();

    // Optionally send email notification to student
    // You can implement this later

    return NextResponse.json({
      message: `Leave request ${status}`,
      leaveRequest,
    });
  } catch (error: any) {
    console.error('Update leave request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update leave request' },
      { status: 500 }
    );
  }
}
