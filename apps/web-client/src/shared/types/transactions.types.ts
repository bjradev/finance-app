/**
 * Categoría relacionada (del JOIN con tabla categories)
 */
export interface TransactionCategory {
  name: string;
  emoji: string;
}

/**
 * Datos crudos retornados por Supabase (estructura directa de la BD con relación anidada)
 * Este tipo refleja exactamente lo que Supabase retorna
 */
export interface SupabaseTransactionRaw {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  amount_original: number;
  currency_code: string;
  fx_rate_to_usd: number;
  amount_usd: number;
  tx_type: "income" | "expense";
  tx_date: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  // Relación con categorías (puede venir null o con datos)
  categories?: TransactionCategory | null;
}

/**
 * Transacción de presentación (aplanada, con todos los campos resueltos)
 * Este es el tipo que se usa en toda la aplicación
 */
export interface Transaction
  extends Omit<SupabaseTransactionRaw, "categories"> {
  // Campos derivados del JOIN aplanados
  category_name: string;
  category_emoji: string;
}

/**
 * Datos de transacción para crear/editar (sin campos computed)
 */
export interface TransactionInput {
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
}

/**
 * Respuesta de Supabase después de operación CRUD
 */
export interface SupabaseResponse<T> {
  data: T | T[] | null;
  error?: {
    message: string;
    code?: string;
  } | null;
}
