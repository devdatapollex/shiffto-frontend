import { KycGuard } from '@/components/auth/kyc-guard';
import { CreateTripWizard } from '@/components/trips/create/create-trip-wizard';

export default function CreateTripPage() {
  return (
    <KycGuard>
      <CreateTripWizard />
    </KycGuard>
  );
}
