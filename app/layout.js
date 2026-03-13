import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SessionWrapper from "./components/SessionWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Concentric Tracker",
  description: "Company Tracking System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          {children}
          <Toaster position="top-right" />
        </SessionWrapper>
      </body>
    </html>
  );
}
