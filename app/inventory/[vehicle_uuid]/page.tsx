"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  ClipboardList,
  Send,
} from "lucide-react";
import { useRequireAuth } from "@/lib/use-require-auth";
import { cn } from "@/lib/utils";
import {
  getInventoryVehicleDetail,
  toggleInventoryVehicleActive,
} from "@/lib/api";
import type { InventoryVehicleDetail } from "@/lib/types";
import InventoryDetailTab from "@/components/InventoryDetailTab";
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

/* ── Tab types ──────────────────────────────────── */

type TabId = "details" | "offers";

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  { id: "details", label: "Details", icon: <ClipboardList className="size-4" /> },
  { id: "offers", label: "Offers", icon: <Send className="size-4" /> },
];

/**
 * InventoryDetailPage – Top-level page for viewing a single inventory vehicle.
 *
 * Renders a shared header (back link, title, active toggle) and a tab bar
 * that lets the user switch between the vehicle details view and the
 * offers view (offers using this vehicle).
 */
export default function InventoryDetailPage() {
  const { isReady } = useRequireAuth();
  const params = useParams();
  const vehicleUuid = params.vehicle_uuid as string;

  /* ── Data state ─────────────────────────── */
  const [detail, setDetail] = useState<InventoryVehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ── Tab state ──────────────────────────── */
  const [activeTab, setActiveTab] = useState<TabId>("details");

  /* ── Active toggle state ────────────────── */
  const [togglingActive, setTogglingActive] = useState(false);

  /* ── Fetch detail on mount ─────────────── */
  useEffect(() => {
    if (!vehicleUuid) {
      setError("Invalid vehicle ID.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getInventoryVehicleDetail(vehicleUuid)
      .then((data) => {
        setDetail(data);
        setError("");
      })
      .catch(() => setError("Could not load vehicle details."))
      .finally(() => setLoading(false));
  }, [vehicleUuid]);

  /* ── Toggle active/inactive status ─────── */
  const handleToggleActive = async () => {
    if (!detail || togglingActive) return;
    setTogglingActive(true);
    try {
      const updated = await toggleInventoryVehicleActive(vehicleUuid, !detail.active);
      setDetail(updated);
    } catch (err) {
      console.error("Failed to toggle active status:", err);
    } finally {
      setTogglingActive(false);
    }
  };

  // MUST CHANGE LATER: Replace dummy offer count with real data from offers API
  const dummyOfferCount = 0;

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
          <p className="text-sm font-medium">Loading vehicle details…</p>
        </div>
      </main>
    );
  };

  /* ── Error state ────────────────────────── */
  if (error || !detail) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-gray-900">
            {error || "Vehicle not found."}
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
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {detail.year} {detail.makeName} {detail.modelName}
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

          {/* Active / Inactive toggle */}
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
              aria-label="Toggle vehicle active status"
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
        </div>

        {/* ── Tab Bar ─────────────────────────── */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex gap-6" aria-label="Vehicle tabs">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              // Show offer count badge on the Offers tab
              const badge = tab.id === "offers" ? dummyOfferCount : null;

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
            <InventoryDetailTab
              detail={detail}
              onDetailUpdated={setDetail}
            />
          )}

          {activeTab === "offers" && (
            <div className="text-center py-16">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <Send className="size-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No offers yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Offers that link to this inventory vehicle will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
      </FadeIn>
    </main>
  );
}
