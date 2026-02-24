import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AOD Intake Form | Acres of Diamonds",
  description: "Share your story with us — we'll help you find the diamonds in your own journey.",
  openGraph: {
    title: "AOD Intake Form | Acres of Diamonds",
    description: "Share your story with us — we'll help you find the diamonds in your own journey.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
