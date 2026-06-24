import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/shared/Toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Openlane — Vehicle Auctions",
  description:
    "Browse inventory, inspect vehicle details, and place bids. A buyer-side auction prototype.",
};
const themeScript = `
(function () {
  try {
    if (localStorage.getItem("tb-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col overflow-x-clip font-sans">
        <Script id="tb-theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <NextIntlClientProvider>
          <ToastProvider>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
