import { supabaseClient } from "@/shared/lib/supabaseClient";
import type { Category } from "@/shared/types/categories.types";
import { useAuthStore } from "@/app/store/authStore";

export const categoriesServices = {
  getCategories: async (): Promise<Category[]> => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabaseClient
      .from("categories")
      .select("id, name, emoji, is_default")
      .eq("user_id", user.id);
    if (error) throw error;
    return data as Category[];
  },
};
