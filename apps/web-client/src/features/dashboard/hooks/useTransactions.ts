import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionServices } from "../services/transactionServices";
import { useAuthStore } from "@/app/store/authStore";
import type { Transaction } from "@/shared/types/transactions.types";
import {
  transactionSchema,
  type TransactionFormData,
} from "../validation/transaction.schemas";
import { applyFilters, type PeriodType } from "../logic/summary";
import { calculateCurrencyConversion } from "../logic/currency";

const TRANSACTIONS_QUERY_KEY = ["transactions"] as const;

/**
 * Hook para crear nuevas transacciones
 */
export const useAddTransaction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: transactionServices.addTransaction,
    onSuccess: () => {
      toast.success("Transacción creada correctamente");
      qc.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
    onError: (error: Error) => {
      console.error("Error creating transaction:", error);
      toast.error(
        error.message || "Error al crear la transacción. Intenta de nuevo."
      );
    },
  });
};

/**
 * Hook para obtener todas las transacciones del usuario
 */
export const useGetTransactions = () => {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: transactionServices.getTransactions,
  });
};

/**
 * Hook para actualizar una transacción existente
 */
export const useUpdateTransaction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: transactionServices.updateTransaction,
    onSuccess: () => {
      toast.success("Transacción actualizada correctamente");
      qc.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
};

/**
 * Hook para eliminar una transacción
 */
export const useDeleteTransaction = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: transactionServices.deleteTransaction,
    onSuccess: () => {
      toast.success("Transacción eliminada correctamente");
      qc.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
  });
};

/**
 * Hook completo para manejar edición y eliminación de transacciones
 */
interface UseTransactionEditDeleteReturn {
  transactionToEdit: Transaction | null;
  transactionToDelete: Transaction | null;
  form: UseFormReturn<TransactionFormData>;
  handleEditClick: (transaction: Transaction) => void;
  handleDeleteClick: (transaction: Transaction) => void;
  handleEditSubmit: (data: TransactionFormData) => Promise<void>;
  handleDeleteConfirm: () => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;
  updateMutation: ReturnType<typeof useUpdateTransaction>;
  deleteMutation: ReturnType<typeof useDeleteTransaction>;
}

export const useTransactionEditDelete = (): UseTransactionEditDeleteReturn => {
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const { user, defaultCurrency } = useAuthStore();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: "",
      tx_type: "income",
      amount_original: 0,
      category_id: "",
      currency_code: defaultCurrency || "COP",
      notes: "",
      tx_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleEditClick = useCallback(
    (transaction: Transaction): void => {
      setTransactionToEdit(transaction);
      const dateStr = new Date(transaction.tx_date).toISOString().split("T")[0];

      form.reset({
        title: transaction.title,
        tx_type: transaction.tx_type,
        amount_original: transaction.amount_original,
        category_id: transaction.category_id,
        currency_code: transaction.currency_code,
        tx_date: dateStr,
        notes: transaction.notes || "",
      });
    },
    [form]
  );

  const handleDeleteClick = useCallback((transaction: Transaction): void => {
    setTransactionToDelete(transaction);
  }, []);

  const handleEditSubmit = useCallback(
    async (data: TransactionFormData): Promise<void> => {
      if (!transactionToEdit?.id || !user) return;

      // Calcular la conversión de moneda usando la lógica centralizada
      const { amount_usd, fx_rate_to_usd } = await calculateCurrencyConversion(
        data.amount_original,
        data.currency_code
      );

      const updatedTransaction: Transaction = {
        id: transactionToEdit.id,
        user_id: user.id,
        category_id: data.category_id,
        title: data.title,
        amount_original: data.amount_original,
        currency_code: data.currency_code,
        fx_rate_to_usd: fx_rate_to_usd,
        amount_usd: amount_usd,
        tx_type: data.tx_type,
        tx_date: data.tx_date,
        notes: data.notes,
        category_name: transactionToEdit.category_name,
        category_emoji: transactionToEdit.category_emoji,
      };

      updateMutation.mutate(updatedTransaction);
      setTransactionToEdit(null);
      form.reset();
    },
    [transactionToEdit, user, updateMutation, form]
  );

  const handleDeleteConfirm = useCallback((): void => {
    if (transactionToDelete?.id) {
      deleteMutation.mutate(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  }, [transactionToDelete, deleteMutation]);

  const closeEditDialog = useCallback((): void => {
    setTransactionToEdit(null);
    form.reset();
  }, [form]);

  const closeDeleteDialog = useCallback((): void => {
    setTransactionToDelete(null);
  }, []);

  return {
    transactionToEdit,
    transactionToDelete,
    form,
    handleEditClick,
    handleDeleteClick,
    handleEditSubmit,
    handleDeleteConfirm,
    closeEditDialog,
    closeDeleteDialog,
    updateMutation,
    deleteMutation,
  };
};

/**
 * Filtros disponibles para transacciones
 */
interface TransactionFilters {
  period?: PeriodType;
  type?: "income" | "expense";
  categoryId?: string;
}

/**
 * Hook para manejar filtros de transacciones
 */
interface UseTransactionFiltersReturn {
  typeFilter: "income" | "expense" | undefined;
  setTypeFilter: (type: "income" | "expense" | undefined) => void;
  categoryFilter: string | undefined;
  setCategoryFilter: (categoryId: string | undefined) => void;
  applyTransactionFilters: (transactions: Transaction[], period?: PeriodType) => Transaction[];
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export const useTransactionFilters = (): UseTransactionFiltersReturn => {
  const [typeFilter, setTypeFilter] = useState<"income" | "expense" | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const applyTransactionFilters = useCallback(
    (transactions: Transaction[], period?: PeriodType): Transaction[] => {
      const filters: TransactionFilters = {
        period,
        type: typeFilter,
        categoryId: categoryFilter,
      };
      return applyFilters(transactions, filters);
    },
    [typeFilter, categoryFilter]
  );

  const resetFilters = useCallback((): void => {
    setTypeFilter(undefined);
    setCategoryFilter(undefined);
  }, []);

  return {
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    applyTransactionFilters,
    resetFilters,
    hasActiveFilters: !!typeFilter || !!categoryFilter,
  };
};
