'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { sendShipmentOtp } from '@/services/shipment.service';

export interface SendOtpResult {
  success: boolean;
  status?: number;
  message?: string;
}

export function useShipmentOtp() {
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inFlightRef = useRef(false);

  async function sendOtp(showToast = true): Promise<SendOtpResult> {
    if (inFlightRef.current || cooldown > 0) return { success: false };

    inFlightRef.current = true;
    setIsSending(true);
    try {
      await sendShipmentOtp();
      if (showToast) {
        toast.success('Verification code sent!');
      }
      setCooldown(60);
      return { success: true };
    } catch (error) {
      const err = error as { status?: number; message?: string };
      const message = err?.message || 'Failed to send verification code';
      const status = err?.status;

      if (status !== 403 && !message.toLowerCase().includes('kyc')) {
        toast.error(message);
      }
      return { success: false, status, message };
    } finally {
      setIsSending(false);
      inFlightRef.current = false;
    }
  }

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
