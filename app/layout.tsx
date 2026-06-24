import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
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

/*
  Theme bootstrap: light is the default look. We only switch to dark when the
  user has explicitly chosen it (persisted), set before first paint to avoid a
  flash. (We intentionally do NOT follow the OS setting — the brand look is light.)
*/
const themeScript = `
(function () {
  try {
    if (localStorage.getItem("tb-theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
