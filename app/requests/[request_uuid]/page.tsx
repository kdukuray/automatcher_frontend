"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  ClipboardList,
  MessageSquare,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getVehicleRequestDetail,
  listRequestOffers,
  markNotificationsSeen,
  toggleVehicleRequestActive,
} from "@/lib/api";
import type { VehicleRequestDetail } from "@/lib/types";
import RequestDetailTab from "@/components/RequestDetailTab";
import RequestOffersTab from "@/components/RequestOffersTab";
import { useRequireAuth } from "@/lib/use-require-auth";
import { FadeIn } from "@/components/motion";

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════
   TAB TYPES
   ═══════════════════════════════════════════ */

/** The two tabs available on the request detail page. */
type TabId = "details" | "offers";

/** Config for each tab shown in the tab bar. */
interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

/** Build the tab config based on the viewer's role.
 *  Buyers see "Offers" (all dealer offers); dealers see "Your Offers" (only theirs). */
function buildTabs(isOwner: boolean): TabConfig[] {
  return [
    { id: "details", label: "Details", icon: <ClipboardList className="size-4" /> },
    {
      id: "offers",
      label: isOwner ? "Offers" : "Your Offers",
      icon: <MessageSquare className="size-4" />,
    },
  ];
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */

/**
 * RequestDetailPage – Top-level page for viewing a single vehicle request.
 *
 * Renders a shared header (back link, title, active toggle) and a tab bar
 * that lets the user switch between the request details view and the
 * offers view.
 */
export default function RequestDetailPage() {
  const { isReady } = useRequireAuth();
  const params = useParams();
  const requestUuid = params.request_uuid as string;

  /* ── Data state ─────────────────────────── */
  const [detail, setDetail] = useState<VehicleRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── Tab state ──────────────────────────── */
  const [activeTab, setActiveTab] = useState<TabId>("details");

  /* ── Active toggle state ────────────────── */
  const [togglingActive, setTogglingActive] = useState(false);

  /* Derive ownership from the API response. The backend compares the
     authenticated user to the request's owner and returns `isOwner`. */
  const isOwner = detail?.isOwner ?? false;

  /* ── Fetch detail on mount ─────────────── */
  useEffect(() => {
    if (!isReady) return;
    if (!requestUuid) {
      setError("Invalid request ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getVehicleRequestDetail(requestUuid)
      .then((data) => {
        setDetail(data);
        setError("");

        // Mark any unseen notifications for this request as seen — fire-and-forget.
        // This clears the "New" badge on the dashboard card and reduces the tab count.
        markNotificationsSeen({ requestUuid }).catch(() => {});
      })
      .catch(() => setError("Could not load request details."))
      .finally(() => setLoading(false));
  }, [requestUuid, isReady]);

  /* ── Toggle active/inactive status ─────── */
  const handleToggleActive = async () => {
    if (!detail || togglingActive) return;
    setTogglingActive(true);
    try {
      const updated = await toggleVehicleRequestActive(requestUuid, !detail.active);
      setDetail(updated);
    } catch (err) {
      console.error("Failed to toggle active status:", err);
    } finally {
      setTogglingActive(false);
    }
  };

  /* ── Offer count for the tab badge ─────── */
  const [offerCount, setOfferCount] = useState(0);

  /* Fetch the offer count whenever the request is loaded or user switches to offers tab.
     We pass page=1 and pageSize=1 to minimize data transfer — we only need totalCount. */
  useEffect(() => {
    if (!isReady || !requestUuid) return;
    listRequestOffers(requestUuid, 1, 1)
      .then((data) => setOfferCount(data.totalCount))
      .catch(() => setOfferCount(0));
  }, [requestUuid, isReady]);

  /* ── Auth guard: show loading while checking auth ── */
  if (!isReady) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  /* ── Loading state ──────────────────────── */
  if (loading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading request details…</p>
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
            {error || "Request not found."}
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="size-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white">
      <FadeIn direction="up" duration={0.4}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* ── Header: back link, title, active toggle ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            {/* Back link changes based on viewer context */}
            <Link
              href={isOwner ? "/dashboard" : "/requests"}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 transition-colors"
            >
              <ArrowLeft className="size-4" />
              {isOwner ? "Back to Dashboard" : "Back to Requests"}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Request #{detail.uuid.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(detail.createdAt)}
              {detail.updatedAt !== detail.createdAt && (
                <span className="ml-2 text-gray-400">
                  · Updated {formatDate(detail.updatedAt)}
                </span>
              )}
            </p>
          </div>

          {/* Active / Inactive toggle — only visible to the request owner */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  !detail.active ? "text-gray-500" : "text-gray-400"
                )}
              >
                Inactive
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={detail.active}
                aria-label="Toggle request active status"
                disabled={togglingActive}
                onClick={handleToggleActive}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                  detail.active ? "bg-green-500" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    detail.active ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  detail.active ? "text-green-600" : "text-gray-400"
                )}
              >
                Active
              </span>
            </div>
          )}

          {/* Make an Offer button — only visible to non-owners (e.g. dealers) */}
          {!isOwner && (
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm w-full sm:w-auto"
            >
              <Link href={`/requests/${detail.uuid}/offer`}>
                <Send className="size-4 mr-1.5" />
                Make an Offer
              </Link>
            </Button>
          )}
        </div>

        {/* ── Tab Bar ─────────────────────────── */}
        {/* Horizontally scrollable on small screens so the tab row
            stays on a single line even when the labels are long. */}
        <div className="border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
          <nav className="-mb-px flex gap-4 sm:gap-6 min-w-max" aria-label="Request tabs">
            {buildTabs(isOwner).map((tab) => {
              const isActive = activeTab === tab.id;
              // Show offer count badge on the Offers tab
              const badge = tab.id === "offers" ? offerCount : null;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
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
                  {badge !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Tab Content (narrower inner container) ── */}
        <div className="mx-auto max-w-4xl">
          {activeTab === "details" && (
            <RequestDetailTab
              detail={detail}
              onDetailUpdated={setDetail}
              isOwner={isOwner}
            />
          )}

          {activeTab === "offers" && (
            <RequestOffersTab requestUuid={requestUuid} isOwner={isOwner} />
          )}
        </div>
      </div>
      </FadeIn>
    </main>
  );
}
