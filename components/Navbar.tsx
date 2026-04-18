"use client";

/**
 * Main navigation bar — adapts based on auth state and user type.
 *
 * Navigation links are right-aligned alongside the profile avatar.
 * "Browse Requests" is only visible to dealers.
 * Profile avatar dropdown:
 *   - Logged out → Login, Sign Up
 *   - Logged in  → Profile, Log Out
 */

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Search,
  UserPlus,
  UserCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile } from "@/lib/api";

// Shared easing curve — matches the rest of the app's motion language
// (see components/motion.tsx) so the navbar feels consistent.
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// --- Mobile menu animation variants ---
// The container fades + slides down, and its children stagger in
// sequentially for a polished reveal instead of everything popping at once.
const mobileMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    transition: {
      // On exit, collapse height first while fading — feels snappier.
      height: { duration: 0.25, ease: EASE_OUT },
      opacity: { duration: 0.15, ease: EASE_OUT },
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { duration: 0.3, ease: EASE_OUT },
      opacity: { duration: 0.2, ease: EASE_OUT },
      when: "beforeChildren",
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const mobileLinkVariants: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
};

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  // Track whether the logged-in user is a dealer (needed to show "Browse Requests")
  const [isDealer, setIsDealer] = useState(false);

  /**
   * Fetch the user's profile to determine their user_type.
   * Only dealers should see the "Browse Requests" link.
   */
  useEffect(() => {
    if (!user) {
      setIsDealer(false);
      return;
    }

    getUserProfile()
      .then((profile) => setIsDealer(profile.user_type === "dealer"))
      .catch(() => setIsDealer(false));
  }, [user]);

  /** Sign out and redirect to the landing page. */
  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    router.push("/");
  };

  /**
   * Derive the user's initials from their email for the avatar fallback.
   * Falls back to a generic icon if no email is available.
   */
  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* --- Logo / Home --- */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/automatcher_logo.svg"
            alt="AutoMatcher logo"
            width={52}
            height={24}
            className="h-6 w-auto"
          />
          <span className="text-xl font-bold tracking-tight text-blue-600">AutoMatcher</span>
        </Link>

        {/* --- Right side: nav links + profile dropdown + mobile hamburger --- */}
        <div className="flex items-center gap-1">
          {/* Desktop nav links — right-aligned next to profile */}
          <div className="hidden items-center gap-0.5 md:flex">
            {/* Authenticated-only links — primary actions first */}
            {!isLoading && user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-gray-500 hover:text-blue-600 hover:bg-blue-50/80 font-medium"
                >
                  <Link href="/dashboard" className="flex items-center gap-1.5">
                    <LayoutDashboard className="size-3.5" />
                    Dashboard
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-gray-500 hover:text-blue-600 hover:bg-blue-50/80 font-medium"
                >
                  <Link href="/requests/create" className="flex items-center gap-1.5">
                    <Search className="size-3.5" />
                    Find a Car
                  </Link>
                </Button>

                {/* Browse Requests — dealer-only link */}
                {isDealer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-gray-500 hover:text-blue-600 hover:bg-blue-50/80 font-medium"
                  >
                    <Link href="/requests" className="flex items-center gap-1.5">
                      <ClipboardList className="size-3.5" />
                      Browse Requests
                    </Link>
                  </Button>
                )}
              </>
            )}

            {/* Help — always visible, pushed to the end as a utility link */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50/80 font-medium"
            >
              <Link href="/help" className="flex items-center gap-1.5">
                <HelpCircle className="size-3.5" />
                Help
              </Link>
            </Button>
          </div>

          {/* Separator between nav links and profile — desktop only */}
          {!isLoading && user && (
            <div className="hidden md:block mx-1.5 h-5 w-px bg-gray-200" />
          )}

          {/* Profile avatar dropdown — visible on all screen sizes */}
          {!isLoading && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative size-9 rounded-full p-0 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Account menu"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-semibold">
                      {userInitials ?? <UserCircle className="size-5 text-blue-500" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                {/* ── Logged-in dropdown ── */}
                {user ? (
                  <>
                    {/* Show the user's email at the top for context */}
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => router.push("/profile")}
                      >
                        <UserCircle className="mr-2 size-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer md:hidden"
                        onClick={() => router.push("/dashboard")}
                      >
                        <LayoutDashboard className="mr-2 size-4" />
                        Dashboard
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 size-4" />
                      Log Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  /* ── Logged-out dropdown ── */
                  <>
                    <DropdownMenuLabel className="font-normal text-gray-500">
                      Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push("/login")}
                    >
                      <LogIn className="mr-2 size-4" />
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push("/signup")}
                    >
                      <UserPlus className="mr-2 size-4" />
                      Sign Up
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile hamburger toggle — animates between menu/X icons */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-600 relative overflow-hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {/* AnimatePresence swaps the icon with a rotate + fade for a tactile feel */}
            <AnimatePresence initial={false} mode="wait">
              {mobileOpen ? (
                <motion.span
                  key="close-icon"
                  initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="flex items-center justify-center"
                >
                  <X className="size-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu-icon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, ease: EASE_OUT }}
                  className="flex items-center justify-center"
                >
                  <Menu className="size-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* --- Mobile slide-down menu (navigation links only) ---
          AnimatePresence handles a graceful exit when the user closes the menu.
          overflow-hidden on the container lets the height animation look clean. */}
      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="border-t border-blue-100 bg-white md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              {/* Authenticated-only navigation links — primary actions first */}
              {!isLoading && user && (
                <>
                  <motion.div variants={mobileLinkVariants} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </Link>
                  </motion.div>

                  <motion.div variants={mobileLinkVariants} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/requests/create"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Search className="size-4" />
                      Find a Car
                    </Link>
                  </motion.div>

                  {/* Browse Requests — dealer-only link */}
                  {isDealer && (
                    <motion.div variants={mobileLinkVariants} whileTap={{ scale: 0.97 }}>
                      <Link
                        href="/requests"
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <ClipboardList className="size-4" />
                        Browse Requests
                      </Link>
                    </motion.div>
                  )}
                </>
              )}

              {/* Help — always visible, last in the list */}
              <motion.div variants={mobileLinkVariants} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/help"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <HelpCircle className="size-4" />
                  Help
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
