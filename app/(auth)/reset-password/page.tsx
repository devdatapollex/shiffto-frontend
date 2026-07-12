'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { authClient } from '@/lib/auth-client';
import { maskEmail } from '@/lib/utils';
import { ROUTES } from '@/config/routes';
import { useSendOtp } from '@/hooks/use-send-otp';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const password =
    typeof window !== 'undefined' ? sessionStorage.getItem('shiffto:reset-password') : null;

  const successRef = useRef(false);

  useEffect(() => {
    if (!successRef.current && typeof window !== 'undefined' && !password) {
      router.replace(ROUTES.FORGOT_PASSWORD);
    }
  }, [password, router]);

  const {
    sendOtp,
    isSending: isResending,
    cooldown,
  } = useSendOtp({
    email,
    type: 'forget-password',
    autoSend: true,
  });

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!email || otp.length !== 6 || !password) return;
    setIsVerifying(true);
    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password,
    });
    setIsVerifying(false);
    if (error) {
      toast.error(error.message || 'Invalid or expired code');
      setOtp('');
      return;
    }
    sessionStorage.removeItem('shiffto:reset-password');
    successRef.current = true;
    toast.success('Password reset successfully!');
    router.push(ROUTES.LOGIN);
  };

  if (!password) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          We sent a reset code to{' '}
          <span className="font-medium text-foreground">{maskEmail(email)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isVerifying}
            className="gap-2"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Reset password'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => sendOtp(true)}
            disabled={cooldown > 0 || isResending}
          >
            {isResending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
