'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ChevronLeft, Search, UserPlus, Edit, Trash2, Loader2 } from 'lucide-react';

interface Subject {
  _id: string;
  courseCode: string;
  courseTitle: string;
  courseType: string;
  credits: number;
  branch: string;
  semester: number;
  isLab: boolean;
  teacherId?: string;
  teacherName?: string;
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
}

export default function AdminSubjectsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/');
      } else {
        fetchData();
      }
    }
  }, [status, router, session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all subjects
      const subjectsRes = await fetch('/api/subjects');
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data.subjects || []);
      }

      // Fetch all faculty
      const facultyRes = await fetch('/api/admin/faculty');
      if (facultyRes.ok) {
        const data = await facultyRes.json();
        setFaculty(data.faculty || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedSubject || !selectedTeacher) {
      setError('Please select a teacher');
      return;
    }

    try {
      setAssigning(true);
      setError('');

      console.log('Assigning subject:', {
        subjectId: selectedSubject._id,
        teacherId: selectedTeacher,
      });

      const response = await fetch('/api/admin/subjects/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject._id,
          teacherId: selectedTeacher === 'unassign' ? null : selectedTeacher,
        }),
      });

      const data = await response.json();
      console.log('Assignment response:', data);

      if (response.ok) {
        // Close dialog first
        setAssignDialogOpen(false);
        setSelectedSubject(null);
        setSelectedTeacher('');
        
        // Refresh data immediately - fetch fresh data from server
        setLoading(true);
        await fetchData();
        setLoading(false);
        
        // Show success message
        alert(data.message || 'Subject assigned successfully');
      } else {
        setError(data.error || 'Failed to assign teacher');
      }
    } catch (err) {
      console.error('Assignment error:', err);
      setError('Failed to assign teacher');
    } finally {
      setAssigning(false);
    }
  };

  const openAssignDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedTeacher(subject.teacherId || '');
    setAssignDialogOpen(true);
    setError('');
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.teacherName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesBranch = branchFilter === 'all' || subject.branch === branchFilter;
    const matchesSemester = semesterFilter === 'all' || subject.semester.toString() === semesterFilter;
    
    return matchesSearch && matchesBranch && matchesSemester;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/dashboard')}
              className="min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Subject Management</h1>
              <p className="text-muted-foreground mt-1">
                Assign subjects to faculty members
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger id="branch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="BTCS">B.Tech CSE</SelectItem>
                    <SelectItem value="BTAI">B.Tech AIML</SelectItem>
                    <SelectItem value="BBA">BBA</SelectItem>
                    <SelectItem value="BCA">BCA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                  <SelectTrigger id="semester">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {[3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setBranchFilter('all');
                    setSemesterFilter('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Subjects</CardDescription>
              <CardTitle className="text-3xl">{subjects.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Assigned</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {subjects.filter(s => s.teacherId).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Unassigned</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {subjects.filter(s => !s.teacherId).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects ({filteredSubjects.length})</CardTitle>
            <CardDescription>
              Click "Assign" to assign or change the faculty for a subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Course Code</th>
                    <th className="text-left p-3 font-medium">Course Title</th>
                    <th className="text-left p-3 font-medium">Branch</th>
                    <th className="text-left p-3 font-medium">Semester</th>
                    <th className="text-left p-3 font-medium">Credits</th>
                    <th className="text-left p-3 font-medium">Assigned To</th>
                    <th className="text-left p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-muted-foreground">
                        No subjects found
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((subject) => (
                      <tr key={subject._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{subject.courseCode}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{subject.courseTitle}</div>
                            <div className="text-xs text-muted-foreground">
                              {subject.courseType}
                              {subject.isLab && ' (Lab)'}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">{subject.branch}</td>
                        <td className="p-3">{subject.semester}</td>
                        <td className="p-3">{subject.credits}</td>
                        <td className="p-3">
                          {subject.teacherName ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              {subject.teacherName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignDialog(subject)}
                            className="min-h-[36px]"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            {subject.teacherId ? 'Change' : 'Assign'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Assign Teacher Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Faculty</DialogTitle>
              <DialogDescription>
                Assign a faculty member to teach this subject
              </DialogDescription>
            </DialogHeader>
            
            {selectedSubject && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium">{selectedSubject.courseCode}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedSubject.courseTitle}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedSubject.branch} - Semester {selectedSubject.semester}
                  </div>
                </div>

                <div>
                  <Label htmlFor="teacher">Select Faculty</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="Choose a faculty member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassign">
                        <span className="text-orange-600">Unassign</span>
                      </SelectItem>
                      {faculty.map((teacher) => (
                        <SelectItem key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignTeacher}
                disabled={assigning || !selectedTeacher}
              >
                {assigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
