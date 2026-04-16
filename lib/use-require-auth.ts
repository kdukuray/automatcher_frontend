"use client";

/**
 * Hook that enforces authentication on a page.
 *
 * If the user is not logged in once the auth state finishes loading,
 * they are redirected to /login?next=<current_path>. The page should
 * show a loading spinner while isReady is false.
 *
 * Usage:
 *   const { isReady } = useRequireAuth();
 *   if (!isReady) return <LoadingSpinner />;
 */

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-context";

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until auth state is resolved before redirecting
    if (!isLoading && !user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, router, pathname]);

  return {
    /** True when auth is loaded AND user is authenticated */
    isReady: !isLoading && !!user,
    user,
  };
}
