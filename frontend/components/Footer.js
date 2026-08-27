"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Phone, Clock, Info } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Auth pages check
  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname?.startsWith("/verify-email");

  // Only show footer for:
  // 1. Guest user on the home page (pathname === "/" && !user)
  // 2. Auth pages (login, register, forgot-password, reset-password, verify-email)
  const isGuestHomePage = pathname === "/" && !user;
  const shouldShowFooter = isGuestHomePage || isAuthRoute;

  if (!shouldShowFooter) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#ECE8DF] border-t border-[#DDD6C8] text-[#2C2A29] mt-auto">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pb-8 border-b border-[#DDD6C8]">
          {/* About Us (No links, plain informational text) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C2A29] uppercase tracking-wider">
              <Info className="w-4 h-4 text-[#1E3A5F]" />
              <span>About Us</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md">
              We are dedicated to providing thoughtfully curated essentials designed for everyday living. 
              Our focus is on premium quality, transparent value, and delivering a simple, dependable shopping experience.
            </p>
          </div>

          {/* Contact Us (No links, plain informational text with random email & phone) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C2A29] uppercase tracking-wider">
              <Phone className="w-4 h-4 text-[#1E3A5F]" />
              <span>Contact Us</span>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>support@ecommerce.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>+1 (555) 382-9104</span>
              </div>
              <div className="flex items-center gap-2 text-stone-500 text-xs">
                <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>Mon – Fri &bull; 9:00 AM – 6:00 PM EST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Rights Reserved */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 text-center sm:text-left">
          <p>&copy; {currentYear}. All rights reserved.</p>
          <p className="text-[11px] text-stone-400">
            Crafted for a seamless and reliable shopping experience.
          </p>
        </div>
      </div>
    </footer>
  );
}
