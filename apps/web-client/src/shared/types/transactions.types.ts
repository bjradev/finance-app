export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category_id: string;
  tx_date: string;
  tx_type: "income" | "expense";
  fx_rate_to_usd: number;
  amount_usd: number;
  notes: string;
  created_at: Date;
  updated_at: Date;
}
