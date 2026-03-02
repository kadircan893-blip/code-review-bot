"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GitPullRequest,
  Star,
  Settings,
  BrainCircuit,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/repositories", icon: GitPullRequest, label: "Repositories" },
  { href: "/reviews", icon: Star, label: "Reviews" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="hidden lg:flex flex-col h-screen bg-[#0f0f12] border-r border-white/5 fixed left-0 top-0 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/5", collapsed && "justify-center")}>
        <div className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25">
          <BrainCircuit className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-white whitespace-nowrap"
          >
            Code Review Bot
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                collapsed && "justify-center",
                isActive
                  ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 text-white border border-violet-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-violet-400" : "group-hover:text-white"
                )}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        {session?.user && (
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2",
              collapsed && "justify-center"
            )}
          >
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {session.user.name?.[0] ?? "U"}
                </span>
              </div>
            )}
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white text-sm font-medium truncate">
                  {session.user.name ?? "User"}
                </p>
                <p className="text-zinc-500 text-xs truncate">
                  {session.user.email}
                </p>
              </motion.div>
            )}
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm"
            >
              Sign out
            </motion.span>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 -right-3 h-6 w-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  );
}
