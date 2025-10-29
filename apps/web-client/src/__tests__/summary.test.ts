import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Transaction } from "@/shared/types/transactions.types";
import {
  calculateStats,
  filterTransactionsByPeriod,
  filterByType,
  filterByCategory,
  applyFilters,
  generateChartData,
} from "@/features/dashboard/logic/summary";

// ============================================================================
// MOCK: convertForDisplay
// ============================================================================
vi.mock("@/features/dashboard/logic/currency", () => ({
  convertForDisplay: (
    amountOriginal: number,
    currency: string,
    display: string
  ) => {
    if (currency === "USD" && display === "COP") {
      return amountOriginal * 3780;
    }
    if (currency === "COP" && display === "USD") {
      return amountOriginal / 3780;
    }
    return amountOriginal;
  },
}));

// ============================================================================
// SETUP: Fijar la fecha "actual" para que los tests sean determinísticos
// ============================================================================
const FIXED_NOW = new Date("2025-10-15T12:00:00Z").getTime();

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterAll(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ============================================================================
// FIXTURE: Transacciones de prueba (como retorna Supabase en la práctica)
// ============================================================================
// IMPORTANTE: tx_date es SIEMPRE string ISO "YYYY-MM-DD" (cómo Supabase serializa DATE)
const fixtureTransactions: Transaction[] = [
  // Octubre (mes actual) - DENTRO del rango
  {
    id: "1",
    user_id: "user-123",
    tx_type: "income",
    amount_original: 1000,
    currency_code: "USD",
    category_id: "salary",
    title: "Salario",
    tx_date: "2025-10-10", // STRING ISO (cómo Supabase lo retorna)
    fx_rate_to_usd: 1.0,
    amount_usd: 1000,
    category_name: "Salario",
    category_emoji: "💼",
  },
  {
    id: "2",
    user_id: "user-123",
    tx_type: "expense",
    amount_original: 200,
    currency_code: "USD",
    category_id: "food",
    title: "Comida",
    tx_date: "2025-10-11",
    fx_rate_to_usd: 1.0,
    amount_usd: 200,
    category_name: "Comida",
    category_emoji: "🍔",
  },
  {
    id: "3",
    user_id: "user-123",
    tx_type: "income",
    amount_original: 500,
    currency_code: "USD",
    category_id: "bonus",
    title: "Bonus",
    tx_date: "2025-10-15", // Hoy
    fx_rate_to_usd: 1.0,
    amount_usd: 500,
    category_name: "Bonus",
    category_emoji: "🎁",
  },
  // Septiembre (mes anterior) - FUERA del rango mes actual
  {
    id: "4",
    user_id: "user-123",
    tx_type: "income",
    amount_original: 1500,
    currency_code: "USD",
    category_id: "salary",
    title: "Salario Septiembre",
    tx_date: "2025-09-30",
    fx_rate_to_usd: 1.0,
    amount_usd: 1500,
    category_name: "Salario",
    category_emoji: "💼",
  },
  // Enero (mismo año, otro mes) - FUERA del rango mes actual
  {
    id: "5",
    user_id: "user-123",
    tx_type: "expense",
    amount_original: 50,
    currency_code: "USD",
    category_id: "transport",
    title: "Transporte",
    tx_date: "2025-01-12",
    fx_rate_to_usd: 1.0,
    amount_usd: 50,
    category_name: "Transporte",
    category_emoji: "🚗",
  },
  // Octubre con otra moneda (COP)
  {
    id: "6",
    user_id: "user-123",
    tx_type: "expense",
    amount_original: 3780,
    currency_code: "COP",
    category_id: "food",
    title: "Comida en pesos",
    tx_date: "2025-10-12",
    fx_rate_to_usd: 0.00026, // Tasa típica COP->USD
    amount_usd: 1, // 3780 * 0.00026 ≈ 1
    category_name: "Comida",
    category_emoji: "🍔",
  },
];

// ============================================================================
// DESCRIBE: calculateStats()
// ============================================================================
describe("calculateStats()", () => {
  it("debe calcular ingresos, egresos y total para el mes actual", () => {
    const result = calculateStats(fixtureTransactions, "month", "USD");

    // Octubre:
    // Income: 1000 (oct 10) + 500 (oct 15) = 1500
    // Expense: 200 (oct 11) + 1 COP (3780 COP / 3780 = 1 USD) = 201
    // Total: 1500 - 201 = 1299
    expect(result.income).toBe(1500);
    expect(result.expense).toBe(201);
    expect(result.total).toBe(1299);
  });

  it("debe incluir etiqueta del período en formato es-ES", () => {
    const result = calculateStats(fixtureTransactions, "month", "USD");
    // Debería ser algo como "Mes octubre 2025"
    expect(result.periodLabel).toContain("octubre");
    expect(result.periodLabel).toContain("2025");
  });

  it("debe devolver 0 para período sin transacciones", () => {
    const emptyResult = calculateStats([], "month", "USD");
    expect(emptyResult.income).toBe(0);
    expect(emptyResult.expense).toBe(0);
    expect(emptyResult.total).toBe(0);
  });

  it("debe convertir moneda correctamente de COP a USD", () => {
    const copTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 3780,
        currency_code: "COP",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15", // STRING ISO
        fx_rate_to_usd: 0.00026,
        amount_usd: 1,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = calculateStats(copTransactions, "month", "USD");
    // 3780 COP / 3780 = 1 USD (usando mock convertForDisplay)
    expect(result.income).toBe(1);
  });

  it("debe convertir moneda de USD a COP", () => {
    const usdTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 1,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 1,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = calculateStats(usdTransactions, "month", "COP");
    // 1 USD * 3780 = 3780 COP
    expect(result.income).toBe(3780);
  });

  it("debe redondear a 2 decimales", () => {
    const transactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 1000.555,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 1000.555,
        category_name: "Test",
        category_emoji: "💸",
      },
      {
        id: "2",
        user_id: "user-123",
        tx_type: "expense",
        amount_original: 200.333,
        currency_code: "USD",
        category_id: "cat2",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 200.333,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = calculateStats(transactions, "month", "USD");
    expect(result.income).toBe(1000.56);
    expect(result.expense).toBe(200.33);
  });

  it("debe filtrar solo transacciones del período seleccionado (week)", () => {
    // Semana que contiene el 15 de octubre debería incluir solo eso
    const result = calculateStats(fixtureTransactions, "week", "USD");

    // La semana del 15 de octubre (miércoles) es del 13-19
    // Transacciones dentro:
    // - 15 de octubre: 500 income, ningún expense
    expect(result.income).toBe(500);
    expect(result.expense).toBe(0);
  });

  it("debe filtrar solo transacciones del período seleccionado (year)", () => {
    const result = calculateStats(fixtureTransactions, "year", "USD");

    // Todo el año 2025:
    // Income: 1000 + 500 + 1500 = 3000
    // Expense: 200 + 1 + 50 = 251
    expect(result.income).toBe(3000);
    expect(result.expense).toBe(251);
  });

  it("debe ignorar transacciones con tx_type inválido", () => {
    const mixedTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 100,
        category_name: "Test",
        category_emoji: "💸",
      },
      {
        id: "2",
        user_id: "user-123",
        tx_type: "unknown" as Transaction["tx_type"],
        amount_original: 50,
        currency_code: "USD",
        category_id: "cat2",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 50,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = calculateStats(mixedTransactions, "month", "USD");
    expect(result.income).toBe(100);
    expect(result.expense).toBe(0);
  });

  it("debe soportar tx_date como string ISO (formato real de Supabase)", () => {
    const transaction: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15", // STRING ISO como Supabase lo retorna
        fx_rate_to_usd: 1.0,
        amount_usd: 100,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = calculateStats(transaction, "month", "USD");
    expect(result.income).toBe(100);
  });
});

// ============================================================================
// DESCRIBE: filterTransactionsByPeriod()
// ============================================================================
describe("filterTransactionsByPeriod()", () => {
  it("debe devolver solo transacciones del mes actual", () => {
    const result = filterTransactionsByPeriod(fixtureTransactions, "month");

    // Octubre: IDs 1, 2, 3, 6
    const ids = result.map((t) => t.id);
    expect(ids).toEqual(expect.arrayContaining(["1", "2", "3", "6"]));
    expect(ids).not.toContain("4"); // Septiembre
    expect(ids).not.toContain("5"); // Enero
  });

  it("debe devolver solo transacciones de la semana actual", () => {
    const result = filterTransactionsByPeriod(fixtureTransactions, "week");

    // La semana del 15 octubre (miércoles) es 13-19
    // Solo la transacción del 15 octubre entra
    const ids = result.map((t) => t.id);
    expect(ids).toContain("3"); // 15 octubre
    expect(ids).not.toContain("1"); // 10 octubre (semana anterior)
  });

  it("debe devolver todas las transacciones del año", () => {
    const result = filterTransactionsByPeriod(fixtureTransactions, "year");

    expect(result.length).toBe(6);
  });

  it("debe devolver array vacío si no hay transacciones en el período", () => {
    const futureTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2026-01-01",
        fx_rate_to_usd: 1.0,
        amount_usd: 100,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = filterTransactionsByPeriod(futureTransactions, "month");
    expect(result).toEqual([]);
  });

  it("debe manejar transacciones en el último y primer día del mes", () => {
    const edgeDates: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-01",
        fx_rate_to_usd: 1.0,
        amount_usd: 100,
        category_name: "Test",
        category_emoji: "💸",
      },
      {
        id: "2",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 200,
        currency_code: "USD",
        category_id: "cat2",
        title: "Test",
        tx_date: "2025-10-31",
        fx_rate_to_usd: 1.0,
        amount_usd: 200,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = filterTransactionsByPeriod(edgeDates, "month");
    expect(result.length).toBe(2);
  });
});

// ============================================================================
// DESCRIBE: filterByType()
// ============================================================================
describe("filterByType()", () => {
  it("debe filtrar solo ingresos", () => {
    const result = filterByType(fixtureTransactions, "income");

    expect(result.length).toBe(3); // IDs 1, 3, 4
    result.forEach((t) => {
      expect(t.tx_type).toBe("income");
    });
  });

  it("debe filtrar solo egresos", () => {
    const result = filterByType(fixtureTransactions, "expense");

    expect(result.length).toBe(3); // IDs 2, 5, 6
    result.forEach((t) => {
      expect(t.tx_type).toBe("expense");
    });
  });

  it("debe devolver todas las transacciones si type no se proporciona", () => {
    const result = filterByType(fixtureTransactions);

    expect(result.length).toBe(fixtureTransactions.length);
  });

  it("debe devolver array vacío si no coincide el tipo", () => {
    const singleType: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 100,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = filterByType(singleType, "expense");
    expect(result).toEqual([]);
  });
});

// ============================================================================
// DESCRIBE: filterByCategory()
// ============================================================================
describe("filterByCategory()", () => {
  it("debe filtrar por categoría específica", () => {
    const result = filterByCategory(fixtureTransactions, "food");

    expect(result.length).toBe(2); // IDs 2, 6
    result.forEach((t) => {
      expect(t.category_id).toBe("food");
    });
  });

  it("debe devolver todas las transacciones si categoryId no se proporciona", () => {
    const result = filterByCategory(fixtureTransactions);

    expect(result.length).toBe(fixtureTransactions.length);
  });

  it("debe devolver array vacío si no existe la categoría", () => {
    const result = filterByCategory(fixtureTransactions, "nonexistent");
    expect(result).toEqual([]);
  });

  it("debe ser case-sensitive", () => {
    const result = filterByCategory(fixtureTransactions, "FOOD");
    expect(result).toEqual([]);
  });
});

// ============================================================================
// DESCRIBE: applyFilters()
// ============================================================================
describe("applyFilters()", () => {
  it("debe aplicar filtro por período", () => {
    const result = applyFilters(fixtureTransactions, { period: "month" });

    // Octubre: IDs 1, 2, 3, 6
    const ids = result.map((t) => t.id);
    expect(ids.length).toBe(4);
    expect(ids).not.toContain("4"); // Septiembre
    expect(ids).not.toContain("5"); // Enero
  });

  it("debe aplicar filtro por tipo", () => {
    const result = applyFilters(fixtureTransactions, { type: "income" });

    result.forEach((t) => {
      expect(t.tx_type).toBe("income");
    });
    expect(result.length).toBe(3);
  });

  it("debe aplicar filtro por categoría", () => {
    const result = applyFilters(fixtureTransactions, { categoryId: "salary" });

    expect(result.length).toBe(2); // IDs 1, 4
    result.forEach((t) => {
      expect(t.category_id).toBe("salary");
    });
  });

  it("debe aplicar múltiples filtros en combinación", () => {
    const result = applyFilters(fixtureTransactions, {
      period: "month",
      type: "expense",
      categoryId: "food",
    });

    // Octubre + expense + food = IDs 2, 6
    expect(result.length).toBe(2);
    result.forEach((t) => {
      expect(t.tx_type).toBe("expense");
      expect(t.category_id).toBe("food");
    });
  });

  it("debe devolver todas las transacciones si no hay filtros", () => {
    const result = applyFilters(fixtureTransactions, {});

    expect(result.length).toBe(fixtureTransactions.length);
  });

  it("debe devolver array vacío si no coinciden los filtros", () => {
    const result = applyFilters(fixtureTransactions, {
      type: "income",
      categoryId: "food", // No hay income de food
    });

    expect(result).toEqual([]);
  });

  it("debe aplicar filtros en orden: período → tipo → categoría", () => {
    // Esto verifica que los filtros se aplican secuencialmente
    const result = applyFilters(fixtureTransactions, {
      period: "year",
      type: "expense",
      categoryId: "food",
    });

    // Año 2025 + expense + food = IDs 2, 6
    expect(result.length).toBe(2);
    result.forEach((t) => {
      expect(t.tx_type).toBe("expense");
      expect(t.category_id).toBe("food");
    });
  });
});

// ============================================================================
// DESCRIBE: generateChartData()
// ============================================================================
describe("generateChartData()", () => {
  it("debe generar data para gráfico mensual con todos los días", () => {
    const result = generateChartData(fixtureTransactions, "month", "USD");

    // Octubre 2025 tiene 31 días
    expect(result.length).toBe(31);

    // Todos los días deberían tener una entrada
    result.forEach((item) => {
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("income");
      expect(item).toHaveProperty("expense");
      expect(typeof item.income).toBe("number");
      expect(typeof item.expense).toBe("number");
    });
  });

  it("debe sumar ingresos y egresos correctamente en el gráfico mensual", () => {
    const result = generateChartData(fixtureTransactions, "month", "USD");

    // Día 10: 1000 income
    const day10 = result.find((item) => item.label === "10");
    expect(day10?.income).toBe(1000);
    expect(day10?.expense).toBe(0);

    // Día 11: 200 expense
    const day11 = result.find((item) => item.label === "11");
    expect(day11?.income).toBe(0);
    expect(day11?.expense).toBe(200);

    // Día 15: 500 income
    const day15 = result.find((item) => item.label === "15");
    expect(day15?.income).toBe(500);
    expect(day15?.expense).toBe(0);

    // Día 12: 1 expense (de COP)
    const day12 = result.find((item) => item.label === "12");
    expect(day12?.income).toBe(0);
    expect(day12?.expense).toBe(1);
  });

  it("debe generar data para gráfico semanal con 7 días", () => {
    const result = generateChartData(fixtureTransactions, "week", "USD");

    expect(result.length).toBe(7);
  });

  it("debe generar data para gráfico anual con 12 meses", () => {
    const result = generateChartData(fixtureTransactions, "year", "USD");

    expect(result.length).toBe(12);

    // Labels deberían ser meses en español
    const labels = result.map((item) => item.label);
    expect(labels).toEqual([
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
    ]);
  });

  it("debe sumar múltiples transacciones del mismo día", () => {
    const sameDayTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 100,
        category_name: "Test",
        category_emoji: "💸",
      },
      {
        id: "2",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 200,
        currency_code: "USD",
        category_id: "cat2",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 200,
        category_name: "Test",
        category_emoji: "💸",
      },
      {
        id: "3",
        user_id: "user-123",
        tx_type: "expense",
        amount_original: 50,
        currency_code: "USD",
        category_id: "cat3",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 50,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = generateChartData(sameDayTransactions, "month", "USD");
    const day15 = result.find((item) => item.label === "15");

    expect(day15?.income).toBe(300);
    expect(day15?.expense).toBe(50);
  });

  it("debe incluir días sin transacciones con 0", () => {
    const sparseTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-01",
        fx_rate_to_usd: 1.0,
        amount_usd: 100,
        category_name: "Test",
        category_emoji: "💸",
      },
      {
        id: "2",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 200,
        currency_code: "USD",
        category_id: "cat2",
        title: "Test",
        tx_date: "2025-10-31",
        fx_rate_to_usd: 1.0,
        amount_usd: 200,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = generateChartData(sparseTransactions, "month", "USD");

    // Debe haber 31 días
    expect(result.length).toBe(31);

    // Día 2 debe tener 0
    const day2 = result.find((item) => item.label === "2");
    expect(day2?.income).toBe(0);
    expect(day2?.expense).toBe(0);
  });

  it("debe convertir divisas correctamente en el gráfico", () => {
    const copTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 3780,
        currency_code: "COP",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 0.00026,
        amount_usd: 1,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = generateChartData(copTransactions, "month", "USD");
    const day15 = result.find((item) => item.label === "15");

    // 3780 COP / 3780 = 1 USD (usando mock convertForDisplay)
    expect(day15?.income).toBe(1);
  });

  it("debe redondear a 2 decimales en el gráfico", () => {
    const decimalTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100.555,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2025-10-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 100.555,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = generateChartData(decimalTransactions, "month", "USD");
    const day15 = result.find((item) => item.label === "15");

    expect(day15?.income).toBe(100.56);
  });

  it("debe filtrar por período antes de generar el gráfico", () => {
    // Solo octubre debe incluirse
    const result = generateChartData(fixtureTransactions, "month", "USD");

    const totalIncome = result.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = result.reduce((sum, item) => sum + item.expense, 0);

    // Octubre: 1000 + 500 = 1500 income, 200 + 1 = 201 expense
    expect(totalIncome).toBe(1500);
    expect(totalExpense).toBe(201);
  });

  it("debe devolver array vacío si no hay transacciones en el período", () => {
    const futureTransactions: Transaction[] = [
      {
        id: "1",
        user_id: "user-123",
        tx_type: "income",
        amount_original: 100,
        currency_code: "USD",
        category_id: "cat1",
        title: "Test",
        tx_date: "2026-01-15",
        fx_rate_to_usd: 1.0,
        amount_usd: 100,
        category_name: "Test",
        category_emoji: "💸",
      },
    ];

    const result = generateChartData(futureTransactions, "month", "USD");

    // Debe haber 31 días pero todos con 0
    expect(result.length).toBe(31);
    result.forEach((item) => {
      expect(item.income).toBe(0);
      expect(item.expense).toBe(0);
    });
  });

  it("debe soportar diferentes períodos", () => {
    const monthResult = generateChartData(fixtureTransactions, "month", "USD");
    const weekResult = generateChartData(fixtureTransactions, "week", "USD");
    const yearResult = generateChartData(fixtureTransactions, "year", "USD");

    expect(monthResult.length).toBe(31);
    expect(weekResult.length).toBe(7);
    expect(yearResult.length).toBe(12);
  });
});
