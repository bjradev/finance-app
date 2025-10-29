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
 *
 * IMPORTANTE: tx_date es DATE en la BD, Supabase lo serializa como string ISO "YYYY-MM-DD"
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
  tx_date: string; // YYYY-MM-DD (DATE de Supabase serializado como string ISO)
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  // Relación con categorías (puede venir null o con datos)
  categories?: TransactionCategory | null;
}

/**
 * Transacción de presentación (aplanada, con todos los campos resueltos)
 * Este es el tipo que se usa en toda la aplicación
 *
 * IMPORTANTE: tx_date es SIEMPRE string ISO "YYYY-MM-DD" (viene de Supabase como DATE)
 * La lógica en summary.ts soporta también Date objects para flexibilidad interna,
 * pero desde la BD siempre llega como string.
 */
export interface Transaction
  extends Omit<SupabaseTransactionRaw, "categories"> {
  // Campos derivados del JOIN aplanados
  category_name: string;
  category_emoji: string;
}

/**
 * Datos de transacción para crear/editar (sin campos computed)
 *
 * IMPORTANTE: tx_date debe ser string ISO "YYYY-MM-DD" para consistencia con la BD
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
  tx_date: string; // YYYY-MM-DD
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
