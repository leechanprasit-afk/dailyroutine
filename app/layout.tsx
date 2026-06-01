import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus with Lee",
  description: "Your daily routine & focus companion",
  appleWebApp: {
    capable: true,
    title: "Focus with Lee",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
