/**
 * Exporta toda la lógica de negocio del dashboard
 */

// Lógica de conversión de moneda
export {
  calculateCurrencyConversion,
  calculateFromUSD,
  formatCurrency,
  type CurrencyCalculationResult,
} from "./currency";

// Lógica de resumen y estadísticas
export {
  calculateStats,
  filterTransactionsByPeriod,
  filterByType,
  filterByCategory,
  applyFilters,
  generateChartData,
  calculateAmountUSD,
  type PeriodType,
  type StatsResult,
  type ChartData,
} from "./summary";
