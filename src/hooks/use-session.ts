import { useEffect, useState } from "react";
import { getSession, setSession, type Session } from "@/lib/store";

export function useSession() {
  const [session, setLocal] = useState<Session | null>(() => getSession());
  useEffect(() => {
    const handler = () => setLocal(getSession());
    window.addEventListener("estate:session", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("estate:session", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return { session, logout: () => setSession(null) };
}
