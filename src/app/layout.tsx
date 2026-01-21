
"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 

    return () => clearTimeout(timer); 
  }, []);

  return (
    <html lang="en">
      <body className={poppins.variable}>
        {loading ? (
          <div className="flex justify-center items-center h-screen w-screen bg-white">
            <Loader2 className="animate-spin h-16 w-16 text-[#1E3A8A]" />
          </div>
        ) : (
          <div className="flex w-full">
            <main className="flex-grow w-full items-center justify-center p-0  overflow-auto">
              {children}
            </main>
            <Toaster />
          </div>
        )}
      </body>
    </html>
  );
}