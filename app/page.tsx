import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Search, CarFront, Handshake, ShieldCheck, ArrowRight } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-blue-800">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-blue-500/20" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-blue-400/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <FadeIn direction="up" duration={0.6}>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find Your Perfect Car,{" "}
                <span className="text-blue-200">Effortlessly</span>
              </h1>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                Tell us exactly what you&apos;re looking for — make, model, specs, and budget — and
                we&apos;ll match you with dealers who have the car you want.
              </p>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.3}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg shadow-blue-900/20 w-full sm:w-auto text-center"
                >
                  <Link href="/requests/create">
                    Find a Car
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-blue-300 text-white hover:bg-blue-600 hover:text-white bg-transparent w-full sm:w-auto text-center"
                >
                  <Link href="/help">Learn More</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Three simple steps to find the car you&apos;ve been searching for.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer viewOnce className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3" delay={0.1}>
            {/* Step 1 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Search className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  1. Tell Us What You Want
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Submit a request with the exact make, model, year, mileage, color, and any other
                  specifications you need.
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
                  2. Get Matched with Dealers
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Our system matches your request with verified dealers who have vehicles that
                  meet your criteria.
                </p>
              </div>
            </StaggerItem>

            {/* Step 3 */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CarFront className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  3. Drive Away Happy
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Review offers from dealers, compare prices, and close the deal — all through
                  one simple platform.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Features / Value Props */}
      <section className="bg-blue-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <FadeIn viewOnce direction="left" distance={30}>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Why Choose AutoMatcher?
                </h2>
                <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                  We take the stress out of car shopping by connecting you directly with dealers
                  who have exactly what you need.
                </p>

                <ul className="mt-8 space-y-5">
                  <li className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <ShieldCheck className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Verified Dealers Only</h4>
                      <p className="text-sm text-gray-500">
                        Every dealer on our platform is vetted so you can shop with confidence.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Search className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Precision Matching</h4>
                      <p className="text-sm text-gray-500">
                        Our algorithm surfaces only the most relevant matches for your exact specs.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <Handshake className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">No Haggling</h4>
                      <p className="text-sm text-gray-500">
                        Dealers compete for your business, giving you the best price upfront.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </FadeIn>

            {/* Isometric dealer illustration */}
            <FadeIn viewOnce direction="right" distance={30} delay={0.15}>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-lg">
                  <Image
                    src="/isometric_dealer.png"
                    alt="Isometric illustration of a car dealership"
                    width={800}
                    height={800}
                    className="h-auto w-full object-cover"
                    priority={false}
                  />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Find Your Next Car?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Submit your first request for free and get matched with dealers today.
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg shadow-blue-900/30 w-full sm:w-auto"
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
