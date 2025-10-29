import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  tx_type: z.enum(["income", "expense"]),
  amount_original: z.number().min(0.01, "El monto debe ser mayor a 0"),
  category_id: z.string().min(1, "La categoría es requerida"),
  currency_code: z.string(),
  tx_date: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
