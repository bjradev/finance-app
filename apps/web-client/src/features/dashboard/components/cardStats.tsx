import { Card, CardContent } from "@/shared/components/ui/card";
import { ArrowUpRightIcon, ArrowDownRightIcon } from "lucide-react";

interface CardStatsProps {
  type: "income" | "expense" | "total";
  value: number;
  currency: string;
}

export const CardStats = ({ type, value, currency }: CardStatsProps) => {
  return (
    <>
      <Card className="flex items-center justify-between gap-4 p-4 rounded-lg bg-[#F8F8F8] shadow-none border-none">
        <CardContent className="flex flex-row justify-center items-center gap-4">
          <div className="flex flex-row justify-center items-center gap-2">
            {type === "income" ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#B8F1DE]">
                <ArrowUpRightIcon className="w-8 h-8 text-[#11C483] stroke-3" />
              </div>
            ) : type === "expense" ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#FFCCCB]">
                <ArrowDownRightIcon className="w-8 h-8 text-[#FD4745] stroke-3" />
              </div>
            ) : null}
            <div>
              <h3 className="text-sm font-bold text-muted-foreground capitalize">
                {type === "total"
                  ? "Total"
                  : type === "income"
                  ? "Ingresos"
                  : "Egresos"}
              </h3>
              <div className="flex items-center justify-between gap-2">
                <p className="text-2xl font-black text-foreground">{value}</p>
                <span className="text-sm text-muted-foreground">
                  {currency}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
