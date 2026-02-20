import type { ReactNode } from "react";

type SupabaseProviderProps = {
  children: ReactNode;
};

export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  return <>{children}</>;
}
