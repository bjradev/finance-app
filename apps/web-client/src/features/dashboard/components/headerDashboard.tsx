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

export const HeaderDashboard = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-2">
      <h1 className="text-2xl md:text-3xl font-black text-foreground">
        👋🏼 Bienvenido,{" "}
        <span className="text-primary font-bold">{user?.name}</span>
      </h1>
      <div className="flex items-center gap-2">
        <Select defaultValue={user?.defaultCurrency}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una opción" />
            <SelectContent>
              <SelectItem value="COP">🇨🇴 COP</SelectItem>
              <SelectItem value="USD">🇺🇸 USD</SelectItem>
            </SelectContent>
          </SelectTrigger>
        </Select>
        <Select defaultValue="week">
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una opción" />
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
              <SelectItem value="year">Año</SelectItem>
            </SelectContent>
          </SelectTrigger>
        </Select>
        <NewTransactionForm />
        <ButtonLogout />
      </div>
    </div>
  );
};
