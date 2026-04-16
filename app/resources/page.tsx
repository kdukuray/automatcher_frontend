import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Car,
  CheckCircle,
  FileText,
  Handshake,
  HelpCircle,
  Megaphone,
  Search,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

/**
 * Dealer Resources page — a knowledge hub for dealers using AutoMatcher.
 * Covers best practices, tips for crafting effective offers, inventory
 * management guidance, and links to other helpful pages. Styled
 * consistently with the help/about page.
 */
export default function ResourcesPage() {
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
                Dealer{" "}
                <span className="text-blue-200">Resource Center</span>
              </h1>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                Everything you need to succeed on AutoMatcher. Guides,
                best practices, and tips to help you close more deals
                and grow your business.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Getting Started Guide --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Getting started on AutoMatcher
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                New to the platform? Here&apos;s everything you need to
                know to hit the ground running.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer
            viewOnce
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
            delay={0.1}
          >
            {/* Step 1 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Set up your profile
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Complete your dealer profile with your business name,
                  location, and specialties. A complete profile builds
                  trust with buyers and improves your visibility.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Add a professional business name",
                    "Include your location and service area",
                    "Specify vehicle types you specialize in",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-gray-500"
                    >
                      <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>

            {/* Step 2 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Car className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Add your inventory
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  List your available vehicles with accurate details.
                  The more complete your listings, the more likely
                  buyers are to find exactly what they need.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Include detailed vehicle specifications",
                    "Add high-quality photos",
                    "Keep pricing and availability current",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-gray-500"
                    >
                      <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>

            {/* Step 3 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Start matching
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Browse buyer requests to find the best opportunities.
                  Send targeted offers to buyers who want exactly what
                  you have.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Review buyer requests regularly",
                    "Focus on requests that fit your inventory",
                    "Send personalized, detailed offers",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-gray-500"
                    >
                      <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- Best Practices --- */}
      <section className="bg-blue-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Best practices for success
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Top-performing dealers on AutoMatcher share these
                habits. Follow these tips to maximize your results.
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
                icon: <Zap className="size-5" />,
                title: "Respond quickly",
                description:
                  "Speed matters. Buyers often go with the first dealer who responds with a strong offer. Set up notifications so you never miss a matching request.",
              },
              {
                icon: <Target className="size-5" />,
                title: "Be specific in offers",
                description:
                  "Generic offers get ignored. Reference the buyer's exact requirements in your response. Show them you have exactly what they asked for.",
              },
              {
                icon: <BookOpen className="size-5" />,
                title: "Keep inventory updated",
                description:
                  "Stale listings hurt your credibility. Remove sold vehicles promptly and keep pricing accurate. Fresh inventory leads to better matches.",
              },
              {
                icon: <Handshake className="size-5" />,
                title: "Be transparent",
                description:
                  "Honesty builds trust. If a vehicle has minor issues, disclose them upfront. Buyers appreciate transparency and are more likely to close.",
              },
              {
                icon: <BarChart3 className="size-5" />,
                title: "Track your performance",
                description:
                  "Monitor which types of requests convert best for you. Use this data to refine your inventory strategy and focus on your strengths.",
              },
              {
                icon: <Megaphone className="size-5" />,
                title: "Communicate professionally",
                description:
                  "Clear, professional communication sets you apart. Respond to buyer questions promptly and keep them updated throughout the process.",
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

      {/* --- Crafting Great Offers --- */}
      <section className="bg-blue-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How to craft winning offers
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                The quality of your offer directly impacts your close
                rate. Here&apos;s what separates good offers from great
                ones.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer
            viewOnce
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2"
            delay={0.1}
          >
            {/* Do */}
            <StaggerItem direction="left" distance={30}>
              <div className="h-full rounded-2xl border border-blue-200 bg-blue-50/60 p-8 ring-2 ring-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-700">
                  What to do
                </h3>
                <ul className="mt-6 space-y-4">
                  {[
                    "Reference the buyer's specific requirements in your message",
                    "Include your asking price and any flexibility you have",
                    "Mention the vehicle's condition, history, and standout features",
                    "Be upfront about any differences from the buyer's request",
                    "Provide a clear next step (e.g., schedule a viewing)",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <CheckCircle className="mt-0.5 size-5 shrink-0 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>

            {/* Don't */}
            <StaggerItem direction="right" distance={30}>
              <div className="h-full rounded-2xl border border-gray-200 bg-gray-50 p-8">
                <h3 className="text-lg font-semibold text-gray-400">
                  What to avoid
                </h3>
                <ul className="mt-6 space-y-4">
                  {[
                    "Sending generic, copy-pasted offer messages",
                    "Hiding important details about the vehicle's condition",
                    "Pressuring the buyer with aggressive sales tactics",
                    "Offering a vehicle that doesn't match the request at all",
                    "Failing to follow up after initial contact",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-gray-500"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400 text-xs">
                        ✕
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- Quick Links --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Helpful links
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Quick access to everything you need.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer
            viewOnce
            className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            delay={0.1}
          >
            {[
              {
                icon: <Shield className="size-5" />,
                title: "Help Center",
                description:
                  "Answers to common questions about using AutoMatcher.",
                href: "/help",
              },
              {
                icon: <HelpCircle className="size-5" />,
                title: "Frequently Asked Questions",
                description:
                  "Quick answers to the most common questions from dealers and buyers.",
                href: "/faq",
              },
              {
                icon: <FileText className="size-5" />,
                title: "Privacy Policy",
                description:
                  "How we collect, use, and protect your data.",
                href: "/privacy",
              },
              {
                icon: <Target className="size-5" />,
                title: "Contact Support",
                description:
                  "Get in touch with our team for personalized help.",
                href: "/contact#contact-form",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <Link
                  href={item.href}
                  className="group block h-full rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                  <span className="mt-3 inline-flex items-center text-sm font-medium text-blue-600">
                    Learn more
                    <ArrowRight className="ml-1 size-3.5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to start selling smarter?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Put these resources into practice. Browse active buyer
              requests and make your first offer today.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg shadow-blue-900/30 w-full sm:w-auto"
              >
                <Link href="/requests">
                  Browse Requests
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-blue-300 text-white hover:bg-blue-500 hover:text-white bg-transparent w-full sm:w-auto"
              >
                <Link href="/faq">View FAQs</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
