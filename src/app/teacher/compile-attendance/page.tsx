'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  email: string;
  branch: string;
  semester: number;
}

interface Subject {
  _id: string;
  courseCode: string;
  courseTitle: string;
  branch: string;
  semester: number;
}

interface StudentAttendance {
  studentId: string;
  name: string;
  rollNo: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
}

export default function CompileAttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedBranch, setSelectedBranch] = useState('BTCS');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [isCompiled, setIsCompiled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedBranch && selectedSemester) {
      fetchSubjects();
      fetchStudents();
      setIsCompiled(false);
      setAttendanceData([]);
      setSelectedSubject('all');
    }
  }, [selectedBranch, selectedSemester]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?branch=${selectedBranch}&semester=${selectedSemester}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/teacher/students?branch=${selectedBranch}&semester=${selectedSemester}`
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const compileAttendance = async () => {
    if (students.length === 0) {
      setError('No students found for selected branch and semester');
      return;
    }

    setCompiling(true);
    setError('');

    try {
      const url = selectedSubject === 'all'
        ? `/api/attendance/compile?branch=${selectedBranch}&semester=${selectedSemester}`
        : `/api/attendance/compile?branch=${selectedBranch}&semester=${selectedSemester}&subjectId=${selectedSubject}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to compile attendance');
      }

      const data = await response.json();
      setAttendanceData(data.attendanceData || []);
      setIsCompiled(true);
    } catch (err: any) {
      console.error('Failed to compile attendance:', err);
      setError(err.message || 'Failed to compile attendance');
    } finally {
      setCompiling(false);
    }
  };

  const exportToCSV = () => {
    if (attendanceData.length === 0) return;

    const headers = ['Roll No', 'Student Name', 'Total Classes', 'Attended Classes', 'Attendance %', 'Status'];
    const rows = attendanceData.map(student => [
      student.rollNo,
      student.name,
      student.totalClasses.toString(),
      student.attendedClasses.toString(),
      student.attendancePercentage.toFixed(2) + '%',
      student.attendancePercentage >= 75 ? 'Good' : 'Low'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedBranch}_sem${selectedSemester}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Compile Attendance</h1>
              <p className="text-xs sm:text-sm text-gray-600">Generate attendance reports for students</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/teacher/dashboard')}
              className="text-xs sm:text-sm"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Select Branch, Semester, and Subject</CardTitle>
            <CardDescription>Choose the branch, semester, and subject to compile attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Selection Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Branch Selection */}
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <select
                    id="branch"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BTCS">B.Tech CSE</option>
                    <option value="BTAI">B.Tech AIML</option>
                    <option value="BBA">BBA</option>
                    <option value="BCA">BCA</option>
                  </select>
                </div>

                {/* Semester Selection */}
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setIsCompiled(false);
                      setAttendanceData([]);
                    }}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.courseCode} - {subject.courseTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                  {error}
                </div>
              )}

              {/* Students Info */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading students...</p>
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Total Students: <span className="font-semibold text-gray-900">{students.length}</span>
                    </p>
                    <Button
                      onClick={compileAttendance}
                      disabled={compiling}
                      className="px-6"
                    >
                      {compiling ? 'Compiling...' : 'Compile Attendance'}
                    </Button>
                  </div>

                  {/* Students List */}
                  {!isCompiled && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Roll No
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                              <tr key={student._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {student.rollNo}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {student.name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {student.email}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Compiled Attendance Data */}
                  {isCompiled && attendanceData.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Attendance Report</h3>
                        <Button variant="outline" size="sm" onClick={exportToCSV}>
                          📥 Export to CSV
                        </Button>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-600 font-medium">Total Students</p>
                          <p className="text-2xl font-bold text-blue-900">{attendanceData.length}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-600 font-medium">Good Attendance</p>
                          <p className="text-2xl font-bold text-green-900">
                            {attendanceData.filter(s => s.attendancePercentage >= 75).length}
                          </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-sm text-red-600 font-medium">Low Attendance</p>
                          <p className="text-2xl font-bold text-red-900">
                            {attendanceData.filter(s => s.attendancePercentage < 75).length}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-600 font-medium">Average</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {(attendanceData.reduce((sum, s) => sum + s.attendancePercentage, 0) / attendanceData.length).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Attendance Table */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Roll No
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student Name
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Total Classes
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Attended
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Attendance %
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {attendanceData
                                .sort((a, b) => a.attendancePercentage - b.attendancePercentage)
                                .map((student) => {
                                  const isLowAttendance = student.attendancePercentage < 75;
                                  return (
                                    <tr 
                                      key={student.studentId} 
                                      className={`hover:bg-gray-50 ${
                                        isLowAttendance ? 'bg-red-50' : 'bg-green-50'
                                      }`}
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {student.rollNo}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {student.name}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                        {student.totalClasses}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                        {student.attendedClasses}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <span className={`text-sm font-bold ${
                                          isLowAttendance ? 'text-red-700' : 'text-green-700'
                                        }`}>
                                          {student.attendancePercentage.toFixed(2)}%
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          isLowAttendance 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                          {isLowAttendance ? '⚠️ Low' : '✓ Good'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No students found for this branch and semester
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
