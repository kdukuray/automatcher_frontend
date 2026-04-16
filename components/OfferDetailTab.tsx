"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pencil,
  Save,
  X,
  Check,
  Car,
  Camera,
  DollarSign,
  Settings2,
  Sparkles,
  Loader2,
  Ban,
  Store,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  BadgeCheck,
  Power,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  acceptOffer,
  declineOffer,
  fetchMakes,
  fetchModelsForMake,
  fetchTrimsForModel,
  updateDealerOffer,
  uploadOfferImages,
  deleteOfferImage,
  withdrawDealerOffer,
  toggleVehicleRequestActive,
} from "@/lib/api";
import type {
  Make,
  Model,
  Trim,
  OfferDetail,
  OfferPayload,
} from "@/lib/types";
import ImageGallery from "@/components/ImageGallery";

/* ── Constants ──────────────────────────────────── */

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - 1990 + 1 },
  (_, i) => CURRENT_YEAR - i
);

const BODY_STYLES = [
  { value: "any", label: "Any" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "coupe", label: "Coupe" },
  { value: "hatch", label: "Hatchback" },
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "wagon", label: "Wagon" },
];

const COLORS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Beige",
  "Orange",
  "Yellow",
  "Gold",
];

const PURCHASE_MODES = [
  { value: "cash", label: "Cash" },
  { value: "finance", label: "Finance" },
  { value: "lease", label: "Lease" },
  { value: "not_sure", label: "Not Sure" },
];

const DRIVETRAINS = [
  { value: "any", label: "Any" },
  { value: "fwd", label: "FWD" },
  { value: "rwd", label: "RWD" },
  { value: "awd", label: "AWD" },
  { value: "4wd", label: "4WD" },
];

const FUEL_TYPES = [
  { value: "any", label: "Any" },
  { value: "gas", label: "Gas" },
  { value: "hybrid", label: "Hybrid" },
  { value: "phev", label: "PHEV" },
  { value: "ev", label: "Electric" },
  { value: "diesel", label: "Diesel" },
];

const TRANSMISSIONS = [
  { value: "any", label: "Any" },
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
];

const TITLE_STATUSES = [
  { value: "any", label: "Any" },
  { value: "clean", label: "Clean Title" },
  { value: "rebuilt", label: "Rebuilt" },
];

const FEATURES_LIST = [
  "Apple CarPlay / Android Auto",
  "Heated Seats",
  "Ventilated Seats",
  "Sunroof / Panoramic Roof",
  "Leather Seats",
  "Remote Start",
  "Blind Spot Monitoring",
  "Parking Sensors",
  "Adaptive Cruise Control",
  "Third Row (SUV)",
  "Tow Package (Truck/SUV)",
];

/* ── Small reusable components ─────────────────── */

const inputStyles =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-400";

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium transition-all cursor-pointer",
        selected
          ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
          : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/50",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── Display helpers ───────────────────────────── */

function labelFor(
  value: string,
  list: { value: string; label: string }[]
): string {
  return list.find((i) => i.value === value)?.label || value || "—";
}

function capitalize(s: string): string {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatCurrency(val: string): string {
  if (!val) return "—";
  return `$${Number(val).toLocaleString()}`;
}

/* ── Section icon map ──────────────────────────── */

const sectionIcons: Record<string, React.ReactNode> = {
  car: <Car className="size-4" />,
  photos: <Camera className="size-4" />,
  pricing: <DollarSign className="size-4" />,
  specs: <Settings2 className="size-4" />,
  extras: <Sparkles className="size-4" />,
};

/* ── Edit form data type ───────────────────────── */

interface EditFormData extends OfferPayload {
  // Payload already has all the fields we need
}

/** Convert an OfferDetail into the editable form shape. */
function detailToEditForm(detail: OfferDetail): EditFormData {
  return {
    make: detail.makeSlug,
    model: detail.modelSlug,
    year: detail.year,
    mileage: detail.mileage != null ? String(detail.mileage) : "",
    trim: detail.trim,
    bodyStyle: detail.bodyStyle,
    drivetrain: detail.drivetrain,
    fuelType: detail.fuelType,
    transmission: detail.transmission,
    titleStatus: detail.titleStatus,
    exteriorColor: detail.exteriorColor,
    interiorColor: detail.interiorColor,
    purchaseMode: detail.purchaseMode,
    offeredPrice: detail.offeredPrice,
    offeredMonthlyPayment: detail.offeredMonthlyPayment,
    offeredDownPayment: detail.offeredDownPayment,
    features: [...detail.features],
  };
}

/* ── Detail row (view mode) ────────────────────── */

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "—") return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 sm:w-44 shrink-0 font-medium">
        {label}
      </span>
      <span className="text-sm text-gray-900 wrap-break-word">{value}</span>
    </div>
  );
}

/* ── Section wrapper ───────────────────────────── */

/** Accent class overrides so sections can use blue (sender) or green (receiver). */
interface SectionAccent {
  border: string;
  headerBg: string;
  headerBorder: string;
  iconColor: string;
  titleColor: string;
  editBadgeBg: string;
  editBadgeText: string;
}

function Section({
  icon,
  title,
  editing,
  accentClasses,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  editing: boolean;
  accentClasses?: SectionAccent;
  children: React.ReactNode;
}) {
  // Default to blue accent if no overrides are given (backward-compatible)
  const accent: SectionAccent = accentClasses ?? {
    border: "border-blue-100",
    headerBg: "bg-blue-50/70",
    headerBorder: "border-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
    editBadgeBg: "bg-blue-100",
    editBadgeText: "text-blue-500",
  };

  return (
    <motion.div
      layout
      className={cn("rounded-xl border bg-white overflow-hidden shadow-sm", accent.border)}
    >
      <div className={cn("flex items-center gap-2 px-5 py-3 border-b", accent.headerBg, accent.headerBorder)}>
        <span className={accent.iconColor}>{icon}</span>
        <h3 className={cn("text-sm font-semibold", accent.titleColor)}>{title}</h3>
        {editing && (
          <span className={cn("ml-auto text-xs font-medium rounded-full px-2 py-0.5", accent.editBadgeBg, accent.editBadgeText)}>
            Editing
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
}

/* ── Component props ────────────────────────────── */

interface OfferDetailTabProps {
  /** The full detail object for this offer. */
  detail: OfferDetail;
  /** Whether the current viewer is the sender or receiver of this offer. */
  viewerRole: "sender" | "receiver";
  /** Callback to update the detail object after a successful save / action. */
  onDetailUpdated: (updated: OfferDetail) => void;
}

/* ── Main component ─────────────────────────────── */

/**
 * OfferDetailTab – Renders the detail/edit view for a single offer.
 *
 * Supports two roles:
 * - **Sender**: sees Edit / Withdraw buttons and can inline-edit the offer.
 * - **Receiver**: sees a read-only view with Accept / Decline buttons and
 *   a "Dealer Info" section showing who sent the offer. Uses green accents
 *   instead of blue to visually distinguish the receiver experience.
 */
export default function OfferDetailTab({
  detail,
  viewerRole,
  onDetailUpdated,
}: OfferDetailTabProps) {
  const offerId = detail.uuid;
  const isSender = viewerRole === "sender";
  const isReceiver = viewerRole === "receiver";

  /* ── Edit state (sender only) ─────────────── */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── Withdraw state (sender only) ─────────── */
  const [withdrawing, setWithdrawing] = useState(false);

  /* ── Image upload state (sender only) ──── */
  const [uploadingImages, setUploadingImages] = useState(false);

  /* ── Accept / Decline state (receiver only) ── */
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  /* ── Confirmation dialog state (replaces JS confirm()) ── */
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  /* ── Deactivate-request follow-up dialog state ──
     Shown after a buyer successfully accepts an offer to suggest
     deactivating the linked request so it stops collecting new offers. */
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  /* ── Makes / Models / Trims for edit dropdowns ──── */
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [trims, setTrims] = useState<Trim[]>([]);

  useEffect(() => {
    fetchMakes()
      .then(setMakes)
      .catch((err) => console.error("Failed to load makes:", err));
  }, []);

  const selectedMake = editForm?.make ?? detail.makeSlug ?? "";
  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      return;
    }
    fetchModelsForMake(selectedMake)
      .then(setModels)
      .catch((err) => console.error("Failed to load models:", err));
  }, [selectedMake]);

  // Fetch known trims whenever the selected model changes
  const selectedModel = editForm?.model ?? detail.modelSlug ?? "";
  useEffect(() => {
    if (!selectedMake || !selectedModel) {
      setTrims([]);
      return;
    }
    fetchTrimsForModel(selectedMake, selectedModel)
      .then(setTrims)
      .catch((err) => console.error("Failed to load trims:", err));
  }, [selectedMake, selectedModel]);

  // Determine whether the current trim is a custom "Other" entry
  const currentTrim = editForm?.trim ?? "";
  const isCustomTrim = currentTrim !== "" && !trims.some((t) => t.name === currentTrim);
  const trimDropdownValue = currentTrim === "" ? "" : isCustomTrim ? "__other__" : currentTrim;

  /* ── Edit helpers ──────────────────────── */
  const startEditing = useCallback(() => {
    setEditForm(detailToEditForm(detail));
    setEditing(true);
  }, [detail]);

  const cancelEditing = () => {
    setEditing(false);
    setEditForm(null);
  };

  const updateField = <K extends keyof EditFormData>(
    key: K,
    value: EditFormData[K]
  ) => {
    setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toggleFeature = (feature: string) => {
    if (!editForm) return;
    const current = editForm.features;
    if (current.includes(feature)) {
      updateField("features", current.filter((f) => f !== feature));
    } else {
      updateField("features", [...current, feature]);
    }
  };

  const handleSave = async () => {
    if (!editForm || saving) return;
    setSaving(true);
    try {
      const payload: OfferPayload = { ...editForm };
      const updated = await updateDealerOffer(offerId, payload);
      onDetailUpdated(updated);
      setEditing(false);
      setEditForm(null);
      toast.success("Changes saved successfully!");
    } catch (err) {
      console.error("Failed to update offer:", err);
      toast.error("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /** Opens a confirmation modal before withdrawing the offer. */
  const handleWithdraw = () => {
    if (withdrawing) return;
    setConfirmDialog({
      open: true,
      title: "Withdraw Offer",
      description:
        "Are you sure you want to withdraw this offer? This action cannot be undone.",
      onConfirm: async () => {
        setWithdrawing(true);
        try {
          const updated = await withdrawDealerOffer(offerId);
          onDetailUpdated(updated);
          toast.success("Offer withdrawn successfully.");
        } catch (err) {
          console.error("Failed to withdraw offer:", err);
          toast.error("Something went wrong while withdrawing. Please try again.");
        } finally {
          setWithdrawing(false);
        }
      },
    });
  };

  /** Opens a confirmation modal before accepting the offer.
   *  After a successful accept, shows a follow-up dialog suggesting the
   *  buyer deactivate the linked request to stop collecting new offers. */
  const handleAccept = () => {
    if (accepting) return;
    setConfirmDialog({
      open: true,
      title: "Accept Offer",
      description:
        "Are you sure you want to accept this offer? Your contact information will be shared with the dealer so they can reach out to you.",
      onConfirm: async () => {
        setAccepting(true);
        try {
          const updated = await acceptOffer(offerId);
          onDetailUpdated(updated);
          toast.success("Offer accepted! Your contact info has been shared with the dealer.");

          // Show follow-up dialog asking the buyer if they want to
          // deactivate the linked request now that they've accepted an offer
          setDeactivateDialog(true);
        } catch (err) {
          console.error("Failed to accept offer:", err);
          toast.error("Something went wrong while accepting. Please try again.");
        } finally {
          setAccepting(false);
        }
      },
    });
  };

  /** Opens a confirmation modal before declining the offer. */
  const handleDecline = () => {
    if (declining) return;
    setConfirmDialog({
      open: true,
      title: "Decline Offer",
      description: "Are you sure you want to decline this offer?",
      onConfirm: async () => {
        setDeclining(true);
        try {
          const updated = await declineOffer(offerId);
          onDetailUpdated(updated);
          toast.success("Offer declined.");
        } catch (err) {
          console.error("Failed to decline offer:", err);
          toast.error("Something went wrong while declining. Please try again.");
        } finally {
          setDeclining(false);
        }
      },
    });
  };

  /** Deactivates the linked request after the buyer accepts an offer.
   *  Called from the follow-up dialog that appears post-accept. */
  const handleDeactivateRequest = async () => {
    if (deactivating || !detail.requestUuid) return;
    setDeactivating(true);
    try {
      await toggleVehicleRequestActive(detail.requestUuid, false);
      toast.success("Request deactivated. You won't receive new offers for it.");
      setDeactivateDialog(false);
    } catch (err) {
      console.error("Failed to deactivate request:", err);
      toast.error("Couldn't deactivate the request. You can do it manually from your dashboard.");
    } finally {
      setDeactivating(false);
    }
  };

  /* ── Image upload/delete handlers (sender only) ── */

  /** Upload new images and update the parent detail with the refreshed image list. */
  const handleImageUpload = async (files: File[]) => {
    if (uploadingImages) return;
    setUploadingImages(true);
    try {
      const updatedImages = await uploadOfferImages(offerId, files);
      onDetailUpdated({ ...detail, images: updatedImages });
      toast.success(
        `${files.length} photo${files.length > 1 ? "s" : ""} uploaded!`
      );
    } catch (err) {
      console.error("Failed to upload images:", err);
      const message =
        err instanceof Error ? err.message : "Failed to upload images.";
      toast.error(message);
    } finally {
      setUploadingImages(false);
    }
  };

  /** Delete a single image and update the parent detail with the refreshed image list. */
  const handleImageDelete = async (imageId: number) => {
    try {
      const updatedImages = await deleteOfferImage(offerId, imageId);
      onDetailUpdated({ ...detail, images: updatedImages });
      toast.success("Photo removed.");
    } catch (err) {
      console.error("Failed to delete image:", err);
      toast.error("Failed to remove photo. Please try again.");
    }
  };

  // Sender actions: only available for active offers when the viewer is the sender
  const canEdit = isSender && detail.status === "active";
  const canWithdraw = isSender && detail.status === "active";

  // Receiver actions: only available for active offers when the viewer is the receiver
  const canAccept = isReceiver && detail.status === "active";
  const canDecline = isReceiver && detail.status === "active";

  // Section accent colors differ by role for instant visual distinction
  const sectionBorderColor = isSender ? "border-blue-100" : "border-green-100";
  const sectionHeaderBg = isSender ? "bg-blue-50/70" : "bg-green-50/70";
  const sectionHeaderBorder = isSender ? "border-blue-100" : "border-green-100";
  const sectionIconColor = isSender ? "text-blue-600" : "text-green-600";
  const sectionTitleColor = isSender ? "text-blue-800" : "text-green-800";
  const editingBadgeBg = isSender ? "bg-blue-100" : "bg-green-100";
  const editingBadgeText = isSender ? "text-blue-500" : "text-green-500";

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* ── Action bar: sender sees Edit/Withdraw, receiver sees Accept/Decline ── */}
      <div className="flex items-center justify-end gap-3">
        {/* --- Sender actions --- */}
        {isSender && !editing && (
          <>
            {canEdit && (
              <Button
                onClick={startEditing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <Pencil className="size-4 mr-1" />
                Edit
              </Button>
            )}
            {canWithdraw && (
              <Button
                onClick={handleWithdraw}
                disabled={withdrawing}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {withdrawing ? (
                  <Loader2 className="size-4 mr-1 animate-spin" />
                ) : (
                  <Ban className="size-4 mr-1" />
                )}
                {withdrawing ? "Withdrawing…" : "Withdraw Offer"}
              </Button>
            )}
          </>
        )}

        {/* --- Sender editing controls --- */}
        {isSender && editing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={cancelEditing}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <X className="size-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Save className="size-4 mr-1" />
              )}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        )}

        {/* --- Receiver actions --- */}
        {isReceiver && (
          <>
            {canDecline && (
              <Button
                onClick={handleDecline}
                disabled={declining}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {declining ? (
                  <Loader2 className="size-4 mr-1 animate-spin" />
                ) : (
                  <X className="size-4 mr-1" />
                )}
                {declining ? "Declining…" : "Decline Offer"}
              </Button>
            )}
            {canAccept && (
              <Button
                onClick={handleAccept}
                disabled={accepting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-60"
              >
                {accepting ? (
                  <Loader2 className="size-4 mr-1 animate-spin" />
                ) : (
                  <Check className="size-4 mr-1" />
                )}
                {accepting ? "Accepting…" : "Accept Offer"}
              </Button>
            )}
          </>
        )}
      </div>

      {/* --- Confirmation dialog (withdraw / accept / decline) --- */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog((prev) => ({ ...prev, open: false }));
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Deactivate-request follow-up dialog (shown after accepting) ---
           Suggests the buyer deactivate the linked request so dealers stop
           sending new offers for a vehicle the buyer has already found. */}
      <AlertDialog
        open={deactivateDialog}
        onOpenChange={(open) => setDeactivateDialog(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Power className="size-5 text-blue-600" />
              Deactivate This Request?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve accepted an offer for this request. Would you like to
              deactivate it so you stop receiving new offers? You can always
              reactivate it later from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivating}>
              Keep Active
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // Prevent the dialog from auto-closing so we can show loading state
                e.preventDefault();
                handleDeactivateRequest();
              }}
              disabled={deactivating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {deactivating ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Deactivating…
                </>
              ) : (
                "Deactivate Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Note about non-active offers */}
      {detail.status !== "active" && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
          This offer is <span className="font-medium">{detail.status}</span>.
          {isSender && detail.status !== "accepted" && " Editing is disabled."}
        </div>
      )}

      {/* ── ACCEPTER CONTACT INFO (sender viewing accepted offer) ── */}
      {/* When a receiver accepts an offer, their contact info is shared
          with the sender (dealer) so they can get in touch. This section
          is the primary value of "accepting" an offer. */}
      {isSender && detail.status === "accepted" && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-blue-200 bg-white overflow-hidden shadow-sm"
        >
          {/* Header with distinct accepted-offer styling */}
          <div className="flex items-center gap-2.5 bg-blue-600 px-5 py-3.5">
            <UserCheck className="size-5 text-white" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Offer Accepted — Contact Information
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                The request owner accepted your offer. Here is their contact information so you can reach out.
              </p>
            </div>
          </div>

          {/* Contact details grid */}
          <div className="px-5 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              {detail.accepterEmail && (
                <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Mail className="size-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Email</p>
                    <a
                      href={`mailto:${detail.accepterEmail}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors break-all"
                    >
                      {detail.accepterEmail}
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {detail.accepterPhone && (
                <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Phone className="size-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Phone</p>
                    <a
                      href={`tel:${detail.accepterPhone}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {detail.accepterPhone}
                    </a>
                  </div>
                </div>
              )}

              {/* Location */}
              {(detail.accepterCity || detail.accepterState) && (
                <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <MapPin className="size-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      {[detail.accepterCity, detail.accepterState].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fallback when no contact info is available */}
            {!detail.accepterEmail && !detail.accepterPhone && (
              <p className="text-sm text-gray-500 text-center py-2">
                No contact information available for this buyer.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* ── DEALER INFO (receiver only) ────────────── */}
      {isReceiver && (detail.dealerName || detail.dealerCity || detail.dealerState) && (
        <motion.div
          layout
          className={cn("rounded-xl border overflow-hidden shadow-sm", sectionBorderColor)}
        >
          <div className={cn("flex items-center gap-2 px-5 py-3 border-b", sectionHeaderBg, sectionHeaderBorder)}>
            <span className={sectionIconColor}><Store className="size-4" /></span>
            <h3 className={cn("text-sm font-semibold", sectionTitleColor)}>Dealer Information</h3>
            {/* Verified dealer badge — prominently shown in the section header */}
            {detail.dealerVerified && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                <BadgeCheck className="size-3.5" />
                Verified Dealer
              </span>
            )}
          </div>
          <div className="px-5 py-4 space-y-4">
            {/* --- Dealer identity: logo + name + location --- */}
            <div className="flex items-center gap-3">
              {/* Logo or fallback icon */}
              {detail.dealerLogo ? (
                <img
                  src={detail.dealerLogo}
                  alt={`${detail.dealerName || "Dealer"} logo`}
                  className="size-12 rounded-lg object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="size-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                  <Store className="size-5 text-gray-400" />
                </div>
              )}
              <div className="min-w-0">
                {detail.dealerName && (
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {detail.dealerName}
                  </p>
                )}
                {(detail.dealerCity || detail.dealerState) && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 shrink-0" />
                    {[detail.dealerCity, detail.dealerState].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
            {/* --- Contact details --- */}
            {(detail.dealerPhone || detail.dealerEmail) && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                {detail.dealerPhone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="size-3.5 text-gray-400 shrink-0" />
                    <span>{detail.dealerPhone}</span>
                  </div>
                )}
                {detail.dealerEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="size-3.5 text-gray-400 shrink-0" />
                    <span>{detail.dealerEmail}</span>
                  </div>
                )}
              </div>
            )}
            {detail.dealerVerified && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <BadgeCheck className="size-3.5 text-blue-600 shrink-0" />
                  This dealer has been verified by AutoMatcher
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── PHOTOS ──────────────────────────────── */}
      {/* Senders can upload/delete images when editing; everyone sees the gallery. */}
      <Section
        icon={sectionIcons.photos}
        title="Photos"
        editing={isSender && editing}
        accentClasses={{ border: sectionBorderColor, headerBg: sectionHeaderBg, headerBorder: sectionHeaderBorder, iconColor: sectionIconColor, titleColor: sectionTitleColor, editBadgeBg: editingBadgeBg, editBadgeText: editingBadgeText }}
      >
        <ImageGallery
          images={detail.images ?? []}
          editing={isSender && editing}
          uploading={uploadingImages}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
        />
      </Section>

      {/* ── VEHICLE IDENTITY ─────────────────────── */}
      <Section icon={sectionIcons.car} title="Vehicle Offered" editing={editing} accentClasses={{ border: sectionBorderColor, headerBg: sectionHeaderBg, headerBorder: sectionHeaderBorder, iconColor: sectionIconColor, titleColor: sectionTitleColor, editBadgeBg: editingBadgeBg, editBadgeText: editingBadgeText }}>
        {editing && editForm ? (
          <div className="space-y-5">
            <div>
              <Label required>Make</Label>
              <Select
                value={editForm.make || undefined}
                onValueChange={(value) => {
                  updateField("make", value);
                  updateField("model", "");
                  updateField("trim", "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a make" />
                </SelectTrigger>
                <SelectContent>
                  {makes.map((m) => (
                    <SelectItem key={m.slug} value={m.slug}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label required>Model</Label>
              <Select
                value={editForm.model || undefined}
                onValueChange={(value) => {
                  updateField("model", value);
                  updateField("trim", "");
                }}
                disabled={!editForm.make}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.filter((m) => m.current).length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Current Models</SelectLabel>
                      {models.filter((m) => m.current).map((m) => (
                        <SelectItem key={m.slug} value={m.slug}>{m.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {models.filter((m) => !m.current).length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Other Models</SelectLabel>
                      {models.filter((m) => !m.current).map((m) => (
                        <SelectItem key={m.slug} value={m.slug}>{m.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Year</Label>
                <Select
                  value={String(editForm.year)}
                  onValueChange={(value) => updateField("year", Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mileage</Label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={inputStyles}
                  placeholder="e.g. 35000"
                  value={editForm.mileage}
                  onChange={(e) =>
                    updateField("mileage", e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>
            </div>
            {/* Trim — dropdown of known trims + "Other" for free text */}
            <div>
              <Label>Trim</Label>
              <Select
                value={trimDropdownValue || undefined}
                onValueChange={(value) => {
                  if (value === "__other__") {
                    updateField("trim", " ");
                  } else if (value === "__none__") {
                    updateField("trim", "");
                  } else {
                    updateField("trim", value);
                  }
                }}
                disabled={!editForm.model}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a trim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a trim</SelectItem>
                  {trims.map((t) => (
                    <SelectItem key={t.slug} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__other__">Other…</SelectItem>
                </SelectContent>
              </Select>
              {isCustomTrim && (
                <input
                  type="text"
                  className={cn(inputStyles, "mt-2")}
                  placeholder="Enter trim (e.g. LX, EX, Limited)"
                  value={editForm.trim}
                  onChange={(e) => updateField("trim", e.target.value)}
                  autoFocus
                />
              )}
            </div>
            <div>
              <Label>Body Style</Label>
              <div className="flex flex-wrap gap-2">
                {BODY_STYLES.map((bs) => (
                  <OptionButton
                    key={bs.value}
                    selected={editForm.bodyStyle === bs.value}
                    onClick={() => updateField("bodyStyle", bs.value)}
                  >
                    {bs.label}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Exterior Color</Label>
                <Select
                  value={editForm.exteriorColor || undefined}
                  onValueChange={(value) => updateField("exteriorColor", value === "__none__" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select a color</SelectItem>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase()}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interior Color</Label>
                <Select
                  value={editForm.interiorColor || undefined}
                  onValueChange={(value) => updateField("interiorColor", value === "__none__" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select a color</SelectItem>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase()}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DetailRow label="Make" value={detail.makeName} />
            <DetailRow label="Model" value={detail.modelName} />
            <DetailRow label="Year" value={String(detail.year)} />
            {detail.mileage != null && (
              <DetailRow
                label="Mileage"
                value={`${detail.mileage.toLocaleString()} mi`}
              />
            )}
            {detail.trim && <DetailRow label="Trim" value={detail.trim} />}
            <DetailRow
              label="Body Style"
              value={labelFor(detail.bodyStyle, BODY_STYLES)}
            />
            <DetailRow
              label="Exterior Color"
              value={detail.exteriorColor ? capitalize(detail.exteriorColor) : "—"}
            />
            <DetailRow
              label="Interior Color"
              value={detail.interiorColor ? capitalize(detail.interiorColor) : "—"}
            />
          </>
        )}
      </Section>

      {/* ── VEHICLE SPECS ────────────────────── */}
      <Section icon={sectionIcons.specs} title="Vehicle Specs" editing={editing} accentClasses={{ border: sectionBorderColor, headerBg: sectionHeaderBg, headerBorder: sectionHeaderBorder, iconColor: sectionIconColor, titleColor: sectionTitleColor, editBadgeBg: editingBadgeBg, editBadgeText: editingBadgeText }}>
        {editing && editForm ? (
          <div className="space-y-5">
            <div>
              <Label>Drivetrain</Label>
              <div className="flex flex-wrap gap-2">
                {DRIVETRAINS.map((d) => (
                  <OptionButton
                    key={d.value}
                    selected={editForm.drivetrain === d.value}
                    onClick={() => updateField("drivetrain", d.value)}
                  >
                    {d.label}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div>
              <Label>Fuel Type</Label>
              <div className="flex flex-wrap gap-2">
                {FUEL_TYPES.map((f) => (
                  <OptionButton
                    key={f.value}
                    selected={editForm.fuelType === f.value}
                    onClick={() => updateField("fuelType", f.value)}
                  >
                    {f.label}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div>
              <Label>Transmission</Label>
              <div className="flex flex-wrap gap-2">
                {TRANSMISSIONS.map((tr) => (
                  <OptionButton
                    key={tr.value}
                    selected={editForm.transmission === tr.value}
                    onClick={() => updateField("transmission", tr.value)}
                  >
                    {tr.label}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div>
              <Label>Title Status</Label>
              <div className="flex flex-wrap gap-2">
                {TITLE_STATUSES.map((ts) => (
                  <OptionButton
                    key={ts.value}
                    selected={editForm.titleStatus === ts.value}
                    onClick={() => updateField("titleStatus", ts.value)}
                  >
                    {ts.label}
                  </OptionButton>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <DetailRow
              label="Drivetrain"
              value={labelFor(detail.drivetrain, DRIVETRAINS)}
            />
            <DetailRow
              label="Fuel Type"
              value={labelFor(detail.fuelType, FUEL_TYPES)}
            />
            <DetailRow
              label="Transmission"
              value={labelFor(detail.transmission, TRANSMISSIONS)}
            />
            {detail.titleStatus !== "any" && (
              <DetailRow
                label="Title Status"
                value={labelFor(detail.titleStatus, TITLE_STATUSES)}
              />
            )}
          </>
        )}
      </Section>

      {/* ── PRICING ───────────────────────────────── */}
      <Section icon={sectionIcons.pricing} title="Offer Pricing" editing={editing} accentClasses={{ border: sectionBorderColor, headerBg: sectionHeaderBg, headerBorder: sectionHeaderBorder, iconColor: sectionIconColor, titleColor: sectionTitleColor, editBadgeBg: editingBadgeBg, editBadgeText: editingBadgeText }}>
        {editing && editForm ? (
          <div className="space-y-5">
            <div>
              <Label required>Purchase Mode</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PURCHASE_MODES.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={editForm.purchaseMode === opt.value}
                    onClick={() => updateField("purchaseMode", opt.value)}
                    className="py-3"
                  >
                    {opt.label}
                  </OptionButton>
                ))}
              </div>
            </div>
            {editForm.purchaseMode === "cash" && (
              <div>
                <Label>Offered Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={cn(inputStyles, "pl-7")}
                    placeholder="e.g. 25000"
                    value={editForm.offeredPrice}
                    onChange={(e) =>
                      updateField("offeredPrice", e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </div>
              </div>
            )}
            {(editForm.purchaseMode === "finance" || editForm.purchaseMode === "lease") && (
              <>
                <div>
                  <Label>Offered Monthly Payment</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={cn(inputStyles, "pl-7")}
                      placeholder="e.g. 450"
                      value={editForm.offeredMonthlyPayment}
                      onChange={(e) =>
                        updateField("offeredMonthlyPayment", e.target.value.replace(/[^0-9]/g, ""))
                      }
                    />
                  </div>
                </div>
                {editForm.purchaseMode === "finance" && (
                  <div>
                    <Label>Down Payment</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={cn(inputStyles, "pl-7")}
                        placeholder="Optional"
                        value={editForm.offeredDownPayment}
                        onChange={(e) =>
                          updateField("offeredDownPayment", e.target.value.replace(/[^0-9]/g, ""))
                        }
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <DetailRow
              label="Purchase Mode"
              value={labelFor(detail.purchaseMode, PURCHASE_MODES)}
            />
            {detail.purchaseMode === "cash" && detail.offeredPrice && (
              <DetailRow label="Offered Price" value={formatCurrency(detail.offeredPrice)} />
            )}
            {(detail.purchaseMode === "finance" || detail.purchaseMode === "lease") &&
              detail.offeredMonthlyPayment && (
                <DetailRow
                  label="Monthly Payment"
                  value={`${formatCurrency(detail.offeredMonthlyPayment)}/mo`}
                />
              )}
            {detail.purchaseMode === "finance" && detail.offeredDownPayment && (
              <DetailRow
                label="Down Payment"
                value={formatCurrency(detail.offeredDownPayment)}
              />
            )}
          </>
        )}
      </Section>

      {/* ── FEATURES ───────────────────────────── */}
      <Section icon={sectionIcons.extras} title="Features" editing={editing} accentClasses={{ border: sectionBorderColor, headerBg: sectionHeaderBg, headerBorder: sectionHeaderBorder, iconColor: sectionIconColor, titleColor: sectionTitleColor, editBadgeBg: editingBadgeBg, editBadgeText: editingBadgeText }}>
        {editing && editForm ? (
          <div>
            <Label>Features</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEATURES_LIST.map((feature) => {
                const isSelected = editForm.features.includes(feature);
                return (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded border transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-gray-300 bg-white"
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    {feature}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {detail.features.length > 0 ? (
              <DetailRow label="Features" value={detail.features.join(", ")} />
            ) : (
              <DetailRow label="Features" value="None specified" />
            )}
          </>
        )}
      </Section>

      {/* Bottom save bar when editing */}
      {editing && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={cancelEditing}
            className="w-full sm:w-auto border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            <X className="size-4 mr-1" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Save className="size-4 mr-1" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
