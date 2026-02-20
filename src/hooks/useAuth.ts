import { useEffect, useState } from "react";
import { supabaseClient } from "../services/supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });
    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    setLoading(true);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) throw error;
    setUser(data.user);
    return data;
  }

  async function signUp(email: string, password: string) {
    setLoading(true);
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) throw error;
    setUser(data.user);
    return data;
  }
  async function signOut() {
    setLoading(true);
    const { error } = await supabaseClient.auth.signOut();
    setLoading(false);
    if (error) throw error;
    setUser(null);
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
