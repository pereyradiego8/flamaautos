export type Category = 'pickup' | 'suv' | 'sedan' | 'hatchback' | 'utility' | 'motorcycle' | 'other';
export type VehicleStatus = 'draft' | 'published' | 'reserved' | 'sold';
export type Currency = 'ARS' | 'USD';
export type Branch = { id: string; name: string; address: string; active: boolean };
export type VehicleImage = { id: string; vehicle_id: string; storage_path: string; alt_text: string | null; sort_order: number };
export type Vehicle = {
  id: string; slug: string; brand: string; model: string; version: string | null;
  model_year: number | null; mileage_km: number | null; category: Category;
  fuel: string | null; transmission: string | null; description: string | null;
  currency: Currency | null; cash_price: number | null; trade_in_price: number | null;
  down_payment: number | null; list_price?: number | null; branch_id: string | null; status: VehicleStatus;
  source_listing_id?: string | null; source_url?: string | null; source_checked_at?: string | null;
  source_specs?: Record<string, string>; vehicle_condition?: 'new' | 'used' | null;
  featured: boolean; created_at: string; updated_at: string;
  branches?: Pick<Branch, 'name' | 'address'> | null;
  vehicle_images?: VehicleImage[];
};
