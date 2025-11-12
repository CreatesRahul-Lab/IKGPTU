'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

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

export default function AttendanceUploadPage() {
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

  const branches = ['BTCS', 'BTAI', 'BBA', 'BCA'];
  const semesters = ['3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'teacher') {
      router.push('/');
    }
  }, [status, session, router]);

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
      setLoading(true);
      const response = await fetch('/api/teacher/subjects');
      if (response.ok) {
        const data = await response.json();
        const filtered = (data.subjects || []).filter(
          (s: Subject) => s.branch === selectedBranch && s.semester === parseInt(selectedSemester)
        );
        setSubjects(filtered);
        setSelectedSubject('');
        setStudents([]);
        setAttendance([]);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/students?branch=${selectedBranch}&semester=${selectedSemester}`
      );
      if (response.ok) {
        const data = await response.json();
        const studentList = data.students || [];
        setStudents(studentList);
        
        // Initialize attendance with all absent
        const initialAttendance = studentList.map((student: Student) => ({
          studentId: student._id,
          rollNo: student.rollNo,
          name: student.name,
          status: 'A' as const,
        }));
        setAttendance(initialAttendance);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
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
    setAttendance(prev =>
      prev.map(record => ({ ...record, status: 'P' as const }))
    );
  };

  const markAllAbsent = () => {
    setAttendance(prev =>
      prev.map(record => ({ ...record, status: 'A' as const }))
    );
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedDate) {
      setError('Please select subject and date');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const subject = subjects.find(s => s._id === selectedSubject);
      if (!subject) return;

      const response = await fetch('/api/attendance/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          subjectId: selectedSubject,
          subjectCode: subject.courseCode,
          subjectName: subject.courseTitle,
          branch: selectedBranch,
          semester: parseInt(selectedSemester),
          records: attendance,
        }),
      });

      if (response.ok) {
        setSuccess('Attendance uploaded successfully!');
        // Reset form
        setTimeout(() => {
          setSelectedSubject('');
          setStudents([]);
          setAttendance([]);
          setSuccess('');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to upload attendance');
      }
    } catch (err) {
      setError('An error occurred while uploading attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = attendance.filter(r => r.status === 'P').length;
  const absentCount = attendance.filter(r => r.status === 'A').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Upload Attendance
        </h1>
        <p className="text-gray-600 mt-1">
          Mark attendance for your classes
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Selection Form */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class Details</CardTitle>
          <CardDescription>Choose branch, semester, subject, and date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <select
                id="branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="semester">Semester</Label>
              <select
                id="semester"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
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

            <div>
              <Label htmlFor="date">Date</Label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Attendance List */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>
                  Present: <span className="font-semibold text-green-600">{presentCount}</span> | 
                  Absent: <span className="font-semibold text-red-600">{absentCount}</span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={markAllPresent}
                  variant="outline"
                  size="sm"
                  className="min-h-[44px]"
                >
                  Mark All Present
                </Button>
                <Button
                  onClick={markAllAbsent}
                  variant="outline"
                  size="sm"
                  className="min-h-[44px]"
                >
                  Mark All Absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendance.map((record) => (
                <div
                  key={record.studentId}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{record.name}</p>
                    <p className="text-sm text-gray-600">{record.rollNo}</p>
                  </div>
                  <Button
                    onClick={() => toggleAttendance(record.studentId)}
                    variant={record.status === 'P' ? 'default' : 'outline'}
                    className={`min-h-[44px] min-w-[120px] ${
                      record.status === 'P'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'border-red-300 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {record.status === 'P' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Present
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Absent
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                onClick={handleSubmit}
                disabled={submitting || attendance.length === 0}
                className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Attendance'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
