import type { Transaction } from "@/shared/types/transactions.types";

export type PeriodType = "week" | "month" | "year";

export interface StatsResult {
  income: number;
  expense: number;
  total: number;
  periodLabel: string;
}

/**
 * Obtiene el inicio de la semana (lunes) y fin (domingo) para una fecha dada
 */
function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date);
  const day = d.getDay();
  // Calcular el número de días para llegar al lunes
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);

  // Crear una nueva fecha sin modificar la original
  const start = new Date(d.getFullYear(), d.getMonth(), diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Obtiene el inicio y fin del mes actual
 */
function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Obtiene el inicio y fin del año actual
 */
function getYearRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date.getFullYear(), 11, 31);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Obtiene el rango de fechas según el período seleccionado
 */
function getDateRange(
  period: PeriodType,
  date: Date = new Date()
): { start: Date; end: Date } {
  switch (period) {
    case "week":
      return getWeekRange(date);
    case "month":
      return getMonthRange(date);
    case "year":
      return getYearRange(date);
    default:
      return getMonthRange(date);
  }
}

/**
 * Genera etiqueta legible del período
 */
function getPeriodLabel(period: PeriodType, date: Date = new Date()): string {
  const range = getDateRange(period, date);
  const locale = "es-ES";

  switch (period) {
    case "week": {
      const startDate = range.start.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
      });
      const endDate = range.end.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
      });
      return `Semana ${startDate} - ${endDate}`;
    }
    case "month":
      return `Mes ${date.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      })}`;
    case "year":
      return `Año ${date.getFullYear()}`;
    default:
      return "";
  }
}

/**
 * Filtra transacciones por período y calcula estadísticas
 */
export function calculateStats(
  transactions: Transaction[],
  period: PeriodType = "month"
): StatsResult {
  const { start, end } = getDateRange(period);
  const startDateKey = start.toISOString().split("T")[0]; // YYYY-MM-DD
  const endDateKey = end.toISOString().split("T")[0]; // YYYY-MM-DD

  let income = 0;
  let expense = 0;

  transactions.forEach((transaction) => {
    // Parsear fecha como ISO string para evitar problemas de timezone
    let dateKey: string;

    if (typeof transaction.tx_date === "string") {
      dateKey = transaction.tx_date.split("T")[0];
    } else {
      const date = new Date(transaction.tx_date);
      dateKey = date.toISOString().split("T")[0];
    }

    // Filtrar solo transacciones dentro del rango de fechas
    if (dateKey >= startDateKey && dateKey <= endDateKey) {
      const amount = Math.round(transaction.amount_usd);

      if (transaction.tx_type === "income") {
        income += amount;
      } else if (transaction.tx_type === "expense") {
        expense += amount;
      }
    }
  });

  // Total = ingresos - egresos
  const total = income - expense;

  return {
    income,
    expense,
    total,
    periodLabel: getPeriodLabel(period),
  };
}

/**
 * Filtra transacciones por período
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: PeriodType = "month"
): Transaction[] {
  const { start, end } = getDateRange(period);
  const startDateKey = start.toISOString().split("T")[0]; // YYYY-MM-DD
  const endDateKey = end.toISOString().split("T")[0]; // YYYY-MM-DD

  return transactions.filter((transaction) => {
    // Parsear fecha como ISO string para evitar problemas de timezone
    let dateKey: string;

    if (typeof transaction.tx_date === "string") {
      // Si es string, usarlo directamente (ej: "2025-10-30")
      dateKey = transaction.tx_date.split("T")[0]; // Tomar solo la fecha
    } else {
      // Si es Date, convertir a ISO string
      const date = new Date(transaction.tx_date);
      dateKey = date.toISOString().split("T")[0];
    }

    // Comparar usando strings ISO (YYYY-MM-DD)
    return dateKey >= startDateKey && dateKey <= endDateKey;
  });
}

/**
 * Interfaz para datos del gráfico
 */
export interface ChartData {
  label: string;
  income: number;
  expense: number;
}

/**
 * Genera todos los días de una semana con sus datos de transacciones
 */
function aggregateByWeek(transactions: Transaction[]): ChartData[] {
  const now = new Date();
  const { start } = getWeekRange(now);

  // Usar YYYY-MM-DD como clave interna consistente
  const weekData: Map<string, { income: number; expense: number; date: Date }> =
    new Map();

  // Generar todos los días de la semana (7 días)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
    weekData.set(dateKey, { income: 0, expense: 0, date: new Date(d) });
  }

  // Agregar transacciones
  transactions.forEach((transaction) => {
    const date = new Date(transaction.tx_date);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (weekData.has(dateKey)) {
      const dayRecord = weekData.get(dateKey)!;
      const amount = Math.round(transaction.amount_usd);

      if (transaction.tx_type === "income") {
        dayRecord.income += amount;
      } else if (transaction.tx_type === "expense") {
        dayRecord.expense += amount;
      }
    }
  });

  // Convertir a array con etiquetas legibles
  return Array.from(weekData.entries())
    .map(([, data]) => ({
      label: data.date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
      }),
      income: data.income,
      expense: data.expense,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es-ES"));
}

/**
 * Genera todos los meses de un año con sus datos de transacciones
 */
function aggregateByYear(transactions: Transaction[]): ChartData[] {
  const monthData: Map<string, { income: number; expense: number }> = new Map();
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  // Generar todos los meses del año
  months.forEach((month) => {
    monthData.set(month, { income: 0, expense: 0 });
  });

  // Agregar transacciones
  transactions.forEach((transaction) => {
    const date = new Date(transaction.tx_date);
    const monthIndex = date.getMonth();
    const monthLabel = months[monthIndex];

    if (monthData.has(monthLabel)) {
      const monthRecord = monthData.get(monthLabel)!;
      const amount = Math.round(transaction.amount_usd);

      if (transaction.tx_type === "income") {
        monthRecord.income += amount;
      } else if (transaction.tx_type === "expense") {
        monthRecord.expense += amount;
      }
    }
  });

  // Convertir a array con etiquetas
  return Array.from(monthData.entries()).map(([label, data]) => ({
    label,
    ...data,
  }));
}

/**
 * Genera todos los meses del mes actual con sus datos de transacciones
 */
function aggregateByMonth(transactions: Transaction[]): ChartData[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Usar YYYY-MM-DD como clave interna consistente
  const dayData: Map<string, { income: number; expense: number; day: number }> =
    new Map();

  // Generar todos los días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
    dayData.set(dateKey, { income: 0, expense: 0, day });
  }

  // Agregar transacciones
  transactions.forEach((transaction) => {
    const date = new Date(transaction.tx_date);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (dayData.has(dateKey)) {
      const dayRecord = dayData.get(dateKey)!;
      const amount = Math.round(transaction.amount_usd);

      if (transaction.tx_type === "income") {
        dayRecord.income += amount;
      } else if (transaction.tx_type === "expense") {
        dayRecord.expense += amount;
      }
    }
  });

  // Convertir a array ordenado por día
  return Array.from(dayData.entries())
    .map(([, data]) => ({
      label: `${data.day}`,
      income: data.income,
      expense: data.expense,
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));
}

/**
 * Genera datos del gráfico por período, incluyendo 0s para períodos sin datos
 */
export function generateChartData(
  transactions: Transaction[],
  period: PeriodType = "month"
): ChartData[] {
  const filteredTransactions = filterTransactionsByPeriod(transactions, period);

  switch (period) {
    case "week":
      return aggregateByWeek(filteredTransactions);
    case "month":
      return aggregateByMonth(filteredTransactions);
    case "year":
      return aggregateByYear(filteredTransactions);
    default:
      return aggregateByMonth(filteredTransactions);
  }
}
