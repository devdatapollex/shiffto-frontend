import { KycGuard } from '@/components/auth/kyc-guard';
import { CreateShipmentWizard } from '@/components/shipments/create/create-shipment-wizard';

export default function CreateShipmentPage() {
  return (
    <KycGuard>
      <CreateShipmentWizard />
    </KycGuard>
  );
}
