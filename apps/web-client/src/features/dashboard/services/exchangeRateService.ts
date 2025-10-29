/**
 * Tasas de cambio fijas (mock API)
 * 1 USD = 3780 COP (tasa fija para propósitos de demostración)
 */
const FIXED_EXCHANGE_RATES = {
  USD: 1.0,
  COP: 3780,
} as const;

/**
 * Mock de API para obtener tasa de cambio
 * En producción, esto vendría de una API externa como Forex API, exchangerate.host, etc.
 * 
 * RATES:
 * - 1 USD = 3780 COP
 * - 1 COP = 0.000265 USD
 */
export const exchangeRateService = {
  /**
   * Obtiene la tasa de cambio de una moneda a USD
   * @param currencyCode - Código de moneda (USD, COP)
   * @returns Tasa de cambio (cuántos USD vale 1 unidad de la moneda)
   * 
   * Ejemplos:
   * - getRate("USD") => 1.0
   * - getRate("COP") => 3780 (significa que 3780 COP = 1 USD)
   */
  getRate: async (currencyCode: "USD" | "COP"): Promise<number> => {
    // Simular latencia de API (100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));

    const rate = FIXED_EXCHANGE_RATES[currencyCode];
    if (!rate) {
      throw new Error(`Tasa de cambio no encontrada para: ${currencyCode}`);
    }
    return rate;
  },

  /**
   * Convierte una cantidad de una moneda a USD
   * @param amount - Cantidad a convertir
   * @param fromCurrency - Moneda de origen (USD o COP)
   * @returns Objeto con cantidad en USD y tasa de cambio utilizada
   * 
   * Ejemplos:
   * - convertToUSD(100, "USD") => { amountUSD: 100, fxRate: 1.0 }
   * - convertToUSD(3780, "COP") => { amountUSD: 1, fxRate: 0.000265 }
   */
  convertToUSD: async (
    amount: number,
    fromCurrency: "USD" | "COP"
  ): Promise<{ amountUSD: number; fxRate: number }> => {
    const rate = await exchangeRateService.getRate(fromCurrency);

    if (fromCurrency === "USD") {
      return { amountUSD: amount, fxRate: 1.0 };
    }

    // Convertir de COP a USD: dividir por la tasa (3780 COP / 1 USD)
    // Ejemplo: 3780 COP / 3780 = 1 USD
    const amountUSD = Math.round((amount / rate) * 100) / 100;
    return { amountUSD, fxRate: 1 / rate };
  },

  /**
   * Convierte una cantidad en USD a otra moneda
   * @param amountUSD - Cantidad en USD
   * @param toCurrency - Moneda de destino (USD o COP)
   * @returns Cantidad convertida a la moneda de destino
   * 
   * Ejemplos:
   * - convertFromUSD(1, "USD") => 1
   * - convertFromUSD(1, "COP") => 3780
   */
  convertFromUSD: async (
    amountUSD: number,
    toCurrency: "USD" | "COP"
  ): Promise<number> => {
    if (toCurrency === "USD") {
      return amountUSD;
    }

    const rate = await exchangeRateService.getRate(toCurrency);
    // Multiplicar por la tasa para convertir de USD a la otra moneda
    return Math.round(amountUSD * rate * 100) / 100;
  },
};
