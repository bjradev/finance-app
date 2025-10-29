import { exchangeRateService } from "../services/exchangeRateService";

/**
 * Interfaz para el resultado del cálculo de moneda
 */
export interface CurrencyCalculationResult {
  amount_usd: number;
  fx_rate_to_usd: number;
}

/**
 * Calcula el monto en USD basado en la moneda original y la cantidad
 * @param amountOriginal - Monto en la moneda original
 * @param currencyCode - Código de moneda (USD, COP, etc.)
 * @returns Promise con amount_usd y fx_rate_to_usd
 */
export async function calculateCurrencyConversion(
  amountOriginal: number,
  currencyCode: string
): Promise<CurrencyCalculationResult> {
  try {
    // Si la moneda es USD, no hay conversión necesaria
    if (currencyCode === "USD") {
      return {
        amount_usd: amountOriginal,
        fx_rate_to_usd: 1.0,
      };
    }

    // Para COP u otras monedas, usar el servicio de conversión
    const { amountUSD, fxRate } = await exchangeRateService.convertToUSD(
      amountOriginal,
      currencyCode as "USD" | "COP"
    );

    return {
      amount_usd: amountUSD,
      fx_rate_to_usd: fxRate,
    };
  } catch (error) {
    console.error("Error al calcular conversión de moneda:", error);
    // Fallback: si falla, asumir que el monto original es USD
    return {
      amount_usd: amountOriginal,
      fx_rate_to_usd: 1.0,
    };
  }
}

/**
 * Calcula el monto en la moneda original basado en USD
 * @param amountUSD - Monto en USD
 * @param currencyCode - Código de moneda de destino (USD, COP, etc.)
 * @returns Promise con el monto en la moneda original
 * 
 * Ejemplos:
 * - calculateFromUSD(1, "USD") => 1
 * - calculateFromUSD(1, "COP") => 3780
 */
export async function calculateFromUSD(
  amountUSD: number,
  currencyCode: string
): Promise<number> {
  try {
    // Si la moneda es USD, no hay conversión necesaria
    if (currencyCode === "USD") {
      return amountUSD;
    }

    // Usar el nuevo método convertFromUSD del servicio
    return await exchangeRateService.convertFromUSD(
      amountUSD,
      currencyCode as "USD" | "COP"
    );
  } catch (error) {
    console.error("Error al calcular conversión desde USD:", error);
    // Fallback: retornar el monto sin conversión
    return amountUSD;
  }
}

/**
 * Formatea un monto en la moneda especificada
 * @param amount - Monto a formatear
 * @param currencyCode - Código de moneda (USD, COP, etc.)
 * @returns String formateado con símbolo de moneda
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  const currencySymbols: Record<string, string> = {
    USD: "$",
    COP: "$",
  };

  const symbol = currencySymbols[currencyCode] || currencyCode;

  // Formatear con separadores de miles
  const formattedAmount = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: currencyCode === "USD" ? 2 : 0,
    maximumFractionDigits: currencyCode === "USD" ? 2 : 0,
  }).format(amount);

  return `${symbol}${formattedAmount} ${currencyCode}`;
}

/**
 * Convierte un monto desde su moneda original a la moneda de visualización
 * Evita pérdida de precisión usando amount_original en lugar de amount_usd
 * @param amountOriginal - Monto en la moneda original (guardado en BD)
 * @param currencyCode - Moneda original (guardado en BD)
 * @param displayCurrency - Moneda en que quiero MOSTRAR
 * @returns Monto convertido a la moneda de visualización
 * 
 * Ejemplos:
 * - convertForDisplay(20000, "COP", "COP") → 20000 (sin conversión)
 * - convertForDisplay(20000, "COP", "USD") → 5.29 (20000 ÷ 3780)
 * - convertForDisplay(100, "USD", "COP") → 378000 (100 × 3780)
 * - convertForDisplay(100, "USD", "USD") → 100 (sin conversión)
 */
export function convertForDisplay(
  amountOriginal: number,
  currencyCode: string,
  displayCurrency: string
): number {
  // Si la moneda original es igual a la de visualización, no hay conversión
  if (currencyCode === displayCurrency) {
    return amountOriginal;
  }

  // De COP a USD
  if (currencyCode === "COP" && displayCurrency === "USD") {
    return Math.round((amountOriginal / 3780) * 100) / 100;
  }

  // De USD a COP
  if (currencyCode === "USD" && displayCurrency === "COP") {
    return Math.round(amountOriginal * 3780 * 100) / 100;
  }

  // Fallback: sin conversión
  return amountOriginal;
}
