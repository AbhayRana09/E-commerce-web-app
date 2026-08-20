import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "E-Commerce Store",
  description: "Simple & thoughtful shopping experience built with Next.js & FastAPI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1 w-full max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}



