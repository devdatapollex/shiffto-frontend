'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { authClient, useSession } from '@/lib/auth-client';
import apiClient from '@/lib/api-client';
import { logger } from '@/lib/logger';
import { ROUTES } from '@/config/routes';
import { useSendOtp } from '@/hooks/use-send-otp';
import { maskEmail } from '@/lib/utils';
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

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get('email') || '';

  const { data: session, isPending } = useSession();
  const email = session?.user?.email || queryEmail;
  const emailVerified = session?.user?.emailVerified;

  const successRef = useRef(false);

  useEffect(() => {
    if (!successRef.current && !isPending && session?.user && emailVerified) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isPending, session, emailVerified, router]);

  const {
    sendOtp,
    isSending: isResending,
    cooldown,
    clearStorage,
  } = useSendOtp({
    email,
    type: 'email-verification',
    autoSend: !emailVerified,
  });

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAborting, setIsAborting] = useState(false);

  const handleVerify = async () => {
    if (!email || otp.length !== 6) return;
    setIsVerifying(true);
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp,
    });
    setIsVerifying(false);
    if (error) {
      toast.error(error.message || 'Invalid or expired code');
      setOtp('');
      return;
    }
    successRef.current = true;
    clearStorage();
    toast.success('Email verified!');
    router.push(ROUTES.DASHBOARD);
    router.refresh();
  };

  const handleAbortSignup = async () => {
    if (!email) return;
    setIsAborting(true);
    try {
      await apiClient.post('/profile/abort-signup', { email });
    } catch (err: unknown) {
      logger.error('Failed to abort signup', err);
    } finally {
      clearStorage();
      try {
        await authClient.signOut();
      } catch {
        // Ignored if no session cookie exists
      }
      setIsAborting(false);
      toast.success('Sign up cancelled. You can sign up using a different email.');
      router.push(ROUTES.REGISTER);
      router.refresh();
    }
  };

  const handleBackToSignIn = async () => {
    clearStorage();
    try {
      await authClient.signOut();
    } catch {
      // Ignored if no session cookie exists
    }
    router.push(ROUTES.LOGIN);
  };

  if (isPending && !queryEmail) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (emailVerified) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!email) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We could not determine your email. Please sign up again.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link href={ROUTES.REGISTER}>
            <Button>Back to sign up</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a verification code to{' '}
          <span className="font-medium text-foreground">{maskEmail(email)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            disabled={isVerifying || isAborting}
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
          disabled={otp.length !== 6 || isVerifying || isAborting}
        >
          {isVerifying ? 'Verifying...' : 'Verify email'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => sendOtp(true)}
            disabled={cooldown > 0 || isResending || isAborting}
          >
            {isResending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </p>

      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-center">
          <button
            type="button"
            onClick={handleBackToSignIn}
            className="font-medium text-primary hover:underline disabled:opacity-50"
            disabled={isAborting || isVerifying}
          >
            Back to sign in
          </button>
          <span>or</span>
          <button
            type="button"
            onClick={handleAbortSignup}
            className="font-medium text-primary hover:underline disabled:opacity-50"
            disabled={isAborting || isVerifying}
          >
            {isAborting ? 'Cancelling...' : 'Sign up using a different email'}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
