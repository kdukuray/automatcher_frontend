"use client";

/**
 * Dashboard page — displays the appropriate dashboard based on the user's
 * profile user_type (buyer or dealer).
 *
 * Fetches the user's profile from Django on mount. If the user is not
 * authenticated, redirects to /login. The dashboard shown is determined
 * entirely by the user's profile user_type — there is no toggle.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BuyerDashboard from "@/components/BuyerDashboard";
import DealerDashboard from "@/components/DealerDashboard";
import { useAuth } from "@/lib/auth-context";
import { getUserProfile } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { FadeIn } from "@/components/motion";

// --- User type as returned by the profile endpoint ---
type UserType = "buyer" | "dealer";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // The user's role from their profile — determines which dashboard to render
  const [userType, setUserType] = useState<UserType | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // --- Redirect if not authenticated ---
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/dashboard");
    }
  }, [authLoading, user, router]);

  // --- Fetch user profile to determine which dashboard to show ---
  useEffect(() => {
    if (!user) return;

    getUserProfile()
      .then((profile) => {
        setUserType(profile.user_type);
        setProfileLoading(false);
      })
      .catch(() => {
        // Fallback to buyer dashboard if profile fetch fails
        setUserType("buyer");
        setProfileLoading(false);
      });
  }, [user]);

  // --- Loading state while checking auth + fetching profile ---
  if (authLoading || profileLoading || !userType) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* --- Top Bar --- */}
      <FadeIn direction="none" duration={0.3}>
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Dashboard
            </h1>

            {/* Role badge — shows the user's account type */}
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {userType === "dealer" ? "Dealer" : "Buyer"}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* --- Dashboard Content Area --- */}
      <FadeIn direction="up" duration={0.4} delay={0.1}>
        {userType === "dealer" ? <DealerDashboard /> : <BuyerDashboard />}
      </FadeIn>
    </main>
  );
}
