'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  CalendarIcon, 
  DownloadIcon, 
  EditIcon, 
  TrashIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FilterIcon,
  RefreshCwIcon,
  ArrowLeftIcon
} from 'lucide-react';
import Link from 'next/link';

interface Subject {
  _id: string;
  courseCode: string;
  courseTitle: string;
}

interface AttendanceRecord {
  studentId: string;
  rollNo: string;
  name: string;
  status: 'P' | 'A' | 'L';
}

interface AttendanceHistoryItem {
  _id: string;
  date: string;
  subject: Subject;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  totalPresent: number;
  totalAbsent: number;
  totalStudents: number;
  uploadedBy: {
    name: string;
    email: string;
  };
  records: AttendanceRecord[];
  createdAt: string;
}

export default function AttendanceHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingRecord, setEditingRecord] = useState<AttendanceHistoryItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchAttendanceHistory();
  }, [currentPage]);

  useEffect(() => {
    if (selectedBranch && selectedSemester) {
      fetchSubjects();
    }
  }, [selectedBranch, selectedSemester]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(
        `/api/subjects?branch=${selectedBranch}&semester=${selectedSemester}`
      );
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchAttendanceHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedSemester) params.append('semester', selectedSemester);
      if (selectedSubject) params.append('subjectId', selectedSubject);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/teacher/attendance-history?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance history');
      }

      const data = await response.json();
      setAttendanceHistory(data.records);
      setTotalPages(data.pagination.totalPages);
      setTotalRecords(data.pagination.totalRecords);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setCurrentPage(1);
    fetchAttendanceHistory();
  };

  const handleReset = () => {
    setSelectedBranch('');
    setSelectedSemester('');
    setSelectedSubject('');
    setStartDate('');
    setEndDate('');
    setSubjects([]);
    setCurrentPage(1);
    fetchAttendanceHistory();
  };

  const handleDelete = async (attendanceId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/attendance-history?id=${attendanceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete attendance record');
      }

      setSuccess('Attendance record deleted successfully');
      fetchAttendanceHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete attendance record');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEdit = (record: AttendanceHistoryItem) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedRecords: AttendanceRecord[]) => {
    if (!editingRecord) return;

    try {
      const response = await fetch(`/api/teacher/attendance-history`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attendanceId: editingRecord._id,
          records: updatedRecords,
          reason: 'Manual correction by teacher'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance record');
      }

      setSuccess('Attendance record updated successfully');
      setShowEditModal(false);
      setEditingRecord(null);
      fetchAttendanceHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update attendance record');
      setTimeout(() => setError(''), 5000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <div className="flex items-center gap-4">
              <Link href="/teacher/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
                <p className="text-sm text-gray-600">View and manage attendance records</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter attendance records by branch, semester, subject, or date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="filter-branch">Branch</Label>
                <select
                  id="filter-branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Branches</option>
                  <option value="BTCS">B.Tech CSE</option>
                  <option value="BTAI">B.Tech AIML</option>
                  <option value="BBA">BBA</option>
                  <option value="BCA">BCA</option>
                </select>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label htmlFor="filter-semester">Semester</Label>
                <select
                  id="filter-semester"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="filter-subject">Subject</Label>
                <select
                  id="filter-subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedBranch || !selectedSemester}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.courseCode}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="filter-start-date">Start Date</Label>
                <Input
                  id="filter-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="filter-end-date">End Date</Label>
                <Input
                  id="filter-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <Button onClick={handleFilter} className="flex items-center gap-2">
                <FilterIcon className="w-4 h-4" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
                <RefreshCwIcon className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 text-green-600 p-4 rounded-md">
            {success}
          </div>
        )}

        {/* Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>
                  {totalRecords > 0 
                    ? `Showing ${((currentPage - 1) * 10) + 1} - ${Math.min(currentPage * 10, totalRecords)} of ${totalRecords} records`
                    : 'No records found'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading records...</p>
              </div>
            ) : attendanceHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No attendance records found</p>
                <p className="text-sm mt-2">Try adjusting your filters or upload some attendance</p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch/Sem
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceHistory.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400" />
                              {formatDate(record.date)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="font-medium">{record.subjectCode}</div>
                            <div className="text-xs text-gray-500">{record.subjectName}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.branch} - Sem {record.semester}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {record.totalPresent}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {record.totalAbsent}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                            {record.totalStudents}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(record)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <EditIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(record._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRightIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Modal */}
      {showEditModal && editingRecord && (
        <EditAttendanceModal
          record={editingRecord}
          onClose={() => {
            setShowEditModal(false);
            setEditingRecord(null);
          }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

// Edit Attendance Modal Component
function EditAttendanceModal({ 
  record, 
  onClose, 
  onSave 
}: { 
  record: AttendanceHistoryItem;
  onClose: () => void;
  onSave: (records: AttendanceRecord[]) => void;
}) {
  const [editedRecords, setEditedRecords] = useState<AttendanceRecord[]>(record.records);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleStatus = (studentId: string) => {
    setEditedRecords((prev: AttendanceRecord[]) =>
      prev.map((r: AttendanceRecord) =>
        r.studentId === studentId
          ? { ...r, status: (r.status === 'P' ? 'A' : 'P') as 'P' | 'A' }
          : r
      )
    );
  };

  const filteredRecords = editedRecords.filter((r: AttendanceRecord) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = editedRecords.filter((r: AttendanceRecord) => r.status === 'P').length;
  const absentCount = editedRecords.filter((r: AttendanceRecord) => r.status === 'A').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Attendance</h2>
          <p className="text-sm text-gray-600 mt-1">
            {record.subjectCode} - {new Date(record.date).toLocaleDateString('en-IN')}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {/* Search */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <span className="text-gray-600">
              Total: <span className="font-medium">{editedRecords.length}</span>
            </span>
            <span className="text-green-600">
              Present: <span className="font-medium">{presentCount}</span>
            </span>
            <span className="text-red-600">
              Absent: <span className="font-medium">{absentCount}</span>
            </span>
          </div>

          {/* Students List */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Roll No
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {student.rollNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant={student.status === 'P' ? 'default' : 'outline'}
                          onClick={() => toggleStatus(student.studentId)}
                          className={student.status === 'P' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          P
                        </Button>
                        <Button
                          size="sm"
                          variant={student.status === 'A' ? 'default' : 'outline'}
                          onClick={() => toggleStatus(student.studentId)}
                          className={student.status === 'A' ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          A
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(editedRecords)}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
