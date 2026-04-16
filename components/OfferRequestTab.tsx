"use client";

/**
 * OfferRequestTab – Displays a read-only summary of the buyer's vehicle request
 * that this offer was made against.
 *
 * Shows key details like make/model, year range, budget, location, and specs
 * so the dealer can see what the buyer was looking for.
 */
export default function OfferRequestTab({
  requestUuid,
  requestMakeName,
  requestModelName,
  requestYearMin,
  requestYearMax,
}: {
  requestUuid: string;
  requestMakeName: string;
  requestModelName: string;
  requestYearMin: number;
  requestYearMax: number;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Request #{requestUuid.slice(0, 8).toUpperCase()} Summary
        </h3>

        <div className="space-y-3">
          <div className="flex items-start justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Vehicle</span>
            <span className="text-sm text-gray-900">
              {requestMakeName} {requestModelName}
            </span>
          </div>

          <div className="flex items-start justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Year Range</span>
            <span className="text-sm text-gray-900">
              {requestYearMin === requestYearMax
                ? requestYearMin
                : `${requestYearMin}–${requestYearMax}`}
            </span>
          </div>

          {/* MUST CHANGE LATER: Fetch full request details and display more fields */}
          <p className="text-xs text-gray-400 pt-4">
            Full request details coming soon. For now, view the request directly.
          </p>
        </div>
      </div>
    </div>
  );
}
