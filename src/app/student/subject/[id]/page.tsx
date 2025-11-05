'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'P' | 'A' | 'L';
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
}

interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  percentage: number;
}

export default function SubjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<SubjectDetails | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

      setSubject(subjectInfo);

      // Then fetch attendance data for this subject
      const attendanceResponse = await fetch(`/api/attendance/student?subjectId=${subjectId}`);
      
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        console.log('Attendance data:', attendanceData);
        
        if (attendanceData.attendance && attendanceData.attendance.length > 0) {
          setAttendanceRecords(attendanceData.attendance);
        }
        
        if (attendanceData.stats) {
          setStats(attendanceData.stats);
        }
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

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getAttendanceForDate = (date: Date) => {
    // Create date string in local timezone (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return attendanceRecords.find(record => {
      // Parse the record date in local timezone
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = String(recordDate.getMonth() + 1).padStart(2, '0');
      const recordDay = String(recordDate.getDate()).padStart(2, '0');
      const recordDateStr = `${recordYear}-${recordMonth}-${recordDay}`;
      
      return recordDateStr === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1 sm:p-2 border border-gray-100"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const attendance = getAttendanceForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`aspect-square p-1 sm:p-2 border border-gray-200 relative ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          } ${attendance ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        >
          <div className="text-xs sm:text-sm font-medium text-gray-700">{day}</div>
          {attendance && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-lg sm:text-2xl font-bold ${
                  attendance.status === 'P'
                    ? 'text-green-600'
                    : attendance.status === 'L'
                    ? 'text-blue-600'
                    : 'text-red-600'
                }`}
                title={
                  attendance.status === 'P'
                    ? 'Present'
                    : attendance.status === 'L'
                    ? 'On Leave'
                    : 'Absent'
                }
              >
                {attendance.status}
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
            className="min-h-[44px] min-w-[44px] p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold">
            {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="min-h-[44px] min-w-[44px] p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className="p-1 sm:p-2 text-center text-xs sm:text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{weekDaysShort[index]}</span>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days}
        </div>

        {/* Legend */}
        <div className="p-3 sm:p-4 border-t border-gray-200 flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl font-bold text-green-600">P</span>
            <span className="text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl font-bold text-red-600">A</span>
            <span className="text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl font-bold text-blue-600">L</span>
            <span className="text-gray-600">Leave</span>
          </div>
        </div>
      </div>
    );
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/student/dashboard')}
                className="min-h-[44px]"
              >
                ← Back
              </Button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{subject.courseTitle}</h1>
                <p className="text-xs sm:text-sm text-gray-600">{subject.courseCode}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-xs text-gray-600">{session?.user?.rollNo}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Subject Info & Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardDescription className="text-xs sm:text-sm">Total Classes</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl">{stats?.totalClasses || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardDescription className="text-xs sm:text-sm">Present</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-green-600">{stats?.presentClasses || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardDescription className="text-xs sm:text-sm">Absent</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl text-red-600">{stats?.absentClasses || 0}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
              <CardDescription className="text-xs sm:text-sm">Attendance %</CardDescription>
              <CardTitle className={`text-2xl sm:text-3xl ${stats ? getAttendanceColor(stats.percentage) : 'text-gray-400'}`}>
                {stats?.percentage !== undefined ? stats.percentage.toFixed(1) : '0.0'}%
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Subject Details */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Subject Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Course Type</p>
                <p className="font-medium text-sm sm:text-base text-gray-900">{subject.courseType}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Credits</p>
                <p className="font-medium text-sm sm:text-base text-gray-900">{subject.credits}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Branch</p>
                <p className="font-medium text-sm sm:text-base text-gray-900">{subject.branch}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Semester</p>
                <p className="font-medium text-sm sm:text-base text-gray-900">{subject.semester}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">Attendance Records</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Complete attendance history for this subject</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="min-h-[44px] flex-1 sm:flex-none"
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="min-h-[44px] flex-1 sm:flex-none"
                >
                  <CalendarIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Calendar</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {attendanceRecords.length === 0 ? (
              <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">
                No attendance records yet
              </p>
            ) : viewMode === 'calendar' ? (
              renderCalendar()
            ) : (
              <div className="space-y-2">
                {attendanceRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {formatDate(record.date)}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(record.status)}
                      </div>
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
