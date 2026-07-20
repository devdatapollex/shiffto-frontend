'use client';

import { useFormContext } from 'react-hook-form';
import { Mail } from 'lucide-react';

import { useSession } from '@/lib/auth-client';
import { maskEmail } from '@/lib/utils';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import type { CreateShipmentValues } from '@/lib/validations/shipment';

import type { SendOtpResult } from '@/hooks/use-shipment-otp';

interface OtpVerificationStepProps {
  sendOtp: (showToast?: boolean) => Promise<SendOtpResult>;
  isSending: boolean;
  cooldown: number;
  isSubmitting: boolean;
}

export function OtpVerificationStep({
  sendOtp,
  isSending,
  cooldown,
  isSubmitting,
}: OtpVerificationStepProps) {
  const { register, setValue, watch, formState } = useFormContext<CreateShipmentValues>();
  const { data: session } = useSession();
  const otp = watch('otp') ?? '';

  const error = formState.errors.otp?.message;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center gap-3 pt-2">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-[#0B3A8E]">Verify it&apos;s you</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          We sent a 6-digit verification code to{' '}
          <span className="font-medium text-foreground">
            {session?.user?.email ? maskEmail(session.user.email) : 'your email'}
          </span>
          . Enter the code below to create your shipment.
        </p>
      </div>

      <input type="hidden" {...register('otp')} />

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setValue('otp', value, { shouldValidate: true, shouldDirty: true })}
          disabled={isSubmitting}
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}

      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t receive the code?{' '}
        <button
          type="button"
          className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => sendOtp(true)}
          disabled={cooldown > 0 || isSending || isSubmitting}
        >
          {isSending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </button>
      </p>
    </div>
  );
}
