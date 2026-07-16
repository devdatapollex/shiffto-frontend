'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Check,
  X,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RoleGuard } from '@/components/auth/role-guard';
import { getKycSubmissions, reviewKyc, KycDetails } from '@/services/profile.service';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type KycSubmission = KycDetails & {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    phone: string | null;
  };
};

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Pagination calculations
  const startIdx = (page - 1) * limit;
  const endIdx = Math.min(startIdx + limit, total);
  const totalPages = Math.ceil(total / limit) || 1;

  // Detail Dialog State
  const [selectedKyc, setSelectedKyc] = useState<KycSubmission | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Reject Reason Dialog State
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Photo viewer modal state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getKycSubmissions({ status: statusFilter, page, limit });
      setSubmissions(res.data as KycSubmission[]);
      setTotal(res.meta?.total || 0);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to fetch KYC submissions');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, limit]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleApprove = async (kycId: string) => {
    try {
      setSubmittingReview(true);
      await reviewKyc(kycId, { status: 'APPROVED' });
      toast.success('KYC Approved successfully');
      setShowDetailDialog(false);
      fetchSubmissions();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to approve KYC');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedKyc) return;
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewKyc(selectedKyc.id, { status: 'REJECTED', rejectionReason });
      toast.success('KYC Rejected successfully');
      setShowRejectDialog(false);
      setShowDetailDialog(false);
      setRejectionReason('');
      fetchSubmissions();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to reject KYC');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <RoleGuard
      roles={['admin']}
      fallback={
        <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B3A8E]">KYC Management</h1>
          <p className="text-muted-foreground mt-1">
            Review, approve, or reject user identity verification submissions.
          </p>
        </div>

        <Tabs
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val as 'PENDING' | 'APPROVED' | 'REJECTED');
            setPage(1);
          }}
          className="space-y-6"
        >
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="PENDING" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Pending Review
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">
                {statusFilter === 'PENDING' && 'Pending Submissions'}
                {statusFilter === 'APPROVED' && 'Approved Identities'}
                {statusFilter === 'REJECTED' && 'Rejected Submissions'}
              </CardTitle>
              <CardDescription>
                Displaying all user registrations waiting for document checks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-48 w-full flex-col items-center justify-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading submissions...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-lg">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No submissions found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    There are no KYC submissions under this status.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Doc Type</TableHead>
                      <TableHead>Doc Number</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-semibold text-slate-800">
                          {sub.user?.name || 'Unknown User'}
                        </TableCell>
                        <TableCell className="text-slate-600">{sub.user?.email}</TableCell>
                        <TableCell className="capitalize text-slate-700">
                          {sub.documentType.toLowerCase().replace('_', ' ')}
                        </TableCell>
                        <TableCell className="font-mono text-slate-600">
                          {sub.documentNumber}
                        </TableCell>
                        <TableCell className="text-slate-600">{sub.nationality}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedKyc(sub);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="mr-1.5 h-4 w-4" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && submissions.length > 0 && (
                <div className="border-t border-[#e2e8f0]/60 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
                  {/* Left: Entries selector and showing info */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <span>Show</span>
                      <Select
                        value={limit.toString()}
                        onValueChange={(val) => {
                          setLimit(Number(val));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 w-16 rounded-lg border-[#e2e8f0] bg-white text-xs">
                          <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-[#e2e8f0] min-w-[4rem] bg-white">
                          {[5, 10, 20, 50].map((size) => (
                            <SelectItem
                              key={size}
                              value={size.toString()}
                              className="text-xs rounded-lg cursor-pointer"
                            >
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span>entries</span>
                    </div>
                    <span className="hidden sm:inline-block h-4 w-[1px] bg-slate-200" />
                    <span>
                      Showing{' '}
                      <span className="font-semibold text-slate-700">
                        {total === 0 ? 0 : startIdx + 1}
                      </span>{' '}
                      to <span className="font-semibold text-slate-700">{endIdx}</span> of{' '}
                      <span className="font-semibold text-slate-700">{total}</span> entries
                    </span>
                  </div>

                  {/* Right: Page buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className="h-8 rounded-lg border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600 px-3 cursor-pointer text-xs"
                    >
                      Previous
                    </Button>

                    {/* Render dynamic page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (
                        totalPages > 5 &&
                        pageNum !== 1 &&
                        pageNum !== totalPages &&
                        Math.abs(pageNum - page) > 1
                      ) {
                        if (pageNum === 2 && page > 3) {
                          return (
                            <span key="dots-left" className="px-1.5 text-slate-400 text-xs">
                              ...
                            </span>
                          );
                        }
                        if (pageNum === totalPages - 1 && page < totalPages - 2) {
                          return (
                            <span key="dots-right" className="px-1.5 text-slate-400 text-xs">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`h-8 w-8 rounded-lg text-xs font-semibold cursor-pointer ${
                            page === pageNum
                              ? 'bg-[#FF6F3F] hover:bg-[#e05626] text-white border-transparent'
                              : 'border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className="h-8 rounded-lg border-[#e2e8f0] bg-white hover:bg-slate-50 text-slate-600 px-3 cursor-pointer text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {/* Detail & Action Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedKyc && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-[#0B3A8E]">
                    KYC Verification Review
                  </DialogTitle>
                  <DialogDescription>
                    Verify document credentials for {selectedKyc.user?.name}.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4 grid-cols-1">
                  {/* User details */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 border-b pb-1 text-sm uppercase tracking-wide">
                      Registrant Info
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-400">Full Name:</span>
                      <span className="font-semibold text-slate-700">{selectedKyc.user?.name}</span>
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-700 truncate">{selectedKyc.user?.email}</span>
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-slate-700">{selectedKyc.user?.phone || 'N/A'}</span>
                      <span className="text-slate-400">Submission Date:</span>
                      <span className="text-slate-700">
                        {new Date(selectedKyc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Document details */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 border-b pb-1 text-sm uppercase tracking-wide">
                      Document Info
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-slate-400">Type:</span>
                      <span className="font-semibold text-slate-700 capitalize">
                        {selectedKyc.documentType.toLowerCase().replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">Number:</span>
                      <span className="font-mono text-slate-700">{selectedKyc.documentNumber}</span>
                      <span className="text-slate-400">Nationality:</span>
                      <span className="text-slate-700">{selectedKyc.nationality}</span>
                      <span className="text-slate-400">KYC Phone:</span>
                      <span className="text-slate-700">{selectedKyc.phoneNumber}</span>
                    </div>
                  </div>

                  {/* Document Photos */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 border-b pb-1 text-sm uppercase tracking-wide">
                      Document Scans
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="border rounded-lg overflow-hidden bg-slate-50 p-2">
                        <div className="flex justify-between items-center mb-2 px-1">
                          <span className="text-xs font-semibold text-slate-600">Front Scan</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setPreviewPhotoUrl(selectedKyc.frontPhotoUrl)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" /> Preview
                          </Button>
                        </div>
                        <div
                          className="h-40 bg-contain bg-center bg-no-repeat rounded border cursor-zoom-in"
                          style={{ backgroundImage: `url(${selectedKyc.frontPhotoUrl})` }}
                          onClick={() => setPreviewPhotoUrl(selectedKyc.frontPhotoUrl)}
                        />
                      </div>

                      <div className="border rounded-lg overflow-hidden bg-slate-50 p-2">
                        <div className="flex justify-between items-center mb-2 px-1">
                          <span className="text-xs font-semibold text-slate-600">Back Scan</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setPreviewPhotoUrl(selectedKyc.backPhotoUrl)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" /> Preview
                          </Button>
                        </div>
                        <div
                          className="h-40 bg-contain bg-center bg-no-repeat rounded border cursor-zoom-in"
                          style={{ backgroundImage: `url(${selectedKyc.backPhotoUrl})` }}
                          onClick={() => setPreviewPhotoUrl(selectedKyc.backPhotoUrl)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rejection reason history if rejected */}
                  {selectedKyc.status === 'REJECTED' && selectedKyc.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded text-xs font-semibold text-destructive">
                      Current Rejection Reason: {selectedKyc.rejectionReason}
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 border-t pt-4">
                  <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                    Close
                  </Button>

                  {selectedKyc.status === 'PENDING' && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={submittingReview}
                      >
                        <X className="mr-1.5 h-4 w-4" /> Reject
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(selectedKyc.id)}
                        disabled={submittingReview}
                      >
                        <Check className="mr-1.5 h-4 w-4" /> Approve
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Reason dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive">Reject KYC Application</DialogTitle>
              <DialogDescription>
                Please provide a clear, detailed explanation of why this verification is rejected.
                This will be visible to the user.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="reject-reason">Reason for Rejection</Label>
              <Textarea
                id="reject-reason"
                placeholder="e.g. Document image is blurry / Name does not match document"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={submittingReview}
              >
                {submittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Big photo preview modal */}
        <Dialog open={!!previewPhotoUrl} onOpenChange={(open) => !open && setPreviewPhotoUrl(null)}>
          <DialogContent className="max-w-4xl p-1 bg-black/90">
            <div className="relative flex items-center justify-center max-h-[85vh] w-full min-h-[400px]">
              {previewPhotoUrl && (
                <Image
                  src={toRelativeImageUrl(previewPhotoUrl)}
                  alt="Document Preview"
                  className="max-h-[85vh] max-w-full object-contain"
                  width={800}
                  height={600}
                />
              )}
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/90 text-white rounded-full h-8 w-8 flex items-center justify-center border border-white/20 font-bold"
              >
                X
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
