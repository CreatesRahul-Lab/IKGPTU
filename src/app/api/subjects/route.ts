import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Subject from '@/models/Subject';
import Faculty from '@/models/Faculty';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const id = searchParams.get('_id');
    
    await connectDB();
    
    const query: any = {};
    if (id) {
      query._id = id;
    } else {
      if (branch) query.branch = branch;
      if (semester) query.semester = parseInt(semester);
    }
    
    const subjects = await Subject.find(query)
      .sort({ semester: 1, courseCode: 1 })
      .lean();
    
    return NextResponse.json({ subjects });
  } catch (error: any) {
    console.error('Fetch subjects error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(['admin']);
    const body = await req.json();
    
    await connectDB();
    
    // Check if subject already exists
    const existing = await Subject.findOne({
      courseCode: body.courseCode,
      branch: body.branch,
      semester: body.semester,
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Subject already exists for this branch and semester' },
        { status: 400 }
      );
    }
    
    const subject = await Subject.create(body);
    
    return NextResponse.json(
      {
        message: 'Subject created successfully',
        subject,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create subject error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subject' },
      { status: 500 }
    );
  }
}
