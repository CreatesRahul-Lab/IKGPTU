'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, TrendingUp, TrendingDown } from 'lucide-react';

interface AttendanceReport {
  overall: {
    totalStudents: number;
    totalClasses: number;
    totalPresent: number;
    averagePercentage: number;
  };
  byBranch: Array<{
    branch: string;
    totalStudents: number;
    averagePercentage: number;
  }>;
  bySubject: Array<{
    subjectName: string;
    subjectCode: string;
    branch: string;
    semester: number;
    totalClasses: number;
    averagePercentage: number;
  }>;
  lowAttendance: Array<{
    studentName: string;
    rollNo: string;
    branch: string;
    semester: number;
    percentage: number;
  }>;
}

export default function AttendanceReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchReport();
    }
  }, [status, session, router, selectedBranch, selectedSemester]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedBranch !== 'ALL') params.append('branch', selectedBranch);
      if (selectedSemester !== 'ALL') params.append('semester', selectedSemester);

      const response = await fetch(`/api/admin/reports/attendance?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;

    let csv = 'Attendance Report\n\n';
    
    // Overall Stats
    csv += 'Overall Statistics\n';
    csv += 'Total Students,Total Classes,Total Present,Average Percentage\n';
    csv += `${report.overall.totalStudents},${report.overall.totalClasses},${report.overall.totalPresent},${report.overall.averagePercentage.toFixed(2)}%\n\n`;
    
    // Branch-wise
    csv += 'Branch-wise Statistics\n';
    csv += 'Branch,Total Students,Average Percentage\n';
    report.byBranch.forEach(b => {
      csv += `${b.branch},${b.totalStudents},${b.averagePercentage.toFixed(2)}%\n`;
    });
    csv += '\n';
    
    // Subject-wise
    csv += 'Subject-wise Statistics\n';
    csv += 'Subject Code,Subject Name,Branch,Semester,Total Classes,Average Percentage\n';
    report.bySubject.forEach(s => {
      csv += `${s.subjectCode},${s.subjectName},${s.branch},${s.semester},${s.totalClasses},${s.averagePercentage.toFixed(2)}%\n`;
    });
    csv += '\n';
    
    // Low Attendance
    csv += 'Students with Low Attendance (<75%)\n';
    csv += 'Roll No,Name,Branch,Semester,Attendance %\n';
    report.lowAttendance.forEach(s => {
      csv += `${s.rollNo},${s.studentName},${s.branch},${s.semester},${s.percentage.toFixed(2)}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading report...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/dashboard')}
            className="mb-4 min-h-[44px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Attendance Reports</h1>
              <p className="text-gray-600 mt-1">
                Detailed attendance analytics and insights
              </p>
            </div>
            <Button onClick={exportToCSV} className="min-h-[44px]">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="branch">Filter by Branch</Label>
                <select
                  id="branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md min-h-[44px]"
                >
                  <option value="ALL">All Branches</option>
                  <option value="BTCS">B.Tech CSE</option>
                  <option value="BTAI">B.Tech AIML</option>
                  <option value="BBA">BBA</option>
                  <option value="BCA">BCA</option>
                </select>
              </div>
              <div>
                <Label htmlFor="semester">Filter by Semester</Label>
                <select
                  id="semester"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md min-h-[44px]"
                >
                  <option value="ALL">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {report && (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.overall.totalStudents}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{report.overall.totalClasses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Present
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {report.overall.totalPresent}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Average Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      report.overall.averagePercentage >= 75
                        ? 'text-green-600'
                        : report.overall.averagePercentage >= 65
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {report.overall.averagePercentage.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Branch-wise Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Branch-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {report.byBranch.map((branch) => (
                    <div
                      key={branch.branch}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="text-sm text-gray-600 mb-1">{branch.branch}</div>
                      <div className="text-xl font-bold mb-2">
                        {branch.averagePercentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {branch.totalStudents} students
                      </div>
                      <div className="mt-2 flex items-center text-xs">
                        {branch.averagePercentage >= 75 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-green-600">Good</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                            <span className="text-red-600">Needs Improvement</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subject-wise Stats */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Subject-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Subject Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                          Subject Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                          Branch
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                          Semester
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                          Classes
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Attendance %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.bySubject.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No subject data available
                          </td>
                        </tr>
                      ) : (
                        report.bySubject.map((subject, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">
                              {subject.subjectCode}
                            </td>
                            <td className="px-4 py-3 text-sm hidden sm:table-cell">
                              {subject.subjectName}
                            </td>
                            <td className="px-4 py-3 text-sm hidden md:table-cell">
                              {subject.branch}
                            </td>
                            <td className="px-4 py-3 text-sm hidden lg:table-cell">
                              {subject.semester}
                            </td>
                            <td className="px-4 py-3 text-sm hidden lg:table-cell">
                              {subject.totalClasses}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  subject.averagePercentage >= 75
                                    ? 'bg-green-100 text-green-700'
                                    : subject.averagePercentage >= 65
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {subject.averagePercentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Low Attendance Students */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">
                  Students with Low Attendance (&lt; 75%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Roll No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                          Branch
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                          Semester
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Attendance %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.lowAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-green-600">
                            🎉 All students have good attendance!
                          </td>
                        </tr>
                      ) : (
                        report.lowAttendance.map((student, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium">{student.rollNo}</td>
                            <td className="px-4 py-3 text-sm">{student.studentName}</td>
                            <td className="px-4 py-3 text-sm hidden sm:table-cell">
                              {student.branch}
                            </td>
                            <td className="px-4 py-3 text-sm hidden md:table-cell">
                              {student.semester}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  student.percentage >= 65
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {student.percentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
