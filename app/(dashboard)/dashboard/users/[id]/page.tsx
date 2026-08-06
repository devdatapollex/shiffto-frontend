'use client';

import { useState, useEffect, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  ShieldAlert,
  Percent,
  Activity,
  DollarSign,
  LifeBuoy,
  Award,
  ChevronLeft,
  Calendar,
  CheckCircle,
  FileText,
  Clock,
  Briefcase,
  AlertTriangle,
  Star,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userService } from '@/services/user.service';
import { DocumentType } from '@/services/profile.service';
import * as reviewService from '@/services/review.service';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-100',
  DEACTIVATED: 'bg-slate-50 text-slate-700 border-slate-100',
  PENDING_KYC: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('timeline');

  // Review sub-tab & pagination states
  const [reviewSubTab, setReviewSubTab] = useState<'received' | 'given'>('received');
  const [receivedPage, setReceivedPage] = useState<number>(1);
  const [givenPage, setGivenPage] = useState<number>(1);

  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCommission, setEditCommission] = useState(0);
  const [editStatus, setEditStatus] = useState('ACTIVE');

  // Fetch user details
  const {
    data: userDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-user-details', id],
    queryFn: () => userService.getUserDetail(id),
  });

  // Fetch paginated received reviews
  const { data: receivedReviewsData, isLoading: isReceivedLoading } = useQuery({
    queryKey: ['admin-user-reviews-received', id, receivedPage],
    queryFn: () => reviewService.getUserReceivedReviews(id, { page: receivedPage, limit: 5 }),
    enabled: activeTab === 'trust' && reviewSubTab === 'received',
  });

  // Fetch paginated given reviews
  const { data: givenReviewsData, isLoading: isGivenLoading } = useQuery({
    queryKey: ['admin-user-reviews-given', id, givenPage],
    queryFn: () => reviewService.getUserGivenReviews(id, { page: givenPage, limit: 5 }),
    enabled: activeTab === 'trust' && reviewSubTab === 'given',
  });

  // Sync form states with retrieved data
  useEffect(() => {
    if (userDetails?.profile) {
      setEditName(userDetails.profile.name || '');
      setEditEmail(userDetails.profile.email || '');
      setEditPhone(userDetails.profile.phone || '');
      setEditCommission(userDetails.profile.commissionRate || 0);
      setEditStatus(userDetails.profile.status || 'ACTIVE');
    }
  }, [userDetails]);

  // Update user details mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone: string;
      commissionRate: number;
      status: string;
    }) => userService.updateUser(id, data),
    onSuccess: () => {
      toast.success('User profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-user-details', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update user profile');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: editName,
      email: editEmail,
      phone: editPhone,
      commissionRate: editCommission,
      status: editStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Clock className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading profile details...</p>
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-foreground">User not found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          The requested user record could not be retrieved from the server.
        </p>
        <Button asChild className="mt-5 rounded-lg border border-primary/10">
          <Link href="/dashboard/users">Back to User Management</Link>
        </Button>
      </div>
    );
  }

  const { profile, kyc, timeline, transactions, tickets, reviews } = userDetails;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to User Management
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-6 border border-primary/5 rounded-lg bg-card space-y-6">
            {/* Header info */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-primary/5">
              <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground bg-primary shrink-0 overflow-hidden shadow">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground mt-3">{profile.name}</h2>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              <Badge
                className={`border uppercase text-[9px] font-bold mt-2 py-0.5 px-2 ${STATUS_COLORS[profile.status]}`}
              >
                {profile.status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Profile fields edit form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="userName" className="text-xs font-semibold">
                  Name
                </Label>
                <Input
                  id="userName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border-primary/10 mt-1 focus-visible:ring-primary"
                  required
                />
              </div>

              <div>
                <Label htmlFor="userEmail" className="text-xs font-semibold">
                  Email
                </Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="border-primary/10 mt-1 focus-visible:ring-primary"
                  required
                />
              </div>

              <div>
                <Label htmlFor="userPhone" className="text-xs font-semibold">
                  Phone Number
                </Label>
                <Input
                  id="userPhone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="border-primary/10 mt-1 focus-visible:ring-primary"
                  placeholder="Not provided"
                />
              </div>

              <div>
                <Label htmlFor="userStatus" className="text-xs font-semibold">
                  Account Status
                </Label>
                <Select value={editStatus} onValueChange={(val) => setEditStatus(val)}>
                  <SelectTrigger
                    id="userStatus"
                    className="border-primary/10 mt-1 focus:ring-primary"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended (Banned)</SelectItem>
                    <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                    <SelectItem value="PENDING_KYC">Pending KYC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Commission Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <Label htmlFor="userCommission" className="font-semibold flex items-center gap-1">
                    <Percent className="h-3 w-3 text-primary" />
                    Traveler Commission Rate
                  </Label>
                  <span className="font-bold text-primary">{editCommission}%</span>
                </div>
                <input
                  id="userCommission"
                  type="range"
                  min="0"
                  max="100"
                  value={editCommission}
                  onChange={(e) => setEditCommission(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4 rounded-lg flex items-center justify-center gap-1.5"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Detail Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-primary/5 bg-primary/[0.01] p-1 rounded-lg border border-primary/5">
            {[
              { id: 'timeline', label: 'Timeline', icon: Activity },
              { id: 'kyc', label: 'KYC Document', icon: ShieldAlert },
              { id: 'transactions', label: 'Transactions', icon: DollarSign },
              { id: 'tickets', label: 'Support Issues', icon: LifeBuoy },
              { id: 'trust', label: 'Ratings & Reviews', icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Box */}
          <div className="p-6 border border-primary/5 rounded-lg bg-card min-h-[400px]">
            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold border-b border-primary/5 pb-2">
                  Mixed Activity Timeline
                </h3>
                {timeline.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-8 text-center">
                    No recorded activity for this user.
                  </p>
                ) : (
                  <div className="relative border-l border-primary/10 ml-3 pl-6 space-y-6">
                    {timeline.map((item) => (
                      <div key={item.id} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow-sm" />

                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground block font-mono">
                            {new Date(item.date).toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-foreground">{item.title}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                  <h3 className="text-sm font-bold">KYC Verification Data</h3>
                  {kyc && (
                    <Badge
                      className={`border uppercase text-[9px] font-bold py-0.5 px-2 ${
                        kyc.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : kyc.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                      }`}
                    >
                      {kyc.status}
                    </Badge>
                  )}
                </div>

                {!kyc ? (
                  <div className="text-center py-12">
                    <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground italic">
                      KYC verification documents have not been submitted by this user.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Metadata fields */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-muted/30 border border-primary/5 rounded-lg">
                        <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                          Document Type
                        </span>
                        <strong className="text-foreground mt-0.5 block">
                          {kyc.documentType === DocumentType.PASSPORT
                            ? 'Passport'
                            : kyc.documentType === DocumentType.DRIVING_LICENSE
                              ? 'Driving License'
                              : kyc.documentType === DocumentType.NID
                                ? 'National ID (NID)'
                                : String(kyc.documentType).replace('_', ' ')}
                        </strong>
                      </div>
                      <div className="p-3 bg-muted/30 border border-primary/5 rounded-lg">
                        <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                          Document Number
                        </span>
                        <strong className="text-foreground mt-0.5 block">
                          {kyc.documentNumber}
                        </strong>
                      </div>
                      <div className="p-3 bg-muted/30 border border-primary/5 rounded-lg">
                        <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                          Nationality
                        </span>
                        <strong className="text-foreground mt-0.5 block">{kyc.nationality}</strong>
                      </div>
                      <div className="p-3 bg-muted/30 border border-primary/5 rounded-lg">
                        <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                          Phone Verified
                        </span>
                        <strong className="text-foreground mt-0.5 block">{kyc.phoneNumber}</strong>
                      </div>
                    </div>

                    {kyc.rejectionReason && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs">
                        <strong>Rejection Reason:</strong> {kyc.rejectionReason}
                      </div>
                    )}

                    {/* Previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Document Front Side
                        </span>
                        <div className="relative border border-primary/5 rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
                          <img
                            src={kyc.frontPhotoUrl}
                            alt="Document Front"
                            className="h-full w-full object-contain"
                          />
                          <a
                            href={kyc.frontPhotoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute right-2 bottom-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Document Back Side
                        </span>
                        <div className="relative border border-primary/5 rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
                          <img
                            src={kyc.backPhotoUrl}
                            alt="Document Back"
                            className="h-full w-full object-contain"
                          />
                          <a
                            href={kyc.backPhotoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute right-2 bottom-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b border-primary/5 pb-2">
                  Financial Transactions Log
                </h3>
                {transactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-8 text-center">
                    No transaction records found for this user.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-primary/5 text-muted-foreground">
                          <th className="py-2.5 font-semibold">Transaction ID</th>
                          <th className="py-2.5 font-semibold">Shipment</th>
                          <th className="py-2.5 font-semibold">Amount</th>
                          <th className="py-2.5 font-semibold">Role</th>
                          <th className="py-2.5 font-semibold">Status</th>
                          <th className="py-2.5 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => {
                          const isSender = tx.senderId === id;
                          return (
                            <tr
                              key={tx.id}
                              className="border-b border-primary/5 hover:bg-primary/[0.01]"
                            >
                              <td className="py-2.5 font-mono text-[10px]">{tx.transactionId}</td>
                              <td className="py-2.5 font-semibold truncate max-w-[150px]">
                                {tx.shipment.itemName}
                              </td>
                              <td className="py-2.5 font-bold text-foreground">
                                ${tx.grossAmount.toFixed(2)}
                              </td>
                              <td className="py-2.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] uppercase ${
                                    isSender
                                      ? 'text-blue-600 border-blue-100 bg-blue-50/10'
                                      : 'text-emerald-600 border-emerald-100 bg-emerald-50/10'
                                  }`}
                                >
                                  {isSender ? 'Sender' : 'Traveler'}
                                </Badge>
                              </td>
                              <td className="py-2.5">
                                <span
                                  className={`inline-block h-2 w-2 rounded-full mr-1.5 ${
                                    tx.status === 'RELEASED' ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                />
                                {tx.status.replace('_', ' ')}
                              </td>
                              <td className="py-2.5 text-muted-foreground">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Support Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b border-primary/5 pb-2">
                  Support Tickets
                </h3>
                {tickets.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-8 text-center">
                    No support tickets created by this user.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-primary/5 text-muted-foreground">
                          <th className="py-2.5 font-semibold">ID</th>
                          <th className="py-2.5 font-semibold">Category</th>
                          <th className="py-2.5 font-semibold">Title</th>
                          <th className="py-2.5 font-semibold">Status</th>
                          <th className="py-2.5 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((t) => (
                          <tr
                            key={t.id}
                            className="border-b border-primary/5 hover:bg-primary/[0.01]"
                          >
                            <td className="py-2.5 font-bold text-primary font-mono">
                              {t.ticketId}
                            </td>
                            <td className="py-2.5 uppercase text-[10px] font-semibold">
                              {t.category}
                            </td>
                            <td className="py-2.5 font-medium truncate max-w-[150px]">{t.title}</td>
                            <td className="py-2.5">
                              <Badge className="border uppercase text-[9px] font-bold py-0 px-1 bg-slate-50 text-slate-700">
                                {t.status}
                              </Badge>
                            </td>
                            <td className="py-2.5 text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Ratings & Reviews Tab */}
            {activeTab === 'trust' && (
              <div className="space-y-6">
                {/* Stats Breakdown Card */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 border border-primary/5 rounded-lg bg-primary/[0.01] items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg font-bold shrink-0">
                      <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Average Rating
                      </span>
                      <strong className="text-xl font-extrabold text-foreground block">
                        {reviews.averageRating ? `${reviews.averageRating} / 5` : 'No Ratings'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Received</span>
                      <strong className="text-sm font-bold text-foreground block">
                        {reviews.receivedCount ?? reviews.received.length} Ratings
                      </strong>
                    </div>
                    <div className="w-px h-8 bg-primary/10" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Given</span>
                      <strong className="text-sm font-bold text-foreground block">
                        {reviews.givenCount ?? reviews.given.length} Ratings
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs for Received vs Given Reviews */}
                <div className="flex border-b border-primary/10 gap-4">
                  <button
                    onClick={() => setReviewSubTab('received')}
                    className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                      reviewSubTab === 'received'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Reviews Received ({reviews.receivedCount ?? reviews.received.length})
                  </button>
                  <button
                    onClick={() => setReviewSubTab('given')}
                    className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
                      reviewSubTab === 'given'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Reviews Given ({reviews.givenCount ?? reviews.given.length})
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviewSubTab === 'received'
                    ? (() => {
                        const list = receivedReviewsData?.data || reviews.received;
                        const meta = receivedReviewsData?.meta;
                        const isLoadingList = isReceivedLoading;

                        if (isLoadingList) {
                          return (
                            <p className="text-xs text-muted-foreground italic py-4 text-center">
                              Loading reviews...
                            </p>
                          );
                        }

                        if (!list || list.length === 0) {
                          return (
                            <p className="text-xs text-muted-foreground italic py-4 text-center">
                              No reviews received yet.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {list.map((rev: any) => {
                              const targetShipmentId = rev.shipmentId || rev.shipment?.id;
                              return (
                                <div
                                  key={rev.id}
                                  onClick={() => {
                                    if (targetShipmentId) {
                                      router.push(
                                        `/dashboard/tracking/shipment/${targetShipmentId}`
                                      );
                                    }
                                  }}
                                  className={`p-3 border border-primary/5 rounded-lg bg-card/50 space-y-2 transition-all ${
                                    targetShipmentId
                                      ? 'cursor-pointer hover:border-primary/30 hover:bg-slate-50/80 shadow-2xs'
                                      : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 overflow-hidden">
                                        {rev.reviewer?.image ? (
                                          <img
                                            src={rev.reviewer.image}
                                            alt={rev.reviewer.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          rev.reviewer?.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                      </div>
                                      <div>
                                        <span className="text-xs font-bold text-foreground block">
                                          {rev.reviewer?.name || 'User'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground block">
                                          {new Date(rev.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      {rev.shipment?.itemName && (
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] font-medium py-0 px-1.5 gap-1 hover:bg-primary/5"
                                        >
                                          Shipment: {rev.shipment.itemName}
                                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                                        </Badge>
                                      )}
                                      <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                          <Star
                                            key={idx}
                                            className={`h-3.5 w-3.5 ${
                                              idx < rev.rating
                                                ? 'fill-amber-500 text-amber-500'
                                                : 'text-slate-200'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {rev.comment && (
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-10 italic">
                                      "{rev.comment}"
                                    </p>
                                  )}
                                </div>
                              );
                            })}

                            {/* Pagination Controls */}
                            {meta && meta.totalPages > 1 && (
                              <div className="flex items-center justify-between pt-2 text-xs">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={receivedPage <= 1}
                                  onClick={() => setReceivedPage((p) => Math.max(1, p - 1))}
                                >
                                  Previous
                                </Button>
                                <span className="text-muted-foreground">
                                  Page {meta.page} of {meta.totalPages}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={receivedPage >= meta.totalPages}
                                  onClick={() => setReceivedPage((p) => p + 1)}
                                >
                                  Next
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    : (() => {
                        const list = givenReviewsData?.data || reviews.given;
                        const meta = givenReviewsData?.meta;
                        const isLoadingList = isGivenLoading;

                        if (isLoadingList) {
                          return (
                            <p className="text-xs text-muted-foreground italic py-4 text-center">
                              Loading reviews...
                            </p>
                          );
                        }

                        if (!list || list.length === 0) {
                          return (
                            <p className="text-xs text-muted-foreground italic py-4 text-center">
                              No reviews given yet.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {list.map((rev: any) => {
                              const targetShipmentId = rev.shipmentId || rev.shipment?.id;
                              return (
                                <div
                                  key={rev.id}
                                  onClick={() => {
                                    if (targetShipmentId) {
                                      router.push(
                                        `/dashboard/tracking/shipment/${targetShipmentId}`
                                      );
                                    }
                                  }}
                                  className={`p-3 border border-primary/5 rounded-lg bg-card/50 space-y-2 transition-all ${
                                    targetShipmentId
                                      ? 'cursor-pointer hover:border-primary/30 hover:bg-slate-50/80 shadow-2xs'
                                      : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 overflow-hidden">
                                        {rev.reviewee?.image ? (
                                          <img
                                            src={rev.reviewee.image}
                                            alt={rev.reviewee.name}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          rev.reviewee?.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                      </div>
                                      <div>
                                        <span className="text-xs font-bold text-foreground block">
                                          {rev.reviewee?.name || 'User'}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground block">
                                          {new Date(rev.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      {rev.shipment?.itemName && (
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] font-medium py-0 px-1.5 gap-1 hover:bg-primary/5"
                                        >
                                          Shipment: {rev.shipment.itemName}
                                          <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                                        </Badge>
                                      )}
                                      <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                          <Star
                                            key={idx}
                                            className={`h-3.5 w-3.5 ${
                                              idx < rev.rating
                                                ? 'fill-amber-500 text-amber-500'
                                                : 'text-slate-200'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {rev.comment && (
                                    <p className="text-xs text-muted-foreground leading-relaxed pl-10 italic">
                                      "{rev.comment}"
                                    </p>
                                  )}
                                </div>
                              );
                            })}

                            {/* Pagination Controls */}
                            {meta && meta.totalPages > 1 && (
                              <div className="flex items-center justify-between pt-2 text-xs">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={givenPage <= 1}
                                  onClick={() => setGivenPage((p) => Math.max(1, p - 1))}
                                >
                                  Previous
                                </Button>
                                <span className="text-muted-foreground">
                                  Page {meta.page} of {meta.totalPages}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={givenPage >= meta.totalPages}
                                  onClick={() => setGivenPage((p) => p + 1)}
                                >
                                  Next
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
