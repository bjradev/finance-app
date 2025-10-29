import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { ButtonLogout } from "@/shared/components/buttonLogout";
import { useAuthStore } from "@/app/store/authStore";
import { NewTransactionForm } from "./newTransactionForm";
import type { PeriodType } from "../logic/summary";

interface HeaderDashboardProps {
  period?: PeriodType;
  onPeriodChange?: (period: PeriodType) => void;
  displayCurrency?: "USD" | "COP";
  onCurrencyChange?: (currency: string) => void;
}

export const HeaderDashboard = ({
  period = "month",
  onPeriodChange,
  displayCurrency = "COP",
  onCurrencyChange,
}: HeaderDashboardProps) => {
  const user = useAuthStore((state) => state.user);

  const handlePeriodChange = (value: string) => {
    if (value === "week" || value === "month" || value === "year") {
      onPeriodChange?.(value);
    }
  };

  const handleCurrencyChange = (value: string) => {
    onCurrencyChange?.(value);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-2">
      <h1 className="text-2xl md:text-3xl font-black text-foreground">
        👋🏼 Bienvenido,{" "}
        <span className="text-primary font-bold">{user?.name}</span>
      </h1>
      <div className="flex items-center gap-2">
        {/* Selector de Moneda de Visualización */}
        <Select value={displayCurrency} onValueChange={handleCurrencyChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COP">🇨🇴 COP</SelectItem>
            <SelectItem value="USD">🇺🇸 USD</SelectItem>
          </SelectContent>
        </Select>

        {/* Selector de Período */}
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mes</SelectItem>
            <SelectItem value="year">Año</SelectItem>
          </SelectContent>
        </Select>

        <NewTransactionForm />
        <ButtonLogout />
      </div>
    </div>
  );
};
