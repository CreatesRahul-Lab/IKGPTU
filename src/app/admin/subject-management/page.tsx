'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  ChevronLeft, 
  Search, 
  UserPlus, 
  UserMinus,
  Filter
} from 'lucide-react';

interface Subject {
  _id: string;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  branch: string;
  semester: number;
  credits: number;
  isLab: boolean;
  teacherId?: string;
  teacherName?: string;
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
}

export default function SubjectManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');
  const [filterAssigned, setFilterAssigned] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/unauthorized');
      } else {
        fetchData();
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    filterSubjects();
  }, [subjects, searchTerm, filterBranch, filterSemester, filterAssigned]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all subjects
      const subjectsRes = await fetch('/api/subjects?all=true');
      const subjectsData = await subjectsRes.json();
      
      // Fetch all faculty
      const facultyRes = await fetch('/api/admin/faculty');
      const facultyData = await facultyRes.json();
      
      setSubjects(subjectsData.subjects || []);
      setFaculty(facultyData.faculty || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubjects = () => {
    let filtered = [...subjects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (subject) =>
          subject.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.teacherName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Branch filter
    if (filterBranch) {
      filtered = filtered.filter((subject) => subject.branch === filterBranch);
    }

    // Semester filter
    if (filterSemester) {
      filtered = filtered.filter((subject) => subject.semester === parseInt(filterSemester));
    }

    // Assignment filter
    if (filterAssigned === 'assigned') {
      filtered = filtered.filter((subject) => subject.teacherId);
    } else if (filterAssigned === 'unassigned') {
      filtered = filtered.filter((subject) => !subject.teacherId);
    }

    setFilteredSubjects(filtered);
  };

  const handleAssignSubject = async () => {
    if (!selectedSubject || !selectedTeacher) return;

    try {
      const response = await fetch('/api/admin/subjects/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject._id,
          teacherId: selectedTeacher,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowAssignModal(false);
        setSelectedSubject(null);
        setSelectedTeacher('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign subject');
      }
    } catch (error) {
      console.error('Error assigning subject:', error);
      alert('Failed to assign subject');
    }
  };

  const handleUnassignSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to unassign this subject?')) return;

    try {
      const response = await fetch(`/api/admin/subjects/assign?subjectId=${subjectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unassign subject');
      }
    } catch (error) {
      console.error('Error unassigning subject:', error);
      alert('Failed to unassign subject');
    }
  };

  const openAssignModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTeacher(subject.teacherId || '');
    setShowAssignModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/dashboard')}
              className="min-h-[44px] min-w-[44px]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Subject Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Assign subjects to faculty members
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by code, title, or teacher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Branch Filter */}
              <div>
                <Label htmlFor="branch">Branch</Label>
                <select
                  id="branch"
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Branches</option>
                  <option value="BTCS">B.Tech CSE</option>
                  <option value="BTAI">B.Tech AIML</option>
                  <option value="BBA">BBA</option>
                  <option value="BCA">BCA</option>
                </select>
              </div>

              {/* Semester Filter */}
              <div>
                <Label htmlFor="semester">Semester</Label>
                <select
                  id="semester"
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignment Filter */}
              <div>
                <Label htmlFor="assigned">Assignment Status</Label>
                <select
                  id="assigned"
                  value={filterAssigned}
                  onChange={(e) => setFilterAssigned(e.target.value as any)}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  <option value="assigned">Assigned Only</option>
                  <option value="unassigned">Unassigned Only</option>
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredSubjects.length} of {subjects.length} subjects
            </div>
          </CardContent>
        </Card>

        {/* Subjects List */}
        <div className="space-y-4">
          {filteredSubjects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No subjects found matching your filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubjects.map((subject) => (
              <Card key={subject._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {subject.courseCode}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          {subject.branch}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          Sem {subject.semester}
                        </span>
                        {subject.isLab && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Lab
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{subject.courseTitle}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>Credits: {subject.credits}</span>
                        <span>Type: {subject.courseType}</span>
                      </div>
                      {subject.teacherName && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded-full border border-green-200">
                            ✓ Assigned to: {subject.teacherName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {subject.teacherId ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignModal(subject)}
                            className="min-h-[44px]"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Reassign
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnassignSubject(subject._id)}
                            className="min-h-[44px] text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Unassign
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openAssignModal(subject)}
                          className="min-h-[44px]"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign Teacher
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Assign Teacher to Subject
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Subject:</p>
              <p className="font-semibold">
                {selectedSubject.courseCode} - {selectedSubject.courseTitle}
              </p>
            </div>

            <div className="mb-6">
              <Label htmlFor="teacher">Select Teacher</Label>
              <select
                id="teacher"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Teacher --</option>
                {faculty.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedSubject(null);
                  setSelectedTeacher('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignSubject}
                disabled={!selectedTeacher}
                className="flex-1"
              >
                Assign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
