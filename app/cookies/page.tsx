import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Clock,
  Cookie,
  FileText,
  Globe,
  Lock,
  Mail,
  Settings,
  Shield,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

/**
 * Cookie Policy page — explains what cookies AutoMatcher uses, why they are
 * needed, how users can manage them, and what third-party cookies (if any)
 * are present. Styled consistently with the Privacy Policy and Terms pages.
 */
export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-blue-500/20" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-blue-400/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn direction="up" duration={0.6}>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Cookie{" "}
                <span className="text-blue-200">Policy</span>
              </h1>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                AutoMatcher uses a minimal set of cookies to keep you logged
                in and the platform running smoothly. No invasive tracking,
                no ad cookies, no surprises.
              </p>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.3}>
              <p className="mt-4 text-sm text-blue-200">
                Last updated: February 15, 2026
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Cookie Overview Cards --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our approach to cookies
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                We believe in transparency. Here&apos;s exactly how and why
                we use cookies.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer
            viewOnce
            className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            delay={0.1}
          >
            {[
              {
                icon: <Lock className="size-5" />,
                title: "Essential only",
                description:
                  "We only use cookies that are strictly necessary for the platform to function. No optional tracking or advertising cookies.",
              },
              {
                icon: <Shield className="size-5" />,
                title: "No ad tracking",
                description:
                  "AutoMatcher does not use third-party advertising cookies, tracking pixels, or retargeting scripts of any kind.",
              },
              {
                icon: <Cookie className="size-5" />,
                title: "Minimal footprint",
                description:
                  "We keep our cookie usage to the absolute minimum required for authentication, security, and basic functionality.",
              },
              {
                icon: <Clock className="size-5" />,
                title: "Short-lived sessions",
                description:
                  "Session cookies expire when you close your browser. Persistent cookies are set with reasonable expiration periods.",
              },
              {
                icon: <Globe className="size-5" />,
                title: "No cross-site tracking",
                description:
                  "We do not track your activity across other websites. Our cookies only work within the AutoMatcher platform.",
              },
              {
                icon: <Settings className="size-5" />,
                title: "You have control",
                description:
                  "You can manage or delete cookies through your browser settings at any time, though some features may not work without them.",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <div className="h-full rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* --- Detailed Policy Sections --- */}
      <section className="bg-blue-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Full cookie policy
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                A detailed breakdown of the cookies we use and your options
                for managing them.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-8">
            {/* --- Section 1: What Are Cookies --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Cookie className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    1. What are cookies?
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    Cookies are small text files that websites place on your
                    device (computer, phone, or tablet) when you visit them.
                    They are widely used to make websites work efficiently, to
                    remember your preferences, and to provide information to
                    the site owners.
                  </p>
                  <p>
                    Cookies can be &ldquo;session&rdquo; cookies, which are
                    deleted when you close your browser, or
                    &ldquo;persistent&rdquo; cookies, which remain on your
                    device for a set period or until you manually delete them.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 2: Cookies We Use --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    2. Cookies we use
                  </h3>
                </div>
                <div className="mt-6 space-y-6 text-sm leading-relaxed text-gray-600">
                  <p>
                    AutoMatcher uses the following categories of cookies, all
                    of which are strictly essential for platform operation:
                  </p>

                  {/* Authentication cookies */}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Authentication cookies
                    </h4>
                    <p className="mt-1">
                      These cookies are set when you log in and allow the
                      platform to recognize your session. Without them, you
                      would need to log in on every page visit. They include
                      secure tokens managed by our authentication provider
                      (Supabase) and are encrypted in transit.
                    </p>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        <span>
                          <span className="font-medium text-gray-900">Type:</span>{" "}
                          Persistent (refreshed on each login)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        <span>
                          <span className="font-medium text-gray-900">Duration:</span>{" "}
                          Up to 7 days (or until you log out)
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Session cookies */}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Session cookies
                    </h4>
                    <p className="mt-1">
                      Temporary cookies that maintain your browsing state
                      within a single visit, such as keeping track of form
                      progress or page navigation context. These are deleted
                      automatically when you close your browser.
                    </p>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        <span>
                          <span className="font-medium text-gray-900">Type:</span>{" "}
                          Session
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        <span>
                          <span className="font-medium text-gray-900">Duration:</span>{" "}
                          Until browser is closed
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Security cookies */}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Security cookies
                    </h4>
                    <p className="mt-1">
                      These cookies help protect against cross-site request
                      forgery (CSRF) and other common web security threats.
                      They are essential for keeping your account and data
                      safe while using the platform.
                    </p>
                    <ul className="mt-2 space-y-1 ml-4">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        <span>
                          <span className="font-medium text-gray-900">Type:</span>{" "}
                          Persistent
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        <span>
                          <span className="font-medium text-gray-900">Duration:</span>{" "}
                          Up to 24 hours
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 3: Third-Party Cookies --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Globe className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    3. Third-party cookies
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    AutoMatcher does{" "}
                    <span className="font-semibold text-gray-900">not</span>{" "}
                    use third-party advertising, analytics, or social media
                    tracking cookies.
                  </p>
                  <p>
                    Our authentication provider (Supabase) may set cookies
                    required for the login and session management flow. These
                    are strictly functional and are not used for advertising or
                    cross-site tracking purposes.
                  </p>
                  <p>
                    We do not embed third-party widgets, share buttons, or
                    tracking scripts that would set cookies on your device.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 4: Managing Cookies --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Settings className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    4. Managing your cookies
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    Most web browsers allow you to control cookies through
                    their settings. You can typically:
                  </p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "View what cookies are stored on your device",
                      "Delete individual cookies or clear all cookies",
                      "Block cookies from specific sites or all sites",
                      "Set your browser to notify you when a cookie is being set",
                      "Configure your browser to reject third-party cookies while allowing first-party ones",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Please note:
                    </span>{" "}
                    If you block or delete essential cookies, some parts of
                    AutoMatcher may not function properly. You may be unable to
                    log in, maintain your session, or use features that require
                    authentication.
                  </p>
                  <p>
                    For instructions on managing cookies in your specific
                    browser, visit your browser&apos;s help documentation or
                    settings page.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 5: Do Not Track --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Shield className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    5. Do Not Track signals
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    Some browsers send a &ldquo;Do Not Track&rdquo; (DNT)
                    signal to websites. Because AutoMatcher does not engage in
                    cross-site tracking or serve targeted advertising, our
                    platform already operates in a manner consistent with DNT
                    principles regardless of whether you have DNT enabled.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 6: Changes to Policy --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Mail className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    6. Changes to this policy
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    We may update this Cookie Policy from time to time to
                    reflect changes in technology, regulation, or our data
                    practices. When we make material changes, we will update
                    the &ldquo;Last updated&rdquo; date at the top of this page
                    and, where appropriate, notify you via email or a platform
                    notice.
                  </p>
                  <p>
                    We encourage you to review this page periodically to stay
                    informed about how we use cookies.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Related Policies Section --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Related policies
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Learn more about how AutoMatcher protects your data and the
                rules governing platform use.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer
            viewOnce
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-2xl mx-auto"
            delay={0.1}
          >
            <StaggerItem>
              <Link
                href="/privacy"
                className="group block h-full rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Lock className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  Privacy Policy
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  How we collect, use, store, and protect your personal
                  information.
                </p>
              </Link>
            </StaggerItem>
            <StaggerItem>
              <Link
                href="/terms"
                className="group block h-full rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  Terms of Service
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  The rules and obligations governing your use of the
                  AutoMatcher platform.
                </p>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Questions about our cookie practices?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              We&apos;re committed to transparency. If anything is unclear,
              don&apos;t hesitate to reach out.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg shadow-blue-900/30 w-full sm:w-auto"
              >
                <Link href="/contact#contact-form">
                  Contact Us
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-blue-300 text-white hover:bg-blue-500 hover:text-white bg-transparent w-full sm:w-auto"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
