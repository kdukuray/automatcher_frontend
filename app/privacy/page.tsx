import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Cookie,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

/**
 * Privacy Policy page — outlines how AutoMatcher collects, uses, stores,
 * and protects user data. Covers both buyers and dealers, and provides
 * transparency about data practices. Styled consistently with the help page.
 */
export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-blue-800">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-blue-500/20" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-blue-400/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn direction="up" duration={0.6}>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your privacy{" "}
                <span className="text-blue-200">matters to us.</span>
              </h1>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                AutoMatcher is built with privacy at its core. We believe
                you should always know what data we collect, how we use
                it, and how we protect it.
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

      {/* --- Privacy at a Glance --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Privacy at a glance
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Here are the key principles that guide how we handle your
                data.
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
                icon: <ShieldCheck className="size-5" />,
                title: "No data selling",
                description:
                  "We never sell your personal information to third parties. Your data is used only to power AutoMatcher's matching engine.",
              },
              {
                icon: <Lock className="size-5" />,
                title: "You control your info",
                description:
                  "Your contact details are never publicly visible. Dealers only receive your information if you accept their offer and choose to share it.",
              },
              {
                icon: <Eye className="size-5" />,
                title: "Transparent collection",
                description:
                  "We only collect what's necessary to match buyers with dealers. No hidden tracking, no unnecessary data harvesting.",
              },
              {
                icon: <Database className="size-5" />,
                title: "Secure storage",
                description:
                  "All data is encrypted at rest and in transit. We use industry-standard security practices to protect your information.",
              },
              {
                icon: <UserCheck className="size-5" />,
                title: "Your control",
                description:
                  "You can view, update, or delete your personal data at any time through your account settings.",
              },
              {
                icon: <Cookie className="size-5" />,
                title: "Minimal cookies",
                description:
                  "We use only essential cookies for authentication and session management. No invasive ad tracking cookies.",
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
                Full privacy policy
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                A detailed breakdown of our data practices and your
                rights.
              </p>
            </div>
          </FadeIn>

          {/* Policy sections rendered as cards */}
          <div className="space-y-8">
            {/* --- Section 1: Information We Collect --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    1. Information we collect
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    When you create an account, we collect your name, email
                    address, phone number, and account type (buyer or
                    dealer). If you sign up as a dealer, we also collect
                    your dealership name and business information.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Match requests:
                    </span>{" "}
                    When buyers submit requests, we collect vehicle
                    preferences including make, model, year range, budget,
                    mileage preferences, and any additional requirements.
                    This data powers our matching engine.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Inventory data:
                    </span>{" "}
                    When dealers list vehicles, we collect vehicle details
                    such as make, model, year, mileage, price, condition,
                    VIN, and photos.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Usage data:
                    </span>{" "}
                    We automatically collect basic usage information such
                    as pages visited, actions taken, browser type, and IP
                    address to improve our service and troubleshoot issues.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 2: How We Use Your Information --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Database className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    2. How we use your information
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>We use the information we collect to:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "Match buyer requests with relevant dealer inventory",
                      "Facilitate communication between matched buyers and dealers",
                      "Send notifications about new matches, offers, and updates",
                      "Improve our matching algorithms and overall user experience",
                      "Maintain account security and prevent fraudulent activity",
                      "Provide customer support and respond to inquiries",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>
                    We do <span className="font-semibold text-gray-900">not</span>{" "}
                    use your data for targeted advertising or sell it to
                    third-party advertisers.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 3: Information Sharing --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Shield className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    3. Information sharing
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-900">
                      Between users:
                    </span>{" "}
                    Buyer contact information is only shared with a dealer
                    when the buyer explicitly accepts that dealer&apos;s
                    offer. Dealers cannot browse or access buyer contact
                    details — sharing is entirely in the buyer&apos;s
                    control.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      With service providers:
                    </span>{" "}
                    We may share limited data with trusted service
                    providers who help us operate our platform (e.g.,
                    hosting, email delivery). These providers are
                    contractually obligated to protect your data.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Legal requirements:
                    </span>{" "}
                    We may disclose information when required by law, such
                    as in response to a court order, subpoena, or other
                    legal process.
                  </p>
                  <p>
                    We will{" "}
                    <span className="font-semibold text-gray-900">
                      never
                    </span>{" "}
                    sell, rent, or trade your personal information to third
                    parties for their marketing purposes.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 4: Data Security --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Lock className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    4. Data security
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    We take the security of your data seriously. All data
                    transmitted between your browser and our servers is
                    encrypted using TLS (Transport Layer Security). Data
                    stored on our servers is encrypted at rest.
                  </p>
                  <p>
                    We implement access controls to ensure that only
                    authorized personnel can access user data, and we
                    regularly review our security practices to stay ahead
                    of emerging threats.
                  </p>
                  <p>
                    While no system is 100% secure, we are committed to
                    protecting your information using commercially
                    reasonable security measures and industry best
                    practices.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 5: Your Rights --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <UserCheck className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    5. Your rights
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>You have the right to:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "Access the personal data we hold about you",
                      "Request correction of inaccurate information",
                      "Request deletion of your account and associated data",
                      "Opt out of non-essential communications",
                      "Export your data in a portable format",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>
                    To exercise any of these rights, please contact us at{" "}
                    <span className="font-medium text-blue-600">
                      privacy@automatcher.co
                    </span>{" "}
                    or visit your account settings. We will respond to all
                    legitimate requests within 30 days.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 6: Cookies --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Cookie className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    6. Cookies and tracking
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    AutoMatcher uses only essential cookies required for
                    the platform to function properly. These include:
                  </p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "Authentication cookies to keep you logged in",
                      "Session cookies for security and functionality",
                      "Preference cookies to remember your settings",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>
                    We do{" "}
                    <span className="font-semibold text-gray-900">not</span>{" "}
                    use third-party advertising cookies, tracking pixels,
                    or invasive analytics tools. We respect your privacy
                    and keep tracking to an absolute minimum.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 7: Changes to Policy --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Mail className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    7. Changes to this policy
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    We may update this privacy policy from time to time to
                    reflect changes in our practices or for legal,
                    operational, or regulatory reasons. When we make
                    material changes, we will notify you via email or a
                    prominent notice on the platform.
                  </p>
                  <p>
                    We encourage you to review this page periodically to
                    stay informed about how we protect your data.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Questions about your privacy?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              We&apos;re happy to answer any questions about how we handle
              your data. Reach out to our privacy team anytime.
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
