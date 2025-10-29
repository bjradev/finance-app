import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionServices } from "../services/transactionServices";
import { useAuthStore } from "@/app/store/authStore";
import type { Transaction } from "@/shared/types/transactions.types";
import {
  transactionSchema,
  type TransactionFormData,
} from "../validation/transaction.schemas";

const TRANSACTIONS_QUERY_KEY = ["transactions"];

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

export const useGetTransactions = () => {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: transactionServices.getTransactions,
  });
};

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

// Hook completo para manejar edición y eliminación de transacciones
export const useTransactionEditDelete = () => {
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

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
    (transaction: Transaction) => {
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

  const handleDeleteClick = useCallback((transaction: Transaction) => {
    setTransactionToDelete(transaction);
  }, []);

  const handleEditSubmit = useCallback(
    async (data: TransactionFormData) => {
      if (!transactionToEdit?.id || !user) return;

      const updatedTransaction: Transaction = {
        id: transactionToEdit.id,
        user_id: user.id,
        category_id: data.category_id,
        title: data.title,
        amount_original: data.amount_original,
        currency_code: data.currency_code,
        fx_rate_to_usd: 1.0,
        amount_usd: data.amount_original,
        tx_type: data.tx_type,
        tx_date: data.tx_date,
        notes: data.notes,
      };

      updateMutation.mutate(updatedTransaction);
      setTransactionToEdit(null);
      form.reset();
    },
    [transactionToEdit, user, updateMutation, form]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (transactionToDelete?.id) {
      deleteMutation.mutate(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  }, [transactionToDelete, deleteMutation]);

  const closeEditDialog = useCallback(() => {
    setTransactionToEdit(null);
    form.reset();
  }, [form]);

  const closeDeleteDialog = useCallback(() => {
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
