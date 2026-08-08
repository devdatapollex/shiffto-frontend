# Sender Cancellation Fee & Admin Refund Management Design

## 1. Overview

Currently, when a shipment is canceled before pickup, the system treats all cancellations identically by queuing a 100% full refund (`grossAmount`) to the sender, regardless of whether the sender or the traveler initiated the cancellation.

This design introduces a **cancellation fee policy**:

- **Sender-Initiated Cancellation**: The platform retains a commission fee (`cancellationFeeAmount`), refunding the remaining net amount (`refundableAmount`) to the sender.
- **Traveler-Initiated Cancellation**: The sender receives a 100% full refund (`cancellationFeeAmount = $0.00`, `refundableAmount = grossAmount`).
- **Admin-Initiated Cancellation**: Admins can cancel via a dedicated endpoint/UI with customizable fee rules (standard commission rate, custom percentage, custom flat fee, or no fee).
- **Analytics Accounting**: All revenue, volume, and liability metrics in the backend/admin analytics services are updated to accurately account for retained cancellation fees and net refundable amounts.

---

## 2. Database Schema Changes (`shiffto-backend/prisma/payment.prisma`)

Add a new `RefundInitiator` Enum and three explicit fields to `PaymentTransaction`:

```prisma
enum RefundInitiator {
  SENDER
  TRAVELLER
  ADMIN
}

model PaymentTransaction {
  id                  String           @id @default(uuid(7))
  // ... existing fields ...

  refundInitiator      RefundInitiator?
  refundableAmount     Float            @default(0.0)
  cancellationFeeAmount Float           @default(0.0)

  // ... existing fields & relations ...
}
```

### Data Migration Strategy

- Run Prisma migration `npx prisma migrate dev --name add_refund_initiator_and_fee_fields`.
- Existing legacy `PENDING_REFUND` or `REFUNDED` records will default to `cancellationFeeAmount = 0.0` and `refundableAmount = grossAmount`, preserving backwards compatibility for past historical transactions.

---

## 3. Backend Logic & Services (`shiffto-backend`)

### 3.1 Modular Helper Calculation (`payment.service.ts`)

Create a helper function `calculateRefundAmounts`:

```typescript
interface CalculateRefundParams {
  grossAmount: number;
  commissionRate: number;
  initiator: 'SENDER' | 'TRAVELLER' | 'ADMIN';
  customFeeType?: 'COMMISSION' | 'PERCENT' | 'FLAT' | 'NONE';
  customFeeValue?: number;
}

export function calculateRefundAmounts(params: CalculateRefundParams) {
  const { grossAmount, commissionRate, initiator, customFeeType, customFeeValue } = params;

  if (initiator === 'TRAVELLER' || customFeeType === 'NONE') {
    return { cancellationFeeAmount: 0, refundableAmount: grossAmount };
  }

  if (initiator === 'SENDER' || customFeeType === 'COMMISSION') {
    const fee = grossAmount * commissionRate;
    return { cancellationFeeAmount: fee, refundableAmount: grossAmount - fee };
  }

  if (initiator === 'ADMIN' && customFeeType === 'PERCENT' && customFeeValue !== undefined) {
    const fee = grossAmount * (customFeeValue / 100);
    return { cancellationFeeAmount: fee, refundableAmount: Math.max(0, grossAmount - fee) };
  }

  if (initiator === 'ADMIN' && customFeeType === 'FLAT' && customFeeValue !== undefined) {
    const fee = Math.min(grossAmount, customFeeValue);
    return { cancellationFeeAmount: fee, refundableAmount: grossAmount - fee };
  }

  // Fallback default
  const fee = grossAmount * commissionRate;
  return { cancellationFeeAmount: fee, refundableAmount: grossAmount - fee };
}
```

### 3.2 Update `PaymentService.markPaymentAsPendingRefund`

Update parameters to accept `initiator`, `reason`, and optional `customFee`:

1. Look up primary payment method (`refundMethodDetails`).
2. Calculate `cancellationFeeAmount` and `refundableAmount` using `calculateRefundAmounts`.
3. Update `PaymentTransaction`:
   - `status = PaymentStatus.PENDING_REFUND`
   - `refundReason = reason`
   - `refundInitiator = initiator`
   - `cancellationFeeAmount`
   - `refundableAmount`
   - `refundMethodDetails`
4. Notify sender: _"Your payment of ${refundableAmount} for shipment X is pending refund (Fee retained: ${cancellationFeeAmount})."_

### 3.3 Cancellation Handlers Update

- **`ShipmentService.cancelShipment`**: When sender cancels, pass `initiator: RefundInitiator.SENDER`.
- **`TripService.cancelTrip`**: When traveler cancels trip, pass `initiator: RefundInitiator.TRAVELLER`.

### 3.4 Dedicated Admin Cancellation Endpoint

- **Route**: `POST /api/v1/payments/admin/shipments/:id/cancel`
- **Access**: Auth Admin Guard
- **Payload**:
  ```json
  {
    "reason": "Administrative cancellation",
    "feeType": "COMMISSION" | "PERCENT" | "FLAT" | "NONE",
    "feeValue": 15
  }
  ```
- Executed inside a Prisma transaction, updates `ShipmentStatus` to `CANCELED` and calls `markPaymentAsPendingRefund` with `initiator: RefundInitiator.ADMIN`.

### 3.5 Accounting & Analytics Updates (`admin.service.ts` & `payment.service.ts`)

Update all aggregation methods:

- **`totalPendingRefund`**:
  $$\sum_{\text{status} = \text{PENDING\_REFUND}} \text{refundableAmount}$$
- **`totalRefunded`**:
  $$\sum_{\text{status} = \text{REFUNDED}} \text{refundableAmount}$$
- **`totalPlatformRevenue`**:
  $$\sum_{\text{RELEASED}} \text{commissionAmount} + \sum_{\text{PENDING\_REFUND} \lor \text{REFUNDED}} \text{cancellationFeeAmount}$$
- **`getAdminPayments`**: Map `cancellationFeeAmount` and `refundableAmount` in data list and stats summary.

---

## 4. Frontend UI Updates (`shiffto-frontend`)

### 4.1 Sender Cancellation Flow ([my-shipments/page.tsx](<file:///d:/Codes/work/DataPollex/shiffto/shiffto-frontend/app/(dashboard)/dashboard/my-shipments/page.tsx>))

- In the cancellation confirmation modal, display a financial breakdown card before the user confirms:
  - **Original Amount Paid**: `$100.00`
  - **Cancellation Fee (Platform Commission)**: `-$30.00`
  - **Net Refund Amount**: `$70.00`

### 4.2 Admin Shipments Table ([admin/shipments/page.tsx](<file:///d:/Codes/work/DataPollex/shiffto/shiffto-frontend/app/(dashboard)/dashboard/admin/shipments/page.tsx>))

- Make table rows clickable to navigate directly to `/dashboard/admin/shipments/[id]`.
- Replace existing "View Details" button with a **3-dot dropdown menu icon** (`MoreVertical` / `DropdownMenu`).
- Menu options:
  - **View Details**
  - **Cancel Shipment** (Enabled if shipment is active/cancellable).

### 4.3 Admin Cancellation Modal

- Displayed when Admin clicks "Cancel Shipment" from table action menu or details page.
- Features:
  - Input for cancellation reason.
  - Fee Option Radio/Select: `Standard Commission Rate (30%)`, `Custom Percentage`, `Custom Flat Fee`, `No Fee (100% Refund)`.
  - Input field for fee value when Custom Percentage or Flat Fee is selected.
  - Real-time preview card showing Gross Amount, Fee Retained, and Net Refund Payout.

### 4.4 Admin Payments Page ([admin/payments/page.tsx](<file:///d:/Codes/work/DataPollex/shiffto/shiffto-frontend/app/(dashboard)/dashboard/admin/payments/page.tsx>))

- Display breakdown in transaction details modal (`Gross Paid`, `Cancellation Fee Retained`, `Net Refundable`).
- Admin payout processing updates `refundableAmount` as the exact payout target.

---

## 5. Verification Plan

### Manual & API Verification

1. **Sender Cancellation**:
   - Create a shipment and complete payment ($100).
   - Sender cancels shipment via dashboard.
   - Verify DB: `refundInitiator = SENDER`, `cancellationFeeAmount = $30`, `refundableAmount = $70`.
   - Check Admin Payments Queue: Pending refund shows **$70.00**.
   - Check Admin Revenue Stats: Platform Revenue reflects **$30.00**.
2. **Traveler Cancellation**:
   - Traveler cancels trip associated with active shipment ($100).
   - Verify DB: `refundInitiator = TRAVELLER`, `cancellationFeeAmount = $0`, `refundableAmount = $100`.
   - Check Admin Payments Queue: Pending refund shows **$100.00**.
3. **Admin Cancellation with Custom Fee**:
   - Admin cancels shipment using custom fee 15%.
   - Verify DB: `refundInitiator = ADMIN`, `cancellationFeeAmount = $15`, `refundableAmount = $85`.
4. **Admin Payout Execution**:
   - Process refund in Admin payments queue. Status transitions to `REFUNDED` and notifications send correct amounts.
