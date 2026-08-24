"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Ticket,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navLinks = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: <Package className="w-5 h-5" />,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: <Tags className="w-5 h-5" />,
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      label: "Coupons",
      href: "/admin/coupons",
      icon: <Ticket className="w-5 h-5" />,
    },
  ];

  return (
    <RouteGuard type="admin">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-[#F7F5F0] text-[#2C2A29]">
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 bg-[#ECE8DF] border-r border-[#DDD6C8] p-6 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-xl bg-[#1E3A5F] flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#2C2A29]">Admin Portal</h2>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="space-y-1.5 pt-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-[#1E3A5F] text-white shadow-xs"
                        : "text-stone-600 hover:text-[#2C2A29] hover:bg-[#DDD6C8]"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-[#F7F5F0]">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
