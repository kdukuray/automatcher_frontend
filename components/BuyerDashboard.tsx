"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Car,
  DollarSign,
  MapPin,
  MessageSquare,
  Loader2,
  SlidersHorizontal,
  X,
  Inbox,
  ClipboardList,
  Package,
  User,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listVehicleRequests, listReceivedOffers, getNotificationCounts } from "@/lib/api";
import type {
  VehicleRequestListItem,
  ReceivedOfferListItem,
  NotificationCounts,
} from "@/lib/types";
import PaginationBar from "@/components/PaginationBar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

/* ── Tab types ────────────────────────────────────── */

type BuyerDashboardTab = "requests" | "received";

interface TabConfig {
  id: BuyerDashboardTab;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: "received", label: "Offers Received", icon: <Inbox className="size-4" /> },
  { id: "requests", label: "My Requests", icon: <ClipboardList className="size-4" /> },
];

/* ── Constants for purchase mode labels ───────────── */

const PURCHASE_MODE_LABELS: Record<string, string> = {
  cash: "Cash",
  finance: "Finance",
  lease: "Lease",
  not_sure: "Not Sure",
};

/* ── Constants for offer status labels ───────────── */

const OFFER_STATUS_LABELS: Record<string, string> = {
  all: "All",
  active: "Active",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
  expired: "Expired",
};

/* ── Filter options ───────────────────────────────── */

type RequestStatusFilter = "all" | "active" | "inactive";
type ReceivedOfferStatusFilter = "all" | "active" | "accepted" | "declined" | "withdrawn" | "expired";

/**
 * BuyerDashboard – Rendered when the dashboard toggle is set to "Buyer" mode.
 *
 * Displays two tabs:
 *   1. My Requests – List of the user's vehicle requests with search/filter
 *   2. Offers Received – List of all offers received across all requests
 *
 * Each tab has search/filter controls and displays cards that link to detail pages.
 */
export default function BuyerDashboard() {
  // --- Tab state ---
  const [activeTab, setActiveTab] = useState<BuyerDashboardTab>("received");

  // --- Notification badge counts for tab buttons and filter pills ---
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    offersSent: 0,
    offersReceived: 0,
    myRequests: 0,
    offersSentByStatus: {},
    offersReceivedByStatus: {},
  });

  // --- Requests data, pagination & filters ---
  const [requests, setRequests] = useState<VehicleRequestListItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [requestsSearchQuery, setRequestsSearchQuery] = useState("");
  const [requestsStatusFilter, setRequestsStatusFilter] =
    useState<RequestStatusFilter>("all");
  const [showRequestsFilters, setShowRequestsFilters] = useState(false);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [requestsTotalCount, setRequestsTotalCount] = useState(0);

  // --- Received offers data, pagination & filters ---
  const [receivedOffers, setReceivedOffers] = useState<ReceivedOfferListItem[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(true);
  const [receivedError, setReceivedError] = useState("");
  const [receivedSearchQuery, setReceivedSearchQuery] = useState("");
  const [receivedStatusFilter, setReceivedStatusFilter] =
    useState<ReceivedOfferStatusFilter>("active");
  const [showReceivedFilters, setShowReceivedFilters] = useState(true);
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedTotalPages, setReceivedTotalPages] = useState(1);
  const [receivedTotalCount, setReceivedTotalCount] = useState(0);

  // --- Debounced search values (wait 500ms after the user stops typing) ---
  const debouncedRequestsSearch = useDebouncedValue(requestsSearchQuery, 500);
  const debouncedReceivedSearch = useDebouncedValue(receivedSearchQuery, 500);

  // --- Track whether each tab has completed its first load.
  //     Used to distinguish initial load (show full-page spinner) from
  //     filter-driven re-fetches (keep UI visible, dim results). ---
  const [requestsHasLoaded, setRequestsHasLoaded] = useState(false);
  const [receivedHasLoaded, setReceivedHasLoaded] = useState(false);

  // --- AbortController refs for cancelling stale requests ---
  const requestsAbortRef = useRef<AbortController | null>(null);
  const receivedAbortRef = useRef<AbortController | null>(null);

  // --- Fetch notification counts once on mount to populate tab badges ---
  useEffect(() => {
    getNotificationCounts()
      .then(setNotificationCounts)
      .catch(() => {
        // Silently ignore — badge counts are non-critical UI
      });
  }, []);

  // --- Fetch requests (server-side filtered) ---
  const fetchRequests = useCallback(
    (page: number, search: string, status: string) => {
      requestsAbortRef.current?.abort();
      requestsAbortRef.current = new AbortController();

      setRequestsLoading(true);
      listVehicleRequests(page, 12, search || undefined, status || undefined)
        .then((data) => {
          setRequests(data.results);
          setRequestsPage(data.page);
          setRequestsTotalPages(data.totalPages);
          setRequestsTotalCount(data.totalCount);
          setRequestsError("");
          setRequestsHasLoaded(true);
        })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            setRequestsError(
              "Failed to load your requests. Please try again."
            );
          }
        })
        .finally(() => setRequestsLoading(false));
    },
    []
  );

  // Re-fetch requests when page, debounced search, or status filter changes
  useEffect(() => {
    fetchRequests(requestsPage, debouncedRequestsSearch, requestsStatusFilter);
  }, [
    requestsPage,
    debouncedRequestsSearch,
    requestsStatusFilter,
    fetchRequests,
  ]);

  // Reset to page 1 when filter criteria change (not when page itself changes)
  useEffect(() => {
    setRequestsPage(1);
  }, [debouncedRequestsSearch, requestsStatusFilter]);

  // --- Fetch received offers (server-side filtered) ---
  const fetchReceivedOffers = useCallback(
    (page: number, search: string, status: string) => {
      receivedAbortRef.current?.abort();
      receivedAbortRef.current = new AbortController();

      setReceivedLoading(true);
      listReceivedOffers(page, 12, search || undefined, status || undefined)
        .then((data) => {
          setReceivedOffers(data.results);
          setReceivedPage(data.page);
          setReceivedTotalPages(data.totalPages);
          setReceivedTotalCount(data.totalCount);
          setReceivedError("");
          setReceivedHasLoaded(true);
        })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            setReceivedError(
              "Failed to load received offers. Please try again."
            );
          }
        })
        .finally(() => setReceivedLoading(false));
    },
    []
  );

  useEffect(() => {
    fetchReceivedOffers(
      receivedPage,
      debouncedReceivedSearch,
      receivedStatusFilter
    );
  }, [
    receivedPage,
    debouncedReceivedSearch,
    receivedStatusFilter,
    fetchReceivedOffers,
  ]);

  useEffect(() => {
    setReceivedPage(1);
  }, [debouncedReceivedSearch, receivedStatusFilter]);

  const hasActiveRequestsFilters =
    requestsStatusFilter !== "all" || requestsSearchQuery.trim() !== "";
  const hasActiveReceivedFilters =
    receivedStatusFilter !== "all" || receivedSearchQuery.trim() !== "";

  // --- Helper functions ---

  /**
   * Formats the budget display text based on purchase mode.
   * Cash → "Up to $X", Finance/Lease → "$X/mo", Not Sure → "Flexible"
   */
  function formatBudget(item: VehicleRequestListItem): string {
    if (item.purchaseMode === "cash" && item.maxBudget) {
      return `Up to $${Number(item.maxBudget).toLocaleString()}`;
    }
    if (
      (item.purchaseMode === "finance" || item.purchaseMode === "lease") &&
      item.maxMonthlyPayment
    ) {
      return `$${Number(item.maxMonthlyPayment).toLocaleString()}/mo`;
    }
    return "Flexible budget";
  }

  /**
   * Formats the location display string using city/state when available.
   * Falls back to raw zip code if no city/state data exists.
   * Examples: "Los Angeles, CA · 25 mi radius", "90210", "Nationwide"
   */
  function formatLocation(item: VehicleRequestListItem): string {
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
   * Format the offered price display based on purchase mode.
   * Cash → "$X", Finance/Lease → "$X/mo"
   */
  function formatOfferPrice(offer: ReceivedOfferListItem): string {
    if (offer.purchaseMode === "cash" && offer.offeredPrice) {
      return `$${Number(offer.offeredPrice).toLocaleString()}`;
    }
    if (
      (offer.purchaseMode === "finance" || offer.purchaseMode === "lease") &&
      offer.offeredMonthlyPayment
    ) {
      return `$${Number(offer.offeredMonthlyPayment).toLocaleString()}/mo`;
    }
    return "—";
  }

  /* ═══════════════════════════════════════════
     RENDER: REQUESTS TAB
     ═══════════════════════════════════════════ */

  const renderRequestsTab = () => {
    // Full-page loading spinner — only shown on the very first load before
    // any data exists. Subsequent filter/search fetches keep the UI visible.
    if (requestsLoading && !requestsHasLoaded) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading your requests…</p>
        </div>
      );
    }

    // Error state
    if (requestsError) {
      return (
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-gray-900">{requestsError}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Retry
          </Button>
        </div>
      );
    }

    return (
      <>
        {/* --- Top Bar: Title + New Request Button --- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              My Requests
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {requestsTotalCount === 0
                ? hasActiveRequestsFilters
                  ? "No results match your current filters."
                  : "You haven't created any requests yet."
                : `${requestsTotalCount} request${requestsTotalCount !== 1 ? "s" : ""} total`}
            </p>
          </div>

          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            <Link href="/requests/create">
              <Plus className="size-4 mr-1.5" />
              New Request
            </Link>
          </Button>
        </div>

        {/* --- Search & Filter Bar (stays visible when filters are active so the user can clear them) --- */}
        {(requestsTotalCount > 0 || hasActiveRequestsFilters) && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search input — filters within the current page */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by make, model, or year…"
                  value={requestsSearchQuery}
                  onChange={(e) => setRequestsSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {requestsSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setRequestsSearchQuery("")}
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
                onClick={() => setShowRequestsFilters(!showRequestsFilters)}
                className={cn(
                  "border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0",
                  showRequestsFilters && "border-blue-500 text-blue-600 bg-blue-50"
                )}
              >
                <SlidersHorizontal className="size-4 mr-1.5" />
                Filters
                {hasActiveRequestsFilters && (
                  <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-bold">
                    !
                  </span>
                )}
              </Button>
            </div>

            {/* Collapsible filter row */}
            {showRequestsFilters && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
                <span className="text-xs font-medium text-gray-500 mr-1">
                  Status:
                </span>
                {(["all", "active", "inactive"] as RequestStatusFilter[]).map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setRequestsStatusFilter(option)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                        requestsStatusFilter === option
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                      )}
                    >
                      {option === "all"
                        ? "All"
                        : option === "active"
                          ? "Active"
                          : "Inactive"}
                    </button>
                  )
                )}

                {/* Clear all filters — always rendered to reserve space and
                    prevent layout shift when filters become active */}
                <button
                  type="button"
                  onClick={() => {
                    setRequestsStatusFilter("all");
                    setRequestsSearchQuery("");
                  }}
                  className={cn(
                    "ml-auto text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer",
                    !hasActiveRequestsFilters && "invisible"
                  )}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- Request Cards Grid --- */}
        {/* Dim the results area while a filter-driven re-fetch is in progress */}
        {requests.length > 0 ? (
          <>
            <div className={cn(
              "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200",
              requestsLoading && "opacity-50 pointer-events-none"
            )}>
              {requests.map((item) => (
                <Link
                  key={item.uuid}
                  href={`/requests/${item.uuid}`}
                  className={cn(
                    "group block rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
                    item.hasUnseenNotification
                      ? "border-blue-300 hover:border-blue-400"
                      : "border-gray-200 hover:border-blue-200"
                  )}
                >
                  {/* --- Card Header: Car Summary --- */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <Car className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {item.makeName} {item.modelName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item.yearMin === item.yearMax
                            ? item.yearMin
                            : `${item.yearMin}–${item.yearMax}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* New activity indicator — visible until the user views the detail page */}
                      {item.hasUnseenNotification && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          <span className="size-1.5 rounded-full bg-white" />
                          New
                        </span>
                      )}
                      {/* Status badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          item.active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            item.active ? "bg-green-500" : "bg-gray-400"
                          )}
                        />
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* --- Card Body: Budget + Location --- */}
                  <div className="space-y-2.5">
                    {/* Budget row */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="size-4 shrink-0 text-gray-400" />
                      <span>
                        {formatBudget(item)}
                        {item.purchaseMode !== "not_sure" && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({PURCHASE_MODE_LABELS[item.purchaseMode] || item.purchaseMode})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Location row */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="size-4 shrink-0 text-gray-400" />
                      <span>{formatLocation(item)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* --- Pagination Controls --- */}
            <PaginationBar
              currentPage={requestsPage}
              totalPages={requestsTotalPages}
              onPageChange={setRequestsPage}
            />
          </>
        ) : hasActiveRequestsFilters ? (
          /* Filtered to zero results — server returned 0 items for the current filters */
          <div className="text-center py-16">
            <Search className="mx-auto size-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              No requests match your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setRequestsStatusFilter("all");
                setRequestsSearchQuery("");
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Empty state – no requests at all */
          <div className="text-center py-16">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <Car className="size-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No requests yet
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Create your first vehicle request and we&apos;ll start matching you
              with the right dealers.
            </p>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Link href="/requests/create">
                <Plus className="size-4 mr-1.5" />
                Create Your First Request
              </Link>
            </Button>
          </div>
        )}
      </>
    );
  };

  /* ═══════════════════════════════════════════
     RENDER: OFFERS RECEIVED TAB
     ═══════════════════════════════════════════ */

  const renderReceivedTab = () => {
    // Full-page loading spinner — only shown on the very first load
    if (receivedLoading && !receivedHasLoaded) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading received offers…</p>
        </div>
      );
    }

    // Error state
    if (receivedError) {
      return (
        <div className="text-center py-20">
          <p className="text-lg font-semibold text-gray-900">{receivedError}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Retry
          </Button>
        </div>
      );
    }

    return (
      <>
        {/* --- Top Bar: Title ---
             Uses the same flex layout as tabs with action buttons so the header
             row height is identical across all tabs, preventing visual shift. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Offers Received
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {receivedTotalCount === 0
                ? hasActiveReceivedFilters
                  ? "No results match your current filters."
                  : "No one has made an offer on your requests yet."
                : `${receivedTotalCount} offer${receivedTotalCount !== 1 ? "s" : ""} received`}
            </p>
          </div>
        </div>

        {/* --- Search & Filter Bar (stays visible when filters are active so the user can clear them) --- */}
        {(receivedTotalCount > 0 || hasActiveReceivedFilters) && (
          <div className="mb-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search input — filters within the current page */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle, dealer, or request…"
                  value={receivedSearchQuery}
                  onChange={(e) => setReceivedSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                {receivedSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setReceivedSearchQuery("")}
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
                onClick={() => setShowReceivedFilters(!showReceivedFilters)}
                className={cn(
                  "border-gray-200 text-gray-600 hover:bg-gray-50 shrink-0",
                  showReceivedFilters && "border-blue-500 text-blue-600 bg-blue-50"
                )}
              >
                <SlidersHorizontal className="size-4 mr-1.5" />
                Filters
                {hasActiveReceivedFilters && (
                  <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white font-bold">
                    !
                  </span>
                )}
              </Button>
            </div>

            {/* Collapsible filter row */}
            {showReceivedFilters && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
                <span className="text-xs font-medium text-gray-500 mr-1">
                  Status:
                </span>
                {(["all", "active", "accepted", "declined", "withdrawn", "expired"] as ReceivedOfferStatusFilter[]).map(
                  (option) => {
                    const pillCount =
                      option === "all"
                        ? notificationCounts.offersReceived
                        : notificationCounts.offersReceivedByStatus[option] ?? 0;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setReceivedStatusFilter(option)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                          receivedStatusFilter === option
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                        )}
                      >
                        {OFFER_STATUS_LABELS[option] || option}
                        {pillCount > 0 && (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center min-w-[16px] h-4 rounded-full px-1 text-[10px] font-bold leading-none",
                              receivedStatusFilter === option
                                ? "bg-white text-blue-600"
                                : "bg-blue-600 text-white"
                            )}
                          >
                            {pillCount > 99 ? "99+" : pillCount}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}

                {/* Clear all filters — always rendered to reserve space and
                    prevent layout shift when filters become active */}
                <button
                  type="button"
                  onClick={() => {
                    setReceivedStatusFilter("all");
                    setReceivedSearchQuery("");
                  }}
                  className={cn(
                    "ml-auto text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer",
                    !hasActiveReceivedFilters && "invisible"
                  )}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- Received Offer Cards Grid --- */}
        {/* Dim the results area while a filter-driven re-fetch is in progress */}
        {receivedOffers.length > 0 ? (
          <>
            <div className={cn(
              "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200",
              receivedLoading && "opacity-50 pointer-events-none"
            )}>
              {receivedOffers.map((offer) => (
                <Link
                  key={offer.uuid}
                  href={`/offers/${offer.uuid}`}
                  className={cn(
                    "group block rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
                    offer.hasUnseenNotification
                      ? "border-blue-300 hover:border-blue-400"
                      : "border-gray-200 hover:border-blue-200"
                  )}
                >
                  {/* --- Card Header: Offered Vehicle Summary --- */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <Inbox className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {offer.makeName} {offer.modelName}
                        </h3>
                        <p className="text-xs text-gray-500">{offer.year}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {/* New activity indicator — visible until the user views the detail page */}
                      {offer.hasUnseenNotification && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          <span className="size-1.5 rounded-full bg-white" />
                          New
                        </span>
                      )}
                      {/* Status badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          offer.status === "active"
                            ? "bg-green-50 text-green-700"
                            : offer.status === "withdrawn"
                              ? "bg-gray-100 text-gray-500"
                              : offer.status === "accepted"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-yellow-50 text-yellow-700"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            offer.status === "active"
                              ? "bg-green-500"
                              : offer.status === "withdrawn"
                                ? "bg-gray-400"
                                : offer.status === "accepted"
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                          )}
                        />
                        {OFFER_STATUS_LABELS[offer.status] || offer.status}
                      </span>
                    </div>
                  </div>

                  {/* --- Card Body: Price + Request + Dealer --- */}
                  <div className="space-y-2.5">
                    {/* Offered price row */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="size-4 shrink-0 text-gray-400" />
                      <span>
                        {formatOfferPrice(offer)}
                        {offer.purchaseMode !== "not_sure" && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({PURCHASE_MODE_LABELS[offer.purchaseMode] || offer.purchaseMode})
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Request info row */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="size-4 shrink-0 text-gray-400" />
                      <span className="line-clamp-1">
                        Request #{offer.requestUuid.slice(0, 8).toUpperCase()} · {offer.requestMakeName}{" "}
                        {offer.requestModelName}
                      </span>
                    </div>

                    {/* Dealer info row */}
                    {offer.dealerName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {/* Small logo or fallback icon */}
                        {offer.dealerLogo ? (
                          <img
                            src={offer.dealerLogo}
                            alt={`${offer.dealerName} logo`}
                            className="size-5 rounded object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <User className="size-4 shrink-0 text-gray-400" />
                        )}
                        <span className="line-clamp-1">
                          {offer.dealerName}
                          {offer.dealerCity && offer.dealerState
                            ? ` · ${offer.dealerCity}, ${offer.dealerState}`
                            : ""}
                        </span>
                        {/* Verified dealer badge — shown when the dealer has been verified by AutoMatcher */}
                        {offer.dealerVerified && (
                          <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            <BadgeCheck className="size-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* --- Pagination Controls --- */}
            <PaginationBar
              currentPage={receivedPage}
              totalPages={receivedTotalPages}
              onPageChange={setReceivedPage}
            />
          </>
        ) : hasActiveReceivedFilters ? (
          /* Filtered to zero results — server returned 0 items for the current filters */
          <div className="text-center py-16">
            <Search className="mx-auto size-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              No offers match your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setReceivedStatusFilter("all");
                setReceivedSearchQuery("");
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Empty state – no received offers at all */
          <div className="text-center py-16">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <Inbox className="size-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No offers received yet
            </h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Once dealers start responding to your requests, their offers will
              appear here.
            </p>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Link href="/requests/create">
                <Plus className="size-4 mr-1.5" />
                Create a Request
              </Link>
            </Button>
          </div>
        )}
      </>
    );
  };

  /* ═══════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* ── Tab Bar ─────────────────────────── */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex gap-6" aria-label="Buyer dashboard tabs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            // Map each tab to the correct unseen notification count
            const tabBadgeCount =
              tab.id === "received"
                ? notificationCounts.offersReceived
                : tab.id === "requests"
                  ? notificationCounts.myRequests
                  : 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                <span
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-500"
                  )}
                >
                  {tab.icon}
                </span>
                {tab.label}
                {/* Badge showing unseen notification count for this tab */}
                {tabBadgeCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white leading-none">
                    {tabBadgeCount > 99 ? "99+" : tabBadgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Tab Content ────────────────────── */}
      {activeTab === "requests" && renderRequestsTab()}
      {activeTab === "received" && renderReceivedTab()}
    </div>
  );
}
