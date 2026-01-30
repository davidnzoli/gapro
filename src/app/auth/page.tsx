"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePathname } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, error, refresh } = useCurrentUser();

  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(data);
      if (res.ok && data.success) {
        toast.success("Connexion réussie !");

        // appeler l'API pour récupérer le user actuel
        const meRes = await fetch("/api/auth/userItems");
        const meData = await meRes.json();
        const role = meData.user.role;

        if (role === "admin") {
          router.push("/Dashboard");
        } else if (["caissier", "magasinier", "comptable"].includes(role)) {
          router.push("/DashboardUser");
        } else {
          toast.error("Rôle non reconnu");
        }
      } else {
        toast.error(data.error || "Erreur de connexion");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-[100%] justify-center items-center min-h-screen md:h-[80svh] lg:h-[80svh] mt-0">
      <div className="flex w-[100%] p-10 lg:p-0 h-screen bg-white flex-col lg:flex-row justify-center items-center shadow-sm  overflow-hidden ">
        <div className="hidden lg:flex w-[60%] h-full justify-center items-center bg-blue-50 p-10">
          <Image
            src="/finance.svg"
            alt="Illustration login"
            width={300}
            height={300}
            className="rounded-3xl object-cover p-8 w-[500px] "
          />
        </div>

        <div className="hidden lg:block w-px bg-gray-300"></div>

        <div className="lg:w-[50%] w-full h-full flex flex-col justify-center items-center lg:p-10 pt-10">
          <div className="flex w-[100%] h-50 mb-10 items-center  justify-center">
            <Image
              src="/gapro.svg"
              alt="logo"
              width={1000}
              height={0}
              className="rounded-4xl  pb-8 lg:pb-1 h-50 m-0 object-cover p-0 "
            />
          </div>
          <h2 className="md:text-2xl text-md font-bold text-gray-800 text-center md:mb-6 mb-2">
            Connexion à votre compte
          </h2>
          <p className="text-gray-500 md:text-md text-xs mb-6 text-center">
            Entrez vos identifiants pour accéder à votre tableau de bord.
          </p>

          <form
            onSubmit={handleSubmit}
            className="w-full p-2 space-y-4 flex flex-col justify-center items-center"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border border-gray-300 p-3 lg:w-[80%] w-[100%] rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-blue-400"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="border border-gray-300 p-3 lg:w-[80%] w-[100%] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="submit"
              className="bg-[#1E3A8A] h-12  text-white p-3 lg:w-[80%] w-[100%] rounded-lg cursor-pointer hover:bg-blue-950 transition-colors"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-gray-400 text-sm text-center">
            © 2025 Gapro. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
