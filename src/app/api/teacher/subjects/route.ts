import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Subject from '@/models/Subject';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(['teacher', 'admin']);
    await connectDB();

    console.log('Fetching subjects for teacher:', user.id);

    // Fetch only subjects assigned to this teacher
    // Convert user.id string to ObjectId for comparison
    const subjects = await Subject.find({
      teacherId: new mongoose.Types.ObjectId(user.id),
    }).sort({ branch: 1, semester: 1, courseCode: 1 });

    console.log('Found subjects:', subjects.length);

    return NextResponse.json({
      subjects,
      count: subjects.length,
    });
  } catch (error: any) {
    console.error('Fetch teacher subjects error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}
