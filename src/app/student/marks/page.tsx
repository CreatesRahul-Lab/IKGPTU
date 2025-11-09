'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';

interface SubjectMarks {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  marks: {
    [examType: string]: {
      obtained: number;
      total: number;
      percentage: string;
      remarks?: string;
      examDate: string;
      uploadedBy: string;
      uploadedAt: string;
    };
  };
  total: number;
  maxTotal: number;
  percentage: string;
}

interface MarksSummary {
  totalObtained: number;
  totalMax: number;
  overallPercentage: string;
  totalSubjects: number;
}

export default function StudentMarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMarks[]>([]);
  const [summary, setSummary] = useState<MarksSummary | null>(null);
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
      const response = await fetch('/api/marks/student');
      if (response.ok) {
        const data = await response.json();
        setSubjectMarks(data.marks || []);
        setSummary(data.summary || null);
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

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

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
        {subjectMarks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-muted-foreground">No marks uploaded yet</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Subject-wise Marks */}
            <div className="space-y-6">
              {subjectMarks.map((subject) => (
                <Card key={subject.subjectId}>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">
                      {subject.subjectCode} - {subject.subjectName}
                    </CardTitle>
                    <CardDescription>
                      Total: {subject.total} / {subject.maxTotal} ({subject.percentage}%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                              Exam Type
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                              Marks
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                              Percentage
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                              Exam Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(subject.marks).map(([examType, markData]) => {
                            const percentage = parseFloat(markData.percentage);
                            return (
                              <tr key={examType}>
                                <td className="px-4 py-3 text-sm font-medium">{examType}</td>
                                <td className="px-4 py-3 text-sm">
                                  {markData.obtained} / {markData.total}
                                </td>
                                <td
                                  className={`px-4 py-3 text-sm font-semibold ${getGradeColor(
                                    percentage
                                  )}`}
                                >
                                  {markData.percentage}%
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {new Date(markData.examDate).toLocaleDateString('en-IN', {
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

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {Object.entries(subject.marks).map(([examType, markData]) => {
                        const percentage = parseFloat(markData.percentage);
                        return (
                          <div
                            key={examType}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-base">{examType}</h4>
                              <span
                                className={`text-lg font-bold ${getGradeColor(percentage)}`}
                              >
                                {markData.percentage}%
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-gray-600">Marks</p>
                                <p className="font-medium">
                                  {markData.obtained} / {markData.total}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Exam Date</p>
                                <p className="font-medium">
                                  {new Date(markData.examDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                            {markData.remarks && (
                              <p className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Remarks:</span> {markData.remarks}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
