import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
import "./globals.css";
import { currentUser } from "@/lib/server/auth";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata = {
  title: "OpenHouse AI — Realtor Workspace",
  description:
    "Prepare every property for a better open house. Realtor dashboard prototype.",
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
