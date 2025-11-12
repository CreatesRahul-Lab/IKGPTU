'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  GraduationCap, 
  BarChart3,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  totalSubjects: number;
  overallAttendance: number;
  activeStudents: number;
  activeFaculty: number;
}

interface Activity {
  id: string;
  type: 'attendance' | 'marks' | 'leave';
  action: string;
  description: string;
  actor: string;
  timestamp: Date;
  details?: any;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    overallAttendance: 0,
    activeStudents: 0,
    activeFaculty: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/unauthorized');
      } else {
        fetchDashboardStats();
        fetchRecentActivities();
      }
    }
  }, [status, session, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await fetch('/api/admin/activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <UserCheck className="h-4 w-4" />;
      case 'marks':
        return <BarChart3 className="h-4 w-4" />;
      
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'text-green-600 bg-green-50';
      case 'marks':
        return 'text-purple-600 bg-purple-50';
      
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {session?.user?.name}
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Students */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeStudents} active
              </p>
            </CardContent>
          </Card>

          {/* Total Faculty */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFaculty}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeFaculty} active
              </p>
            </CardContent>
          </Card>

          {/* Total Subjects */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubjects}</div>
              <p className="text-xs text-muted-foreground">
                Across all branches
              </p>
            </CardContent>
          </Card>

          {/* Overall Attendance */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overallAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Institute average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Student Management */}
          <Link href="/admin/students">
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Student Management</CardTitle>
                </div>
                <CardDescription>
                  View, add, edit, and manage student accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <Button className="w-full min-h-[44px]">Manage Students</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Faculty Management */}
          <Link href="/admin/faculty">
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Faculty Management</CardTitle>
                </div>
                <CardDescription>
                  View, add, edit, and manage faculty accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <Button className="w-full min-h-[44px]">Manage Faculty</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Attendance Reports */}
          <Link href="/admin/reports">
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Attendance Reports</CardTitle>
                </div>
                <CardDescription>
                  View detailed attendance reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <Button className="w-full min-h-[44px]">View Reports</Button>
              </CardContent>
            </Card>
          </Link>

          {/* Subject Management */}
          <Link href="/admin/subjects">
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Subject Management</CardTitle>
                </div>
                <CardDescription>
                  Manage subjects, courses, and curriculum
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <Button className="w-full min-h-[44px]">Manage Subjects</Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest updates and actions across the system</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-3">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activities found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                        <span>{activity.actor}</span>
                        <span>•</span>
                        <span>{formatTimestamp(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
