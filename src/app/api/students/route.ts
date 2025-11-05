import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Student from '@/models/Student';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['teacher', 'admin']);
    
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    
    if (!branch || !semester) {
      return NextResponse.json(
        { error: 'Branch and semester are required' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const students = await Student.find({
      branch: branch,
      semester: parseInt(semester),
      isActive: true
    })
      .select('name rollNo email branch semester')
      .sort({ rollNo: 1 });
    
    return NextResponse.json({ students });
  } catch (error: any) {
    console.error('Fetch students error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
