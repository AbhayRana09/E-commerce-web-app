import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "E-Commerce Store",
  description: "Simple & thoughtful shopping experience built with Next.js & FastAPI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#F7F5F0] text-[#2C2A29] min-h-screen flex flex-col font-sans selection:bg-[#1E3A5F] selection:text-white antialiased">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main className="flex-1 w-full max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8">
                  {children}
                </main>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
