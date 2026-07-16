'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { User, Lock, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProfile, updateProfile, changePassword, UserProfile } from '@/services/profile.service';
import { uploadPhotos } from '@/services/upload.service';
import { ROUTES } from '@/config/routes';
import { RoleGuard } from '@/components/auth/role-guard';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';

export default function AdminProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState('personal');

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

  // Fetch Profile
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setImage(data.image || '');
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
        router.push(ROUTES.ADMIN_LOGIN);
        router.refresh();
      }, 1500);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard
        roles={['admin']}
        fallback={
          <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
        }
      >
        <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin profile...</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard
      roles={['admin']}
      fallback={
        <div className="p-8 text-center font-bold text-destructive">Unauthorized Access</div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B3A8E]">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your admin profile details and secure your administrative account.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1">
            <TabsTrigger value="personal" id="tab-personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Personal Info</span>
            </TabsTrigger>
            <TabsTrigger value="security" id="tab-security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Password</span>
            </TabsTrigger>
          </TabsList>

          {/* Section 1: Personal Info */}
          <TabsContent value="personal">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[#0B3A8E]">
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your administrative profile photo and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center text-primary-foreground font-semibold text-3xl">
                      {image ? (
                        <Image
                          src={toRelativeImageUrl(image)}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          width={96}
                          height={96}
                        />
                      ) : (
                        <span className="text-[#0B3A8E]">
                          {name.charAt(0).toUpperCase() || 'A'}
                        </span>
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
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="e.g. +8801700000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
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
                  Ensure your administrative account is protected. Changing password will sign you
                  out.
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
        </Tabs>
      </div>
    </RoleGuard>
  );
}
