'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Upload, CheckCircle2 } from 'lucide-react';

interface Subject {
  _id: string;
  courseCode: string;
  courseTitle: string;
  branch: string;
  semester: number;
}

interface Student {
  _id: string;
  name: string;
  rollNo: string;
  email: string;
}

export default function UploadMarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState<'MST-1' | 'MST-2' | 'Assignment'>('MST-1');
  const [examDate, setExamDate] = useState('');
  const [marks, setMarks] = useState<{ [key: string]: { obtainedMarks: string; remarks: string } }>({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSubjects();
    }
  }, [status, router]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/teacher/subjects');
      if (response.ok) {
        const data = await response.json();
        setAllSubjects(data.subjects || []);
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Fetch subjects error:', err);
    }
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedSubject('');
    setStudents([]);
    setMarks({});
    
    if (semester === '') {
      setSubjects(allSubjects);
    } else {
      const filtered = allSubjects.filter(s => s.semester === parseInt(semester));
      setSubjects(filtered);
    }
  };

  const fetchStudents = async (subjectId: string) => {
    try {
      const subject = subjects.find((s) => s._id === subjectId);
      if (!subject) return;

      const response = await fetch(
        `/api/teacher/students?branch=${subject.branch}&semester=${subject.semester}`
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        
        // Initialize marks object
        const initialMarks: any = {};
        data.students.forEach((student: Student) => {
          initialMarks[student._id] = { obtainedMarks: '', remarks: '' };
        });
        setMarks(initialMarks);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    }
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setStudents([]);
    setMarks({});
    setError('');
    setSuccess('');
    if (subjectId) {
      fetchStudents(subjectId);
    }
  };

  const handleMarksChange = (studentId: string, field: 'obtainedMarks' | 'remarks', value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare marks data
      const marksData = Object.entries(marks)
        .filter(([_, data]) => data.obtainedMarks !== '')
        .map(([studentId, data]) => ({
          studentId,
          obtainedMarks: parseFloat(data.obtainedMarks),
          remarks: data.remarks,
        }));

      if (marksData.length === 0) {
        setError('Please enter marks for at least one student');
        return;
      }

      const response = await fetch('/api/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          examType,
          examDate: examDate || new Date().toISOString(),
          marks: marksData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${examType} marks uploaded successfully for ${data.marksUploaded} students`);
        // Reset form
        setMarks({});
        setExamDate('');
        setTimeout(() => {
          router.push('/teacher/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Failed to upload marks');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const totalMarks = examType === 'Assignment' ? 10 : 20;

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/teacher/dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Upload Marks</h1>
          <p className="text-muted-foreground mt-2">Upload MST-1, MST-2, or Assignment marks</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Marks Entry Form</CardTitle>
            <CardDescription>Select subject and exam type to upload marks</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selection Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => handleSemesterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <select
                    id="subject"
                    value={selectedSubject}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.courseCode} - {subject.courseTitle} ({subject.branch} Sem {subject.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examType">Exam Type *</Label>
                  <select
                    id="examType"
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MST-1">MST-1 (20 marks)</option>
                    <option value="MST-2">MST-2 (20 marks)</option>
                    <option value="Assignment">Assignment (10 marks)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    type="date"
                    id="examDate"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Marks Entry Table */}
              {students.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Roll No
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Student Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Marks (Out of {totalMarks})
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {students.map((student) => (
                          <tr key={student._id}>
                            <td className="px-4 py-3 text-sm">{student.rollNo}</td>
                            <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min="0"
                                max={totalMarks}
                                step="0.5"
                                placeholder="0"
                                value={marks[student._id]?.obtainedMarks || ''}
                                onChange={(e) =>
                                  handleMarksChange(student._id, 'obtainedMarks', e.target.value)
                                }
                                className="w-24"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="text"
                                placeholder="Optional"
                                value={marks[student._id]?.remarks || ''}
                                onChange={(e) =>
                                  handleMarksChange(student._id, 'remarks', e.target.value)
                                }
                                className="w-full"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  {success}
                </div>
              )}

              {/* Submit Button */}
              {students.length > 0 && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="min-w-[200px]">
                    {loading ? (
                      'Uploading...'
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Marks
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
