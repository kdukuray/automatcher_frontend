"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── PaginationBar Component ─────────────────────────── */

/**
 * Renders page navigation controls: previous / next buttons plus numbered
 * page buttons. Collapses gracefully with ellipsis for large page counts.
 *
 * @param currentPage  - The currently active page (1-indexed).
 * @param totalPages   - Total number of pages available.
 * @param onPageChange - Callback invoked with the new page number when the user navigates.
 */
export default function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

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
