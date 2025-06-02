import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export const useAccessToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const { data } = await supabase.auth.getSession();
      setToken(data.session?.access_token ?? null);
    };
    getToken();
    // Optional: subscribe to session changes if your app needs it
  }, []);

  return token;
};
