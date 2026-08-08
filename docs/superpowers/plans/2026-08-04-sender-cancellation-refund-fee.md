# Sender Cancellation Fee & Admin Refund Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement non-refundable cancellation fee deduction for sender-initiated shipment cancellations, full 100% refunds for traveler cancellations, dedicated custom-fee admin cancellations, and update all analytics metrics to accurately account for retained fees and refund liabilities.

**Architecture:** Database schema extensions on `PaymentTransaction` store `refundInitiator`, `cancellationFeeAmount`, and `refundableAmount`. A modular calculation engine in `payment.service.ts` handles fee math based on initiator role or custom admin overrides. Backend analytics aggregations in `admin.service.ts` and `payment.service.ts` track platform revenue and refund liabilities. The frontend UI provides financial breakdown modals for senders and custom-fee cancellation dialogs + 3-dot action menus for admins.

**Tech Stack:** Node.js, Express, TypeScript, Prisma ORM, Next.js, React, Tailwind CSS, Lucide Icons, Shadcn UI.

## Global Constraints

- Preserve existing API contracts and payment gateway integrations (Stripe).
- Maintain backwards compatibility for legacy transactions (`cancellationFeeAmount` defaults to 0.0, `refundableAmount` defaults to `grossAmount`).
- Use exact relative file links and types everywhere.

---

### Task 1: Prisma Schema & Database Migration

**Files:**

- Modify: `shiffto-backend/prisma/payment.prisma`
- Test: `shiffto-backend` (Prisma CLI validation)

**Interfaces:**

- Consumes: Existing `PaymentTransaction` schema
- Produces: `RefundInitiator` Enum and `refundInitiator`, `refundableAmount`, `cancellationFeeAmount` fields on `PaymentTransaction`

- [ ] **Step 1: Update `payment.prisma` schema**

```prisma
enum RefundInitiator {
  SENDER
  TRAVELLER
  ADMIN
}

model PaymentTransaction {
  // ... existing fields ...
  refundTxnId         String?
  refundReason        String?
  refundInitiator     RefundInitiator?
  refundableAmount    Float            @default(0.0)
  cancellationFeeAmount Float           @default(0.0)
  refundMethodDetails Json?
  refundedAt          DateTime?
  refundedBy          String?
  adminRefundNotes    String?
  // ...
}
```

- [ ] **Step 2: Run Prisma generate and migration**

Run: `cd shiffto-backend && npx prisma migrate dev --name add_refund_initiator_and_fee_fields`
Expected: Migration created and applied successfully, Prisma client generated.

- [ ] **Step 3: Commit**

```bash
git add shiffto-backend/prisma/payment.prisma shiffto-backend/prisma/migrations
git commit -m "feat(db): add RefundInitiator enum and refund fee fields to PaymentTransaction"
```

---

### Task 2: Backend Refund Calculation Helper & Service Integration

**Files:**

- Modify: `shiffto-backend/src/app/modules/payment/payment.service.ts`
- Modify: `shiffto-backend/src/app/modules/shipment/shipment.service.ts`
- Modify: `shiffto-backend/src/app/modules/trip/trip.service.ts`

**Interfaces:**

- Consumes: Prisma `PaymentTransaction` model, `RefundInitiator` enum
- Produces: `calculateRefundAmounts` helper and updated `markPaymentAsPendingRefund(shipmentId, reason, initiator, customFee?, dbTx?)`

- [ ] **Step 1: Add `calculateRefundAmounts` helper function in `payment.service.ts`**

```typescript
export interface CalculateRefundParams {
  grossAmount: number;
  commissionRate: number;
  initiator: 'SENDER' | 'TRAVELLER' | 'ADMIN';
  customFeeType?: 'COMMISSION' | 'PERCENT' | 'FLAT' | 'NONE';
  customFeeValue?: number;
}

export function calculateRefundAmounts(params: CalculateRefundParams): {
  cancellationFeeAmount: number;
  refundableAmount: number;
} {
  const { grossAmount, commissionRate, initiator, customFeeType, customFeeValue } = params;

  if (initiator === 'TRAVELLER' || customFeeType === 'NONE') {
    return { cancellationFeeAmount: 0, refundableAmount: grossAmount };
  }

  if (initiator === 'SENDER' || customFeeType === 'COMMISSION') {
    const fee = grossAmount * (commissionRate || 0.3);
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

  const fee = grossAmount * (commissionRate || 0.3);
  return { cancellationFeeAmount: fee, refundableAmount: grossAmount - fee };
}
```

- [ ] **Step 2: Update `markPaymentAsPendingRefund` in `payment.service.ts`**

Update signature to:

```typescript
const markPaymentAsPendingRefund = async (
  shipmentId: string,
  reason: string,
  initiator: RefundInitiator = RefundInitiator.SENDER,
  customFee?: { feeType?: 'COMMISSION' | 'PERCENT' | 'FLAT' | 'NONE'; feeValue?: number },
  dbTx?: Prisma.TransactionClient,
) => {
  // ...
  const { cancellationFeeAmount, refundableAmount } = calculateRefundAmounts({
    grossAmount: paymentTx.grossAmount,
    commissionRate: paymentTx.commissionRate,
    initiator,
    customFeeType: customFee?.feeType,
    customFeeValue: customFee?.feeValue,
  });

  const updated = await client.paymentTransaction.update({
    where: { id: paymentTx.id },
    data: {
      status: PaymentStatus.PENDING_REFUND,
      refundReason: reason,
      refundInitiator: initiator,
      cancellationFeeAmount,
      refundableAmount,
      refundMethodDetails: refundMethodDetails as any,
    },
  });
  // ...
```

- [ ] **Step 3: Update `ShipmentService.cancelShipment` in `shipment.service.ts`**

Pass `RefundInitiator.SENDER`:

```typescript
await PaymentService.markPaymentAsPendingRefund(
  id,
  `Shipment canceled by ${user.role === 'admin' ? 'admin' : 'user'} before pickup`,
  user.role === 'admin' ? RefundInitiator.ADMIN : RefundInitiator.SENDER,
  undefined,
  tx
);
```

- [ ] **Step 4: Update `TripService.cancelTrip` in `trip.service.ts`**

Pass `RefundInitiator.TRAVELLER`:

```typescript
await PaymentService.markPaymentAsPendingRefund(
  shipment.id,
  `Trip (${trip.flightNumber}) canceled by traveler before pickup`,
  RefundInitiator.TRAVELLER,
  undefined,
  tx
);
```

- [ ] **Step 5: Commit**

```bash
git add shiffto-backend/src/app/modules/payment/payment.service.ts shiffto-backend/src/app/modules/shipment/shipment.service.ts shiffto-backend/src/app/modules/trip/trip.service.ts
git commit -m "feat(backend): implement refund fee calculation helper and initiator tracking"
```

---

### Task 3: Dedicated Admin Cancellation API Endpoint

**Files:**

- Modify: `shiffto-backend/src/app/modules/payment/payment.controller.ts`
- Modify: `shiffto-backend/src/app/modules/payment/payment.routes.ts`
- Modify: `shiffto-backend/src/app/modules/payment/payment.service.ts`

**Interfaces:**

- Consumes: Admin auth token, shipment ID, cancellation payload
- Produces: `POST /api/v1/payments/admin/shipments/:id/cancel` endpoint

- [ ] **Step 1: Add `adminCancelShipment` service method in `payment.service.ts`**

```typescript
const adminCancelShipment = async (
  shipmentId: string,
  payload: {
    reason: string;
    feeType?: 'COMMISSION' | 'PERCENT' | 'FLAT' | 'NONE';
    feeValue?: number;
  },
  adminUser: User
) => {
  if (adminUser.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can perform admin cancellations');
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { shipmentSteps: true },
  });

  if (!shipment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shipment not found');
  }

  if (shipment.status === ShipmentStatus.CANCELED) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Shipment is already canceled');
  }

  return prisma.$transaction(async (tx) => {
    await tx.shipment.update({
      where: { id: shipmentId },
      data: { status: ShipmentStatus.CANCELED },
    });

    const updatedTx = await markPaymentAsPendingRefund(
      shipmentId,
      payload.reason || 'Admin canceled shipment',
      RefundInitiator.ADMIN,
      { feeType: payload.feeType, feeValue: payload.feeValue },
      tx
    );

    await tx.offer.updateMany({
      where: {
        shipmentId,
        status: { in: [OfferStatus.ACCEPTED, OfferStatus.PENDING, OfferStatus.PAYMENT_PENDING] },
      },
      data: { status: OfferStatus.EXPIRED },
    });

    return updatedTx;
  });
};
```

- [ ] **Step 2: Add controller handler in `payment.controller.ts`**

```typescript
const adminCancelShipment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PaymentService.adminCancelShipment(id, req.body, req.user as User);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shipment canceled by admin successfully',
    data: result,
  });
});
```

- [ ] **Step 3: Add route in `payment.routes.ts`**

```typescript
router.post(
  '/admin/shipments/:id/cancel',
  authGuard('admin'),
  PaymentController.adminCancelShipment
);
```

- [ ] **Step 4: Commit**

```bash
git add shiffto-backend/src/app/modules/payment/payment.service.ts shiffto-backend/src/app/modules/payment/payment.controller.ts shiffto-backend/src/app/modules/payment/payment.routes.ts
git commit -m "feat(backend): add dedicated admin shipment cancellation endpoint"
```

---

### Task 4: Analytics Accounting & Statistics Updates

**Files:**

- Modify: `shiffto-backend/src/app/modules/admin/admin.service.ts`
- Modify: `shiffto-backend/src/app/modules/payment/payment.service.ts`

**Interfaces:**

- Consumes: `PaymentTransaction` records
- Produces: Updated `totalPlatformRevenue`, `totalPendingRefund`, and `totalRefunded` stats

- [ ] **Step 1: Update `getAdminPayments` stats in `payment.service.ts`**

```typescript
allTxns.forEach((tx) => {
  const commission =
    tx.commissionAmount > 0 ? tx.commissionAmount : tx.grossAmount * (tx.commissionRate || 0.3);
  const net = tx.netAmount > 0 ? tx.netAmount : tx.grossAmount - commission;
  const refundable = tx.refundableAmount > 0 ? tx.refundableAmount : tx.grossAmount;
  const cancellationFee = tx.cancellationFeeAmount || 0;

  if (
    tx.status === PaymentStatus.ESCROWED ||
    tx.status === PaymentStatus.PENDING_RELEASE ||
    tx.status === PaymentStatus.RELEASED
  ) {
    totalGrossVolume += tx.grossAmount;
  }

  if (tx.status === PaymentStatus.PENDING_RELEASE || tx.status === PaymentStatus.RELEASED) {
    totalPlatformRevenue += commission;
  } else if (tx.status === PaymentStatus.PENDING_REFUND || tx.status === PaymentStatus.REFUNDED) {
    totalPlatformRevenue += cancellationFee;
  }

  if (tx.status === PaymentStatus.ESCROWED) {
    totalEscrowed += tx.grossAmount;
  } else if (tx.status === PaymentStatus.PENDING_RELEASE) {
    totalPendingRelease += tx.grossAmount;
  } else if (tx.status === PaymentStatus.PENDING_REFUND) {
    totalPendingRefund += refundable;
  } else if (tx.status === PaymentStatus.RELEASED) {
    totalReleased += net;
  } else if (tx.status === PaymentStatus.REFUNDED) {
    totalRefunded += refundable;
  }
});
```

- [ ] **Step 2: Update admin dashboard stats in `admin.service.ts`**

Update `paymentAgg` query and aggregation math to sum `cancellationFeeAmount` for refunded/pending refund transactions and `refundableAmount` for refund totals.

- [ ] **Step 3: Commit**

```bash
git add shiffto-backend/src/app/modules/payment/payment.service.ts shiffto-backend/src/app/modules/admin/admin.service.ts
git commit -m "fix(backend): update financial revenue and refund liability aggregations"
```

---

### Task 5: Frontend API Services & Types Update

**Files:**

- Modify: `shiffto-frontend/services/payment.service.ts`
- Modify: `shiffto-frontend/services/shipment.service.ts`

**Interfaces:**

- Consumes: Backend response shapes
- Produces: Updated TypeScript interfaces and `adminCancelShipment` service function

- [ ] **Step 1: Update `AdminPaymentTransaction` interface in `shiffto-frontend/services/payment.service.ts`**

```typescript
export interface AdminPaymentTransaction {
  id: string;
  transactionId: string;
  shipmentId: string;
  offerId: string;
  senderId: string;
  travellerId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  refundableAmount?: number;
  cancellationFeeAmount?: number;
  refundInitiator?: 'SENDER' | 'TRAVELLER' | 'ADMIN' | null;
  // ...
}
```

- [ ] **Step 2: Add `adminCancelShipment` API function in `shiffto-frontend/services/payment.service.ts`**

```typescript
export async function adminCancelShipment(
  shipmentId: string,
  payload: {
    reason: string;
    feeType?: 'COMMISSION' | 'PERCENT' | 'FLAT' | 'NONE';
    feeValue?: number;
  }
): Promise<any> {
  const { data } = await apiClient.post(`/payments/admin/shipments/${shipmentId}/cancel`, payload);
  return data.data;
}
```

- [ ] **Step 3: Commit**

```bash
git add shiffto-frontend/services/payment.service.ts shiffto-frontend/services/shipment.service.ts
git commit -m "feat(frontend): update payment types and add adminCancelShipment service"
```

---

### Task 6: Frontend Sender Cancellation Financial Breakdown UI

**Files:**

- Modify: `shiffto-frontend/app/(dashboard)/dashboard/my-shipments/page.tsx`

**Interfaces:**

- Consumes: `cancelShipment` mutation
- Produces: Enhanced cancellation confirmation modal displaying gross, fee retained, and net refund

- [ ] **Step 1: Add breakdown card inside cancellation dialog in `my-shipments/page.tsx`**

When cancelling an escrowed shipment, compute estimated fee: `grossAmount * 0.3` and net refund: `grossAmount * 0.7`. Display card:

```tsx
<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5 text-xs text-amber-900 my-3">
  <div className="flex justify-between font-medium">
    <span>Amount Paid:</span>
    <span>${grossAmount.toFixed(2)}</span>
  </div>
  <div className="flex justify-between text-amber-700">
    <span>Cancellation Fee (Platform Commission):</span>
    <span>-${cancellationFee.toFixed(2)}</span>
  </div>
  <div className="border-t border-amber-200 pt-1 flex justify-between font-bold text-amber-950">
    <span>Estimated Refund:</span>
    <span>${netRefund.toFixed(2)}</span>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add shiffto-frontend/app/\(dashboard\)/dashboard/my-shipments/page.tsx
git commit -m "feat(frontend): add financial refund breakdown to sender cancellation modal"
```

---

### Task 7: Frontend Admin Shipments Table & Detail Page UX

**Files:**

- Modify: `shiffto-frontend/app/(dashboard)/dashboard/admin/shipments/page.tsx`
- Modify: `shiffto-frontend/app/(dashboard)/dashboard/admin/shipments/[id]/page.tsx`
- Create/Modify Component: `shiffto-frontend/components/admin/admin-cancel-shipment-modal.tsx`

**Interfaces:**

- Consumes: `adminCancelShipment` API function
- Produces: Clickable table rows, 3-dot dropdown menu, and Admin Cancellation Modal with fee options

- [ ] **Step 1: Create `AdminCancelShipmentModal` component**

Features reason input, fee option selector (`Standard Commission (30%)`, `Custom %`, `Custom $`, `No Fee`), fee value input, and live breakdown preview card.

- [ ] **Step 2: Update `admin/shipments/page.tsx` Table UX**

* Make row `onClick` navigate to `/dashboard/admin/shipments/${item.id}`.
* Replace "View Details" button with 3-dot menu (`DropdownMenu` with `MoreVertical` icon).
* Add dropdown items: `View Details` and `Cancel Shipment` (triggers `AdminCancelShipmentModal`).

- [ ] **Step 3: Update `admin/shipments/[id]/page.tsx` Detail Page**

* Add red **"Cancel Shipment"** button in header if shipment is active.
* Integrates `AdminCancelShipmentModal`.

- [ ] **Step 4: Commit**

```bash
git add shiffto-frontend/app/\(dashboard\)/dashboard/admin/shipments/page.tsx shiffto-frontend/app/\(dashboard\)/dashboard/admin/shipments/\[id\]/page.tsx shiffto-frontend/components/admin
git commit -m "feat(frontend): upgrade admin shipments table row UX, 3-dot dropdown menu, and cancellation modal"
```

---

### Task 8: Frontend Admin Payments Page Refund Display

**Files:**

- Modify: `shiffto-frontend/app/(dashboard)/dashboard/admin/payments/page.tsx`

**Interfaces:**

- Consumes: `AdminPaymentTransaction` with `refundableAmount` and `cancellationFeeAmount`
- Produces: Updated payment transaction details modal and pending refund payout modal

- [ ] **Step 1: Update transaction details modal in `admin/payments/page.tsx`**

Display breakdown lines:

- `Gross Paid`: `${selectedTx.grossAmount}`
- `Cancellation Fee Retained`: `${selectedTx.cancellationFeeAmount || 0}`
- `Net Refund Payout`: `${selectedTx.refundableAmount || selectedTx.grossAmount}`
- `Initiator`: `${selectedTx.refundInitiator}`

* [ ] **Step 2: Commit**

```bash
git add shiffto-frontend/app/\(dashboard\)/dashboard/admin/payments/page.tsx
git commit -m "feat(frontend): display cancellation fee breakdown and net refund in admin payments"
```

---

## Plan Review & Verification

Before executing:

1. Verify Prisma migration executes cleanly on dev database.
2. Run backend build check: `npm run build` in `shiffto-backend`.
3. Run frontend build check: `npm run build` in `shiffto-frontend`.
