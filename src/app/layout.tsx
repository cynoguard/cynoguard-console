import { Providers } from "@/components/providers";
import ReduxProvider from "@/components/redux/redux-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { fontGeist, fontSans } from "../../public/fonts";
import "./globals.css";


export const metadata: Metadata = {
  title: "CynoGuard Console",
  description: "Cybersecurity platform for monitoring and protecting digital assets.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      {/* <script src="http://localhost:5173/src/v1/bot-management" async data-strictness="high" data-presistence="48" /> */}
      <body
        className={`${fontSans.className} ${fontGeist.className} antialiased`}
      >
        <ReduxProvider>
            <Providers>
             {children}
           <Toaster richColors position="top-right" />
            </Providers>
        </ReduxProvider>
      </body>
    </html>
  );
}

