'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, History, BookOpen, Users, FileText, ClipboardCheck } from 'lucide-react';

interface DashboardStats {
  totalSubjects: number;
  totalStudents: number;
  attendanceMarkedToday: number;
  pendingLeaves: number;
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalStudents: 0,
    attendanceMarkedToday: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDashboardStats();
    }
  }, [status, router]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher's assigned subjects
      const subjectsResponse = await fetch('/api/teacher/subjects');
      const subjectsData = await subjectsResponse.json();
      
      setStats({
        totalSubjects: subjectsData.subjects?.length || 0,
        totalStudents: 0, // TODO: Calculate from assigned subjects
        attendanceMarkedToday: 0, // TODO: Fetch from attendance API
        pendingLeaves: 0, // TODO: Fetch pending leave requests
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome, {session?.user?.name}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Assigned Subjects</CardDescription>
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-3xl">{stats.totalSubjects}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Students</CardDescription>
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-3xl">{stats.totalStudents}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Attendance Today</CardDescription>
              <ClipboardCheck className="h-5 w-5 text-purple-600" />
            </div>
            <CardTitle className="text-3xl">{stats.attendanceMarkedToday}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Pending Leaves</CardDescription>
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle className="text-3xl">{stats.pendingLeaves}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/teacher/upload-attendance')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Upload Attendance</CardTitle>
                <CardDescription>Mark attendance for today</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/teacher/attendance-history')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <History className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Attendance History</CardTitle>
                <CardDescription>View past records</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/teacher/upload-marks')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Upload Marks</CardTitle>
                <CardDescription>Enter test scores</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/teacher/my-students')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">My Students</CardTitle>
                <CardDescription>View student list</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/teacher/leave-requests')}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 rounded-lg">
                <FileText className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Leave Requests</CardTitle>
                <CardDescription>Review applications</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
