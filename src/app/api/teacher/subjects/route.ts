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

    console.log('\n=== FETCHING SUBJECTS ===');
    console.log('User ID:', user.id);
    console.log('User Role:', user.role);
    console.log('User Name:', user.name);

    let subjects;

    if (user.role === 'admin') {
      // Admin can see all subjects
      subjects = await Subject.find({}).sort({ branch: 1, semester: 1, courseCode: 1 });
      console.log('Admin: Fetched all subjects:', subjects.length);
    } else {
      // Teachers see ONLY their assigned subjects
      // Convert user.id string to ObjectId for comparison
      subjects = await Subject.find({
        teacherId: new mongoose.Types.ObjectId(user.id),
      }).sort({ branch: 1, semester: 1, courseCode: 1 });

      console.log('Teacher: Found assigned subjects:', subjects.length);
      if (subjects.length > 0) {
        console.log('Assigned subjects:');
        subjects.forEach((s) => {
          console.log(`  - ${s.courseCode}: ${s.courseTitle} (${s.branch} Sem ${s.semester})`);
        });
      } else {
        console.log('⚠️  No subjects assigned to this teacher');
      }
    }

    console.log('=== END ===\n');

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
