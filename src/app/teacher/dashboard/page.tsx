'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Subject {
  _id: string;
  courseCode: string;
  courseTitle: string;
  branch: string;
  semester: number;
  isLab: boolean;
}

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  email: string;
  branch: string;
  semester: number;
}

interface AttendanceRecord {
  studentId: string;
  rollNo: string;
  name: string;
  status: 'P' | 'A';
}

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedBranch, setSelectedBranch] = useState('BTCS');
  const [selectedSemester, setSelectedSemester] = useState('3');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (selectedBranch && selectedSemester) {
      fetchSubjects();
    }
  }, [selectedBranch, selectedSemester]);

  useEffect(() => {
    if (selectedBranch && selectedSemester && selectedSubject) {
      fetchStudents();
    }
  }, [selectedBranch, selectedSemester, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?branch=${selectedBranch}&semester=${selectedSemester}`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
        setSelectedSubject('');
        setStudents([]);
        setAttendance([]);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/students?branch=${selectedBranch}&semester=${selectedSemester}`);
      if (response.ok) {
        const data = await response.json();
        const studentList = data.students || [];
        setStudents(studentList);
        
        // Initialize attendance records with all students marked as Present by default
        setAttendance(studentList.map((student: Student) => ({
          studentId: student._id,
          rollNo: student.rollNo,
          name: student.name,
          status: 'P' as 'P' | 'A'
        })));
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => 
      prev.map(record => 
        record.studentId === studentId 
          ? { ...record, status: record.status === 'P' ? 'A' : 'P' }
          : record
      )
    );
  };

  const markAllPresent = () => {
    setAttendance(prev => prev.map(record => ({ ...record, status: 'P' })));
  };

  const markAllAbsent = () => {
    setAttendance(prev => prev.map(record => ({ ...record, status: 'A' })));
  };

  const handleSubmit = async () => {
    if (!selectedSubject || attendance.length === 0) {
      setError('Please select a subject and ensure students are loaded');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const subject = subjects.find(s => s._id === selectedSubject);
      
      const response = await fetch('/api/attendance/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          subjectId: selectedSubject,
          subjectCode: subject?.courseCode,
          subjectName: subject?.courseTitle,
          branch: selectedBranch,
          semester: parseInt(selectedSemester),
          records: attendance,
          academicYear: new Date().getFullYear().toString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload attendance');
      }

      setSuccess(`Attendance uploaded successfully! ${data.attendance.totalPresent} present, ${data.attendance.totalAbsent} absent.`);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess('');
        setSelectedSubject('');
        setStudents([]);
        setAttendance([]);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload attendance');
    } finally {
      setSubmitting(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {session?.user?.name}</p>
            </div>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Attendance</CardTitle>
            <CardDescription>Select branch, semester, subject, and mark attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Selection Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {[3, 4, 5, 6, 7, 8].map((sem) => (
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
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={subjects.length === 0}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.courseCode} - {subject.courseTitle}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded-md">
                  {success}
                </div>
              )}

              {/* Students List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading students...</p>
                </div>
              ) : students.length > 0 ? (
                <>
                  {/* Quick Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Total Students: {students.length} | 
                      Present: <span className="text-green-600 font-medium">{attendance.filter(a => a.status === 'P').length}</span> | 
                      Absent: <span className="text-red-600 font-medium">{attendance.filter(a => a.status === 'A').length}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={markAllPresent}>
                        Mark All Present
                      </Button>
                      <Button variant="outline" size="sm" onClick={markAllAbsent}>
                        Mark All Absent
                      </Button>
                    </div>
                  </div>

                  {/* Students Grid */}
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
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attendance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => {
                            const record = attendance.find(a => a.studentId === student._id);
                            const isPresent = record?.status === 'P';
                            
                            return (
                              <tr key={student._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {student.rollNo}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {student.name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      size="sm"
                                      variant={isPresent ? "default" : "outline"}
                                      onClick={() => toggleAttendance(student._id)}
                                      className={isPresent ? "bg-green-600 hover:bg-green-700" : ""}
                                    >
                                      P
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={!isPresent ? "default" : "outline"}
                                      onClick={() => toggleAttendance(student._id)}
                                      className={!isPresent ? "bg-red-600 hover:bg-red-700" : ""}
                                    >
                                      A
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="px-8"
                    >
                      {submitting ? 'Uploading...' : 'Upload Attendance'}
                    </Button>
                  </div>
                </>
              ) : selectedSubject ? (
                <div className="text-center py-8 text-gray-500">
                  No students found for this branch and semester
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a subject to load students
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
