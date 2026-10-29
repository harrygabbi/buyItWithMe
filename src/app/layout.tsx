import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
import "./globals.css";
import "./workspace.css";
import { currentUser } from "@/lib/server/auth";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata = {
  title: "OpenHouse AI — Realtor Workspace",
  icons: { icon: "/favicon.svg" },
  description:
    "An elevated workspace for exceptional properties. Organize, prepare, and bring every home into focus.",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await currentUser();
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
