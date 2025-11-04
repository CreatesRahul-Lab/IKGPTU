'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  leave: number;
  percentage: number;
}

interface Subject {
  _id: string;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  credits: number;
  isLab: boolean;
  isElective: boolean;
  attendance?: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      // Fetch all subjects for the student's semester
      const subjectsResponse = await fetch(`/api/subjects?branch=${session?.user?.branch}&semester=${session?.user?.semester}`);
      
      if (!subjectsResponse.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const subjectsData = await subjectsResponse.json();
      
      // Fetch attendance data
      const attendanceResponse = await fetch('/api/attendance/student');
      
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        
        // Group attendance by subject
        const attendanceBySubject: Record<string, any> = {};
        
        if (attendanceData.attendance && Array.isArray(attendanceData.attendance)) {
          attendanceData.attendance.forEach((record: any) => {
            const subjectId = record.subject.id.toString();
            if (!attendanceBySubject[subjectId]) {
              attendanceBySubject[subjectId] = {
                total: 0,
                present: 0,
                absent: 0,
              };
            }
            attendanceBySubject[subjectId].total++;
            if (record.status === 'P' || record.status === 'L') {
              attendanceBySubject[subjectId].present++;
            } else {
              attendanceBySubject[subjectId].absent++;
            }
          });
        }
        
        // Calculate percentage for each subject
        Object.keys(attendanceBySubject).forEach(subjectId => {
          const data = attendanceBySubject[subjectId];
          data.percentage = data.total > 0 ? (data.present / data.total) * 100 : 0;
        });
        
        // Merge subjects with attendance data
        const mergedSubjects = subjectsData.subjects.map((subject: Subject) => {
          const attendanceStats = attendanceBySubject[subject._id] || { 
            total: 0, 
            present: 0, 
            absent: 0, 
            percentage: 0 
          };
          return {
            ...subject,
            attendance: attendanceStats
          };
        });
        
        setSubjects(mergedSubjects);
      } else {
        // No attendance data yet, just show subjects
        setSubjects(subjectsData.subjects.map((s: Subject) => ({
          ...s,
          attendance: { total: 0, present: 0, absent: 0, percentage: 0 }
        })));
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load data');
      setStats(null);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return 'Good Standing';
    if (percentage >= 65) return 'Warning';
    return 'Critical';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {session.user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.rollNo}</p>
                <p className="text-xs text-gray-600">
                  {session.user?.branch} - Sem {session.user?.semester}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Quick Action */}
        <div className="mb-8 flex justify-end">
          <Button onClick={() => router.push('/student/leave/apply')}>
            Apply for Leave
          </Button>
        </div>

        {/* Subject Cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Subjects</h2>
              <p className="text-sm text-gray-600">Click on any subject to view detailed attendance</p>
            </div>
          </div>

          {!subjects || subjects.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-gray-500">
                  No subjects found for your semester
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <span className="text-sm font-medium text-gray-900">{subject.courseType}</span>
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
      </main>
    </div>
  );
}
