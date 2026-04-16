"use client";

/**
 * Login page — supports email/password and Google OAuth.
 *
 * After successful login the user is redirected to /dashboard (or to a
 * ?next= URL if present in the query string).
 *
 * If the user's email hasn't been verified, a "Resend verification"
 * option is shown.
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Car, Loader2, Mail } from "lucide-react";
import { ScaleIn } from "@/components/motion";

/**
 * Inner component that actually reads `useSearchParams()`.
 *
 * Next.js requires any component that calls `useSearchParams()` to be
 * rendered inside a <Suspense> boundary so that static pre-rendering can
 * bail out to client-side rendering for the search-param-dependent subtree.
 * Without this, `next build` fails with a "missing-suspense-with-csr-bailout"
 * error on pages that would otherwise be statically generated.
 */
function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // If already logged in, redirect away.
  // Must be in useEffect to avoid calling router.replace() during render,
  // which would trigger a setState on Router while LoginPage is rendering.
  useEffect(() => {
    if (user) {
      const next = searchParams.get("next") ?? "/dashboard";
      router.replace(next);
    }
  }, [user, searchParams, router]);

  // --- Form state ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  /** Where to redirect after login */
  const redirectTo = searchParams.get("next") ?? "/dashboard";

  // --- Email / Password login ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowResendVerification(false);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      // Supabase returns this when the email is not yet confirmed
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError("Your email address has not been verified.");
        setShowResendVerification(true);
        return;
      }
      setError(signInError.message);
      return;
    }

    // Successful login — redirect
    router.push(redirectTo);
  };

  // --- Google OAuth login ---
  const handleGoogleLogin = async () => {
    setError(null);
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectTo}`,
      },
    });

    if (oAuthError) {
      setError(oAuthError.message);
    }
    // User will be redirected to Google; no further action needed here
  };

  // --- Resend verification email ---
  const handleResendVerification = async () => {
    setResendSuccess(false);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setResendSuccess(true);
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <ScaleIn className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Car className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your AutoMatcher account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* --- Google OAuth Button --- */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            type="button"
          >
            {/* Google icon (inline SVG for simplicity) */}
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          {/* --- Divider --- */}
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
              or
            </span>
          </div>

          {/* --- Email / Password Form --- */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            {/* --- Error / Verification Messages --- */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {showResendVerification && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleResendVerification}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend verification email
                </Button>
                {resendSuccess && (
                  <p className="text-center text-xs text-green-600">
                    Verification email sent! Check your inbox.
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* --- Sign-up link --- */}
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
      </ScaleIn>
    </main>
  );
}

/**
 * Default export wraps the inner component in a Suspense boundary so that
 * `useSearchParams()` works during static generation / production build.
 *
 * The fallback is intentionally minimal because the inner component renders
 * its own skeleton/loading UI almost immediately on the client.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
