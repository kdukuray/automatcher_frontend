import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  FileText,
  Handshake,
  Lock,
  Search,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

/**
 * Help / About page — explains what AutoMatcher is, how it works for both
 * buyers and dealers, and how trust & safety are handled. Copy is kept tight
 * and focused so visitors can grasp the value prop quickly.
 */
export default function HelpPage() {
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
                Stop searching for cars.{" "}
                <span className="text-blue-200">Let the right one find you.</span>
              </h1>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                AutoMatcher flips the car-buying process. You post exactly what
                you&apos;re looking for, and only dealers who actually have
                that car get in touch.
              </p>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.3}>
              <div className="mt-10 flex justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg shadow-blue-900/20 px-8"
                >
                  <Link href="/requests/create">
                    Find a Car
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- What AutoMatcher Really Is --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                This isn&apos;t another listing site.
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Most car sites make you scroll through thousands of listings
                hoping to find a match. AutoMatcher works the other way around:
                you tell us what you want, and dealers who can deliver come to
                you.
              </p>
            </div>
          </FadeIn>

          {/* Traditional vs AutoMatcher comparison */}
          <StaggerContainer viewOnce className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2" delay={0.1}>
            {/* Traditional model */}
            <StaggerItem direction="left" distance={30}>
              <div className="h-full rounded-2xl border border-gray-200 bg-gray-50 p-8">
                <h3 className="text-lg font-semibold text-gray-400">
                  Traditional Marketplaces
                </h3>
                <ul className="mt-6 space-y-4">
                  {[
                    "Buyers spend hours scrolling through endless listings",
                    "Dealers compete by racing to the bottom on price",
                    "Spam calls, ghosting, and bait-and-switch are the norm",
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

            {/* AutoMatcher model */}
            <StaggerItem direction="right" distance={30}>
              <div className="h-full rounded-2xl border border-blue-200 bg-blue-50/60 p-8 ring-2 ring-blue-500/20">
                <h3 className="text-lg font-semibold text-blue-700">
                  The AutoMatcher Way
                </h3>
                <ul className="mt-6 space-y-4">
                  {[
                    "Buyers post exactly the car they're looking for",
                    "Only dealers who have that car can reach out",
                    "Buyers stay in control of their contact information",
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
          </StaggerContainer>
        </div>
      </section>

      {/* --- Key Insight Callout --- */}
      <section className="bg-blue-700 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Target className="mx-auto size-10 text-blue-200" />
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Intent is more valuable than inventory.
            </h2>
            <p className="mt-4 text-lg text-blue-100 leading-relaxed">
              A buyer who knows exactly what they want is worth
              far more than a thousand random listings. AutoMatcher turns that
              intent into a direct connection with the right dealer.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* --- How It Works (Buyers) --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How it works for Buyers
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Three simple steps — no endless browsing required.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer viewOnce className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3" delay={0.1}>
            {/* Step 1 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  1. Post your request
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Tell us the exact car you want — make, model, year range,
                  budget, and any must-haves. It takes a few minutes and
                  there&apos;s no obligation to buy.
                </p>
              </div>
            </StaggerItem>

            {/* Step 2 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Handshake className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  2. Dealers come to you
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Verified dealers who actually have a matching car send you
                  an offer. No spam calls, no irrelevant pitches, no
                  bait-and-switch.
                </p>
              </div>
            </StaggerItem>

            {/* Step 3 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Zap className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  3. Pick the best offer
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Compare offers side by side, choose the dealer you want to
                  work with, and close the deal on your terms.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- How It Works (Dealers) --- */}
      <section className="bg-blue-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How it works for Dealers
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Stop chasing cold leads. Start closing real, structured
                demand.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer viewOnce className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3" delay={0.1}>
            {/* Step 1 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Eye className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  See live buyer demand
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Browse real, structured requests from verified buyers who
                  are actively looking to buy — updated in real time.
                </p>
              </div>
            </StaggerItem>

            {/* Step 2 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Respond when you match
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Only reach out when you actually have the car or can source
                  it quickly. No wasted outreach, no competing on price
                  alone.
                </p>
              </div>
            </StaggerItem>

            {/* Step 3 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Lock className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Close with serious buyers
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  When a buyer accepts your offer, they share their contact
                  info with you directly. That means every conversation is
                  with someone genuinely ready to buy.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- Trust & Safety --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Built to protect your time and privacy
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                AutoMatcher is designed so serious buyers and serious dealers
                can find each other without the usual noise and risk.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer viewOnce className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" delay={0.1}>
            {[
              {
                icon: <ShieldCheck className="size-5" />,
                title: "Verified accounts",
                description:
                  "Every buyer and dealer is verified before they can send or receive offers, so you always know you're dealing with real people.",
              },
              {
                icon: <Lock className="size-5" />,
                title: "You control your info",
                description:
                  "Your phone number and email stay private until you accept an offer. Nothing is ever listed publicly or sold to third parties.",
              },
              {
                icon: <Zap className="size-5" />,
                title: "No spam incentives",
                description:
                  "Because dealers pay to access real buyer demand, only serious ones ever reach out. That means no cold calls and no mass marketing.",
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

      {/* --- CTA Section --- */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to find your next car?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Post your first request and get matched with dealers who have
              exactly what you&apos;re looking for.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg shadow-blue-900/30 px-8"
              >
                <Link href="/requests/create">
                  Get Started
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
