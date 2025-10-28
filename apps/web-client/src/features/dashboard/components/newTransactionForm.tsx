import { Button } from "@/shared/components/ui/button";
import { PlusIcon } from "lucide-react";

export const NewTransactionForm = () => {
  return (
    <>
      <Button
        variant="outline"
        className="bg-[#3C3C3C] hover:bg-[#3C3C3C]/70 border-none text-white hover:text-white"
      >
        <PlusIcon className="w-4 h-4" />
      </Button>
    </>
  );
};
