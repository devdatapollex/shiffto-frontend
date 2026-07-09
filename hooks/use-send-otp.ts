'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth-client';

type OtpType = 'email-verification' | 'forget-password' | 'change-email' | 'sign-in';

interface UseSendOtpParams {
  email: string;
  type: OtpType;
  autoSend?: boolean;
}

export function useSendOtp({ email, type, autoSend = false }: UseSendOtpParams) {
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sentRef = useRef(false);

  async function sendOtp(showToast = true): Promise<boolean> {
    if (!email || isSending || cooldown > 0) return false;

    setIsSending(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type,
    });
    setIsSending(false);

    if (error) {
      toast.error(error.message || 'Failed to send verification code');
      return false;
    }

    if (showToast) {
      toast.success('Verification code sent!');
    }

    setCooldown(60);
    return true;
  }

  useEffect(() => {
    if (email && autoSend && !sentRef.current) {
      sentRef.current = true;
      sendOtp(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  return { sendOtp, isSending, cooldown };
}
