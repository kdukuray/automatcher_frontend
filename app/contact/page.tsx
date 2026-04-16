"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Loader2,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { submitContactMessage } from "@/lib/api";
import { toast } from "sonner";

/**
 * Contact Us page — provides users with ways to reach the AutoMatcher
 * support team, including a message submission form, email address,
 * and help center link. Styled consistently with the help/about page.
 */
export default function ContactPage() {
  // --- Contact form state ---
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles the contact form submission.
   * Validates required fields client-side, then sends to the backend.
   * On success, clears the form and shows a success toast.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side validation for required fields
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter your message.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContactMessage({
        email: email.trim(),
        title: title.trim() || undefined,
        content: content.trim(),
      });
      toast.success(
        "Your message has been sent! We'll get back to you soon."
      );
      // Clear the form on successful submission
      setEmail("");
      setTitle("");
      setContent("");
    } catch {
      toast.error(
        "Something went wrong. Please try again or email us directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
                We&apos;re here to{" "}
                <span className="text-blue-200">help.</span>
              </h1>
            </FadeIn>
            <FadeIn direction="up" duration={0.6} delay={0.15}>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 sm:text-xl">
                Have a question, feedback, or need support? Reach out and
                our team will get back to you as soon as possible.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Contact Methods --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Get in touch
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Choose the best way to reach us. We&apos;re committed to
                getting you the help you need quickly.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer
            viewOnce
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3"
            delay={0.1}
          >
            {/* Email support */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Email Us
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Send us a detailed message and we&apos;ll respond within
                  24 hours on business days.
                </p>
                <p className="mt-4 text-sm font-medium text-blue-600">
                  support@automatcher.co
                </p>
              </div>
            </StaggerItem>

            {/* Help center */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <MessageSquare className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Help Center
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Browse our comprehensive help page for answers to common
                  questions about buying, selling, and using AutoMatcher.
                </p>
                <Link
                  href="/help"
                  className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Visit Help Center
                  <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </div>
            </StaggerItem>

            {/* Message support (replaced phone support) */}
            <StaggerItem>
              <div className="group relative h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Send className="size-6" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Message Support
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Use the form below to send us a message directly. Include
                  your email and we&apos;ll follow up promptly.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("contact-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Send a Message
                  <ArrowRight className="ml-1 size-3.5" />
                </button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- Contact Form --- */}
      <section id="contact-form" className="bg-blue-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Send us a message
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Fill out the form below and our team will get back to you
                as soon as possible.
              </p>
            </div>
          </FadeIn>

          <FadeIn viewOnce direction="up" delay={0.15}>
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-12 max-w-2xl space-y-6"
            >
              {/* Email field (required) */}
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700">
                  Your Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              {/* Subject/title field (optional) */}
              <div className="space-y-2">
                <Label htmlFor="contact-title" className="text-sm font-medium text-gray-700">
                  Subject{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="contact-title"
                  type="text"
                  placeholder="e.g. Question about match requests"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Message content (required) */}
              <div className="space-y-2">
                <Label htmlFor="contact-content" className="text-sm font-medium text-gray-700">
                  Message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="contact-content"
                  placeholder="Tell us how we can help..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* Submit button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* --- Common Topics --- */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn viewOnce direction="up">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Common topics we can help with
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Not sure where to start? Here are the most common reasons
                people get in touch.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer
            viewOnce
            className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2"
            delay={0.1}
          >
            {/* Buyer topics */}
            <StaggerItem>
              <div className="h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  For Buyers
                </h3>
                <ul className="mt-6 space-y-3">
                  {[
                    "Help creating or editing a match request",
                    "Questions about how dealer offers work",
                    "Reporting an issue with a dealer or offer",
                    "Account settings and profile updates",
                    "Understanding notifications and offer updates",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>

            {/* Dealer topics */}
            <StaggerItem>
              <div className="h-full rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900">
                  For Dealers
                </h3>
                <ul className="mt-6 space-y-3">
                  {[
                    "Getting started as a dealer on AutoMatcher",
                    "Inventory management and listing questions",
                    "Understanding the offer and matching process",
                    "Billing, payments, and subscription inquiries",
                    "Technical support and troubleshooting",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-blue-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <FadeIn viewOnce direction="up">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Can&apos;t find what you need?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Check out our help center for detailed guides, FAQs, and
              everything you need to know about AutoMatcher.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg shadow-blue-900/30 w-full sm:w-auto"
              >
                <Link href="/help">
                  Visit Help Center
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
