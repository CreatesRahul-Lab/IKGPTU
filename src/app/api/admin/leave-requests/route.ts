import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import LeaveRequest from '@/models/LeaveRequest';

export const dynamic = 'force-dynamic';

// GET all leave requests
export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);
    await connectDB();

    const requests = await LeaveRequest.find()
      .populate('studentId', 'name email rollNo branch semester')
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Fetch leave requests error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}
