import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TableX Quoting Dashboard",
  description: "Analytics dashboard for TableX quoting workflow, pricing, and operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
