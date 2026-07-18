'use client';

import { useState } from 'react';
import {
  PackageCheck,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUploadImages } from '@/hooks/use-upload-image';
import {
  useConfirmPickup,
  useConfirmCheckin,
  useConfirmTransit,
  useConfirmArrival,
  useConfirmOutForDelivery,
  useConfirmDelivery,
} from '@/hooks/use-shipment-steps';
import type { ShipmentDetails, ShipmentStep } from '@/services/shipment.service';
import { toRelativeImageUrl } from '@/lib/image-utils';
import Image from 'next/image';
import { toast } from 'sonner';

interface StepAdvancementCardProps {
  shipment: ShipmentDetails;
  steps: ShipmentStep[];
}

const STEP_TITLES: Record<string, { title: string; subtitle: string }> = {
  PAYMENT_CONFIRMED: {
    title: 'Payment Confirmation',
    subtitle: 'Waiting for sender payment confirmation before pickup.',
  },
  PICKED_UP: {
    title: 'Confirm Package Pickup',
    subtitle: 'Upload a photo proof of the package picked up from sender.',
  },
  CHECKED_IN: {
    title: 'Confirm Airport Check-in',
    subtitle: 'Confirm that the package has been checked in for your flight.',
  },
  IN_TRANSIT: {
    title: 'Confirm In Transit',
    subtitle: 'Mark package as in transit once flight has departed.',
  },
  ARRIVED_AT_DESTINATION: {
    title: 'Confirm Arrival at Destination',
    subtitle: 'Mark package as arrived at destination airport.',
  },
  OUT_FOR_DELIVERY: {
    title: 'Confirm Out for Delivery',
    subtitle: 'Mark package as out for delivery to receiver.',
  },
  DELIVERED: {
    title: 'Confirm Final Delivery',
    subtitle: 'Upload delivery proof photo to mark package as delivered.',
  },
};

export function StepAdvancementCard({ shipment, steps }: StepAdvancementCardProps) {
  const currentStep = steps.find((s) => s.isCurrent);

  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Mutations
  const uploadMutation = useUploadImages();
  const pickupMutation = useConfirmPickup(shipment.id);
  const checkinMutation = useConfirmCheckin(shipment.id);
  const transitMutation = useConfirmTransit(shipment.id);
  const arrivalMutation = useConfirmArrival(shipment.id);
  const outForDeliveryMutation = useConfirmOutForDelivery(shipment.id);
  const deliveryMutation = useConfirmDelivery(shipment.id);

  if (!currentStep) return null;

  const stage = currentStep.stage;
  const config = STEP_TITLES[stage] || {
    title: 'Advance Step',
    subtitle: 'Update shipment status to next stage.',
  };

  const isPendingMutation =
    pickupMutation.isPending ||
    checkinMutation.isPending ||
    transitMutation.isPending ||
    arrivalMutation.isPending ||
    outForDeliveryMutation.isPending ||
    deliveryMutation.isPending;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadMutation.mutateAsync(Array.from(files));
      if (uploaded && uploaded.length > 0) {
        setPhotoUrl(uploaded[0].url);
        toast.success('Photo uploaded successfully');
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdvancement = async () => {
    switch (stage) {
      case 'PICKED_UP':
        // REVERT_MARKER: Restore original validation "if (!photoUrl)" when photo proof is required.
        const finalPickupPhoto = photoUrl || 'https://placehold.co/600x400?text=Pickup+Proof';
        await pickupMutation.mutateAsync({ photoUrl: finalPickupPhoto, notes: notes || undefined });
        setNotes('');
        setPhotoUrl('');
        break;

      case 'CHECKED_IN':
        await checkinMutation.mutateAsync({ notes: notes || undefined });
        setNotes('');
        break;

      case 'IN_TRANSIT':
        await transitMutation.mutateAsync({ notes: notes || undefined });
        setNotes('');
        break;

      case 'ARRIVED_AT_DESTINATION':
        await arrivalMutation.mutateAsync({ notes: notes || undefined });
        setNotes('');
        break;

      case 'OUT_FOR_DELIVERY':
        await outForDeliveryMutation.mutateAsync({ notes: notes || undefined });
        setNotes('');
        break;

      case 'DELIVERED':
        // REVERT_MARKER: Restore original validation "if (!photoUrl)" when photo proof is required.
        const finalDeliveryPhoto = photoUrl || 'https://placehold.co/600x400?text=Delivery+Proof';
        await deliveryMutation.mutateAsync({
          photoUrl: finalDeliveryPhoto,
          notes: notes || undefined,
        });
        setNotes('');
        setPhotoUrl('');
        break;

      default:
        break;
    }
  };

  if (stage === 'PAYMENT_CONFIRMED') {
    return (
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900">Awaiting Sender Payment</h4>
          <p className="text-xs text-amber-700 mt-0.5">
            The sender must confirm payment before you can pick up the shipment and advance tracking steps.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-[#0D307A] to-slate-900 rounded-2xl p-6 text-white shadow-md space-y-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 shrink-0">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                Traveller Action Required
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold mt-1 text-white">{config.title}</h3>
            <p className="text-xs text-indigo-200/80">{config.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-white/10">
        {/* Photo Upload for Pickup or Delivery */}
        {(stage === 'PICKED_UP' || stage === 'DELIVERED') && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-indigo-100 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              Proof Photo <span className="text-amber-400">*</span>
            </Label>

            {photoUrl ? (
              <div className="relative w-36 h-28 rounded-xl overflow-hidden border-2 border-amber-400/60 group shadow-sm">
                <Image
                  src={toRelativeImageUrl(photoUrl)}
                  alt="Proof photo"
                  className="object-cover w-full h-full"
                  width={144}
                  height={112}
                />
                <button
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white p-1 rounded-full transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all">
                {isUploading ? (
                  <div className="flex items-center gap-2 text-xs text-indigo-200">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                    <span>Uploading photo...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-3">
                    <Upload className="h-6 w-6 text-amber-400 mb-1" />
                    <span className="text-xs font-semibold text-white">Click to upload photo</span>
                    <span className="text-[10px] text-indigo-200/70 mt-0.5">JPG, PNG up to 5MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* Optional Notes */}
        <div className="space-y-2">
          <Label htmlFor="step-notes" className="text-xs font-semibold text-indigo-100 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            Notes (Optional)
          </Label>
          <Textarea
            id="step-notes"
            placeholder="Add any remarks or details for this step..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="bg-white/10 border-white/20 text-white placeholder:text-indigo-200/50 text-xs rounded-xl focus:border-amber-400 focus:ring-amber-400"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            onClick={handleAdvancement}
            disabled={isPendingMutation || isUploading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold h-11 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPendingMutation ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Updating Step...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>{config.title}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
