import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import connectDB from '@/lib/db/mongodb';
import Marks from '@/models/Marks';
import Subject from '@/models/Subject';
import Student from '@/models/Student';
import { cache } from '@/lib/cache';
import { NotificationService } from '@/lib/notifications/notification-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['teacher', 'admin']);
    
    const body = await req.json();
    const {
      subjectId,
      examType,
      totalMarks,
      marks, // Array of { studentId, obtainedMarks, remarks }
      examDate,
    } = body;

    // Validate required fields
    if (!subjectId || !examType || !totalMarks || !marks || !Array.isArray(marks)) {
      return NextResponse.json(
        { error: 'Subject, exam type, total marks, and marks array are required' },
        { status: 400 }
      );
    }

    // Validate exam type
    if (!['MST-1', 'MST-2', 'Assignment'].includes(examType)) {
      return NextResponse.json(
        { error: 'Invalid exam type. Must be MST-1, MST-2, or Assignment' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get subject details
    const subject = await Subject.findById(subjectId).lean().exec();
    if (!subject) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    // Verify teacher is assigned to this subject
    if (user.role === 'teacher' && subject.teacherId?.toString() !== user.id) {
      return NextResponse.json(
        { error: 'You are not assigned to this subject' },
        { status: 403 }
      );
    }

    // Process marks upload
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const mark of marks) {
      try {
        const { studentId, obtainedMarks, remarks } = mark;

        // Validate obtained marks
        if (obtainedMarks < 0 || obtainedMarks > totalMarks) {
          results.failed++;
          results.errors.push(`Invalid marks for student ${studentId}: ${obtainedMarks}`);
          continue;
        }

        // Check if student exists
        const student = await Student.findById(studentId).lean().exec();
        if (!student) {
          results.failed++;
          results.errors.push(`Student not found: ${studentId}`);
          continue;
        }

        // Check if marks already exist for this student, subject, and exam type
        const existingMarks = await Marks.findOne({
          student: studentId,
          subject: subjectId,
          examType: examType,
        });

        if (existingMarks) {
          // Update existing marks
          existingMarks.obtainedMarks = obtainedMarks;
          existingMarks.totalMarks = totalMarks;
          existingMarks.remarks = remarks || '';
          existingMarks.uploadedBy = user.id;
          existingMarks.uploadedByName = user.name;
          if (examDate) existingMarks.examDate = new Date(examDate);
          await existingMarks.save();
        } else {
          // Create new marks entry
          await Marks.create({
            student: studentId,
            subject: subjectId,
            subjectCode: subject.courseCode,
            subjectName: subject.courseTitle,
            branch: subject.branch,
            semester: subject.semester,
            examType: examType,
            totalMarks: totalMarks,
            obtainedMarks: obtainedMarks,
            uploadedBy: user.id,
            uploadedByName: user.name,
            remarks: remarks || '',
            examDate: examDate ? new Date(examDate) : undefined,
          });
        }

        results.success++;

        // Invalidate student's marks cache
        cache.delete(`marks:${studentId}`);

        // Send notification to the student
        try {
          await NotificationService.notifyMarksAssigned(
            studentId,
            subject.courseTitle,
            obtainedMarks,
            totalMarks,
            examType
          );
        } catch (notifError) {
          console.error('Error sending marks notification:', notifError);
          // Don't fail if notification fails
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error processing student ${mark.studentId}: ${error.message}`);
      }
    }

    return NextResponse.json({
      message: 'Marks uploaded successfully',
      results,
    });
  } catch (error: any) {
    console.error('Upload marks error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload marks' },
      { status: 500 }
    );
  }
}
