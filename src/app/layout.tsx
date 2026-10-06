import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Literata } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const display = Instrument_Serif({ variable: "--font-display-serif", subsets: ["latin"], weight: "400" });
const literata = Literata({ variable: "--font-literata", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Readly — Your Digital Library", template: "%s · Readly" },
  description:
    "Describe a scene, select a genre, or dive straight into timeless literary masterpieces. Readly brings a hand-curated world of e-books right to your fingertips.",
};

export const viewport: Viewport = { themeColor: "#0b4a3b" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} ${literata.variable} antialiased`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
