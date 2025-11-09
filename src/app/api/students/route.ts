import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Student from '@/models/Student';
import { cache, cacheKeys } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['teacher', 'admin']);
    
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get('branch');
    const semester = searchParams.get('semester');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    
    if (!branch || !semester) {
      return NextResponse.json(
        { error: 'Branch and semester are required' },
        { status: 400 }
      );
    }
    
    // Check cache first
    const cacheKey = `students:${branch}:${semester}:${page}:${limit}:${search || 'all'}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
    
    await connectDB();
    
    // Build query
    const query: any = {
      branch,
      semester: parseInt(semester),
      isActive: true
    };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Execute paginated query with lean() for better performance
    const [students, total] = await Promise.all([
      Student.find(query)
        .select('name rollNo email branch semester')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ rollNo: 1 })
        .lean()
        .exec(),
      Student.countDocuments(query),
    ]);
    
    const response = {
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
    
    // Cache for 2 minutes
    cache.set(cacheKey, response, 2 * 60 * 1000);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Fetch students error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
