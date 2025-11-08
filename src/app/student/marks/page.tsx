'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';

interface MarksRecord {
  _id: string;
  subject: {
    courseCode: string;
    courseTitle: string;
  };
  examType: string;
  totalMarks: number;
  obtainedMarks: number;
  remarks: string;
  examDate: string;
  uploadedByName: string;
}

export default function StudentMarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<MarksRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchMarks();
    }
  }, [status, router]);

  const fetchMarks = async () => {
    try {
      const response = await fetch('/api/marks');
      if (response.ok) {
        const data = await response.json();
        setMarks(data.marks || []);
      } else {
        setError('Failed to fetch marks');
      }
    } catch (err) {
      console.error('Fetch marks error:', err);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const groupMarksBySubject = () => {
    const grouped: { [key: string]: MarksRecord[] } = {};
    marks.forEach((mark) => {
      const subjectKey = `${mark.subject.courseCode} - ${mark.subject.courseTitle}`;
      if (!grouped[subjectKey]) {
        grouped[subjectKey] = [];
      }
      grouped[subjectKey].push(mark);
    });
    return grouped;
  };

  const getPercentage = (obtained: number, total: number) => {
    return ((obtained / total) * 100).toFixed(1);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const groupedMarks = groupMarksBySubject();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">My Marks</h1>
          <p className="text-muted-foreground mt-2">
            View your MST-1, MST-2, and Assignment marks
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Marks Display */}
        {marks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-muted-foreground">No marks uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMarks).map(([subjectName, subjectMarks]) => (
              <Card key={subjectName}>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">{subjectName}</CardTitle>
                  <CardDescription>
                    Total Marks: {subjectMarks.reduce((sum, m) => sum + m.obtainedMarks, 0)} /{' '}
                    {subjectMarks.reduce((sum, m) => sum + m.totalMarks, 0)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Exam Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Marks Obtained
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Total Marks
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Percentage
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Remarks
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Exam Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {subjectMarks.map((mark) => {
                          const percentage = parseFloat(
                            getPercentage(mark.obtainedMarks, mark.totalMarks)
                          );
                          return (
                            <tr key={mark._id}>
                              <td className="px-4 py-3 text-sm font-medium">{mark.examType}</td>
                              <td className="px-4 py-3 text-sm">{mark.obtainedMarks}</td>
                              <td className="px-4 py-3 text-sm">{mark.totalMarks}</td>
                              <td
                                className={`px-4 py-3 text-sm font-semibold ${getGradeColor(
                                  percentage
                                )}`}
                              >
                                {percentage}%
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {mark.remarks || <span className="text-gray-400">-</span>}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(mark.examDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
