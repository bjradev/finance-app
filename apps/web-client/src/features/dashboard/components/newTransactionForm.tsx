import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { PlusIcon, ArrowUpRightIcon, ArrowDownRightIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddTransaction } from "../hooks/useTransactions";
import { useAuthStore } from "@/app/store/authStore";
import type { TransactionInput } from "@/shared/types/transactions.types";
import { useCategories } from "../hooks/useCategories";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  transactionSchema,
  type TransactionFormData,
} from "../validation/transaction.schemas";
import { calculateCurrencyConversion } from "../logic/currency";

export const NewTransactionForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, defaultCurrency } = useAuthStore();
  const categoriesResponse = useCategories();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
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

  const addTransactionMutation = useAddTransaction();
  const selectedType = watch("tx_type");

  const onSubmit: SubmitHandler<TransactionFormData> = async (data) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      // Calcular monto en USD y tasa de cambio usando la lógica centralizada
      const { amount_usd, fx_rate_to_usd } = await calculateCurrencyConversion(
        data.amount_original,
        data.currency_code
      );

      const transactionData: TransactionInput = {
        user_id: user.id,
        title: data.title,
        tx_type: data.tx_type,
        amount_original: data.amount_original,
        category_id: data.category_id,
        currency_code: data.currency_code,
        fx_rate_to_usd: fx_rate_to_usd,
        amount_usd: amount_usd,
        tx_date: data.tx_date,
        notes: data.notes || undefined,
      };

      addTransactionMutation.mutate(transactionData);
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error("Error al crear transacción:", error);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-[#3C3C3C] hover:bg-[#3C3C3C]/70 border-none text-white hover:text-white"
      >
        <PlusIcon className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              {selectedType === "income" ? (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#B8F1DE]">
                  <ArrowUpRightIcon className="w-5 h-5 text-[#11C483] stroke-3" />
                </div>
              ) : selectedType === "expense" ? (
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FFCCCB]">
                  <ArrowDownRightIcon className="w-5 h-5 text-[#FD4745] stroke-3" />
                </div>
              ) : null}
              Nueva Transacción
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={selectedType}
            onValueChange={(value) => {
              setValue("tx_type", value as "income" | "expense");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income">Ingreso</TabsTrigger>
              <TabsTrigger value="expense">Egreso</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  {...register("title")}
                  id="title"
                  type="text"
                  placeholder="Ej: Compra en supermercado"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>
              <div className="grid w-full grid-cols-2 gap-4">
                {/* Amount Field */}
                <div className="space-y-2">
                  <Label htmlFor="amount_original">Monto</Label>
                  <Input
                    {...register("amount_original", { valueAsNumber: true })}
                    id="amount_original"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  {errors.amount_original && (
                    <p className="text-red-500 text-sm">
                      {errors.amount_original.message}
                    </p>
                  )}
                </div>

                {/* Currency Select */}
                <div className="space-y-2">
                  <Label htmlFor="currency_code">Moneda</Label>
                  <Controller
                    name="currency_code"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="currency_code"
                          className="w-full overflow-x-auto text-ellipsis whitespace-nowrap"
                        >
                          <SelectValue placeholder="Selecciona una moneda" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COP">
                            🇨🇴 COP (Peso colombiano)
                          </SelectItem>
                          <SelectItem value="USD">
                            🇺🇸 USD (Dólar estadounidense)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Select */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="category_id">Categoría</Label>
                  <Controller
                    name="category_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="category_id">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesResponse.data &&
                          categoriesResponse.data.length > 0 ? (
                            categoriesResponse.data.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.emoji} {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              {categoriesResponse.error
                                ? "Error al cargar categorías"
                                : "Cargando categorías..."}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category_id && (
                    <p className="text-red-500 text-sm">
                      {errors.category_id.message}
                    </p>
                  )}
                </div>

                {/* Date Field */}
                <div className="space-y-2">
                  <Label htmlFor="tx_date">Fecha</Label>
                  <Input {...register("tx_date")} id="tx_date" type="date" />
                  {errors.tx_date && (
                    <p className="text-red-500 text-sm">
                      {errors.tx_date.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                <Label htmlFor="notes">Nota (Opcional)</Label>
                <textarea
                  {...register("notes")}
                  id="notes"
                  placeholder="Agrega una nota..."
                  className="w-full min-h-24 resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                {addTransactionMutation.isPending ? (
                  <>
                    <Spinner />
                    Creando transacción...
                  </>
                ) : (
                  "Crear Transacción"
                )}
                {addTransactionMutation.isPending && <Spinner />}
              </Button>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
