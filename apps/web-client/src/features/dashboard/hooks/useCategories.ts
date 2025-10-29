import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoriesServices } from "../services/categoriesServices";
import type { Category } from "@/shared/types/categories.types";

interface CategoriesResponse {
  data: Category[];
  error: Error | null;
}

export const useCategories = (): CategoriesResponse => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesServices.getCategories,
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading categories:", error);
      toast.error(
        error.message || "Error al cargar las categorías. Intenta de nuevo."
      );
    }
  }, [error]);

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      console.log(`${data.length} categorías cargadas`);
    }
  }, [data, isLoading]);

  return { data: data || [], error };
};
