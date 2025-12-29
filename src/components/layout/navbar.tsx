"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/cards", label: "Cards", icon: LayoutGrid },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              BINGOALS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
