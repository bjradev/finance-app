"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";

import { useGetTransactions } from "../hooks/useTransactions";
import { useTransactionEditDelete } from "../hooks/useTransactions";
import { useTransactionFilters } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import type { Transaction } from "@/shared/types/transactions.types";
import { formatCurrency } from "@/shared/lib/format/formatCurrency";
import { convertForDisplay } from "../logic/currency";
import { type PeriodType } from "../logic/summary";

import { EditTransactionDialog } from "./EditTransactionDialog";
import { DeleteTransactionDialog } from "./DeleteTransactionDialog";

interface TableTransactionsProps {
  period?: PeriodType;
  displayCurrency?: "USD" | "COP";
}

const getColumns = (
  onEditClick: (transaction: Transaction) => void,
  onDeleteClick: (transaction: Transaction) => void,
  displayCurrency: "USD" | "COP" = "COP"
): ColumnDef<Transaction>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "category_name",
    header: "Categoría",
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-lg">
              {transaction.category_emoji || "💸"}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {transaction.category_name || "Sin categoría"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Transacción",
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium">{transaction.title}</div>
          {transaction.notes && (
            <div className="text-sm text-muted-foreground">
              {transaction.notes}
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "currency_code",
    header: "Moneda",
    cell: ({ row }) => {
      const currency_code = row.original.currency_code;
      return (
        <div className="text-sm">
          {currency_code === "COP"
            ? "🇨🇴 COP"
            : currency_code === "USD"
            ? "🇺🇸 USD"
            : "💸"}
        </div>
      );
    },
  },
  {
    accessorKey: "tx_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tx_date = row.original.tx_date;
      return <div className="text-sm">{tx_date}</div>;
    },
  },
  {
    accessorKey: "amount_usd",
    header: () => <div className="text-right">Monto ({displayCurrency})</div>,
    cell: ({ row }) => {
      const transaction = row.original;

      // Usar convertForDisplay para evitar pérdida de precisión
      const displayAmount = convertForDisplay(
        transaction.amount_original,
        transaction.currency_code,
        displayCurrency
      );

      const formatted = formatCurrency(displayAmount, displayCurrency);

      const isIncome = transaction.tx_type === "income";
      return (
        <div
          className={`text-right font-medium ${
            isIncome ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatted}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const transaction = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditClick(transaction)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDeleteClick(transaction)}
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function TableTransactions({
  period,
  displayCurrency = "COP",
}: TableTransactionsProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const { data: transactions = [] } = useGetTransactions();
  const { data: categories = [] } = useCategories();

  const {
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
  } = useTransactionEditDelete();

  const {
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    applyTransactionFilters,
    resetFilters,
    hasActiveFilters,
  } = useTransactionFilters();

  // Filtrar transacciones con período + tipo + categoría
  const filteredTransactions = React.useMemo(() => {
    return applyTransactionFilters(transactions, period);
  }, [transactions, period, applyTransactionFilters]);

  const table = useReactTable({
    data: filteredTransactions,
    columns: getColumns(handleEditClick, handleDeleteClick, displayCurrency),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4 flex-wrap">
        <Input
          placeholder="Buscar por título..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        {/* Filtro por tipo */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={typeFilter ? "default" : "outline"}
              className="gap-2"
            >
              {typeFilter === "income"
                ? "💰 Ingresos"
                : typeFilter === "expense"
                ? "💸 Egresos"
                : "📊 Tipo"}
              {typeFilter && <span className="ml-1 text-xs">×</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() =>
                setTypeFilter(typeFilter === "income" ? undefined : "income")
              }
            >
              💰 Ingresos {typeFilter === "income" && "✓"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setTypeFilter(typeFilter === "expense" ? undefined : "expense")
              }
            >
              💸 Egresos {typeFilter === "expense" && "✓"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filtro por categoría */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={categoryFilter ? "default" : "outline"}
              className="gap-2"
            >
              🏷️ Categoría{" "}
              {categoryFilter && <span className="ml-1 text-xs">×</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setCategoryFilter(undefined)}>
              Todas las categorías
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() =>
                  setCategoryFilter(
                    categoryFilter === category.id ? undefined : category.id
                  )
                }
              >
                {category.emoji} {category.name}{" "}
                {categoryFilter === category.id && "✓"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-red-600 hover:text-red-700"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    getColumns(
                      handleEditClick,
                      handleDeleteClick,
                      displayCurrency
                    ).length
                  }
                  className="h-24 text-center"
                >
                  No hay transacciones.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Componentes de Dialogo separados */}
      <EditTransactionDialog
        isOpen={transactionToEdit !== null}
        onClose={closeEditDialog}
        onSubmit={handleEditSubmit}
        form={form}
        categories={categories}
        updateMutation={updateMutation}
      />

      <DeleteTransactionDialog
        isOpen={transactionToDelete !== null}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        transaction={transactionToDelete}
        deleteMutation={deleteMutation}
      />
    </div>
  );
}
