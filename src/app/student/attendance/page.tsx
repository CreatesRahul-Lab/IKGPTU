'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Subject {
  _id: string;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  credits: number;
  isLab: boolean;
  attendance?: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
}

export default function StudentAttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchAttendance();
    }
  }, [status, router]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/student/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance');
      }

      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-600 mt-1">
          View your attendance records for all subjects
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Subjects List */}
      {!subjects || subjects.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              No subjects found for your semester
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const attendance = subject.attendance || { total: 0, present: 0, absent: 0, percentage: 0 };
            return (
              <Card
                key={subject._id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/student/subject/${subject._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{subject.courseTitle}</CardTitle>
                      <CardDescription className="mt-1">
                        {subject.courseCode}
                      </CardDescription>
                    </div>
                    {subject.isLab && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        Lab
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Course Type</span>
                      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{subject.courseType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Credits</span>
                      <span className="text-sm font-medium text-gray-900">{subject.credits}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Attendance</span>
                        <span className={`text-2xl font-bold ${getAttendanceColor(attendance.percentage)}`}>
                          {attendance.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {attendance.present} / {attendance.total} classes
                        </span>
                        <span className={`font-medium ${getAttendanceColor(attendance.percentage)}`}>
                          {attendance.percentage >= 75 ? '✓ Good' : attendance.percentage >= 65 ? '⚠ Warning' : '✗ Low'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
