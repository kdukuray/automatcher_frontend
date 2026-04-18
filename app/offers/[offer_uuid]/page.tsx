"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  ClipboardList,
  Package,
  Car,
  DollarSign,
  MapPin,
  Settings2,
  Sparkles,
  FileText,
  Store,
  Send,
  Inbox,
} from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";
import { cn } from "@/lib/utils";
import { getOfferDetail, getVehicleRequestDetail, markNotificationsSeen } from "@/lib/api";
import type { OfferDetail, VehicleRequestDetail } from "@/lib/types";
import OfferDetailTab from "@/components/OfferDetailTab";
import { FadeIn } from "@/components/motion";

/* ── Helpers ────────────────────────────────────── */

/** Format an ISO date string into a human-readable label. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/* ── Display helpers for request data ────────────── */

/** Map purchase mode slugs to human-readable labels. */
function formatPurchaseMode(mode: string): string {
  const map: Record<string, string> = {
    cash: "Cash",
    finance: "Finance",
    lease: "Lease",
    not_sure: "Not Sure",
  };
  return map[mode] || mode;
}

/** Map body style slugs to their display labels. */
function formatBodyStyle(val: string): string {
  const map: Record<string, string> = {
    sedan: "Sedan",
    suv: "SUV",
    coupe: "Coupe",
    hatch: "Hatchback",
    truck: "Truck",
    van: "Van",
    wagon: "Wagon",
  };
  if (!val || val === "any") return "Any";
  return map[val] || val;
}

/** Capitalise a spec value slug, or return "Any" for empty / "any". */
function formatSpec(val: string): string {
  if (!val || val === "any") return "Any";
  return val.charAt(0).toUpperCase() + val.slice(1);
}

/** Map credit-range slugs (stored on the backend) to human-readable labels.
 *  Falls back to the raw value if no mapping exists. */
function formatCreditRange(val: string): string {
  const map: Record<string, string> = {
    prefer_not: "Prefer not to say",
    "580_649": "580–649",
    "650_699": "650–699",
    "700_plus": "700+",
  };
  return map[val] || val;
}

/* ── Status display config ──────────────────────── */

/** Map offer statuses to human-readable labels and badge colors.
 *  Each status has a sender variant (blue tones) and a receiver variant
 *  (green tones) so the page accent clearly signals the viewer's role. */
const STATUS_CONFIG: Record<
  string,
  { label: string; badgeBg: string; badgeText: string; dotColor: string }
> = {
  active: {
    label: "Active",
    badgeBg: "bg-green-50",
    badgeText: "text-green-700",
    dotColor: "bg-green-500",
  },
  withdrawn: {
    label: "Withdrawn",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-500",
    dotColor: "bg-gray-400",
  },
  accepted: {
    label: "Accepted",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    dotColor: "bg-blue-500",
  },
  declined: {
    label: "Declined",
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-700",
    dotColor: "bg-yellow-500",
  },
  expired: {
    label: "Expired",
    badgeBg: "bg-red-50",
    badgeText: "text-red-600",
    dotColor: "bg-red-400",
  },
};

/* ── Tab types ──────────────────────────────────── */

type TabId = "details" | "request";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: "details", label: "Offer Details", icon: <ClipboardList className="size-4" /> },
  { id: "request", label: "Linked Request", icon: <Package className="size-4" /> },
];

/* ── Small reusable row for displaying key-value info ── */

/** A single label + value row used inside info cards on the request tab. */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 sm:w-44 shrink-0 font-medium">
        {label}
      </span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

/**
 * OfferDetailPage – Top-level page for viewing a single offer.
 *
 * Renders a role-aware header (different banner, subtitle, and accent
 * depending on whether the viewer is the sender or receiver) and a tab
 * bar that lets the user switch between the offer details view and a
 * full inline summary of the linked vehicle request.
 *
 * - Sender sees "Your Offer" with blue accents and Edit/Withdraw actions.
 * - Receiver sees "Offer from [Dealer]" with green accents and Accept/Decline actions.
 */
/**
 * Inner component that calls `useSearchParams()` to read `from` / `requestUuid`
 * for context-aware back navigation. Must live behind a <Suspense> boundary
 * (see default export below) so Next.js can statically pre-render / bail out
 * to client rendering without throwing the "missing-suspense-with-csr-bailout"
 * build error.
 */
function OfferDetailPageInner() {
  const { isReady } = useRequireAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const offerUuid = params.offer_uuid as string;

  /* ── Context-aware back navigation ──────────
     If the user arrived from a request detail page, `from` will be "request"
     and `requestUuid` will carry the originating request's UUID. In that case the
     back link points to `/requests/<uuid>` so the user returns to where they
     were. Otherwise, we default to the dashboard.
     ──────────────────────────────────────────── */
  const fromContext = searchParams.get("from");
  const originRequestUuid = searchParams.get("requestUuid");
  const backHref =
    fromContext === "request" && originRequestUuid
      ? `/requests/${originRequestUuid}`
      : "/dashboard";
  const backLabel =
    fromContext === "request" && originRequestUuid
      ? "Back to Request"
      : "Back to Dashboard";

  /* ── Data state ─────────────────────────── */
  const [detail, setDetail] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── Linked request state (fetched separately for the "request" tab) ── */
  const [requestDetail, setRequestDetail] = useState<VehicleRequestDetail | null>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  /* ── Tab state ──────────────────────────── */
  const [activeTab, setActiveTab] = useState<TabId>("details");

  /* ── Fetch offer detail on mount ─────────────── */
  useEffect(() => {
    if (!offerUuid) {
      setError("Invalid offer ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getOfferDetail(offerUuid)
      .then((data) => {
        setDetail(data);
        setError("");

        // Mark any unseen notifications for this offer as seen — fire-and-forget.
        // This clears the "New" badge on the dashboard card and reduces the tab count.
        markNotificationsSeen({ offerUuid }).catch(() => {});
      })
      .catch(() => setError("Could not load offer details."))
      .finally(() => setLoading(false));
  }, [offerUuid]);

  /* ── Fetch linked request details when the "request" tab is first opened ── */
  useEffect(() => {
    // Only fetch when the request tab is active and we have the offer detail
    if (activeTab !== "request" || !detail?.requestUuid) return;
    // Don't re-fetch if already loaded or loading
    if (requestDetail || requestLoading) return;

    setRequestLoading(true);
    getVehicleRequestDetail(detail.requestUuid)
      .then((data) => {
        setRequestDetail(data);
        setRequestError("");
      })
      .catch(() => setRequestError("Could not load request details."))
      .finally(() => setRequestLoading(false));
  }, [activeTab, detail, requestDetail, requestLoading]);

  if (!isReady)
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );

  /* ── Loading state ──────────────────────── */
  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading offer details…</p>
        </div>
      </main>
    );
  }

  /* ── Error state ────────────────────────── */
  if (error || !detail) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-gray-900">
            {error || "Offer not found."}
          </p>
          <Button asChild variant="outline">
            <Link href={backHref}>
              <ArrowLeft className="size-4 mr-1" />
              {backLabel}
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  /* ── Derived display values ─────────────── */
  const statusCfg = STATUS_CONFIG[detail.status] ?? STATUS_CONFIG.active;
  const isSender = detail.viewerRole === "sender";
  const isReceiver = detail.viewerRole === "receiver";

  // Role-aware accent colors for the tab bar
  const activeTabBorder = isSender ? "border-blue-600" : "border-green-600";
  const activeTabText = isSender ? "text-blue-600" : "text-green-600";
  const activeTabIconColor = isSender ? "text-blue-600" : "text-green-600";
  const inactiveTabIconColor = "text-gray-400 group-hover:text-gray-500";

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white">
      <FadeIn direction="up" duration={0.4}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

        {/* ── Role Banner ── */}
        {/* A prominent banner at the top that immediately communicates the
            viewer's relationship to this offer, preventing any confusion
            when a dealer views offers they sent vs. offers they received. */}
        <div
          className={cn(
            "mb-6 flex items-center gap-3 rounded-lg border px-4 py-3",
            isSender
              ? "border-blue-200 bg-blue-50 text-blue-800"
              : "border-green-200 bg-green-50 text-green-800"
          )}
        >
          {isSender ? (
            <>
              <Send className="size-5 shrink-0" />
              <p className="text-sm font-medium">
                You sent this offer
              </p>
            </>
          ) : (
            <>
              {/* Dealer logo in banner, or fallback to Inbox icon */}
              {detail.dealerLogo ? (
                <img
                  src={detail.dealerLogo}
                  alt={`${detail.dealerName || "Dealer"} logo`}
                  className="size-7 rounded-md object-cover border border-green-200 shrink-0"
                />
              ) : (
                <Inbox className="size-5 shrink-0" />
              )}
              <p className="text-sm font-medium">
                {detail.dealerName
                  ? `Offer from ${detail.dealerName}`
                  : "You received this offer"}
                {detail.dealerCity && detail.dealerState && (
                  <span className="text-xs font-normal ml-2 opacity-75">
                    — {detail.dealerCity}, {detail.dealerState}
                  </span>
                )}
              </p>
            </>
          )}
        </div>

        {/* ── Header: back link, title, status badge ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Link
              href={backHref}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium mb-3 transition-colors",
                isSender
                  ? "text-blue-600 hover:text-blue-700"
                  : "text-green-600 hover:text-green-700"
              )}
            >
              <ArrowLeft className="size-4" />
              {backLabel}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {detail.year} {detail.makeName} {detail.modelName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {/* Role-aware subtitle */}
              Offer #{detail.uuid.slice(0, 8).toUpperCase()} ·{" "}
              {isSender
                ? `You sent this on ${formatDate(detail.createdAt)}`
                : detail.dealerName
                  ? `Received from ${detail.dealerName} on ${formatDate(detail.createdAt)}`
                  : `Received on ${formatDate(detail.createdAt)}`}
              {detail.updatedAt !== detail.createdAt && (
                <span className="ml-2 text-gray-400">
                  · Updated {formatDate(detail.updatedAt)}
                </span>
              )}
            </p>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
                statusCfg.badgeBg,
                statusCfg.badgeText
              )}
            >
              <span className={cn("size-2 rounded-full", statusCfg.dotColor)} />
              {statusCfg.label}
            </span>

            {/* MUST CHANGE LATER: Re-add match score badge here once scoring logic is implemented.
                Was: {detail.matchScore != null && (<span>…{detail.matchScore}% Match</span>)} */}
          </div>
        </div>

        {/* ── Tab Bar ─────────────────────────── */}
        {/* Horizontally scrollable on small screens so the tab row
            stays on a single line even when the labels are long. */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
          <nav className="-mb-px flex gap-4 sm:gap-6 min-w-max" aria-label="Offer tabs">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
                    isActive
                      ? `${activeTabBorder} ${activeTabText}`
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  <span
                    className={cn(
                      "transition-colors",
                      isActive ? activeTabIconColor : inactiveTabIconColor
                    )}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Tab Content (narrower inner container) ── */}
        <div className="mx-auto max-w-4xl">
          {activeTab === "details" && (
            <OfferDetailTab
              detail={detail}
              viewerRole={detail.viewerRole}
              onDetailUpdated={setDetail}
            />
          )}

          {activeTab === "request" && (
            <div className="space-y-6">
              {/* --- Loading state for request details --- */}
              {requestLoading && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Loader2 className="size-6 animate-spin text-blue-600 mb-2" />
                  <p className="text-sm font-medium">Loading request details…</p>
                </div>
              )}

              {/* --- Error state for request details --- */}
              {requestError && !requestLoading && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">{requestError}</p>
                </div>
              )}

              {/* --- Full request details (shown once loaded) --- */}
              {requestDetail && !requestLoading && (() => {
                const target = requestDetail.target;

                /* Build the vehicle title like "2020–2025 Toyota Camry" */
                const vehicleTitle = [
                  target.yearMin === target.yearMax
                    ? `${target.yearMin}`
                    : `${target.yearMin}–${target.yearMax}`,
                  target.makeName || "Any Make",
                  target.modelName || "Any Model",
                ].join(" ");

                return (
                  <>
                    {/* ── Vehicle Info Section ── */}
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 border-b border-gray-200">
                        <Car className="size-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          Vehicle Wanted
                        </h3>
                        <span className="ml-auto text-xs font-medium text-gray-400">
                          Request #{requestDetail.uuid.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="px-5 py-4 space-y-0.5">
                        {/* Vehicle headline */}
                        <p className="text-lg font-bold text-gray-900 mb-3">{vehicleTitle}</p>

                        <InfoRow label="Make" value={target.makeName || "Any"} />
                        <InfoRow label="Model" value={target.modelName || "Any"} />
                        <InfoRow
                          label="Year Range"
                          value={
                            target.yearMin === target.yearMax
                              ? `${target.yearMin}`
                              : `${target.yearMin} – ${target.yearMax}`
                          }
                        />
                        {target.trim && <InfoRow label="Preferred Trim" value={target.trim} />}
                        {target.maxMileage != null && target.maxMileage > 0 && (
                          <InfoRow label="Max Mileage" value={`${target.maxMileage.toLocaleString()} mi`} />
                        )}
                      </div>
                    </div>

                    {/* ── Vehicle Specs Section ── */}
                    {(
                      (target.bodyStyle && target.bodyStyle !== "any") ||
                      (target.drivetrain && target.drivetrain !== "any") ||
                      (target.fuelType && target.fuelType !== "any") ||
                      (target.transmission && target.transmission !== "any") ||
                      (target.titleStatus && target.titleStatus !== "any") ||
                      (target.exteriorColor && target.exteriorColor !== "") ||
                      (target.interiorColor && target.interiorColor !== "")
                    ) && (
                      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 border-b border-gray-200">
                          <Settings2 className="size-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-900">
                            Preferred Specs
                          </h3>
                        </div>
                        <div className="px-5 py-4 space-y-0.5">
                          {target.bodyStyle && target.bodyStyle !== "any" && (
                            <InfoRow label="Body Style" value={formatBodyStyle(target.bodyStyle)} />
                          )}
                          {target.drivetrain && target.drivetrain !== "any" && (
                            <InfoRow label="Drivetrain" value={target.drivetrain.toUpperCase()} />
                          )}
                          {target.fuelType && target.fuelType !== "any" && (
                            <InfoRow label="Fuel Type" value={formatSpec(target.fuelType)} />
                          )}
                          {target.transmission && target.transmission !== "any" && (
                            <InfoRow label="Transmission" value={formatSpec(target.transmission)} />
                          )}
                          {target.titleStatus && target.titleStatus !== "any" && (
                            <InfoRow
                              label="Title Status"
                              value={target.titleStatus === "clean" ? "Clean Only" : "Rebuilt OK"}
                            />
                          )}
                          {target.exteriorColor && (
                            <InfoRow label="Exterior Color" value={formatSpec(target.exteriorColor)} />
                          )}
                          {target.interiorColor && (
                            <InfoRow label="Interior Color" value={formatSpec(target.interiorColor)} />
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Budget & Pricing Section ── */}
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 border-b border-gray-200">
                        <DollarSign className="size-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          Budget & Pricing
                        </h3>
                      </div>
                      <div className="px-5 py-4 space-y-0.5">
                        <InfoRow label="Purchase Mode" value={formatPurchaseMode(requestDetail.purchaseMode)} />
                        {requestDetail.maxBudget && (
                          <InfoRow label="Max Budget" value={`$${Number(requestDetail.maxBudget).toLocaleString()}`} />
                        )}
                        {requestDetail.maxMonthlyPayment && (
                          <InfoRow
                            label="Max Monthly Payment"
                            value={`$${Number(requestDetail.maxMonthlyPayment).toLocaleString()}/mo`}
                          />
                        )}
                        {requestDetail.downPayment && (
                          <InfoRow label="Down Payment" value={`$${Number(requestDetail.downPayment).toLocaleString()}`} />
                        )}
                        {/* Credit range only applies to financed purchases, and we hide it when
                            the buyer explicitly chose "prefer not to say" — otherwise the row
                            would surface an empty/awkward value to the seller. */}
                        {requestDetail.creditRange &&
                          requestDetail.creditRange !== "prefer_not" &&
                          requestDetail.purchaseMode === "finance" && (
                            <InfoRow
                              label="Credit Range"
                              value={formatCreditRange(requestDetail.creditRange)}
                            />
                          )}
                      </div>
                    </div>

                    {/* ── Location Section ── */}
                    {(requestDetail.zipCode || requestDetail.searchRadius) && (
                      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 border-b border-gray-200">
                          <MapPin className="size-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-900">
                            Location
                          </h3>
                        </div>
                        <div className="px-5 py-4 space-y-0.5">
                          {requestDetail.zipCode && (
                            <InfoRow
                              label="Location"
                              value={
                                requestDetail.cityName && requestDetail.stateName
                                  ? `${requestDetail.cityName}, ${requestDetail.stateName} ${requestDetail.zipCode}`
                                  : requestDetail.zipCode
                              }
                            />
                          )}
                          {requestDetail.searchRadius && (
                            <InfoRow label="Search Radius" value={`${requestDetail.searchRadius} miles`} />
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── Features Section (only if buyer specified features) ── */}
                    {requestDetail.features && requestDetail.features.length > 0 && (
                      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 border-b border-gray-200">
                          <Sparkles className="size-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-900">
                            Desired Features
                          </h3>
                        </div>
                        <div className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {requestDetail.features.map((feature) => (
                              <span
                                key={feature}
                                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Notes Section (only if buyer left notes) ── */}
                    {requestDetail.notes && (
                      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="flex items-center gap-2 bg-gray-50 px-5 py-3 border-b border-gray-200">
                          <FileText className="size-4 text-blue-600" />
                          <h3 className="text-sm font-semibold text-gray-900">
                            Buyer Notes
                          </h3>
                        </div>
                        <div className="px-5 py-4">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {requestDetail.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      </FadeIn>
    </main>
  );
}

/**
 * Default export wraps the inner component in a <Suspense> boundary so that
 * `useSearchParams()` is allowed during static generation.
 */
export default function OfferDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </main>
      }
    >
      <OfferDetailPageInner />
    </Suspense>
  );
}
