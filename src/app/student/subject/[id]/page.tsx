'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AttendanceRecord {
  date: string;
  status: 'P' | 'A' | 'L';
  uploadedByName: string;
}

interface SubjectDetails {
  _id: string;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  credits: number;
  isLab: boolean;
  branch: string;
  semester: number;
  attendance: {
    total: number;
    present: number;
    absent: number;
    leave: number;
    percentage: number;
    records: AttendanceRecord[];
  };
}

export default function SubjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<SubjectDetails | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && subjectId) {
      fetchSubjectDetails();
    }
  }, [status, subjectId, router]);

  const fetchSubjectDetails = async () => {
    try {
      // First, fetch the subject details
      const subjectResponse = await fetch(`/api/subjects?_id=${subjectId}`);
      
      if (!subjectResponse.ok) {
        throw new Error('Subject not found');
      }

      const subjectData = await subjectResponse.json();
      const subjectInfo = subjectData.subjects?.[0];
      
      if (!subjectInfo) {
        throw new Error('Subject not found');
      }

      // Then fetch attendance data for this subject
      try {
        const attendanceResponse = await fetch(`/api/attendance/student?subjectId=${subjectId}`);
        
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();
          setSubject({
            ...subjectInfo,
            attendance: attendanceData.attendance || {
              total: 0,
              present: 0,
              absent: 0,
              leave: 0,
              percentage: 0,
              records: []
            }
          });
        } else {
          // No attendance data yet
          setSubject({
            ...subjectInfo,
            attendance: {
              total: 0,
              present: 0,
              absent: 0,
              leave: 0,
              percentage: 0,
              records: []
            }
          });
        }
      } catch (attendanceErr) {
        // If attendance fetch fails, still show subject with empty attendance
        setSubject({
          ...subjectInfo,
          attendance: {
            total: 0,
            present: 0,
            absent: 0,
            leave: 0,
            percentage: 0,
            records: []
          }
        });
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'P':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Present</span>;
      case 'A':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">Absent</span>;
      case 'L':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">On Leave</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subject details...</p>
        </div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Subject not found'}</p>
              <Button onClick={() => router.push('/student/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/student/dashboard')}
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{subject.courseTitle}</h1>
                <p className="text-sm text-gray-600">{subject.courseCode}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-600">{session?.user?.rollNo}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Info & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Classes</CardDescription>
              <CardTitle className="text-3xl">{subject.attendance?.total || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Present</CardDescription>
              <CardTitle className="text-3xl text-green-600">{subject.attendance?.present || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Absent</CardDescription>
              <CardTitle className="text-3xl text-red-600">{subject.attendance?.absent || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Attendance %</CardDescription>
              <CardTitle className={`text-3xl ${subject.attendance ? getAttendanceColor(subject.attendance.percentage) : 'text-gray-400'}`}>
                {subject.attendance?.percentage !== undefined ? subject.attendance.percentage.toFixed(1) : '0.0'}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Subject Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subject Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Course Type</p>
                <p className="font-medium text-gray-900">{subject.courseType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Credits</p>
                <p className="font-medium text-gray-900">{subject.credits}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="font-medium text-gray-900">{subject.branch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Semester</p>
                <p className="font-medium text-gray-900">{subject.semester}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>Complete attendance history for this subject</CardDescription>
          </CardHeader>
          <CardContent>
            {!subject.attendance || !subject.attendance.records || subject.attendance.records.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No attendance records yet
              </p>
            ) : (
              <div className="space-y-2">
                {subject.attendance.records.map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(record.date)}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(record.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Marked by</p>
                      <p className="text-sm font-medium text-gray-900">{record.uploadedByName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
