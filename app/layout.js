import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SessionWrapper from "./components/SessionWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",   // reuse the same token the CSS references
  display: "swap",
});

export const metadata = {
  title: "Concentric Tracker",
  description: "Company Tracking System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <SessionWrapper>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontSize: '0.875rem',
                borderRadius: '0.625rem',
              },
            }}
          />
        </SessionWrapper>
      </body>
    </html>
  );
}
