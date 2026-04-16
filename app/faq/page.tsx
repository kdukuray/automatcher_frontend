"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, HelpCircle, Mail } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

/**
 * FAQ page — answers common questions from both buyers and dealers about
 * how AutoMatcher works, pricing, privacy, and the matching process.
 * Styled consistently with the help and resources pages.
 */

// --- FAQ Data ---

const generalFaqs = [
  {
    question: "What is AutoMatcher?",
    answer:
      "AutoMatcher is a demand-first car marketplace that flips the traditional model. Instead of browsing listings, buyers post exactly what they're looking for and dealers respond with real offers. It's designed to save time on both sides by matching intent with inventory.",
  },
  {
    question: "Is AutoMatcher free to use?",
    answer:
      "Creating an account and submitting car requests is completely free for buyers. Dealers pay for access to connect with buyers who match their inventory. This keeps the platform spam-free and ensures only serious dealers reach out.",
  },
  {
    question: "How is AutoMatcher different from other car marketplaces?",
    answer:
      "Traditional marketplaces are supply-first — dealers list cars and buyers scroll endlessly. AutoMatcher is demand-first — buyers post what they want and dealers respond only when they can deliver. This means less noise, more relevant matches, and faster deals for everyone.",
  },
  {
    question: "What areas does AutoMatcher cover?",
    answer:
      "AutoMatcher is currently available across the United States. We're focused on building the best experience domestically before expanding further. If a dealer can ship or deliver to your location, they can respond to your request regardless of where they're based.",
  },
];

const buyerFaqs = [
  {
    question: "How do I submit a car request?",
    answer:
      'Click "Find a Car" and fill out the request form with the details of the vehicle you\'re looking for — make, model, year range, budget, mileage, and any other must-haves. The more specific you are, the better your matches will be.',
  },
  {
    question: "Will dealers spam me with calls or emails?",
    answer:
      "No. Your contact information is never shared automatically. Dealers can only see your request details, not your personal info. You choose when to share your contact information by accepting an offer from a dealer you want to work with.",
  },
  {
    question: "How many offers will I receive?",
    answer:
      "It depends on your request. Highly specific requests (rare trims, low mileage, specific colors) may get fewer but more targeted offers. Broader requests may get more. Every offer comes from a dealer who believes they can deliver exactly what you asked for.",
  },
  {
    question: "Can I edit or cancel my request after submitting?",
    answer:
      "Yes. You can update your request details or withdraw it entirely from your dashboard at any time. If you've already received offers, withdrawing the request will close it to new responses.",
  },
  {
    question: "Do I have to accept an offer?",
    answer:
      "Not at all. You're never obligated to accept any offer. Review what dealers send you, compare options, and only move forward when you find the right fit. There's no pressure and no commitment until you decide.",
  },
];

const dealerFaqs = [
  {
    question: "How do I become a dealer on AutoMatcher?",
    answer:
      "Sign up for a dealer account and complete the verification process. You'll need to provide your dealership information and business credentials. Once verified, you'll have access to browse buyer requests and submit offers.",
  },
  {
    question: "How does dealer verification work?",
    answer:
      "We verify every dealer to ensure trust and quality on the platform. The process involves confirming your dealership identity, business license, and contact information. Verification protects both buyers and dealers by keeping the marketplace professional.",
  },
  {
    question: "How do I know which requests match my inventory?",
    answer:
      "AutoMatcher shows you structured buyer requests with clear specifications. You can browse requests filtered by make, model, year, budget, and more to quickly identify which requests align with vehicles you have in stock or can source.",
  },
  {
    question: "When do I get the buyer's contact information?",
    answer:
      "You receive the buyer's contact information only after they accept your offer. This buyer-first privacy model ensures that buyers are genuinely interested before any personal details are exchanged, leading to higher-quality conversations and faster closings.",
  },
];

const privacyFaqs = [
  {
    question: "How does AutoMatcher protect my personal information?",
    answer:
      "Privacy is built into the core of AutoMatcher. Buyer contact details are never publicly visible. Dealers only receive your information after you explicitly accept their offer. We don't sell data to third parties, and all communications are handled through the platform until you choose otherwise.",
  },
  {
    question: "Can I delete my account and data?",
    answer:
      "Yes. You can request to delete your account at any time by contacting us. When your account is deleted, your personal data and request history are removed from our systems in accordance with our privacy policy.",
  },
  {
    question: "Does AutoMatcher share my data with third parties?",
    answer:
      "No. We do not sell, rent, or share your personal data with third-party advertisers or data brokers. Your information is only used to facilitate matches between buyers and dealers on our platform. See our Privacy Policy for full details.",
  },
];

// --- FAQ Section Component ---

interface FaqSectionProps {
  title: string;
  description: string;
  faqs: { question: string; answer: string }[];
  idPrefix: string;
}

/**
 * Renders a titled group of FAQ items using the shadcn Accordion.
 * Each section gets its own heading and accordion instance so users
 * can expand items independently across sections.
 */
function FaqSection({ title, description, faqs, idPrefix }: FaqSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-base text-gray-500">{description}</p>
      <Accordion type="multiple" className="mt-6">
        {faqs.map((faq, index) => (
          <AccordionItem key={`${idPrefix}-${index}`} value={`${idPrefix}-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium text-gray-900 hover:text-blue-600">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-gray-500">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

// --- Page Component ---

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-blue-500/20" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-[500px] rounded-full bg-blue-400/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn direction="up" duration={0.6}>
              <HelpCircle className="mx-auto size-12 text-blue-200" />
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Frequently Asked Questions
              </h1>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                Everything you need to know about AutoMatcher — how it works,
                who it&apos;s for, and how we keep your information safe.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- FAQ Sections --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer viewOnce className="space-y-16" delay={0.1}>
            <StaggerItem>
              <FaqSection
                title="General"
                description="The basics about what AutoMatcher is and how it works."
                faqs={generalFaqs}
                idPrefix="general"
              />
            </StaggerItem>

            <StaggerItem>
              <FaqSection
                title="For Buyers"
                description="How to find the perfect car without the hassle."
                faqs={buyerFaqs}
                idPrefix="buyer"
              />
            </StaggerItem>

            <StaggerItem>
              <FaqSection
                title="For Dealers"
                description="How to connect with real buyer demand."
                faqs={dealerFaqs}
                idPrefix="dealer"
              />
            </StaggerItem>

            <StaggerItem>
              <FaqSection
                title="Privacy & Data"
                description="How we protect your information."
                faqs={privacyFaqs}
                idPrefix="privacy"
              />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- Still Have Questions CTA --- */}
      <section className="bg-blue-50/60 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Mail className="mx-auto size-10 text-blue-600" />
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Still have questions?
            </h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              We&apos;re here to help. Reach out and our team will get back to
              you as soon as possible.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                asChild
                className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-900/20 px-8"
              >
                <Link href="/contact#contact-form">
                  Contact Us
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* --- Find a Car CTA --- */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to find your next car?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Submit your first request and get matched with dealers who have
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
