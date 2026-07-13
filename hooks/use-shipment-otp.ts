'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { sendShipmentOtp } from '@/services/shipment.service';

export function useShipmentOtp() {
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inFlightRef = useRef(false);

  async function sendOtp(showToast = true): Promise<boolean> {
    if (inFlightRef.current || cooldown > 0) return false;

    inFlightRef.current = true;
    setIsSending(true);
    try {
      await sendShipmentOtp();
      if (showToast) {
        toast.success('Verification code sent!');
      }
      setCooldown(60);
      return true;
    } catch (error) {
      const message =
        (error as { message?: string })?.message || 'Failed to send verification code';
      toast.error(message);
      return false;
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
