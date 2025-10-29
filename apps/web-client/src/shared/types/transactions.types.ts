export interface Transaction {
  id?: string;
  user_id: string;
  category_id: string;
  title: string;
  amount_original: number;
  currency_code: string;
  fx_rate_to_usd: number;
  amount_usd: number;
  tx_type: "income" | "expense";
  tx_date: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
  // Datos de la categoría (poblados por JOIN)
  category_name?: string;
  category_emoji?: string;
}
