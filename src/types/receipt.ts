
export interface Store {
  id: string;
  name: string;
  address: string;
  user_id: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  unit: string;
}

export interface GeneratedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isEdited?: boolean;
}

export interface ManualItem {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
}
