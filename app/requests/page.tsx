"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Car,
  DollarSign,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowRight,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listAllActiveRequests, getUserProfile } from "@/lib/api";
import type { BrowseRequestItem, PaginatedBrowseResponse } from "@/lib/types";
import { FadeIn } from "@/components/motion";
import { useAuth } from "@/lib/auth-context";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ── Display helpers ─────────────────────────────────── */

/** Human-readable labels for purchase modes */
const PURCHASE_MODE_LABELS: Record<string, string> = {
  cash: "Cash",
  finance: "Finance",
  lease: "Lease",
  not_sure: "Not Sure",
};

/** Human-readable labels for body styles (only shown when not "any") */
const BODY_STYLE_LABELS: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  coupe: "Coupe",
  hatch: "Hatchback",
  truck: "Truck",
  van: "Van",
  wagon: "Wagon",
};

/**
 * Formats the budget into a concise display string.
 * Cash purchases show "Up to $X", everything else shows the purchase mode label.
 */
function formatBudget(item: BrowseRequestItem): string {
  if (item.maxBudget) {
    return `Up to $${Number(item.maxBudget).toLocaleString()}`;
  }
  return "Flexible budget";
}

/**
 * Formats the location into a compact string using city/state when available.
 * Falls back to raw zip code if no city/state data exists.
 * Examples: "Los Angeles, CA · 25 mi radius", "90210", "Nationwide"
 */
function formatLocation(item: BrowseRequestItem): string {
  const radiusPart = item.searchRadius
    ? `${Number(item.searchRadius)} mi`
    : "";
  /* Prefer "City, ST" when the backend resolved the zip code */
  const locationPart =
    item.cityName && item.stateName
      ? `${item.cityName}, ${item.stateName}`
      : item.zipCode || "";
  /* No radius + no location means the user chose Nationwide */
  if (!locationPart && !radiusPart) return "Nationwide";
  if (locationPart && radiusPart)
    return `${locationPart} · ${radiusPart} radius`;
  if (locationPart) return locationPart;
  if (radiusPart) return `${radiusPart} radius`;
  return "Nationwide";
}

/**
 * Converts an ISO date string into a human-friendly relative time label.
 * e.g. "2 hours ago", "3 days ago", "Just now"
 */
function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

/* ── Filter options ───────────────────────────────────── */

/** Body style filter values. "all" means no filtering. */
type BodyStyleFilter = "all" | "sedan" | "suv" | "coupe" | "hatch" | "truck" | "van" | "wagon";

/** Purchase mode filter values. "all" means no filtering. */
type PurchaseModeFilter = "all" | "cash" | "finance" | "lease";

/** Radius filter values (miles). Empty string means no location filter. */
type RadiusFilter = "" | "25" | "50" | "100" | "200" | "500";

/** Labels displayed on body style filter pills */
const BODY_STYLE_FILTER_OPTIONS: { value: BodyStyleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "coupe", label: "Coupe" },
  { value: "hatch", label: "Hatchback" },
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "wagon", label: "Wagon" },
];

/** Labels displayed on purchase mode filter pills */
const PURCHASE_MODE_FILTER_OPTIONS: { value: PurchaseModeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "cash", label: "Cash" },
  { value: "finance", label: "Finance" },
  { value: "lease", label: "Lease" },
];

/** Radius dropdown options for location filtering */
const RADIUS_OPTIONS: { value: RadiusFilter; label: string }[] = [
  { value: "25", label: "25 mi" },
  { value: "50", label: "50 mi" },
  { value: "100", label: "100 mi" },
  { value: "200", label: "200 mi" },
  { value: "500", label: "500 mi" },
];

/* ── Page size used for pagination ───────────────────── */
const PAGE_SIZE = 12;

/**
 * /requests – Dealer-only browse page.
 *
 * Lists all active vehicle requests on the platform in reverse chronological
 * order with server-side pagination. Each card shows a concise summary
 * (vehicle, budget, location, timestamp) and links to the full detail page.
 *
 * Access control:
 *  - Unauthenticated visitors are redirected to /login?next=/requests.
 *  - Authenticated users whose profile is not a dealer are redirected to
 *    /dashboard with an info toast, since this page exposes buyer demand
 *    that only dealers are meant to act on.
 *  - While the auth/profile check is in flight we render a loading state
 *    rather than briefly flashing the page contents to non-dealers.
 */
export default function RequestsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // --- Dealer gate state ---
  // `isDealer` stays null until we know the answer (authenticated users only).
  // `gateChecked` flips to true once we've finished evaluating the gate so
  // we know whether to show the loading spinner vs. the page contents.
  const [isDealer, setIsDealer] = useState<boolean | null>(null);
  const [gateChecked, setGateChecked] = useState(false);

  // --- Pagination & data state ---
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedBrowseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Filter state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [bodyStyleFilter, setBodyStyleFilter] = useState<BodyStyleFilter>("all");
  const [purchaseModeFilter, setPurchaseModeFilter] = useState<PurchaseModeFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  // --- Location filter state ---
  const [locationZip, setLocationZip] = useState("");
  const [locationRadius, setLocationRadius] = useState<RadiusFilter>("100");

  // --- Debounced search (wait 500ms after the user stops typing) ---
  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  // Debounce the zip input so we don't fire requests on every keystroke.
  // Only send the filter once the user has typed a full 5-digit zip.
  const debouncedZip = useDebouncedValue(locationZip, 500);
  const effectiveZip = debouncedZip.length === 5 ? debouncedZip : "";

  // --- Track whether the initial load is complete so we can distinguish
  //     it from subsequent filter-driven re-fetches ---
  const [hasLoaded, setHasLoaded] = useState(false);

  /** True when any filter is actively narrowing the results */
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    bodyStyleFilter !== "all" ||
    purchaseModeFilter !== "all" ||
    effectiveZip !== "";

  /** Clear every filter and search back to defaults */
  function clearAllFilters() {
    setSearchQuery("");
    setBodyStyleFilter("all");
    setPurchaseModeFilter("all");
    setLocationZip("");
    setLocationRadius("100");
  }

  // --- Dealer access gate ---
  // Runs once auth state resolves. If the user is signed out, bounce to the
  // login page. If signed in but not a dealer, bounce to the dashboard with
  // an info toast explaining that this area is dealer-only. Dealers pass
  // through and the rest of the page mounts normally.
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login?next=/requests");
      return;
    }

    let cancelled = false;
    getUserProfile()
      .then((profile) => {
        if (cancelled) return;
        const userIsDealer = profile.user_type === "dealer";
        setIsDealer(userIsDealer);
        setGateChecked(true);
        if (!userIsDealer) {
          toast.info("Browsing buyer requests is available to dealer accounts only.");
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        // If we can't confirm the profile, err on the side of caution and
        // send the user back to their dashboard rather than leaking the list.
        if (cancelled) return;
        setIsDealer(false);
        setGateChecked(true);
        router.replace("/dashboard");
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, router]);

  // --- Fetch data from the backend with current filters ---
  const fetchData = useCallback(
    async (
      targetPage: number,
      search: string,
      bodyStyle: string,
      purchaseMode: string,
      zip: string,
      radius: string
    ) => {
      setLoading(true);
      setError("");
      try {
        const response = await listAllActiveRequests(
          targetPage,
          PAGE_SIZE,
          search || undefined,
          bodyStyle || undefined,
          purchaseMode || undefined,
          zip || undefined,
          radius || undefined
        );
        setData(response);
        setPage(response.page);
        setHasLoaded(true);
      } catch {
        setError("Failed to load requests. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Re-fetch whenever page, debounced search, filters, or location change.
  // Skip entirely until the dealer gate has confirmed access — otherwise we
  // would fire a doomed request (and get a 403) for buyers who are about to
  // be redirected away from this page.
  useEffect(() => {
    if (!isDealer) return;
    fetchData(page, debouncedSearch, bodyStyleFilter, purchaseModeFilter, effectiveZip, locationRadius);
  }, [isDealer, page, debouncedSearch, bodyStyleFilter, purchaseModeFilter, effectiveZip, locationRadius, fetchData]);

  // Reset to page 1 when any filter criteria changes (not page itself)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, bodyStyleFilter, purchaseModeFilter, effectiveZip, locationRadius]);

  /** Navigate to a specific page and scroll to top */
  function goToPage(targetPage: number) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPage(targetPage);
  }

  // --- Loading state ---
  // Shown while (a) the auth/dealer gate is still being evaluated, (b) the
  // user has been identified as a non-dealer and a redirect is pending, or
  // (c) the initial data fetch is still in flight for a confirmed dealer.
  const gatePending = authLoading || !gateChecked || isDealer !== true;
  if (gatePending || (loading && !hasLoaded)) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
            <Loader2 className="size-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">Loading requests…</p>
          </div>
        </div>
      </main>
    );
  }

  // --- Error state (only if we never got any data) ---
  if (error && !hasLoaded) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <p className="text-lg font-semibold text-gray-900">{error}</p>
            <Button
              onClick={() => fetchData(1, "", "all", "all", "", "100")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const results = data?.results ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? 1;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* --- Page Header --- */}
      <FadeIn direction="none" duration={0.3}>
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Browse Requests
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalCount === 0
                ? hasActiveFilters
                  ? "No requests match your current filters."
                  : "No active requests right now."
                : `${totalCount} active request${totalCount !== 1 ? "s" : ""} from buyers`}
            </p>
          </div>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm w-full sm:w-auto"
          >
            <Link href="/requests/create">
              <Plus className="size-4 mr-1.5" />
              Find a Car
            </Link>
          </Button>
        </div>
      </div>
      </FadeIn>

      {/* --- Content Area --- */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* --- Search & Filter Bar --- */}
        {(totalCount > 0 || hasActiveFilters) && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search input — filters by make or model name */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by make or model…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* Toggle filter panel button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0",
                  showFilters && "border-blue-500 text-blue-600 bg-blue-50"
                )}
              >
                <SlidersHorizontal className="size-4 mr-1.5" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-bold">
                    !
                  </span>
                )}
              </Button>
            </div>

            {/* Collapsible filter panel */}
            {showFilters && (
              <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
                {/* --- Body Style row --- */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 mr-1">
                    Body Style:
                  </span>
                  {BODY_STYLE_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBodyStyleFilter(option.value)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                        bodyStyleFilter === option.value
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* --- Purchase Mode row --- */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 mr-1">
                    Purchase Mode:
                  </span>
                  {PURCHASE_MODE_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPurchaseModeFilter(option.value)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                        purchaseModeFilter === option.value
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* --- Location row: zip code input + radius dropdown --- */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 mr-1">
                    <MapPin className="inline size-3 mr-0.5 -mt-0.5" />
                    Location:
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="Zip code"
                      value={locationZip}
                      onChange={(e) => {
                        // Only allow digits, max 5 chars
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 5);
                        setLocationZip(cleaned);
                      }}
                      className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                    {locationZip && (
                      <button
                        type="button"
                        onClick={() => setLocationZip("")}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Clear zip code"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">within</span>
                  <Select
                    value={locationRadius}
                    onValueChange={(value) => setLocationRadius(value as RadiusFilter)}
                  >
                    <SelectTrigger size="sm" className="w-auto h-auto px-2 py-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RADIUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear all filters link — always rendered to reserve layout
                    space and prevent the filter card from expanding/collapsing
                    when filters become active. Invisible when no filters are set. */}
                <div className={cn("flex justify-end", !hasActiveFilters && "invisible")}>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Cards Grid --- */}
        {/* Dim results while a filter-driven re-fetch is in progress */}
        {results.length > 0 ? (
          <>
            {/* Plain grid instead of StaggerContainer/StaggerItem — Framer Motion
                stagger variants are unreliable with dynamically filtered lists
                (items can get stuck at opacity 0). A CSS transition on the
                wrapper gives a smooth dim/undim effect without ghost items. */}
            <div
              className={cn(
                "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200",
                loading && hasLoaded && "opacity-50 pointer-events-none"
              )}
            >
              {results.map((item) => (
                <RequestCard key={item.uuid} item={item} />
              ))}
            </div>

            {/* --- Pagination Controls --- */}
            {totalPages > 1 && (
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}
          </>
        ) : hasActiveFilters ? (
          /* Filtered empty state – filters produced no results */
          <div className="text-center py-20">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <Search className="size-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No matching requests
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              <X className="size-4 mr-1.5" />
              Clear all filters
            </Button>
          </div>
        ) : (
          /* True empty state – no active requests at all */
          <div className="text-center py-20">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <Car className="size-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No active requests
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Be the first to submit a vehicle request and get matched with
              dealers in your area.
            </p>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Link href="/requests/create">
                <Plus className="size-4 mr-1.5" />
                Find a Car
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

/* ── RequestCard Component ───────────────────────────── */

/**
 * A single card in the browse grid showing a concise summary of one active
 * vehicle request: vehicle info, budget, location, and how long ago it was
 * posted. Links through to the full detail page.
 */
function RequestCard({ item }: { item: BrowseRequestItem }) {
  /** Build a concise vehicle title like "Toyota Camry" or "Any Make / Any Model" */
  const vehicleTitle =
    item.makeName === "Any" && item.modelName === "Any"
      ? "Any Vehicle"
      : `${item.makeName} ${item.modelName}`;

  /** Year range label — collapse to single year if min === max */
  const yearLabel =
    item.yearMin === item.yearMax
      ? `${item.yearMin}`
      : `${item.yearMin}–${item.yearMax}`;

  /** Show body style as a small badge when it's not "any" */
  const bodyStyleLabel = BODY_STYLE_LABELS[item.bodyStyle] ?? null;

  return (
    <Link
      href={`/requests/${item.uuid}`}
      className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5"
    >
      {/* --- Top section: vehicle info --- */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Car className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                {vehicleTitle}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{yearLabel}</p>
            </div>
          </div>

          {/* Body style badge (only when not "any") */}
          {bodyStyleLabel && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 shrink-0">
              {bodyStyleLabel}
            </span>
          )}
        </div>

        {/* --- Info rows: budget + location --- */}
        <div className="space-y-2 mb-4">
          {/* Budget */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="size-4 shrink-0 text-gray-400" />
            <span>
              {formatBudget(item)}
              {item.purchaseMode !== "not_sure" && (
                <span className="ml-1 text-xs text-gray-400">
                  ({PURCHASE_MODE_LABELS[item.purchaseMode] ?? item.purchaseMode})
                </span>
              )}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="size-4 shrink-0 text-gray-400" />
            <span>{formatLocation(item)}</span>
          </div>
        </div>
      </div>

      {/* --- Bottom section: timestamp + view link --- */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="size-3.5" />
          <span>{timeAgo(item.createdAt)}</span>
        </div>

        <span className="flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View details
          <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}

/* ── PaginationBar Component ─────────────────────────── */

/**
 * Renders page navigation controls: previous / next buttons plus numbered
 * page buttons. Collapses gracefully with ellipsis for large page counts.
 */
function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  /**
   * Build the set of page numbers to display, adding ellipsis (null) where
   * pages are skipped. Always shows first, last, current, and one neighbor
   * on each side.
   */
  function getPageNumbers(): (number | null)[] {
    const pages: (number | null)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Left ellipsis if current page is far from the start
    if (currentPage > 3) {
      pages.push(null);
    }

    // Pages around the current page
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Right ellipsis if current page is far from the end
    if (currentPage < totalPages - 2) {
      pages.push(null);
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
      aria-label="Pagination"
    >
      {/* Page info label */}
      <p className="text-sm text-gray-500 order-2 sm:order-1">
        Page {currentPage} of {totalPages}
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        {/* Numbered page buttons */}
        {pageNumbers.map((pageNum, index) =>
          pageNum === null ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-gray-400 select-none"
            >
              &hellip;
            </span>
          ) : (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={
                pageNum === currentPage
                  ? "bg-blue-600 text-white hover:bg-blue-700 min-w-9"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 min-w-9"
              }
            >
              {pageNum}
            </Button>
          )
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
