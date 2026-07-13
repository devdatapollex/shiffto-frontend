export interface WizardStep {
  id: number;
  name: string;
  subtitle: string;
  inactive: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, name: 'Item Details', subtitle: 'Step 1/5 : Item details', inactive: false },
  { id: 2, name: 'Route & Pricing', subtitle: 'Step 2/5 : Route & pricing', inactive: false },
  { id: 3, name: 'Receiver Details', subtitle: 'Step 3/5 : Receiver details', inactive: false },
  { id: 4, name: 'Review', subtitle: 'Step 4/5 : Review', inactive: false },
  { id: 5, name: 'Payment', subtitle: 'Step 5/5 : Payment', inactive: true },
];
