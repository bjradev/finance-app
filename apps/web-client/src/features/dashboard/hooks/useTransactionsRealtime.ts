import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/shared/lib/supabaseClient";

const TRANSACTIONS_QUERY_KEY = ["transactions"];

export function useTransactionsRealtime(userId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) {
      console.log("No userId provided for realtime subscriptions");
      return;
    }

    console.log(`Setting up realtime subscriptions for user: ${userId}`);

    // Crear canal específico para este usuario
    const channel = supabaseClient
      .channel(`realtime:transactions:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT | UPDATE | DELETE
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // MUY IMPORTANTE:
          // En vez de mutar el estado nosotros mismos,
          // le decimos a React Query que la data ya no es fresh.
          // Eso dispara un refetch automático y mantiene todo consistente.
          qc.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status: ${status}`);

        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to transaction changes");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Channel error - check RLS policies in Supabase");
        } else if (status === "TIMED_OUT") {
          console.error("Subscription timed out");
        }
      });

    return () => {
      console.log(`Cleaning up realtime subscription for user: ${userId}`);
      supabaseClient.removeChannel(channel);
    };
  }, [qc, userId]);
}
