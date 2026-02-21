import type { Metadata } from "next";
import { fontGeist, fontSans } from "../../public/fonts";
import "./globals.css";


export const metadata: Metadata = {
  title: "Cynoguard Console",
  description: "Cybersecurity platform for monitoring and protecting digital assets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <script src="http://localhost:5173/src/v1/bot-management" async data-strictness="high" data-presistence="48"/>
      <body
        className={`${fontSans.className} ${fontGeist.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
