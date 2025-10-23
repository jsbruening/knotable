"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useAuth } from "~/components/auth/auth-provider";
import { api } from "~/trpc/react";
import {
  Home,
  Target,
  Users,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";

export function GlobalNav() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: currentUser } = api.auth.getCurrentUser.useQuery();

  // Don't show navigation on auth pages
  const isAuthPage = pathname.startsWith("/auth/");
  
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Campaigns", href: "/campaigns", icon: Target },
    { name: "Teams", href: "/teams", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Don't show navigation on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="sticky top-0 z-50 hidden border-b border-white/20 bg-black/40 shadow-lg backdrop-blur-md md:flex">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <img
                  src="/images/logo.png"
                  alt="Knotable logo"
                  className="h-6 w-6"
                />
                <span className="text-xl font-bold text-white">Knotable</span>
              </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        isActive(item.href)
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Admin Create Campaign Button */}
              {currentUser?.isAdmin && (
                <Link href="/campaigns/create">
                  <Button
                    variant="outline"
                    className="ml-2 border-green-400/30 bg-green-600/20 text-green-200 hover:bg-green-600/30"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </Link>
              )}

              {/* Admin Settings Button */}
              {currentUser?.isAdmin && (
                <Link href="/admin/settings">
                  <Button
                    variant="ghost"
                    className="ml-2 text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {user && (
                <>
                  <div className="flex items-center space-x-2">
                    <img
                      src={
                        user.user_metadata?.avatar_url || "/default-avatar.png"
                      }
                      alt="Profile"
                      className="h-8 w-8 rounded-full border border-white/20"
                    />
                    <div className="hidden lg:block">
                      <div className="text-sm font-medium text-white">
                        {currentUser?.displayName ||
                          user.user_metadata?.full_name ||
                          user.email}
                      </div>
                      {currentUser?.isAdmin && (
                        <Badge variant="glassBlue" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2 hidden lg:inline">Sign Out</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-black/40 shadow-lg backdrop-blur-md md:hidden">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <img
                src="/images/logo.png"
                alt="Knotable logo"
                className="h-6 w-6"
              />
              <span className="text-xl font-bold text-white">Knotable</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t border-white/20 py-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          isActive(item.href)
                            ? "bg-white/20 text-white"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  );
                })}

                {/* Admin Create Campaign Button */}
                {currentUser?.isAdmin && (
                  <Link
                    href="/campaigns/create"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-green-400/30 bg-green-600/20 text-green-200 hover:bg-green-600/30"
                    >
                      <Plus className="mr-3 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </Link>
                )}

                {/* Admin Settings Button */}
                {currentUser?.isAdmin && (
                  <Link
                    href="/admin/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Admin Settings
                    </Button>
                  </Link>
                )}

                {/* User Info */}
                {user && (
                  <div className="border-t border-white/20 pt-4">
                    <div className="mb-3 flex items-center space-x-3">
                      <img
                        src={
                          user.user_metadata?.avatar_url ||
                          "/default-avatar.png"
                        }
                        alt="Profile"
                        className="h-8 w-8 rounded-full border border-white/20"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {currentUser?.displayName ||
                            user.user_metadata?.full_name ||
                            user.email}
                        </div>
                        {currentUser?.isAdmin && (
                          <Badge variant="glassBlue" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

