
export interface Store {
  id: string;
  name: string;
  address: string;
  user_id: string;
  created_at?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface ManualItem {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
}
