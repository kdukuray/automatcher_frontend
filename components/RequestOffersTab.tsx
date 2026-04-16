"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  DollarSign,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Store,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listRequestOffers } from "@/lib/api";
import type { RequestOfferItem } from "@/lib/types";
import PaginationBar from "@/components/PaginationBar";

/* ═══════════════════════════════════════════
   COMPONENT PROPS
   ═══════════════════════════════════════════ */

interface RequestOffersTabProps {
  /** The UUID of the vehicle request whose offers we're displaying. */
  requestUuid: string;
  /**
   * Whether the current viewer is the owner (creator) of this request.
   * Owners see buyer-oriented copy; visitors see dealer-oriented copy.
   */
  isOwner: boolean;
}

/* ═══════════════════════════════════════════
   DISPLAY HELPERS
   ═══════════════════════════════════════════ */

/** Format a purchase mode slug into a human-readable label. */
function formatPurchaseMode(mode: string): string {
  const map: Record<string, string> = {
    cash: "Cash",
    finance: "Finance",
    lease: "Lease",
    not_sure: "Flexible",
  };
  return map[mode] || mode;
}

/** Build a human-readable pricing string from the offer data. */
function formatOfferPricing(offer: RequestOfferItem): string {
  const parts: string[] = [];

  if (offer.offeredPrice) {
    parts.push(`$${Number(offer.offeredPrice).toLocaleString()}`);
  }
  if (offer.offeredMonthlyPayment) {
    parts.push(`$${Number(offer.offeredMonthlyPayment).toLocaleString()}/mo`);
  }
  if (offer.offeredDownPayment) {
    parts.push(`$${Number(offer.offeredDownPayment).toLocaleString()} down`);
  }

  return parts.length > 0 ? parts.join(" · ") : "Price not specified";
}

/** Format a body style slug to its display label. */
function formatBodyStyle(val: string): string {
  const map: Record<string, string> = {
    sedan: "Sedan",
    suv: "SUV",
    coupe: "Coupe",
    hatch: "Hatchback",
    truck: "Truck",
    van: "Van",
    wagon: "Wagon",
    any: "Any",
  };
  return map[val] || val;
}

/** Format a spec value slug — capitalises or returns "Any". */
function formatSpec(val: string): string {
  if (!val || val === "any") return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
}

/** Get a human-readable status label and color class. */
function getStatusBadge(statusVal: string): { label: string; className: string } {
  switch (statusVal) {
    case "active":
      return { label: "Active", className: "bg-green-100 text-green-700" };
    case "accepted":
      return { label: "Accepted", className: "bg-blue-100 text-blue-700" };
    case "declined":
      return { label: "Declined", className: "bg-red-100 text-red-700" };
    case "withdrawn":
      return { label: "Withdrawn", className: "bg-gray-100 text-gray-500" };
    case "expired":
      return { label: "Expired", className: "bg-yellow-100 text-yellow-700" };
    default:
      return { label: statusVal, className: "bg-gray-100 text-gray-500" };
  }
}

/** Format an ISO date string into a short label. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ═══════════════════════════════════════════
   OFFER CARD COMPONENT
   ═══════════════════════════════════════════ */

/**
 * Renders a single offer as a card with vehicle details and pricing.
 *
 * For buyers (isOwner=true): static card showing dealer info and vehicle details.
 * For dealers (isOwner=false): clickable card linking to /offers/[id] for managing the offer.
 *
 * @param offer     - The offer data to display.
 * @param isOwner   - Whether the viewer owns the parent request.
 * @param requestUuid - The parent request UUID, used to build a contextual back-link
 *                    so the offer detail page can navigate back to this request.
 */
function OfferCard({ offer, isOwner, requestUuid }: { offer: RequestOfferItem; isOwner: boolean; requestUuid: string }) {
  const statusBadge = getStatusBadge(offer.status);

  // Build the vehicle title: "2024 BMW 3 Series SE"
  const vehicleTitle = [
    offer.year,
    offer.makeName,
    offer.modelName,
    offer.trim,
  ]
    .filter(Boolean)
    .join(" ");

  // Collect notable specs to display as tags (skip "any" values)
  const specTags: string[] = [];
  if (offer.bodyStyle && offer.bodyStyle !== "any")
    specTags.push(formatBodyStyle(offer.bodyStyle));
  if (offer.drivetrain && offer.drivetrain !== "any")
    specTags.push(offer.drivetrain.toUpperCase());
  if (offer.fuelType && offer.fuelType !== "any")
    specTags.push(formatSpec(offer.fuelType));
  if (offer.transmission && offer.transmission !== "any")
    specTags.push(formatSpec(offer.transmission));
  if (offer.titleStatus && offer.titleStatus !== "any")
    specTags.push(offer.titleStatus === "clean" ? "Clean Title" : "Rebuilt");

  /* --- Shared inner card content (used by both buyer and dealer views) --- */
  const cardContent = (
    <>
      {/* --- Card Header: vehicle name + status badge --- */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Car className="size-4 text-blue-600 shrink-0" />
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {vehicleTitle}
            </h3>
          </div>
          {/* Mileage if available */}
          {offer.mileage != null && (
            <p className="text-xs text-gray-500 ml-6">
              {offer.mileage.toLocaleString()} miles
            </p>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
            statusBadge.className
          )}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* --- Card Body --- */}
      <div className="px-5 py-4 space-y-3">
        {/* Pricing row */}
        <div className="flex items-center gap-2">
          <DollarSign className="size-4 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900">
              {formatOfferPricing(offer)}
            </p>
            <p className="text-xs text-gray-500">
              {formatPurchaseMode(offer.purchaseMode)}
            </p>
          </div>
        </div>

        {/* Dealer info — only show to the request owner (buyer) */}
        {isOwner && offer.dealerName && (
          <div className="flex items-center gap-2">
            {/* Small logo thumbnail or fallback icon */}
            {offer.dealerLogo ? (
              <img
                src={offer.dealerLogo}
                alt={`${offer.dealerName} logo`}
                className="size-8 rounded-md object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="size-8 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                <Store className="size-4 text-gray-400" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {offer.dealerName}
                </p>
                {/* Verified dealer badge — shown when the dealer has been verified by AutoMatcher */}
                {offer.dealerVerified && (
                  <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                    <BadgeCheck className="size-3.5" />
                    Verified
                  </span>
                )}
              </div>
              {/* Business location and contact details */}
              {(offer.dealerCity || offer.dealerState) && (
                <p className="text-xs text-gray-500">
                  {[offer.dealerCity, offer.dealerState]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {(offer.dealerPhone || offer.dealerEmail) && (
                <p className="text-xs text-gray-500">
                  {[offer.dealerPhone, offer.dealerEmail]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Spec tags */}
        {specTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Colors */}
        {(offer.exteriorColor || offer.interiorColor) && (
          <p className="text-xs text-gray-500">
            {offer.exteriorColor && (
              <span>Ext: {offer.exteriorColor}</span>
            )}
            {offer.exteriorColor && offer.interiorColor && " · "}
            {offer.interiorColor && (
              <span>Int: {offer.interiorColor}</span>
            )}
          </p>
        )}

        {/* Features */}
        {offer.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {offer.features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* --- Card Footer: date (+ manage link for dealers) --- */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
        <span>Submitted {formatDate(offer.createdAt)}</span>
        <div className="flex items-center gap-3">
          {/* MUST CHANGE LATER: Re-add match score badge here once scoring logic is implemented.
              Was: {offer.matchScore != null && (<span className="font-medium text-blue-600">{offer.matchScore}% match</span>)} */}
          {/* Subtle "View / Edit" affordance — only for dealers viewing their own offers */}
          {!isOwner && (
            <span className="inline-flex items-center gap-1 font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
              View / Edit
              <ArrowRight className="size-3" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  /* --- Build the offer link with a `from=request` context so the offer
         detail page can navigate back to this request instead of the dashboard --- */
  const offerHref = `/offers/${offer.uuid}?from=request&requestUuid=${requestUuid}`;

  /* --- Dealers: clickable card linking to the offer detail page for managing it --- */
  if (!isOwner) {
    return (
      <Link
        href={offerHref}
        className="group block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all"
      >
        {cardContent}
      </Link>
    );
  }

  /* --- Buyers: clickable card linking to the offer detail page for reviewing it --- */
  return (
    <Link
      href={offerHref}
      className="group block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-green-200 transition-all"
    >
      {cardContent}
    </Link>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

/**
 * RequestOffersTab – Fetches and displays all offers for a vehicle request.
 *
 * For buyers (isOwner=true): shows all active offers with dealer info.
 * For dealers (isOwner=false): shows only their own offers for this request.
 */
export default function RequestOffersTab({
  requestUuid,
  isOwner,
}: RequestOffersTabProps) {
  /* ── State ─────────────────────────────── */
  const [offers, setOffers] = useState<RequestOfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /* ── Fetch offers whenever page changes ─── */
  const fetchOffers = useCallback((fetchPage: number = 1) => {
    setLoading(true);
    setError("");
    listRequestOffers(requestUuid, fetchPage)
      .then((data) => {
        setOffers(data.results);
        setPage(data.page);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
      })
      .catch(() => {
        setError("Could not load offers. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [requestUuid]);

  useEffect(() => {
    fetchOffers(page);
  }, [page, fetchOffers]);

  /* ── Loading state ─────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="size-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">Loading offers…</p>
      </div>
    );
  }

  /* ── Error state ───────────────────────── */
  if (error) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm text-red-600 font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={() => fetchOffers()}>
          <RefreshCw className="size-4 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  /* ── Empty state (role-specific messaging) ── */
  if (totalCount === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 mb-4">
            <MessageSquare className="size-8 text-blue-400" />
          </div>

          {isOwner ? (
            /* --- Buyer empty state --- */
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No offers yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                When dealers submit offers for this request, they&apos;ll appear
                here. You&apos;ll be able to compare and review each one.
              </p>
            </>
          ) : (
            /* --- Dealer empty state --- */
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                You haven&apos;t submitted an offer yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                If you have a matching vehicle, submit an offer for this
                buyer&apos;s request. Your offer will only be visible to you
                and the buyer.
              </p>
              <Button
                asChild
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
              >
                <Link href={`/requests/${requestUuid}/offer`}>
                  <Send className="size-4 mr-1.5" />
                  Make an Offer
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Offers list ───────────────────────── */

  // Role-aware header copy: buyers see "N offers from dealers", dealers see "N offers you've submitted"
  const offerCountLabel = totalCount === 1 ? "offer" : "offers";
  const headerText = isOwner
    ? `${totalCount} ${offerCountLabel} from dealers`
    : `${totalCount} ${offerCountLabel} you've submitted`;

  return (
    <div className="space-y-5">
      {/* Header row with count and refresh */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{headerText}</p>
        <button
          type="button"
          onClick={() => fetchOffers(page)}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </button>
      </div>

      {/* Offer cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {offers.map((offer) => (
          <OfferCard key={offer.uuid} offer={offer} isOwner={isOwner} requestUuid={requestUuid} />
        ))}
      </div>

      {/* --- Pagination Controls --- */}
      <PaginationBar
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* CTA for dealers to submit another offer */}
      {!isOwner && (
        <div className="text-center pt-2">
          <Button
            asChild
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Link href={`/requests/${requestUuid}/offer`}>
              <Send className="size-4 mr-1.5" />
              Submit Another Offer
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
