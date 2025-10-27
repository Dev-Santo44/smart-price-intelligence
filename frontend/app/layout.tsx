"use client";

import "@/app/globals.css" ;
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

const noLayoutRoutes = ["/login", "/register"];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideLayout = noLayoutRoutes.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900">
        {/* ✅ AuthProvider wraps ThemeProvider */}
        <AuthProvider>
          <ThemeProvider>
            {hideLayout ? (
              <main className="min-h-screen flex items-center justify-center">{children}</main>
            ) : (
              <div className="flex h-screen overflow-hidden">
                {/* ✅ Navbar is now inside ThemeProvider */}
                <Sidebar />
                <div className="flex flex-col flex-1">
                  <Navbar />
                  <main className="flex-1 overflow-y-auto p-4">{children}</main>
                </div>
              </div>
            )}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
