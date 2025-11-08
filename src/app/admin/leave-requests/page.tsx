'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

interface LeaveRequest {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    rollNo: string;
    branch: string;
    semester: number;
  };
  reason: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewComments?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
}

export default function LeaveRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchRequests();
    }
  }, [status, session, router]);

  useEffect(() => {
    filterRequests();
  }, [requests, filterStatus]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/leave-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (filterStatus === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === filterStatus));
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/leave/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewComments,
        }),
      });

      if (response.ok) {
        await fetchRequests();
        setSelectedRequest(null);
        setReviewComments('');
      } else {
        alert('Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
              <h1 className="text-2xl sm:text-3xl font-bold">Leave Requests</h1>
              <p className="text-gray-600 mt-1">
                {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="min-h-[44px]"
              >
                All ({requests.length})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                className="min-h-[44px]"
              >
                Pending ({requests.filter((r) => r.status === 'pending').length})
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('approved')}
                className="min-h-[44px]"
              >
                Approved ({requests.filter((r) => r.status === 'approved').length})
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('rejected')}
                className="min-h-[44px]"
              >
                Rejected ({requests.filter((r) => r.status === 'rejected').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.length === 0 ? (
            <Card className="lg:col-span-2">
              <CardContent className="p-8 text-center text-gray-500">
                No leave requests found
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {request.studentId?.name || 'Unknown Student'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.studentId?.rollNo} • {request.studentId?.branch} Sem{' '}
                        {request.studentId?.semester}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Leave Period</p>
                    <p className="text-sm font-medium">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reason</p>
                    <p className="text-sm">{request.reason}</p>
                  </div>
                  {request.reviewComments && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Review Comments</p>
                      <p className="text-sm italic">{request.reviewComments}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">
                      Applied on {formatDate(request.createdAt)}
                    </p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => setSelectedRequest(request)}
                        className="flex-1 min-h-[44px]"
                        variant="outline"
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Review Leave Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  Student: {selectedRequest.studentId?.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Period: {formatDate(selectedRequest.startDate)} -{' '}
                  {formatDate(selectedRequest.endDate)}
                </p>
                <p className="text-sm text-gray-600">Reason: {selectedRequest.reason}</p>
              </div>
              <div>
                <Label htmlFor="reviewComments">Review Comments (Optional)</Label>
                <textarea
                  id="reviewComments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add a note for the student..."
                  className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleAction(selectedRequest._id, 'approve')}
                  className="flex-1 bg-green-600 hover:bg-green-700 min-h-[44px]"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction(selectedRequest._id, 'reject')}
                  className="flex-1 bg-red-600 hover:bg-red-700 min-h-[44px]"
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </div>
              <Button
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewComments('');
                }}
                variant="outline"
                className="w-full min-h-[44px]"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
