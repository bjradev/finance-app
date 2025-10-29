import { useState, useCallback } from "react";
import { calculateFromUSD } from "../logic/currency";

/**
 * Hook para manejar la moneda de visualización
 * Convierte los montos en USD a la moneda seleccionada por el usuario
 */
export const useDisplayCurrency = (defaultCurrency: string = "COP") => {
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "COP">(
    (defaultCurrency as "USD" | "COP") || "COP"
  );

  /**
   * Convierte un monto en USD a la moneda de visualización seleccionada
   * @param amountUSD - Monto en USD
   * @returns Monto convertido a la moneda de visualización
   */
  const convertToDisplayCurrency = useCallback(
    async (amountUSD: number): Promise<number> => {
      // Si la moneda es USD, no hay conversión necesaria
      if (displayCurrency === "USD") {
        return amountUSD;
      }

      // Convertir de USD a la moneda de visualización
      return await calculateFromUSD(amountUSD, displayCurrency);
    },
    [displayCurrency]
  );

  const handleCurrencyChange = (currency: string) => {
    if (currency === "USD" || currency === "COP") {
      setDisplayCurrency(currency as "USD" | "COP");
    }
  };

  return {
    displayCurrency,
    setDisplayCurrency: handleCurrencyChange,
    convertToDisplayCurrency,
  };
};
