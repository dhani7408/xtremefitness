import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Xtreme Fitness Gym — Sec-127 Kharar",
  description:
    "Xtreme Fitness Gym in Sec-127, Sante Majra, Kharar. Modern equipment, personal training, Zumba, Aerobics, Yoga. Open until 10:00 PM.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
