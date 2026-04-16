import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  FileText,
  Gavel,
  Mail,
  Scale,
  Shield,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Link2,
  RefreshCw,
  Copyright,
  Globe,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

// MUST CHANGE LATER: Before launch, have a licensed attorney in your
// jurisdiction review these Terms of Service. The language below is a strong,
// industry-standard template designed to protect the site operator, but it
// is NOT a substitute for legal advice. Update the governing jurisdiction,
// entity name, registered address, and arbitration forum to match your
// actual business once formed (e.g., "AutoMatcher LLC, a Delaware limited
// liability company"). Also confirm compliance with the FTC CARS Rule,
// state dealer advertising laws, and any applicable consumer protection
// statutes in the states where you operate.

/**
 * Terms of Service page — the binding legal agreement governing every user's
 * access to and use of the AutoMatcher platform (automatcher.co). The copy
 * here is written to (a) clearly inform buyers and dealers of their rights
 * and duties, and (b) shield AutoMatcher and its operators from liability
 * arising out of transactions that occur between third parties who meet
 * through the platform. Section ordering and headings are kept aligned with
 * the Privacy Policy and Help pages for visual consistency.
 */
export default function TermsOfServicePage() {
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
                Terms of{" "}
                <span className="text-blue-200">Service</span>
              </h1>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                These Terms are a binding contract between you and AutoMatcher.
                They include a mandatory arbitration agreement and a waiver of
                the right to bring or participate in class actions. Please
                read them carefully before using the platform.
              </p>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.3}>
              <p className="mt-4 text-sm text-blue-200">
                Last updated: April 16, 2026 &middot; Effective upon first
                use of the platform
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Key Points at a Glance --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Key points at a glance
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                A summary of what you&apos;re agreeing to. The
                full legal terms below control in the event of any conflict
                with this summary.
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
                icon: <UserCheck className="size-5" />,
                title: "You must be 18+",
                description:
                  "You must be at least 18 years old (or the age of majority in your jurisdiction) and legally able to enter into a binding contract to use AutoMatcher.",
              },
              {
                icon: <ShieldCheck className="size-5" />,
                title: "Accurate information",
                description:
                  "All account details, vehicle requests, inventory listings, offers, and communications must be truthful, accurate, and kept up to date.",
              },
              {
                icon: <Gavel className="size-5" />,
                title: "Deals are between you",
                description:
                  "AutoMatcher is a neutral platform — not a dealer, broker, lender, or party to any transaction. Always do your own due diligence.",
              },
              {
                icon: <Scale className="size-5" />,
                title: "Arbitration & no class actions",
                description:
                  "Disputes are resolved through binding individual arbitration. You waive the right to a jury trial and to participate in any class action.",
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

      {/* --- Full Terms Sections --- */}
      <section className="bg-blue-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Full terms of service
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                The complete terms governing your use of AutoMatcher.
              </p>
            </div>
          </FadeIn>

          <div className="space-y-8">
            {/* --- Section 1: Acceptance of Terms --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    1. Acceptance of these terms
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    These Terms of Service, together with our{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                    ,{" "}
                    <Link href="/cookies" className="text-blue-600 hover:underline">
                      Cookie Policy
                    </Link>
                    , and any other policies or guidelines we post
                    (collectively, the &ldquo;Terms&rdquo;), form a legally
                    binding agreement between you (&ldquo;you,&rdquo;
                    &ldquo;user,&rdquo; &ldquo;buyer,&rdquo; or
                    &ldquo;dealer&rdquo;) and AutoMatcher, together with its
                    affiliates, officers, directors, employees, contractors,
                    agents, and licensors (collectively, &ldquo;AutoMatcher,&rdquo;
                    &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
                    governing your access to and use of the AutoMatcher website
                    at <span className="font-semibold">automatcher.co</span>,
                    any subdomains, mobile applications, APIs, and related
                    services (collectively, the &ldquo;Platform&rdquo;).
                  </p>
                  <p>
                    By creating an account, clicking &ldquo;I agree,&rdquo;
                    accessing any portion of the Platform, or otherwise using
                    the Platform in any way, you acknowledge that you have
                    read, understood, and agree to be bound by these Terms.{" "}
                    <span className="font-semibold text-gray-900">
                      If you do not agree to these Terms, you must not access
                      or use the Platform.
                    </span>
                  </p>
                  <p>
                    If you are entering into these Terms on behalf of a
                    company, dealership, or other legal entity, you represent
                    and warrant that you have full legal authority to bind that
                    entity to these Terms, in which case &ldquo;you&rdquo; will
                    refer to that entity.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 2: Definitions --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    2. Definitions
                  </h3>
                </div>
                <div className="mt-6 space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-900">&ldquo;Buyer&rdquo;</span>{" "}
                    means any user who submits a vehicle request or otherwise
                    uses the Platform to explore, evaluate, or pursue the
                    purchase, lease, or financing of a vehicle.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">&ldquo;Dealer&rdquo;</span>{" "}
                    means any user who registers as a seller of vehicles,
                    typically a licensed automobile dealership or its authorized
                    representatives, and who uses the Platform to list inventory
                    or submit offers.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">&ldquo;Request&rdquo;</span>{" "}
                    means a buyer-submitted description of a vehicle the buyer
                    is seeking, including specifications, preferences, and
                    budget.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">&ldquo;Offer&rdquo;</span>{" "}
                    means any proposal submitted by a Dealer in response to a
                    Request, including pricing, availability, financing terms,
                    and vehicle details.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">&ldquo;User Content&rdquo;</span>{" "}
                    means any text, images, data, or other materials that users
                    submit to, post on, or transmit through the Platform.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">&ldquo;Transaction&rdquo;</span>{" "}
                    means any purchase, sale, lease, trade, or financing
                    arrangement between a Buyer and a Dealer, whether
                    initiated, facilitated, or discussed through the Platform
                    or otherwise.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 3: Eligibility --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <UserCheck className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    3. Eligibility
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    You may use the Platform only if you: (a) are at least
                    eighteen (18) years old (or the age of majority in your
                    jurisdiction, if higher); (b) have the legal capacity to
                    form a binding contract with AutoMatcher; (c) are not
                    barred from receiving services under applicable United
                    States or other laws (including sanctions, export-control,
                    or anti-terrorism laws); and (d) have not been previously
                    suspended or removed from the Platform by AutoMatcher.
                  </p>
                  <p>
                    Dealers further represent and warrant that they hold, and
                    will continue to hold in good standing throughout their use
                    of the Platform, all licenses, registrations, bonds, and
                    permits required by applicable federal, state, and local
                    law to offer, advertise, sell, lease, broker, or finance
                    the vehicles they list.
                  </p>
                  <p>
                    AutoMatcher may, at its sole discretion, refuse service,
                    close accounts, or deny registration to any person or
                    entity for any reason not prohibited by law.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 4: Account Registration & Security --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Shield className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    4. Account registration and security
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    To access certain features, you must register an account
                    and provide information that is current, complete, and
                    accurate. You agree to promptly update your information to
                    keep it accurate at all times.
                  </p>
                  <p>
                    You are solely responsible for (a) safeguarding your
                    password and other credentials, (b) restricting access to
                    your device and account, and (c) all activities that occur
                    under your account, whether or not authorized by you. You
                    agree to notify AutoMatcher immediately of any unauthorized
                    access or security breach.
                  </p>
                  <p>
                    AutoMatcher is not liable for any loss, damage, or
                    liability arising from your failure to maintain the
                    security of your account. We may, but are not required to,
                    verify the identity or credentials of any user, including
                    through third-party verification services. Verification, if
                    performed, does not constitute an endorsement or guarantee
                    by AutoMatcher.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 5: Platform Role & Disclaimer --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Scale className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    5. Platform role &mdash; AutoMatcher is not a party to any transaction
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    AutoMatcher is a neutral technology platform that enables
                    Buyers and Dealers to communicate with one another.{" "}
                    <span className="font-semibold text-gray-900">
                      AutoMatcher is not a car dealer, broker, auctioneer,
                      lender, lessor, insurer, title agent, escrow agent,
                      inspector, mechanic, transporter, or party to any
                      Transaction.
                    </span>{" "}
                    All Transactions are conducted directly and exclusively
                    between the Buyer and the Dealer.
                  </p>
                  <p>
                    We do not own, inspect, appraise, certify, warrant, insure,
                    transport, or take possession of any vehicle listed or
                    offered through the Platform. We do not set vehicle prices,
                    determine financing terms, or participate in negotiations
                    between Buyers and Dealers.
                  </p>
                  <p>
                    We do not independently verify and do not guarantee the
                    accuracy, completeness, legality, safety, quality, title,
                    condition, history, mileage, or roadworthiness of any
                    vehicle, or the identity, licensing, solvency, honesty, or
                    trustworthiness of any user. Any verification badge,
                    rating, match score, or similar indicator is provided for
                    convenience only and is not a guarantee.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      You agree that you are solely responsible for evaluating
                      any user, vehicle, listing, offer, or Transaction, and
                      for performing your own independent due diligence
                      (including independent inspection, title and lien checks,
                      vehicle history reports, test drives, and verification
                      of all representations) before entering into any
                      Transaction.
                    </span>
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 6: Buyer Responsibilities --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    6. Buyer responsibilities
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>By using the Platform as a Buyer, you agree to:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "Submit Requests that reflect genuine purchase, lease, or financing intent",
                      "Provide accurate and truthful information about your budget, location, preferences, and any trade-in vehicle",
                      "Respond to Dealer Offers in good faith and communicate professionally",
                      "Not use the Platform to collect pricing intelligence or dealer information without bona fide intent to transact",
                      "Independently verify the condition, title, history, and all representations regarding any vehicle before completing any Transaction",
                      "Comply with all applicable laws, including laws regarding consumer financing, insurance, registration, and taxation, in connection with any Transaction",
                      "Acknowledge that AutoMatcher has no responsibility for the outcome, performance, or satisfaction of any Transaction",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 7: Dealer Responsibilities --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    7. Dealer responsibilities and warranties
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>By using the Platform as a Dealer, you represent, warrant, and agree to:</p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "Hold and maintain all required dealer licenses, surety bonds, sales tax permits, and registrations in good standing, and to provide documentation upon request",
                      "Comply at all times with applicable federal, state, and local laws, including (without limitation) the FTC Act, the FTC CARS Rule, the Truth in Lending Act, the Equal Credit Opportunity Act, the Magnuson-Moss Warranty Act, the Used Car Rule, Gramm-Leach-Bliley, state dealer advertising and lemon laws, and all motor-vehicle title, emissions, and odometer regulations",
                      "Submit only truthful, non-deceptive, and substantiated Offers, inventory listings, photos, pricing, and disclosures, and correct any inaccuracies promptly",
                      "Offer only vehicles that you currently own or can legally and verifiably obtain, with clear title unless clearly disclosed otherwise",
                      "Honor accepted Offers consistent with their disclosed terms and refrain from bait-and-switch, hidden fees, yo-yo financing, dealer add-ons without consent, or any deceptive or unfair practices",
                      "Use Buyer information only for the purpose of the specific Transaction and in compliance with the Privacy Policy and applicable privacy laws; not resell, rent, scrape, or repurpose Buyer data for marketing without explicit opt-in consent",
                      "Maintain appropriate commercial insurance, including garage liability and dealer open-lot coverage as required by your jurisdiction",
                      "Indemnify AutoMatcher for any claims arising out of your vehicles, your business practices, or your failure to comply with law (as further described in Section 17)",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>
                    AutoMatcher may, at any time and without notice, remove
                    listings, suspend Offers, or terminate a Dealer&apos;s
                    account for suspected non-compliance with these
                    obligations or applicable law.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 8: Fees, Subscriptions & Payments --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <CreditCard className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    8. Fees, subscriptions, and payment
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    Submitting Requests is currently free for Buyers. Dealers
                    may be required to pay subscription fees, per-lead fees,
                    listing fees, or other charges in order to access certain
                    features (collectively, &ldquo;Fees&rdquo;). Applicable
                    Fees, billing intervals, and cancellation terms will be
                    disclosed at the time of enrollment.
                  </p>
                  <p>
                    By providing a payment method, you authorize AutoMatcher
                    (or its third-party payment processor) to charge all Fees
                    and applicable taxes to that payment method on a recurring
                    basis until you cancel. You are responsible for keeping
                    your payment information current. Failed or reversed
                    payments may result in suspension or termination of your
                    account.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Except where expressly required by law, all Fees are
                      non-refundable.
                    </span>{" "}
                    Chargebacks or payment disputes filed in bad faith may,
                    without limiting our other remedies, result in account
                    termination and collection of amounts owed, together with
                    reasonable attorneys&apos; fees and costs.
                  </p>
                  <p>
                    AutoMatcher may change Fees from time to time on at least
                    thirty (30) days&apos; notice. Your continued use of paid
                    features after the effective date of a price change
                    constitutes acceptance of the new Fees.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 9: User Content & License --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Copyright className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    9. User content and license to AutoMatcher
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    You retain ownership of User Content you submit. However,
                    by submitting User Content to the Platform, you grant
                    AutoMatcher a worldwide, non-exclusive, royalty-free,
                    sublicensable, and transferable license to host, store,
                    reproduce, modify, adapt, translate, publish, publicly
                    display, publicly perform, distribute, and create
                    derivative works from your User Content, in any media now
                    known or hereafter developed, for the purposes of
                    operating, providing, improving, marketing, and promoting
                    the Platform and AutoMatcher&apos;s business.
                  </p>
                  <p>
                    You represent and warrant that (a) you own or have all
                    necessary rights to your User Content and to grant the
                    license above; (b) your User Content is accurate and not
                    misleading; and (c) your User Content does not and will
                    not violate any law or infringe or misappropriate any
                    third party&apos;s intellectual property, privacy,
                    publicity, or other rights.
                  </p>
                  <p>
                    AutoMatcher may, in its sole discretion, review, refuse,
                    remove, or disable access to any User Content at any time,
                    without notice, for any reason or no reason. You are solely
                    responsible for your User Content and the consequences of
                    submitting it.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 10: Prohibited Conduct --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Ban className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    10. Prohibited conduct
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    In addition to the obligations above, you agree that you
                    will not, and will not attempt to, do any of the following:
                  </p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "Violate any applicable law, regulation, court order, or third-party right",
                      "Post or transmit false, misleading, fraudulent, defamatory, obscene, harassing, discriminatory, or unlawful content",
                      "Impersonate any person or entity, or misrepresent your affiliation with any person or entity",
                      "Harvest, scrape, crawl, data-mine, or otherwise collect information from the Platform using automated means, or reverse engineer any part of the Platform",
                      "Introduce malware, viruses, worms, or any other malicious code; probe, scan, or test the vulnerability of the Platform; or bypass any security, authentication, or rate-limiting feature",
                      "Interfere with, disrupt, overload, or impair the Platform, its servers, or networks",
                      "Use the Platform to send unsolicited marketing, spam, chain letters, pyramid schemes, or other unauthorized promotional material, including outside of a legitimate Transaction context",
                      "Contact users off-platform to solicit business unrelated to their original Request or Offer, or to circumvent Platform fees",
                      "Create multiple, false, or duplicate accounts, or sell, transfer, or share your account with any third party",
                      "Use the Platform in a manner that could damage, disable, overburden, or impair AutoMatcher or interfere with any other party&apos;s use of the Platform",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>
                    Violations may result in, without limitation, content
                    removal, account suspension or permanent termination,
                    forfeiture of pre-paid Fees, referral to law enforcement,
                    and civil or criminal liability. We reserve all rights and
                    remedies available at law or in equity.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 11: Intellectual Property --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Gavel className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    11. Intellectual property and feedback
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    The Platform, including all software, source code,
                    databases, designs, layouts, text, graphics, logos, icons,
                    trademarks, service marks, trade dress, and the
                    &ldquo;AutoMatcher&rdquo; name, and all selection,
                    arrangement, and enhancement thereof, is owned by
                    AutoMatcher or its licensors and is protected by
                    intellectual-property laws in the United States and
                    abroad. All rights not expressly granted to you are
                    reserved.
                  </p>
                  <p>
                    Subject to your compliance with these Terms, AutoMatcher
                    grants you a limited, revocable, non-exclusive,
                    non-transferable, non-sublicensable license to access and
                    use the Platform for its intended purpose. You may not copy,
                    modify, create derivative works of, distribute, sell,
                    license, lease, rent, frame, mirror, reverse engineer,
                    decompile, or disassemble any part of the Platform, except
                    as expressly permitted in writing by AutoMatcher or
                    required by applicable law.
                  </p>
                  <p>
                    If you provide AutoMatcher with any ideas, suggestions, or
                    feedback regarding the Platform, you assign to AutoMatcher
                    all rights in that feedback, and AutoMatcher may use it
                    without restriction or compensation to you.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 12: DMCA --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Copyright className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    12. Copyright complaints (DMCA)
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    AutoMatcher respects the intellectual-property rights of
                    others and complies with the Digital Millennium Copyright
                    Act (&ldquo;DMCA&rdquo;). If you believe that material on
                    the Platform infringes your copyright, please send a written
                    notice to our designated agent containing the information
                    required by 17 U.S.C. &sect; 512(c)(3), including: (a) a
                    physical or electronic signature; (b) identification of the
                    copyrighted work claimed to have been infringed;
                    (c) identification of the allegedly infringing material and
                    its location; (d) your contact information; (e) a statement
                    of good-faith belief that the use is not authorized; and
                    (f) a statement, under penalty of perjury, that the
                    information is accurate and that you are authorized to act
                    on behalf of the rights holder.
                  </p>
                  <p>
                    DMCA notices may be sent to our designated agent at{" "}
                    <a
                      href="mailto:legal@automatcher.co"
                      className="text-blue-600 hover:underline"
                    >
                      legal@automatcher.co
                    </a>
                    . We may, in appropriate circumstances and at our
                    discretion, terminate the accounts of users who are repeat
                    infringers.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 13: Third-Party Services --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Link2 className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    13. Third-party services and links
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    The Platform may contain links to, or integrate with,
                    third-party websites, applications, financing partners,
                    vehicle history report providers, payment processors,
                    mapping services, and other external resources
                    (collectively, &ldquo;Third-Party Services&rdquo;). Such
                    Third-Party Services are not owned or controlled by
                    AutoMatcher.
                  </p>
                  <p>
                    AutoMatcher does not endorse and is not responsible for the
                    content, products, services, accuracy, privacy practices,
                    or policies of any Third-Party Service. Your use of any
                    Third-Party Service is at your own risk and subject to that
                    third party&apos;s own terms and privacy policy. Any
                    dealings between you and a third party are solely between
                    you and that third party.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 14: Privacy & Electronic Communications --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Mail className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    14. Privacy and electronic communications
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    Our collection and use of personal information is governed
                    by our{" "}
                    <Link
                      href="/privacy"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    , which is incorporated into these Terms by reference. By
                    using the Platform you consent to such collection and use.
                  </p>
                  <p>
                    You consent to receive communications from AutoMatcher
                    electronically, including emails, in-app notifications,
                    and, where you have opted in, SMS or push notifications.
                    You agree that all agreements, notices, disclosures, and
                    other communications that we provide electronically
                    satisfy any legal requirement that such communications be
                    in writing. You may opt out of non-transactional
                    communications at any time as described in the Privacy
                    Policy, but you cannot opt out of essential account,
                    security, or transactional notices while your account
                    remains active.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 15: DISCLAIMERS --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <AlertTriangle className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    15. Disclaimers of warranties
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700">
                  <p className="uppercase font-semibold tracking-wide text-gray-900">
                    The platform is provided &ldquo;as is&rdquo; and &ldquo;as
                    available,&rdquo; with all faults, and without warranty of
                    any kind.
                  </p>
                  <p className="uppercase">
                    To the maximum extent permitted by applicable law,
                    AutoMatcher and its affiliates, licensors, and service
                    providers expressly disclaim all warranties and conditions
                    of any kind, whether express, implied, statutory, or
                    otherwise, including, without limitation, any warranties
                    of merchantability, fitness for a particular purpose,
                    title, non-infringement, quiet enjoyment, accuracy, or
                    course of dealing, usage, or trade practice.
                  </p>
                  <p>
                    Without limiting the foregoing, AutoMatcher makes no
                    representation or warranty that: (a) the Platform will be
                    uninterrupted, timely, secure, error-free, or free from
                    viruses or other harmful components; (b) the Platform or
                    any Content, Offer, or listing will be accurate, complete,
                    reliable, current, or legal; (c) any vehicle will meet
                    your expectations or be of merchantable quality, safe,
                    roadworthy, or free of defects or liens; (d) any Dealer
                    or Buyer is trustworthy, properly licensed, solvent, or
                    able to perform; or (e) any defects in the Platform will
                    be corrected.
                  </p>
                  <p>
                    You acknowledge that you use the Platform and enter into
                    Transactions at your own risk. Some jurisdictions do not
                    allow the exclusion of certain warranties, so some of the
                    above exclusions may not apply to you; in those
                    jurisdictions, warranties are limited to the shortest
                    period and the narrowest scope permitted by law.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 16: LIMITATION OF LIABILITY --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <AlertTriangle className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    16. Limitation of liability
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700">
                  <p className="uppercase font-semibold tracking-wide text-gray-900">
                    To the maximum extent permitted by applicable law, in no
                    event will AutoMatcher or its affiliates, officers,
                    directors, employees, agents, licensors, or service
                    providers be liable to you or any third party for any
                    indirect, incidental, special, consequential, exemplary,
                    or punitive damages, including, without limitation, loss
                    of profits, loss of revenue, loss of business, loss of
                    goodwill, loss of data, loss of use, diminution in value,
                    cost of substitute goods or services, personal injury,
                    property damage, emotional distress, or any damages
                    arising out of or related to:
                  </p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "Your access to or use of, or inability to access or use, the Platform",
                      "Any conduct, act, or omission of any Buyer, Dealer, or other third party",
                      "Any vehicle, Offer, listing, financing arrangement, or Transaction, whether or not arranged through the Platform",
                      "Any defect, misrepresentation, recall, safety issue, title defect, or loss of value relating to any vehicle",
                      "Any unauthorized access to or use of our servers and/or any personal information stored therein",
                      "Any interruption, cessation, bug, error, or inaccuracy in the Platform",
                      "Any matter otherwise relating to the Platform or these Terms",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>
                    The foregoing limitations apply whether the alleged
                    liability is based on contract, tort, negligence, strict
                    liability, statute, or any other legal theory, even if
                    AutoMatcher has been advised of the possibility of such
                    damages, and even if any limited remedy set forth herein
                    is found to have failed its essential purpose.
                  </p>
                  <p className="uppercase font-semibold tracking-wide text-gray-900">
                    In no event shall the aggregate liability of AutoMatcher
                    and its affiliates, arising out of or related to these
                    Terms or the Platform, exceed the greater of (a) the total
                    amount of Fees you actually paid to AutoMatcher in the
                    twelve (12) months immediately preceding the event giving
                    rise to the claim, or (b) one hundred U.S. dollars
                    ($100.00).
                  </p>
                  <p>
                    Some jurisdictions do not allow the limitation or
                    exclusion of liability for incidental or consequential
                    damages, so the above limitations may not apply to you. In
                    such jurisdictions, our liability is limited to the
                    greatest extent permitted by law. You agree that the
                    limitations in this section are an essential basis of the
                    bargain between you and AutoMatcher.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 17: INDEMNIFICATION --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Shield className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    17. Indemnification
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    You agree to defend, indemnify, and hold harmless
                    AutoMatcher and its affiliates, officers, directors,
                    employees, agents, licensors, and service providers
                    (collectively, the &ldquo;Indemnified Parties&rdquo;) from
                    and against any and all claims, demands, actions, losses,
                    damages, liabilities, judgments, settlements, costs, and
                    expenses (including reasonable attorneys&apos; fees and
                    court costs) arising out of or in any way connected with:
                  </p>
                  <ul className="space-y-2 ml-4">
                    {[
                      "Your access to, use of, or misuse of the Platform",
                      "Your breach or alleged breach of these Terms or any representation, warranty, or covenant herein",
                      "Your violation of any law, regulation, or third-party right (including intellectual property, privacy, and consumer protection rights)",
                      "Any User Content you submit, post, or transmit",
                      "Any vehicle you list, sell, buy, lease, finance, or otherwise deal in, including any warranty, recall, title, safety, odometer, or emissions claim",
                      "Any Transaction or dispute between you and any other user, third party, taxing authority, or regulator",
                      "Any negligent, willful, or fraudulent act or omission by you or your employees, agents, or contractors",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p>
                    AutoMatcher reserves the right, at your expense, to assume
                    the exclusive defense and control of any matter otherwise
                    subject to indemnification by you, and you agree to
                    cooperate with our defense. You will not settle any claim
                    that affects the Indemnified Parties without our prior
                    written consent.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 18: Dispute Resolution / Arbitration --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Scale className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    18. Binding arbitration and class-action waiver
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-700">
                  <p className="font-semibold text-gray-900 uppercase tracking-wide">
                    Please read this section carefully. It requires you to
                    resolve disputes with AutoMatcher through individual,
                    binding arbitration and waives your right to a jury trial
                    or to participate in a class action.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      (a) Informal resolution.
                    </span>{" "}
                    Before filing any claim, you agree to first try to resolve
                    the dispute informally by contacting us at{" "}
                    <a
                      href="mailto:legal@automatcher.co"
                      className="text-blue-600 hover:underline"
                    >
                      legal@automatcher.co
                    </a>{" "}
                    with a written description of the dispute, your contact
                    information, and the relief you seek. The parties will
                    negotiate in good faith for at least sixty (60) days
                    before initiating arbitration.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      (b) Agreement to arbitrate.
                    </span>{" "}
                    You and AutoMatcher agree that any dispute, claim, or
                    controversy arising out of or relating to these Terms, the
                    Platform, any Transaction, or the relationship between us
                    (&ldquo;Dispute&rdquo;) will be resolved exclusively by
                    final and binding arbitration, rather than in court,
                    except that (i) you may assert claims in small-claims
                    court if they qualify, and (ii) either party may seek
                    injunctive or equitable relief in court to protect
                    intellectual-property rights.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      (c) Arbitration rules and forum.
                    </span>{" "}
                    The arbitration will be administered by the American
                    Arbitration Association (&ldquo;AAA&rdquo;) under its
                    Consumer Arbitration Rules (for consumer disputes) or
                    Commercial Arbitration Rules (for Dealer disputes), as
                    applicable. The Federal Arbitration Act, 9 U.S.C. &sect;&sect;
                    1&ndash;16, governs the interpretation and enforcement of
                    this Section. The arbitration will be conducted in the
                    English language in the county of AutoMatcher&apos;s
                    principal place of business, or by videoconference or
                    written submission at the consumer&apos;s election.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      (d) Class-action waiver.
                    </span>{" "}
                    YOU AND AUTOMATCHER AGREE THAT EACH MAY BRING CLAIMS
                    AGAINST THE OTHER ONLY IN AN INDIVIDUAL CAPACITY, AND NOT
                    AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS,
                    COLLECTIVE, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.
                    The arbitrator may not consolidate more than one
                    person&apos;s claims and may not otherwise preside over
                    any form of representative or class proceeding.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      (e) Jury-trial waiver.
                    </span>{" "}
                    To the maximum extent permitted by law, each party waives
                    any right to a trial by jury in any proceeding arising
                    from or related to these Terms.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      (f) Opt-out.
                    </span>{" "}
                    You may opt out of this arbitration agreement by sending
                    written notice to{" "}
                    <a
                      href="mailto:legal@automatcher.co"
                      className="text-blue-600 hover:underline"
                    >
                      legal@automatcher.co
                    </a>{" "}
                    within thirty (30) days after first accepting these Terms.
                    Your notice must include your name, address, and a clear
                    statement that you wish to opt out of arbitration. Opting
                    out will not affect any other provision of these Terms.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      (g) Severability.
                    </span>{" "}
                    If any portion of this Section 18 is found to be
                    unenforceable, the remainder will remain in effect, except
                    that if the class-action waiver is found unenforceable as
                    to a particular claim, that claim alone must be severed
                    and litigated in court while all other claims proceed in
                    arbitration.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 19: Governing Law --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Globe className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    19. Governing law and venue
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    These Terms and any Dispute are governed by and construed
                    in accordance with the laws of the State of California,
                    United States, without regard to its conflict-of-laws
                    principles and excluding the United Nations Convention on
                    Contracts for the International Sale of Goods. For any
                    matters not subject to arbitration under Section 18, the
                    parties submit to the exclusive jurisdiction of the state
                    and federal courts located in the State of California, and
                    waive any objection to venue or forum non conveniens.
                  </p>
                  <p>
                    If you access the Platform from outside the United States,
                    you are responsible for compliance with local law and
                    acknowledge that the Platform is hosted in, and subject to
                    the laws of, the United States.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 20: Termination --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Ban className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    20. Termination and suspension
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    You may terminate your account at any time by following
                    the in-app instructions or contacting support. Any Fees
                    already paid are non-refundable except where required by
                    law.
                  </p>
                  <p>
                    AutoMatcher may, without liability and in its sole
                    discretion, suspend or terminate your access to the
                    Platform, delete your account, and remove your User
                    Content, at any time and for any reason, including, without
                    limitation, if we believe you have violated these Terms or
                    created risk or legal exposure for AutoMatcher.
                  </p>
                  <p>
                    Upon termination, your right to access and use the
                    Platform ceases immediately. All provisions that by their
                    nature should survive termination will survive, including
                    (without limitation) Sections 9 (User Content license),
                    11 (IP), 15 (Disclaimers), 16 (Limitation of Liability),
                    17 (Indemnification), 18 (Arbitration), 19 (Governing
                    Law), and 22 (General).
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 21: Changes to Terms --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <RefreshCw className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    21. Changes to these terms
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    We may revise these Terms at any time by posting an
                    updated version on the Platform and updating the
                    &ldquo;Last updated&rdquo; date above. Material changes
                    will be communicated via email to your registered address
                    or through a prominent notice on the Platform at least
                    thirty (30) days before they take effect, unless a shorter
                    period is required by law or necessary for security or
                    legal-compliance reasons.
                  </p>
                  <p>
                    Your continued access to or use of the Platform after
                    changes become effective constitutes acceptance of the
                    revised Terms. If you do not agree to the revised Terms,
                    you must stop using the Platform and close your account.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 22: General Provisions --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Gavel className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    22. General provisions
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-900">
                      Entire agreement.
                    </span>{" "}
                    These Terms, together with the Privacy Policy and any
                    other policies referenced herein, constitute the entire
                    agreement between you and AutoMatcher regarding the
                    Platform and supersede all prior or contemporaneous
                    communications and proposals (whether oral, written, or
                    electronic) between the parties.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Severability.
                    </span>{" "}
                    If any provision of these Terms is held invalid, illegal,
                    or unenforceable, that provision will be enforced to the
                    maximum extent permitted, and the remaining provisions
                    will remain in full force and effect.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      No waiver.
                    </span>{" "}
                    Our failure to enforce any right or provision of these
                    Terms will not be considered a waiver of those rights.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Assignment.
                    </span>{" "}
                    You may not assign or transfer these Terms or any rights
                    hereunder without our prior written consent, and any
                    attempted assignment without consent is void. AutoMatcher
                    may freely assign these Terms, including in connection
                    with a merger, acquisition, reorganization, or sale of
                    assets.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Force majeure.
                    </span>{" "}
                    AutoMatcher will not be liable for any failure or delay in
                    performance to the extent caused by circumstances beyond
                    its reasonable control, including acts of God, natural
                    disasters, war, terrorism, riots, embargoes, strikes,
                    labor disputes, power or telecommunications failures,
                    cyberattacks, pandemics, or government actions.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Relationship of the parties.
                    </span>{" "}
                    Nothing in these Terms creates any agency, partnership,
                    joint venture, employment, or franchise relationship
                    between you and AutoMatcher.
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Notices.
                    </span>{" "}
                    We may give notice to you by email, in-app notification,
                    or posting on the Platform. You may give notice to us at{" "}
                    <a
                      href="mailto:legal@automatcher.co"
                      className="text-blue-600 hover:underline"
                    >
                      legal@automatcher.co
                    </a>
                    .
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Headings.
                    </span>{" "}
                    Section titles are for convenience only and have no legal
                    or contractual effect.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* --- Section 23: Contact --- */}
            <FadeIn viewOnce direction="up">
              <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Mail className="size-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    23. Contact us
                  </h3>
                </div>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-gray-600">
                  <p>
                    If you have questions about these Terms, please contact us
                    at{" "}
                    <a
                      href="mailto:legal@automatcher.co"
                      className="text-blue-600 hover:underline"
                    >
                      legal@automatcher.co
                    </a>{" "}
                    or via our{" "}
                    <Link
                      href="/contact#contact-form"
                      className="text-blue-600 hover:underline"
                    >
                      contact form
                    </Link>
                    .
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
              Have questions about these terms?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              We&apos;re here to help clarify anything. Reach out to us and
              we&apos;ll get back to you as soon as possible.
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
