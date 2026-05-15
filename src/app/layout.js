import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/providers/AuthProvider";
import { StoreProvider } from "@/providers/StoreProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import ErrorBoundary from "@/components/layout/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TuitionPro | Premium Tuition Management System",
  description: "The most advanced and intuitive tuition management platform for teachers, students, and administrators. Manage attendance, fees, and results with ease.",
  keywords: ["tuition management", "education software", "SaaS", "teacher dashboard", "student tracking"],
  authors: [{ name: "TuitionPro Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900 flex flex-col font-sans">
        <ErrorBoundary>
          <StoreProvider>
            <AuthProvider>
              <ToastProvider />
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <footer className="border-t border-gray-200 bg-white py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <p className="text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} TuitionPro. All rights reserved.
                  </p>
                </div>
              </footer>
            </AuthProvider>
          </StoreProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
