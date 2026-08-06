'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth-client';

type OtpType = 'email-verification' | 'forget-password' | 'change-email' | 'sign-in';

interface UseSendOtpParams {
  email: string;
  type: OtpType;
  autoSend?: boolean;
}

export function clearOtpStorage(email: string, type: OtpType) {
  if (typeof window !== 'undefined' && email) {
    const key = `otp_sent_${encodeURIComponent(email.toLowerCase())}_${type}`;
    sessionStorage.removeItem(key);
  }
}

export function useSendOtp({ email, type, autoSend = false }: UseSendOtpParams) {
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sentRef = useRef(false);

  const storageKey = email ? `otp_sent_${encodeURIComponent(email.toLowerCase())}_${type}` : null;

  const sendOtp = useCallback(
    async (showToast = true): Promise<boolean> => {
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

      if (storageKey && typeof window !== 'undefined') {
        sessionStorage.setItem(storageKey, Date.now().toString());
      }
      setCooldown(60);
      return true;
    },
    [email, isSending, cooldown, storageKey]
  );

  useEffect(() => {
    if (!email || typeof window === 'undefined') return;

    if (storageKey) {
      const savedTime = sessionStorage.getItem(storageKey);
      if (savedTime) {
        const elapsedSeconds = Math.floor((Date.now() - Number(savedTime)) / 1000);
        if (elapsedSeconds < 60) {
          setCooldown(60 - elapsedSeconds);
          sentRef.current = true;
          return;
        }
      }
    }

    if (autoSend && !sentRef.current) {
      sentRef.current = true;
      sendOtp(false);
    }
  }, [email, autoSend, storageKey, sendOtp]);

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

  const clearStorage = useCallback(() => {
    if (email) {
      clearOtpStorage(email, type);
    }
  }, [email, type]);

  return { sendOtp, isSending, cooldown, clearStorage };
}
