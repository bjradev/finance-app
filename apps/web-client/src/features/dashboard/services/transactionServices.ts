import { useAuthStore } from "@/app/store/authStore";
import { supabaseClient } from "@/shared/lib/supabaseClient";
import type { Transaction } from "@/shared/types/transactions.types";

export const transactionServices = {
  addTransaction: async (transaction: Transaction): Promise<Transaction | null> => {
    const { data, error } = await supabaseClient
      .from("transactions")
      .insert(transaction);
    if (error) throw error;
    return data;
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
    
    // Mapear los datos para aplanar la estructura
    return (data as any[]).map((transaction: any) => ({
      ...transaction,
      category_name: transaction.categories?.name,
      category_emoji: transaction.categories?.emoji,
    })) as Transaction[];
  },

  updateTransaction: async (transaction: Transaction): Promise<Transaction | null> => {
    // Extraer solo los campos que existen en la tabla transactions
    // Excluir propiedades derivadas del JOIN (category_name, category_emoji)
    const updateData = {
      id: transaction.id,
      user_id: transaction.user_id,
      category_id: transaction.category_id,
      title: transaction.title,
      amount_original: transaction.amount_original,
      currency_code: transaction.currency_code,
      fx_rate_to_usd: transaction.fx_rate_to_usd,
      amount_usd: transaction.amount_usd,
      tx_type: transaction.tx_type,
      tx_date: transaction.tx_date,
      notes: transaction.notes,
    };

    const { data, error } = await supabaseClient
      .from("transactions")
      .update(updateData)
      .eq("id", transaction.id);
    if (error) throw error;
    return data as Transaction | null;
  },

  deleteTransaction: async (id: string): Promise<Transaction | null> => {
    const { data, error } = await supabaseClient
      .from("transactions")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return data as Transaction | null;
  },
};
