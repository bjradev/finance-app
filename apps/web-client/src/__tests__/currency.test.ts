import { describe, it, expect } from "vitest";
import {
  calculateCurrencyConversion,
  calculateFromUSD,
} from "../features/dashboard/logic/currency";
import { exchangeRateService } from "../features/dashboard/services/exchangeRateService";

describe("Conversión de Monedas", () => {
  describe("calculateCurrencyConversion", () => {
    it("debe convertir COP a USD con tasa 3780:1", async () => {
      const result = await calculateCurrencyConversion(3780, "COP");

      expect(result.amount_usd).toBe(1);
      expect(result.fx_rate_to_usd).toBeCloseTo(0.000265, 6);
    });

    it("debe convertir 75600 COP a 20 USD", async () => {
      const result = await calculateCurrencyConversion(75600, "COP");

      expect(result.amount_usd).toBe(20);
      expect(result.fx_rate_to_usd).toBeCloseTo(0.000265, 6);
    });

    it("no debe convertir USD", async () => {
      const result = await calculateCurrencyConversion(100, "USD");

      expect(result.amount_usd).toBe(100);
      expect(result.fx_rate_to_usd).toBe(1.0);
    });

    it("debe mantener precisión de 2 decimales", async () => {
      const result = await calculateCurrencyConversion(1000, "COP");

      // 1000 / 3780 = 0.2645... redondeado a 0.26
      expect(result.amount_usd).toBe(0.26);
    });
  });

  describe("calculateFromUSD", () => {
    it("debe convertir USD a COP", async () => {
      const result = await calculateFromUSD(1, "COP");

      expect(result).toBe(3780);
    });

    it("debe convertir 20 USD a 75600 COP", async () => {
      const result = await calculateFromUSD(20, "COP");

      expect(result).toBe(75600);
    });

    it("no debe convertir USD", async () => {
      const result = await calculateFromUSD(100, "USD");

      expect(result).toBe(100);
    });
  });

  describe("exchangeRateService", () => {
    it("debe retornar tasa de USD = 1.0", async () => {
      const rate = await exchangeRateService.getRate("USD");
      expect(rate).toBe(1.0);
    });

    it("debe retornar tasa de COP = 3780", async () => {
      const rate = await exchangeRateService.getRate("COP");
      expect(rate).toBe(3780);
    });

    it("convertToUSD debe funcionar correctamente", async () => {
      const result = await exchangeRateService.convertToUSD(3780, "COP");

      expect(result.amountUSD).toBe(1);
      expect(result.fxRate).toBeCloseTo(0.000265, 6);
    });

    it("convertFromUSD debe funcionar correctamente", async () => {
      const result = await exchangeRateService.convertFromUSD(1, "COP");

      expect(result).toBe(3780);
    });
  });
});
