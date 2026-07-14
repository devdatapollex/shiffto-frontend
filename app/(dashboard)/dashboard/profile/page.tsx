'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import {
  User,
  Lock,
  Shield,
  Trash2,
  AlertTriangle,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getProfile,
  updateProfile,
  changePassword,
  submitKyc,
  deactivateAccount,
  deleteAccount,
  UserProfile,
} from '@/services/profile.service';
import { uploadPhotos } from '@/services/upload.service';
import { ROUTES } from '@/config/routes';

const NATIONALITIES = [
  'Bangladeshi',
  'American',
  'British',
  'Canadian',
  'Australian',
  'Indian',
  'Pakistani',
  'Saudi Arabian',
  'Emirati',
  'German',
  'French',
  'Italian',
  'Singaporean',
  'Malaysian',
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'kyc' || tab === 'security' || tab === 'personal' || tab === 'danger') {
        setActiveTab(tab);
      }
    }
  }, []);

  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // KYC States
  const [docType, setDocType] = useState<'PASSPORT' | 'DRIVING_LICENSE' | 'NID'>('PASSPORT');
  const [docNumber, setDocNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [kycPhone, setKycPhone] = useState('');
  const [frontPhotoUrl, setFrontPhotoUrl] = useState('');
  const [frontPhotoKey, setFrontPhotoKey] = useState('');
  const [backPhotoUrl, setBackPhotoUrl] = useState('');
  const [backPhotoKey, setBackPhotoKey] = useState('');
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [savingKyc, setSavingKyc] = useState(false);

  // Dialog States
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch Profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setImage(data.image || '');

      // Pre-fill KYC if exists
      if (data.kyc) {
        setDocType(data.kyc.documentType);
        setDocNumber(data.kyc.documentNumber);
        setNationality(data.kyc.nationality);
        setKycPhone(data.kyc.phoneNumber);
        setFrontPhotoUrl(data.kyc.frontPhotoUrl);
        setFrontPhotoKey(data.kyc.frontPhotoKey);
        setBackPhotoUrl(data.kyc.backPhotoUrl);
        setBackPhotoKey(data.kyc.backPhotoKey);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Upload Profile Photo
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 3MB)
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Profile photo must be less than 3MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Allowed formats: JPG, PNG, WebP');
      return;
    }

    try {
      setUploadingImage(true);
      const uploaded = await uploadPhotos([file]);
      if (uploaded.length > 0) {
        const photoUrl = uploaded[0].url;
        setImage(photoUrl);
        // Auto-save update
        await updateProfile({ image: photoUrl });
        toast.success('Profile photo updated successfully');
        router.refresh();
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Personal Info
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full Name is required');
      return;
    }

    try {
      setSavingPersonal(true);
      await updateProfile({ name, phone: phone || null });
      toast.success('Personal details updated successfully');
      fetchUserProfile();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to update personal details');
    } finally {
      setSavingPersonal(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Password updated successfully. Logging out...');

      // Auto logout after successful change
      setTimeout(async () => {
        await authClient.signOut();
        router.push(ROUTES.LOGIN);
        router.refresh();
      }, 1500);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Upload KYC Photo (front / back)
  const handleKycPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Document photo must be less than 5MB');
      return;
    }

    try {
      if (side === 'front') setUploadingFront(true);
      else setUploadingBack(true);

      const uploaded = await uploadPhotos([file]);
      if (uploaded.length > 0) {
        if (side === 'front') {
          setFrontPhotoUrl(uploaded[0].url);
          setFrontPhotoKey(uploaded[0].key);
          toast.success('Front photo uploaded');
        } else {
          setBackPhotoUrl(uploaded[0].url);
          setBackPhotoKey(uploaded[0].key);
          toast.success('Back photo uploaded');
        }
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to upload document photo');
    } finally {
      setUploadingFront(false);
      setUploadingBack(false);
    }
  };

  // Submit KYC
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim()) {
      toast.error('Document Number is required');
      return;
    }
    if (!nationality) {
      toast.error('Nationality is required');
      return;
    }
    if (!kycPhone.trim()) {
      toast.error('Phone Number is required');
      return;
    }
    if (!frontPhotoUrl) {
      toast.error('Front photo of document is required');
      return;
    }
    if (!backPhotoUrl) {
      toast.error('Back photo of document is required');
      return;
    }

    try {
      setSavingKyc(true);
      await submitKyc({
        documentType: docType,
        documentNumber: docNumber,
        nationality,
        phoneNumber: kycPhone,
        frontPhotoUrl,
        frontPhotoKey,
        backPhotoUrl,
        backPhotoKey,
      });
      toast.success('KYC Verification submitted successfully. Awaiting review.');
      fetchUserProfile();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to submit KYC details');
    } finally {
      setSavingKyc(false);
    }
  };

  // Deactivate Account
  const handleDeactivate = async () => {
    try {
      setDeactivating(true);
      await deactivateAccount();
      toast.success('Account deactivated. Logging out...');
      setTimeout(async () => {
        await authClient.signOut();
        router.push(ROUTES.LOGIN);
        router.refresh();
      }, 1500);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Deactivation failed. Check if you have active shipments.');
    } finally {
      setDeactivating(false);
      setShowDeactivateDialog(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (!deleteConfirmPassword) {
      toast.error('Password confirmation is required');
      return;
    }

    try {
      setDeleting(true);
      await deleteAccount({ password: deleteConfirmPassword });
      toast.success('Account deleted permanently. We are sorry to see you go.');
      setTimeout(async () => {
        await authClient.signOut();
        router.push(ROUTES.LOGIN);
        router.refresh();
      }, 1500);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Deletion failed. Verify your password or active shipments.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile information...</p>
      </div>
    );
  }

  const kycStatus = profile?.kyc?.status || 'NOT_SUBMITTED';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0B3A8E]">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal details, secure your account, and submit identity verification.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/60 p-1">
          <TabsTrigger value="personal" id="tab-personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Personal Info</span>
          </TabsTrigger>
          <TabsTrigger value="security" id="tab-security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden md:inline">Password</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" id="tab-kyc" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">KYC Verification</span>
          </TabsTrigger>
          <TabsTrigger
            value="danger"
            id="tab-danger"
            className="flex items-center gap-2 text-destructive"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden md:inline">Danger Zone</span>
          </TabsTrigger>
        </TabsList>

        {/* Section 1: Personal Info */}
        <TabsContent value="personal">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#0B3A8E]">
                Personal Information
              </CardTitle>
              <CardDescription>Update your profile photo and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center text-primary-foreground font-semibold text-3xl">
                    {image ? (
                      <img src={image} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[#0B3A8E]">{name.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium"
                  >
                    <Camera className="h-5 w-5 mb-0.5" />
                    {uploadingImage ? 'Uploading...' : 'Change'}
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleProfilePhotoUpload}
                    disabled={uploadingImage}
                  />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="font-semibold text-slate-800">Profile Photo</h4>
                  <p className="text-xs text-muted-foreground">
                    Accepts JPG, PNG, or WebP. Max size: 3MB.
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <form onSubmit={handleSavePersonal} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email}
                    disabled
                    className="bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground/80">
                    Your email address is managed securely and cannot be changed.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +8801700000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground/80">
                    No OTP verification is required for updating personal phone.
                  </p>
                </div>

                <Button
                  type="submit"
                  id="btn-save-personal"
                  className="bg-primary text-white hover:bg-primary/95"
                  disabled={savingPersonal}
                >
                  {savingPersonal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 2: Security & Password */}
        <TabsContent value="security">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#0B3A8E]">
                Security & Password
              </CardTitle>
              <CardDescription>
                Ensure your account is protected with a strong, complex password. Changing password
                will sign you out.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="curr-pass">Current Password</Label>
                  <Input
                    id="curr-pass"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-pass">New Password</Label>
                  <Input
                    id="new-pass"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="conf-pass">Confirm New Password</Label>
                  <Input
                    id="conf-pass"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  id="btn-save-password"
                  className="bg-primary text-white hover:bg-primary/95"
                  disabled={savingPassword}
                >
                  {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 3: KYC Verification */}
        <TabsContent value="kyc">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#0B3A8E]">
                Identity Verification (KYC)
              </CardTitle>
              <CardDescription>
                Verification covers traveler and sender privileges. Complete the form to start
                matching shipments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* KYC Status Banner */}
              <div className="rounded-lg p-4 flex items-start gap-3 bg-slate-50 border border-slate-100">
                {kycStatus === 'APPROVED' && (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800">KYC Status: Approved</h4>
                      <p className="text-xs text-green-700 mt-1">
                        Your identity has been fully verified. You can now publish shipment requests
                        and list travel trips.
                      </p>
                    </div>
                  </>
                )}
                {kycStatus === 'PENDING' && (
                  <>
                    <Clock className="h-6 w-6 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="font-semibold text-orange-800">KYC Status: Pending Review</h4>
                      <p className="text-xs text-orange-700 mt-1">
                        Your submissions are currently being verified by our administration team.
                        This usually takes 24 hours.
                      </p>
                    </div>
                  </>
                )}
                {kycStatus === 'REJECTED' && (
                  <>
                    <XCircle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-destructive">KYC Status: Rejected</h4>
                      <p className="text-xs text-red-700 mt-1">
                        Your document could not be verified. Please review the reason below and
                        submit resubmission form from scratch.
                      </p>
                      {profile?.kyc?.rejectionReason && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-xs font-semibold text-destructive">
                          Reason: {profile.kyc.rejectionReason}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {kycStatus === 'NOT_SUBMITTED' && (
                  <>
                    <AlertTriangle className="h-6 w-6 text-yellow-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">KYC Status: Not Submitted</h4>
                      <p className="text-xs text-yellow-700 mt-1">
                        Submit verification documents. Without approval, you will not be allowed to
                        add trips or shipments.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* KYC Submission Form */}
              {(kycStatus === 'NOT_SUBMITTED' || kycStatus === 'REJECTED') && (
                <form onSubmit={handleKycSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Document Type</Label>
                    <div className="flex flex-wrap gap-4">
                      {['PASSPORT', 'DRIVING_LICENSE', 'NID'].map((type) => (
                        <label
                          key={type}
                          className={`flex items-center gap-2 border rounded-lg px-4 py-3 cursor-pointer text-sm transition-all ${
                            docType === type
                              ? 'border-primary bg-primary/5 text-primary font-semibold'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="documentType"
                            value={type}
                            checked={docType === type}
                            onChange={() =>
                              setDocType(type as 'PASSPORT' | 'DRIVING_LICENSE' | 'NID')
                            }
                            className="text-primary focus:ring-primary h-4 w-4"
                          />
                          {type === 'PASSPORT' && 'Passport'}
                          {type === 'DRIVING_LICENSE' && 'Driving License'}
                          {type === 'NID' && 'National ID (NID)'}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="doc-number">Document Number</Label>
                      <Input
                        id="doc-number"
                        placeholder="Enter identification code"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Select value={nationality} onValueChange={setNationality}>
                        <SelectTrigger id="nationality">
                          <SelectValue placeholder="Select your nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          {NATIONALITIES.map((nat) => (
                            <SelectItem key={nat} value={nat}>
                              {nat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="kyc-phone">Verification Phone Number</Label>
                      <Input
                        id="kyc-phone"
                        placeholder="Enter phone with country code"
                        value={kycPhone}
                        onChange={(e) => setKycPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Document Photos Upload */}
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Front Photo */}
                    <div className="space-y-2">
                      <Label>Document Front Page / Photo</Label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center h-48 bg-slate-50 hover:bg-slate-100 transition-colors">
                        {frontPhotoUrl ? (
                          <div className="absolute inset-0 p-2">
                            <img
                              src={frontPhotoUrl}
                              alt="Document Front"
                              className="h-full w-full object-contain rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFrontPhotoUrl('');
                                setFrontPhotoKey('');
                              }}
                              className="absolute top-4 right-4 bg-destructive text-destructive-foreground h-6 w-6 rounded-full flex items-center justify-center shadow-md text-xs font-bold"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <Upload className="h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-xs font-semibold text-slate-700">
                              Click to upload document front
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              JPG, PNG, WebP up to 5MB
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleKycPhotoUpload(e, 'front')}
                          disabled={uploadingFront}
                        />
                        {uploadingFront && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Back Photo */}
                    <div className="space-y-2">
                      <Label>Document Back Page / Secondary Photo</Label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center h-48 bg-slate-50 hover:bg-slate-100 transition-colors">
                        {backPhotoUrl ? (
                          <div className="absolute inset-0 p-2">
                            <img
                              src={backPhotoUrl}
                              alt="Document Back"
                              className="h-full w-full object-contain rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setBackPhotoUrl('');
                                setBackPhotoKey('');
                              }}
                              className="absolute top-4 right-4 bg-destructive text-destructive-foreground h-6 w-6 rounded-full flex items-center justify-center shadow-md text-xs font-bold"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <Upload className="h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-xs font-semibold text-slate-700">
                              Click to upload document back
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              JPG, PNG, WebP up to 5MB
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleKycPhotoUpload(e, 'back')}
                          disabled={uploadingBack}
                        />
                        {uploadingBack && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    id="btn-submit-kyc"
                    className="bg-primary text-white hover:bg-primary/95 w-full md:w-auto"
                    disabled={savingKyc}
                  >
                    {savingKyc && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Verification Details
                  </Button>
                </form>
              )}

              {/* Approved / Pending Read-only State */}
              {(kycStatus === 'APPROVED' || kycStatus === 'PENDING') && (
                <div className="grid gap-4 md:grid-cols-2 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Document Type</h5>
                    <p className="text-sm font-semibold text-slate-700 mt-1 capitalize">
                      {profile?.kyc?.documentType.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Document Number</h5>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {profile?.kyc?.documentNumber.replace(/.(?=.{4})/g, '*')}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Nationality</h5>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {profile?.kyc?.nationality}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">Phone Number</h5>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {profile?.kyc?.phoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section 4 & 5: Danger Zone (Deactivate/Delete) */}
        <TabsContent value="danger">
          <div className="space-y-6">
            {/* Account Deactivation */}
            <Card className="border-red-100 shadow-sm">
              <CardHeader className="bg-red-50/10">
                <CardTitle className="text-xl font-bold text-red-800">Deactivate Account</CardTitle>
                <CardDescription className="text-red-700/80">
                  Temporarily disable your profile. You can only be reactivated by the platform
                  administration.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">
                  Deactivating your account blocks all shipment creations, trip list postings, and
                  makes your profile invisible to other users. You cannot deactivate your account if
                  there are active matched shipments or trips in progress.
                </p>
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-3">
                <Button
                  id="btn-deactivate"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowDeactivateDialog(true)}
                >
                  Deactivate My Account
                </Button>
              </CardFooter>
            </Card>

            {/* Account Deletion */}
            <Card className="border-destructive shadow-sm">
              <CardHeader className="bg-destructive/5">
                <CardTitle className="text-xl font-bold text-destructive">
                  Delete Account Permanently
                </CardTitle>
                <CardDescription className="text-destructive/80">
                  This action is permanent and cannot be undone. All your user profile and matched
                  data will be removed.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600">
                  Once deleted, your account cannot be recovered. All history, transaction logs,
                  ratings, and wallet links are permanently purged. Active matched shipments must be
                  completed before you can request account deletion.
                </p>
              </CardContent>
              <CardFooter className="border-t border-slate-100 bg-slate-50/50 py-3">
                <Button
                  id="btn-delete"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account permanently
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Deactivate Confirmation Popup */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm Account Deactivation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate your account? Your shipments and trips will be
              paused. This can only be reactivated by contacting administration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button
              id="confirm-deactivate"
              className="bg-red-700 hover:bg-red-800 text-white"
              onClick={handleDeactivate}
              disabled={deactivating}
            >
              {deactivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Popup */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Confirm Permanent Deletion
            </DialogTitle>
            <DialogDescription>
              This is non-reversible. Please enter your password to confirm that you wish to delete
              your account permanently.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="delete-pwd">Confirm Password</Label>
            <Input
              type="password"
              id="delete-pwd"
              placeholder="Enter password"
              value={deleteConfirmPassword}
              onChange={(e) => setDeleteConfirmPassword(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmPassword('');
              }}
            >
              Cancel
            </Button>
            <Button
              id="confirm-delete"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
