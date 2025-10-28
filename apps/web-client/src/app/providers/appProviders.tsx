import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./queryProviders";

import { Toaster } from "@/shared/components/ui/sonner";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <BrowserRouter>
      <QueryProvider>
        {children}
        <Toaster position="top-right" />
      </QueryProvider>
    </BrowserRouter>
  );
};
