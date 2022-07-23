export interface IOrder {
  oid: string;
  txn_id: string;
  custom_id: string;
  status: string;
  buyer: string;
  guest_token: string | null;
  currency: string;
  products: string;
  total: number;
  created_at: Date;
}

export interface IOrdersResponse {
  success: IOrder[];
  failed: string;
}

export interface IOrderResponse {
  success: IOrder;
  failed: string;
}
