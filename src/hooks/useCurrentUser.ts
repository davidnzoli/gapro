import { useEffect, useState } from "react";

export type User = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
   

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/userItems", {
        method: "GET",
        credentials: "include", // utile si cookies HttpOnly cross-site
      });

      if (!res.ok) {
        if (res.status === 401) {
          // utilisateur non connecté, ne pas générer d'erreur
          setUser(null);
          return;
        }
        
      }

      const data = await res.json();
      if (data.authenticated) setUser(data.user);
      else setUser(null);
    } catch (err: any) {
      console.error("useCurrentUser fetch error:", err);
      setUser(null);
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, refresh: fetchUser };
}