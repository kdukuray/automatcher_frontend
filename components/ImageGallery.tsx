"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Loader2,
  ImageIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedImage } from "@/lib/types";

/* ── Constants ──────────────────────────────────── */

/** Maximum number of images allowed per entity (offer or inventory vehicle). */
const MAX_IMAGES = 10;

/** Accepted MIME types for image uploads. */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/* ── Component Props ────────────────────────────── */

interface ImageGalleryProps {
  /** The current list of uploaded images to display. */
  images: UploadedImage[];
  /** Whether the gallery is in edit mode (shows upload/delete controls). */
  editing: boolean;
  /** Whether an upload is currently in progress. */
  uploading?: boolean;
  /** Callback fired when the user selects files to upload. */
  onUpload?: (files: File[]) => void;
  /** Callback fired when the user clicks delete on an image. */
  onDelete?: (imageId: number) => void;
}

/* ── Main Component ─────────────────────────────── */

/**
 * ImageGallery – Reusable component for displaying and managing images.
 *
 * **View mode** (`editing=false`):
 *   Renders a responsive thumbnail grid. Clicking any thumbnail opens a
 *   lightbox Dialog modal with full-size navigation (left/right arrows).
 *
 * **Edit mode** (`editing=true`):
 *   Same grid but with a delete (X) button overlay on each image, plus an
 *   upload dropzone button at the end. Enforces a client-side 10-image max.
 */
export default function ImageGallery({
  images,
  editing,
  uploading = false,
  onUpload,
  onDelete,
}: ImageGalleryProps) {
  /* ── Lightbox state ──────────────────────── */
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* ── File input ref ──────────────────────── */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Lightbox navigation ─────────────────── */
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  /* ── File selection handler ──────────────── */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onUpload || !e.target.files) return;

      const selectedFiles = Array.from(e.target.files);

      // Filter to accepted image types only
      const validFiles = selectedFiles.filter((f) =>
        ACCEPTED_TYPES.includes(f.type)
      );

      if (validFiles.length === 0) return;

      // Enforce max image count (existing + new must not exceed MAX_IMAGES)
      const remainingSlots = MAX_IMAGES - images.length;
      const filesToUpload = validFiles.slice(0, remainingSlots);

      if (filesToUpload.length > 0) {
        onUpload(filesToUpload);
      }

      // Reset the input so the same file(s) can be re-selected if needed
      e.target.value = "";
    },
    [images.length, onUpload]
  );

  const canUploadMore = images.length < MAX_IMAGES;

  /* ── Empty state (view mode) ─────────────── */
  if (!editing && images.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
        <ImageIcon className="size-4" />
        <span>No photos uploaded</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Thumbnail Grid ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
            onClick={() => {
              if (!editing) openLightbox(index);
            }}
          >
            {/* Thumbnail image */}
            <img
              src={img.url}
              alt={`Photo ${index + 1}`}
              className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
            />

            {/* View mode hover overlay */}
            {!editing && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            )}

            {/* Edit mode: delete button */}
            {editing && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(img.id);
                }}
                className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-700 cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* ── Upload button (edit mode only) ── */}
        {editing && canUploadMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex flex-col items-center justify-center gap-2 aspect-square rounded-lg border-2 border-dashed transition-colors cursor-pointer",
              uploading
                ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border-blue-300 bg-blue-50/50 text-blue-600 hover:border-blue-400 hover:bg-blue-50"
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="size-6 animate-spin" />
                <span className="text-xs font-medium">Uploading…</span>
              </>
            ) : (
              <>
                <Plus className="size-6" />
                <span className="text-xs font-medium">Add Photos</span>
                <span className="text-[10px] text-gray-400">
                  {images.length}/{MAX_IMAGES}
                </span>
              </>
            )}
          </button>
        )}

        {/* Edit mode: show count when at max */}
        {editing && !canUploadMore && (
          <div className="flex flex-col items-center justify-center gap-1 aspect-square rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
            <ImageIcon className="size-5" />
            <span className="text-xs font-medium">
              {MAX_IMAGES}/{MAX_IMAGES}
            </span>
            <span className="text-[10px]">Max reached</span>
          </div>
        )}
      </div>

      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Lightbox Modal ────────────────────── */}
      {images.length > 0 && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent
            showCloseButton={false}
            className="max-w-6xl w-[96vw] p-0 bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Accessible but visually hidden title for screen readers */}
            <DialogTitle className="sr-only">
              Photo {lightboxIndex + 1} of {images.length}
            </DialogTitle>

            {/* ── Top bar: counter + close button ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-blue-100 bg-blue-50/70">
              <span className="text-sm font-semibold text-blue-800">
                Photo {lightboxIndex + 1} of {images.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* ── Main image area ── */}
            <div className="relative flex items-center justify-center bg-gray-50 min-h-[55vh] max-h-[75vh]">
              {/* Previous button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={goToPrev}
                  className="absolute left-3 z-50 flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}

              {/* Current image */}
              <img
                src={images[lightboxIndex]?.url}
                alt={`Photo ${lightboxIndex + 1} of ${images.length}`}
                className="max-h-[75vh] max-w-full object-contain px-14 py-6"
              />

              {/* Next button */}
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={goToNext}
                  className="absolute right-3 z-50 flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-5" />
                </button>
              )}
            </div>

            {/* ── Thumbnail strip at the bottom ── */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2.5 px-5 py-3.5 border-t border-blue-100 bg-white">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={cn(
                      "size-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer",
                      idx === lightboxIndex
                        ? "border-blue-500 ring-2 ring-blue-500/20 opacity-100"
                        : "border-gray-200 opacity-60 hover:opacity-90 hover:border-blue-200"
                    )}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
