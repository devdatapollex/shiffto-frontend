export const SHIPMENT_CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing & Apparel' },
  { value: 'documents', label: 'Documents' },
  { value: 'food', label: 'Food & Perishables' },
  { value: 'medicine', label: 'Medicine & Health' },
  { value: 'books', label: 'Books & Media' },
  { value: 'cosmetics', label: 'Cosmetics & Beauty' },
  { value: 'toys', label: 'Toys & Games' },
  { value: 'accessories', label: 'Accessories & Jewelry' },
  { value: 'other', label: 'Other' },
] as const;

export type ShipmentCategory = (typeof SHIPMENT_CATEGORIES)[number]['value'];
