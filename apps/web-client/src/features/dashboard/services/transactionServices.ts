import { useAuthStore } from "@/app/store/authStore";
import { supabaseClient } from "@/shared/lib/supabaseClient";
import type {
  Transaction,
  SupabaseTransactionRaw,
  TransactionInput,
} from "@/shared/types/transactions.types";

/**
 * Convierte datos crudos de Supabase a formato de presentación (aplanado)
 * @param rawTransaction - Dato crudo del Supabase con relación anidada
 * @returns Transacción aplanada con campos category_name y category_emoji
 */
function mapSupabaseTransactionToTransaction(
  rawTransaction: SupabaseTransactionRaw
): Transaction {
  return {
    id: rawTransaction.id,
    user_id: rawTransaction.user_id,
    category_id: rawTransaction.category_id,
    title: rawTransaction.title,
    amount_original: rawTransaction.amount_original,
    currency_code: rawTransaction.currency_code,
    fx_rate_to_usd: rawTransaction.fx_rate_to_usd,
    amount_usd: rawTransaction.amount_usd,
    tx_type: rawTransaction.tx_type,
    tx_date: rawTransaction.tx_date,
    notes: rawTransaction.notes || undefined,
    created_at: rawTransaction.created_at,
    updated_at: rawTransaction.updated_at,
    category_name: rawTransaction.categories?.name || "Sin categoría",
    category_emoji: rawTransaction.categories?.emoji || "💸",
  };
}

export const transactionServices = {
  addTransaction: async (
    transaction: TransactionInput
  ): Promise<Transaction | null> => {
    const { data, error } = await supabaseClient
      .from("transactions")
      .insert(transaction);
    if (error) throw error;
    return data
      ? mapSupabaseTransactionToTransaction(data as SupabaseTransactionRaw)
      : null;
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabaseClient
      .from("transactions")
      .select("*, categories(name, emoji)")
      .eq("user_id", user.id)
      .order("tx_date", { ascending: false });
    if (error) throw error;

    // Mapear datos crudos a tipo de presentación
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return (data as SupabaseTransactionRaw[]).map(
      mapSupabaseTransactionToTransaction
    );
  },

  updateTransaction: async (
    transaction: Transaction
  ): Promise<Transaction | null> => {
    // Extraer solo los campos que existen en la tabla transactions
    // Excluir propiedades derivadas del JOIN (category_name, category_emoji)
    const updateData: TransactionInput = {
      user_id: transaction.user_id,
      category_id: transaction.category_id,
      title: transaction.title,
      amount_original: transaction.amount_original,
      currency_code: transaction.currency_code,
      fx_rate_to_usd: transaction.fx_rate_to_usd,
      amount_usd: transaction.amount_usd,
      tx_type: transaction.tx_type,
      tx_date: transaction.tx_date,
      notes: transaction.notes || undefined,
    };

    const { data, error } = await supabaseClient
      .from("transactions")
      .update(updateData)
      .eq("id", transaction.id);
    if (error) throw error;
    return data
      ? mapSupabaseTransactionToTransaction(data as SupabaseTransactionRaw)
      : null;
  },

  deleteTransaction: async (id: string): Promise<Transaction | null> => {
    const { data, error } = await supabaseClient
      .from("transactions")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return data
      ? mapSupabaseTransactionToTransaction(data as SupabaseTransactionRaw)
      : null;
  },
};
