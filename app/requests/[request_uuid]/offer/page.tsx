"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Camera,
  Car,
  Check,
  ChevronDown,
  DollarSign,
  Loader2,
  Mail,
  Package,
  Plus,
  Send,
  Settings2,
  Sparkles,
  Warehouse,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  fetchMakes,
  fetchModelsForMake,
  fetchTrimsForModel,
  getVehicleRequestDetail,
  listInventoryVehicles,
  createOffer,
  uploadOfferImages,
} from "@/lib/api";
import type {
  InventoryVehicleListItem,
  Make,
  Model,
  Trim,
  VehicleRequestDetail,
} from "@/lib/types";
import { useRequireAuth } from "@/lib/use-require-auth";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - 1990 + 2 },
  (_, i) => CURRENT_YEAR + 1 - i
);

const BODY_STYLES = [
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

const DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD"];
const FUEL_TYPES = ["Gas", "Hybrid", "PHEV", "EV", "Diesel"];
const TRANSMISSIONS = ["Automatic", "Manual"];

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

/** Maximum number of images allowed per offer. */
const MAX_IMAGES = 10;

/** Accepted MIME types for image uploads. */
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/* ═══════════════════════════════════════════
   FORM STATE TYPE
   ═══════════════════════════════════════════ */

interface OfferFormData {
  inventoryVehicleUuid: string | null;
  make: string;
  model: string;
  year: number;
  mileage: string;
  trim: string;
  bodyStyle: string;
  drivetrain: string;
  fuelType: string;
  transmission: string;
  titleStatus: string;
  exteriorColor: string;
  interiorColor: string;
  purchaseMode: string;
  offeredPrice: string;
  offeredMonthlyPayment: string;
  offeredDownPayment: string;
  features: string[];
  emailNotificationsEnabled: boolean;
}

const defaultFormData: OfferFormData = {
  inventoryVehicleUuid: null,
  make: "",
  model: "",
  year: CURRENT_YEAR,
  mileage: "",
  trim: "",
  bodyStyle: "any",
  drivetrain: "any",
  fuelType: "any",
  transmission: "any",
  titleStatus: "any",
  exteriorColor: "",
  interiorColor: "",
  purchaseMode: "",
  offeredPrice: "",
  offeredMonthlyPayment: "",
  offeredDownPayment: "",
  features: [],
  // Opt-in defaults to true so dealers hear about accept/decline right
  // away. They can uncheck at the bottom of the form if they prefer not
  // to get status emails.
  emailNotificationsEnabled: true,
};

/* ═══════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
   ═══════════════════════════════════════════ */

/** Shared input class for consistent styling across all form inputs. */
const inputStyles =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-400";

/** A form label with an optional required indicator. */
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

/** A selectable pill/button for option groups (body style, drivetrain, etc.). */
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

/** A labeled section card used to group related form fields. */
function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 bg-gray-50 border-b border-gray-200 px-5 py-3.5">
        <span className="text-blue-600">{icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="px-5 py-5 space-y-5">{children}</div>
    </div>
  );
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
    not_sure: "Not Sure",
  };
  return map[mode] || mode;
}

/** Format a body style slug to its display label. */
function formatBodyStyle(val: string): string {
  if (val === "any") return "Any";
  return BODY_STYLES.find((b) => b.value === val)?.label || val;
}

/** Format a spec value slug — capitalises or returns "Any". */
function formatSpec(val: string): string {
  if (!val || val === "any") return "Any";
  return val.charAt(0).toUpperCase() + val.slice(1);
}

/* ═══════════════════════════════════════════
   REQUEST SUMMARY – shows what the buyer wants
   ═══════════════════════════════════════════ */

function RequestSummary({ detail }: { detail: VehicleRequestDetail }) {
  const target = detail.target;

  /** Build a concise vehicle title like "2020–2025 Toyota Camry". */
  const vehicleTitle = [
    target.yearMin === target.yearMax
      ? `${target.yearMin}`
      : `${target.yearMin}–${target.yearMax}`,
    target.makeName || "Any Make",
    target.modelName || "Any Model",
  ].join(" ");

  // Collect notable preferences the buyer specified (only non-"any" values)
  const preferences: { label: string; value: string }[] = [];
  if (target.bodyStyle && target.bodyStyle !== "any")
    preferences.push({ label: "Body", value: formatBodyStyle(target.bodyStyle) });
  if (target.drivetrain && target.drivetrain !== "any")
    preferences.push({ label: "Drivetrain", value: target.drivetrain.toUpperCase() });
  if (target.fuelType && target.fuelType !== "any")
    preferences.push({ label: "Fuel", value: formatSpec(target.fuelType) });
  if (target.transmission && target.transmission !== "any")
    preferences.push({ label: "Trans", value: formatSpec(target.transmission) });
  if (target.titleStatus && target.titleStatus !== "any")
    preferences.push({
      label: "Title",
      value: target.titleStatus === "clean" ? "Clean Only" : "Rebuilt OK",
    });
  if (target.maxMileage)
    preferences.push({ label: "Max Miles", value: `${target.maxMileage.toLocaleString()} mi` });

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 bg-blue-100/60 border-b border-blue-100 px-5 py-3">
        <Car className="size-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-800">
          Buyer is Looking For
        </span>
        <span className="ml-auto text-xs font-medium text-blue-600/80">
          Request #{detail.uuid.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-3">
        {/* Vehicle headline */}
        <p className="text-base font-bold text-gray-900">{vehicleTitle}</p>

        {/* Budget info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span>
            <span className="font-medium text-gray-700">Budget:</span>{" "}
            {detail.purchaseMode === "cash" && detail.maxBudget
              ? `Cash up to $${Number(detail.maxBudget).toLocaleString()}`
              : detail.purchaseMode === "finance" && detail.maxMonthlyPayment
              ? `Finance ≤$${Number(detail.maxMonthlyPayment).toLocaleString()}/mo`
              : detail.purchaseMode === "lease" && detail.maxMonthlyPayment
              ? `Lease ≤$${Number(detail.maxMonthlyPayment).toLocaleString()}/mo`
              : formatPurchaseMode(detail.purchaseMode)}
          </span>
          <span>
            <span className="font-medium text-gray-700">Location:</span>{" "}
            {detail.zipCode
              ? `${detail.cityName && detail.stateName ? `${detail.cityName}, ${detail.stateName}` : detail.zipCode}${detail.searchRadius ? ` (${detail.searchRadius} mi)` : ""}`
              : "Nationwide"}
          </span>
        </div>

        {/* Notable preferences */}
        {preferences.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {preferences.map((pref) => (
              <span
                key={pref.label}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700"
              >
                {pref.label}: {pref.value}
              </span>
            ))}
          </div>
        )}

        {/* Trim preference if specified */}
        {target.trim && (
          <p className="text-xs text-gray-500">
            Preferred trim: <span className="font-medium">{target.trim}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */

/**
 * OfferPage – Allows a dealer to submit an offer against a vehicle request.
 *
 * Displays:
 * 1. A summary of the buyer's request at the top.
 * 2. An optional "Load from Inventory" section that auto-fills vehicle details.
 * 3. The full offer form: vehicle info, specs, pricing.
 * 4. A submit button that sends the offer to the backend.
 */
export default function OfferPage() {
  const { isReady } = useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const requestUuid = params.request_uuid as string;

  /* ── Page-level data state ──────────────── */
  const [requestDetail, setRequestDetail] = useState<VehicleRequestDetail | null>(null);
  const [inventoryVehicles, setInventoryVehicles] = useState<InventoryVehicleListItem[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [trims, setTrims] = useState<Trim[]>([]);

  /* ── Loading / error state ─────────────── */
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* ── Form state ────────────────────────── */
  const [formData, setFormData] = useState<OfferFormData>(defaultFormData);

  /* ── Inventory dropdown open state ─────── */
  const [showInventoryPicker, setShowInventoryPicker] = useState(false);

  /* ── Photo state: staged files awaiting upload after offer creation ── */
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  /** Handle photo file selection from the file input. */
  const handlePhotoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const newFiles = Array.from(e.target.files).filter((f) =>
        ACCEPTED_IMAGE_TYPES.includes(f.type)
      );
      if (newFiles.length === 0) return;

      setSelectedPhotos((prev) => {
        const remainingSlots = MAX_IMAGES - prev.length;
        return [...prev, ...newFiles.slice(0, remainingSlots)];
      });

      // Reset input so the same file(s) can be re-selected if needed
      e.target.value = "";
    },
    []
  );

  /** Remove a staged photo by index. */
  const removePhoto = useCallback((index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /** Helper to update a single field in form state. */
  const updateField = <K extends keyof OfferFormData>(
    key: K,
    value: OfferFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  /* ── Fetch request detail, inventory, and makes on mount ── */
  useEffect(() => {
    if (!requestUuid) {
      setPageError("Invalid request ID.");
      setPageLoading(false);
      return;
    }

    // Fire all three fetches in parallel. For the inventory dropdown we fetch
    // up to 50 vehicles (max page_size) so the dealer can pick from their stock.
    Promise.all([
      getVehicleRequestDetail(requestUuid),
      listInventoryVehicles(1, 50),
      fetchMakes(),
    ])
      .then(([detail, inventoryResponse, makesList]) => {
        setRequestDetail(detail);
        setInventoryVehicles(inventoryResponse.results);
        setMakes(makesList);

        // Default the purchase mode to match what the buyer wants
        if (detail.purchaseMode) {
          setFormData((prev) => ({
            ...prev,
            purchaseMode: detail.purchaseMode,
          }));
        }
      })
      .catch(() => setPageError("Could not load request details."))
      .finally(() => setPageLoading(false));
  }, [requestUuid]);

  /* ── Fetch models whenever the selected make changes ── */
  useEffect(() => {
    if (!formData.make) {
      setModels([]);
      return;
    }
    fetchModelsForMake(formData.make)
      .then(setModels)
      .catch((err) => console.error("Failed to load models:", err));
  }, [formData.make]);

  /* ── Fetch known trims whenever the selected model changes ── */
  useEffect(() => {
    if (!formData.make || !formData.model) {
      setTrims([]);
      return;
    }
    fetchTrimsForModel(formData.make, formData.model)
      .then(setTrims)
      .catch((err) => console.error("Failed to load trims:", err));
  }, [formData.make, formData.model]);

  // Determine whether the current trim is a custom "Other" entry
  const isCustomTrim = formData.trim !== "" && !trims.some((t) => t.name === formData.trim);
  const trimDropdownValue = formData.trim === "" ? "" : isCustomTrim ? "__other__" : formData.trim;

  /** Handle "Load from Inventory" — finds vehicle by UUID and fills form fields. */
  const handleLoadFromInventory = (vehicleUuid: string) => {
    const vehicle = inventoryVehicles.find((v) => v.uuid === vehicleUuid);
    if (!vehicle) return;

    // Fill in all vehicle fields from the selected inventory item
    setFormData((prev) => ({
      ...prev,
      inventoryVehicleUuid: vehicle.uuid,
      make: vehicle.makeSlug,
      model: vehicle.modelSlug,
      year: vehicle.year,
      mileage: vehicle.mileage != null ? String(vehicle.mileage) : "",
      trim: vehicle.trim,
      bodyStyle: vehicle.bodyStyle,
      drivetrain: vehicle.drivetrain,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      titleStatus: vehicle.titleStatus,
      exteriorColor: vehicle.exteriorColor,
      interiorColor: vehicle.interiorColor,
      // Use the list price as the initial offered price
      offeredPrice: vehicle.listPrice,
      features: vehicle.features,
    }));

    // Trigger model re-fetch for the selected make
    fetchModelsForMake(vehicle.makeSlug)
      .then(setModels)
      .catch((err) => console.error("Failed to load models:", err));

    // Collapse the inventory picker after selection
    setShowInventoryPicker(false);
  };

  /* ── Clear the inventory link (manual entry mode) ────── */
  const handleClearInventory = () => {
    setFormData((prev) => ({
      ...prev,
      inventoryVehicleUuid: null,
    }));
  };

  /* ── Toggle a feature on/off ──────────── */
  const toggleFeature = (feature: string) => {
    const current = formData.features;
    if (current.includes(feature)) {
      updateField(
        "features",
        current.filter((f) => f !== feature)
      );
    } else {
      updateField("features", [...current, feature]);
    }
  };

  /* ── Form validation ──────────────────── */
  const validateForm = (): string | null => {
    if (!formData.make) return "Please select a make.";
    if (!formData.model) return "Please select a model.";
    if (!formData.year) return "Please select a year.";
    if (!formData.purchaseMode) return "Please select a purchase mode.";

    // Require at least one pricing field based on purchase mode
    if (formData.purchaseMode === "cash" && !formData.offeredPrice) {
      return "Please enter an offered price for a cash deal.";
    }
    if (
      (formData.purchaseMode === "finance" || formData.purchaseMode === "lease") &&
      !formData.offeredMonthlyPayment
    ) {
      return "Please enter an offered monthly payment.";
    }

    return null;
  };

  /* ── Submit the offer ─────────────────── */
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const payload = {
        ...(formData.inventoryVehicleUuid
          ? { inventoryVehicleUuid: formData.inventoryVehicleUuid }
          : {}),
        make: formData.make,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        trim: formData.trim,
        bodyStyle: formData.bodyStyle,
        drivetrain: formData.drivetrain,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        titleStatus: formData.titleStatus,
        exteriorColor: formData.exteriorColor,
        interiorColor: formData.interiorColor,
        purchaseMode: formData.purchaseMode,
        offeredPrice: formData.offeredPrice,
        offeredMonthlyPayment: formData.offeredMonthlyPayment,
        offeredDownPayment: formData.offeredDownPayment,
        features: formData.features,
        emailNotificationsEnabled: formData.emailNotificationsEnabled,
      };

      // Step 1: Create the offer and get the new offer UUID
      const offerResponse = await createOffer(requestUuid, payload);

      // Step 2: If photos were selected, upload them to the newly created offer
      if (selectedPhotos.length > 0) {
        try {
          await uploadOfferImages(offerResponse.uuid, selectedPhotos);
        } catch (uploadErr) {
          // The offer was created successfully, but photos failed to upload.
          // Notify the user so they can add photos from the edit page later.
          console.error("Failed to upload offer photos:", uploadErr);
          toast.error(
            "Offer submitted, but some photos failed to upload. You can add them from the offer detail page."
          );
          router.push(`/requests/${requestUuid}`);
          return;
        }
      }

      toast.success("Offer submitted successfully!");
      // Navigate back to the request page on success
      router.push(`/requests/${requestUuid}`);
    } catch (err) {
      console.error("Failed to submit offer:", err);
      // Surface the backend's error message (e.g. duplicate offer) if available
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Please try again.";
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isReady)
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );

  /* ── Loading state ────────────────────── */
  if (pageLoading) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading request details…</p>
        </div>
      </main>
    );
  }

  /* ── Error state ──────────────────────── */
  if (pageError || !requestDetail) {
    return (
      <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-gray-900">
            {pageError || "Request not found."}
          </p>
          <Button asChild variant="outline">
            <Link href="/requests">
              <ArrowLeft className="size-4 mr-1" />
              Back to Requests
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  // Check if the currently selected inventory vehicle is shown
  const selectedInventoryVehicle = inventoryVehicles.find(
    (v) => v.uuid === formData.inventoryVehicleUuid
  );

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white">
      <FadeIn direction="up" duration={0.4}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* ── Back link ── */}
        <Link
          href={`/requests/${requestUuid}`}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Request
        </Link>

        {/* ── Page title ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Make an Offer
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Submit the vehicle you&apos;d like to offer for this request.
          </p>
        </div>

        {/* ── Section stack ── */}
        <StaggerContainer className="space-y-6" delay={0.05}>
          {/* --- Request Summary --- */}
          <StaggerItem>
            <RequestSummary detail={requestDetail} />
          </StaggerItem>

          {/* --- Load from Inventory --- */}
          {inventoryVehicles.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Header – toggles the inventory picker open/closed */}
              <button
                type="button"
                onClick={() => setShowInventoryPicker((prev) => !prev)}
                className="flex items-center gap-3 w-full bg-gray-50 border-b border-gray-200 px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Warehouse className="size-4 text-blue-600" />
                <div className="text-left flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Load from Inventory
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedInventoryVehicle
                      ? `Loaded: ${selectedInventoryVehicle.year} ${selectedInventoryVehicle.makeName} ${selectedInventoryVehicle.modelName}`
                      : "Choose a vehicle from your active inventory to auto-fill the form"}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-gray-400 transition-transform duration-200",
                    showInventoryPicker && "rotate-180"
                  )}
                />
              </button>

              {/* Inventory vehicle list */}
              {showInventoryPicker && (
                <div className="px-5 py-4 space-y-2 max-h-64 overflow-y-auto">
                  {inventoryVehicles.map((vehicle) => {
                    const isSelected = formData.inventoryVehicleUuid === vehicle.uuid;
                    return (
                      <button
                        key={vehicle.uuid}
                        type="button"
                        onClick={() => handleLoadFromInventory(vehicle.uuid)}
                        className={cn(
                          "flex items-center justify-between w-full rounded-lg border px-4 py-3 text-left transition-all cursor-pointer",
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                            : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {vehicle.year} {vehicle.makeName} {vehicle.modelName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {[
                              vehicle.trim,
                              vehicle.mileage != null
                                ? `${vehicle.mileage.toLocaleString()} mi`
                                : null,
                              vehicle.listPrice
                                ? `$${Number(vehicle.listPrice).toLocaleString()}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "No additional details"}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="shrink-0 text-xs font-semibold text-blue-600">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Clear selection button */}
                  {selectedInventoryVehicle && (
                    <button
                      type="button"
                      onClick={handleClearInventory}
                      className="text-xs text-gray-500 hover:text-gray-700 underline mt-1 cursor-pointer"
                    >
                      Clear selection (manual entry)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* --- Vehicle Information --- */}
          <StaggerItem>
          <SectionCard
            icon={<Car className="size-4" />}
            title="Vehicle Information"
            description="Details about the vehicle you're offering"
          >
            {/* Make */}
            <div>
              <Label required>Make</Label>
              <Select
                value={formData.make || undefined}
                onValueChange={(value) => {
                  updateField("make", value);
                  updateField("model", "");
                  updateField("trim", "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select make…" />
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

            {/* Model */}
            <div>
              <Label required>Model</Label>
              <Select
                value={formData.model || undefined}
                onValueChange={(value) => {
                  updateField("model", value);
                  updateField("trim", "");
                }}
                disabled={!formData.make}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model…" />
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

            {/* Year & Mileage row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Year</Label>
                <Select
                  value={String(formData.year)}
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
                  placeholder="e.g. 15000"
                  value={formData.mileage}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    updateField("mileage", val);
                  }}
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
                disabled={!formData.model}
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
              {/* Show free-text input when "Other…" is selected */}
              {isCustomTrim && (
                <input
                  type="text"
                  className={cn(inputStyles, "mt-2")}
                  placeholder="Enter trim (e.g. SE, XLE, Sport)"
                  value={formData.trim}
                  onChange={(e) => updateField("trim", e.target.value)}
                  autoFocus
                />
              )}
            </div>
          </SectionCard>
          </StaggerItem>

          {/* --- Vehicle Specs --- */}
          <StaggerItem>
          <SectionCard
            icon={<Settings2 className="size-4" />}
            title="Vehicle Specs"
            description="Mechanical and appearance details"
          >
            {/* Body Style */}
            <div>
              <Label>Body Style</Label>
              <div className="flex flex-wrap gap-2">
                <OptionButton
                  selected={formData.bodyStyle === "any"}
                  onClick={() => updateField("bodyStyle", "any")}
                >
                  Any
                </OptionButton>
                {BODY_STYLES.map((bs) => (
                  <OptionButton
                    key={bs.value}
                    selected={formData.bodyStyle === bs.value}
                    onClick={() => updateField("bodyStyle", bs.value)}
                  >
                    {bs.label}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Drivetrain */}
            <div>
              <Label>Drivetrain</Label>
              <div className="flex flex-wrap gap-2">
                <OptionButton
                  selected={formData.drivetrain === "any"}
                  onClick={() => updateField("drivetrain", "any")}
                >
                  Any
                </OptionButton>
                {DRIVETRAINS.map((d) => (
                  <OptionButton
                    key={d}
                    selected={formData.drivetrain === d.toLowerCase()}
                    onClick={() => updateField("drivetrain", d.toLowerCase())}
                  >
                    {d}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Fuel Type */}
            <div>
              <Label>Fuel Type</Label>
              <div className="flex flex-wrap gap-2">
                <OptionButton
                  selected={formData.fuelType === "any"}
                  onClick={() => updateField("fuelType", "any")}
                >
                  Any
                </OptionButton>
                {FUEL_TYPES.map((f) => (
                  <OptionButton
                    key={f}
                    selected={formData.fuelType === f.toLowerCase()}
                    onClick={() => updateField("fuelType", f.toLowerCase())}
                  >
                    {f}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div>
              <Label>Transmission</Label>
              <div className="flex flex-wrap gap-2">
                <OptionButton
                  selected={formData.transmission === "any"}
                  onClick={() => updateField("transmission", "any")}
                >
                  Any
                </OptionButton>
                {TRANSMISSIONS.map((t) => (
                  <OptionButton
                    key={t}
                    selected={formData.transmission === t.toLowerCase()}
                    onClick={() => updateField("transmission", t.toLowerCase())}
                  >
                    {t}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Title Status */}
            <div>
              <Label>Title Status</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "any", label: "Any" },
                  { value: "clean", label: "Clean Title" },
                  { value: "rebuilt", label: "Rebuilt" },
                ].map((t) => (
                  <OptionButton
                    key={t.value}
                    selected={formData.titleStatus === t.value}
                    onClick={() => updateField("titleStatus", t.value)}
                  >
                    {t.label}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Colors row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Exterior Color</Label>
                <Select
                  value={formData.exteriorColor || undefined}
                  onValueChange={(value) => updateField("exteriorColor", value === "__any__" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Any color</SelectItem>
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
                  value={formData.interiorColor || undefined}
                  onValueChange={(value) => updateField("interiorColor", value === "__any__" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Any color</SelectItem>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase()}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SectionCard>
          </StaggerItem>

          {/* --- Features --- */}
          <StaggerItem>
          <SectionCard
            icon={<Sparkles className="size-4" />}
            title="Features"
            description="Highlight what this vehicle includes"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEATURES_LIST.map((feature) => {
                const isSelected = formData.features.includes(feature);
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
                      {isSelected && (
                        <svg
                          className="size-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    {feature}
                  </button>
                );
              })}
            </div>
          </SectionCard>
          </StaggerItem>

          {/* --- Photos --- */}
          <StaggerItem>
          <SectionCard
            icon={<Camera className="size-4" />}
            title="Photos"
            description="Add photos of the vehicle (optional, up to 10)"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Thumbnail previews of staged photos */}
              {selectedPhotos.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Photo ${index + 1}`}
                    className="size-full object-cover"
                    onLoad={(e) => {
                      // Revoke the object URL after the image loads to free memory
                      URL.revokeObjectURL((e.target as HTMLImageElement).src);
                    }}
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-700 cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}

              {/* Add photos button (shown when under max limit) */}
              {selectedPhotos.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 aspect-square rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Plus className="size-6" />
                  <span className="text-xs font-medium">Add Photos</span>
                  <span className="text-[10px] text-gray-400">
                    {selectedPhotos.length}/{MAX_IMAGES}
                  </span>
                </button>
              )}

              {/* Max reached indicator */}
              {selectedPhotos.length >= MAX_IMAGES && (
                <div className="flex flex-col items-center justify-center gap-1 aspect-square rounded-lg border border-gray-200 bg-gray-50 text-gray-400">
                  <ImageIcon className="size-5" />
                  <span className="text-xs font-medium">
                    {MAX_IMAGES}/{MAX_IMAGES}
                  </span>
                  <span className="text-[10px]">Max reached</span>
                </div>
              )}
            </div>

            {/* Empty state hint */}
            {selectedPhotos.length === 0 && (
              <p className="text-sm text-gray-400 mt-3">
                Photos help buyers see what you&apos;re offering. You can also add them later from the offer detail page.
              </p>
            )}

            {/* Hidden file input */}
            <input
              ref={photoInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </SectionCard>
          </StaggerItem>

          {/* --- Pricing --- */}
          <StaggerItem>
          <SectionCard
            icon={<DollarSign className="size-4" />}
            title="Your Pricing"
            description="Set the deal terms for this offer"
          >
            {/* Purchase Mode */}
            <div>
              <Label required>Purchase Mode</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { value: "cash", label: "Cash" },
                  { value: "finance", label: "Finance" },
                  { value: "lease", label: "Lease" },
                  { value: "not_sure", label: "Flexible" },
                ].map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={formData.purchaseMode === opt.value}
                    onClick={() => updateField("purchaseMode", opt.value)}
                    className="py-3"
                  >
                    {opt.label}
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* --- Conditional pricing fields based on purchase mode --- */}

            {/* Cash: just the offered price */}
            {formData.purchaseMode === "cash" && (
              <div>
                <Label required>Offered Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={cn(inputStyles, "pl-7")}
                    placeholder="e.g. 30000"
                    value={formData.offeredPrice}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      updateField("offeredPrice", val);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Finance: offered price + monthly payment + down payment */}
            {formData.purchaseMode === "finance" && (
              <div className="space-y-5">
                <div>
                  <Label>Vehicle Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={cn(inputStyles, "pl-7")}
                      placeholder="e.g. 30000"
                      value={formData.offeredPrice}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        updateField("offeredPrice", val);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Label required>Monthly Payment</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={cn(inputStyles, "pl-7")}
                      placeholder="e.g. 450"
                      value={formData.offeredMonthlyPayment}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        updateField("offeredMonthlyPayment", val);
                      }}
                    />
                  </div>
                </div>
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
                      value={formData.offeredDownPayment}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        updateField("offeredDownPayment", val);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Lease: monthly payment only */}
            {formData.purchaseMode === "lease" && (
              <div>
                <Label required>Monthly Lease Payment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={cn(inputStyles, "pl-7")}
                    placeholder="e.g. 350"
                    value={formData.offeredMonthlyPayment}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      updateField("offeredMonthlyPayment", val);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Flexible / Not Sure: show all pricing fields as optional */}
            {formData.purchaseMode === "not_sure" && (
              <div className="space-y-5">
                <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-3 font-medium">
                  The buyer hasn&apos;t decided on a purchase mode — provide any
                  pricing details that apply.
                </p>
                <div>
                  <Label>Vehicle Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={cn(inputStyles, "pl-7")}
                      placeholder="e.g. 30000"
                      value={formData.offeredPrice}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        updateField("offeredPrice", val);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Payment</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        $
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className={cn(inputStyles, "pl-7")}
                        placeholder="Optional"
                        value={formData.offeredMonthlyPayment}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          updateField("offeredMonthlyPayment", val);
                        }}
                      />
                    </div>
                  </div>
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
                        value={formData.offeredDownPayment}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          updateField("offeredDownPayment", val);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hint if no mode selected yet */}
            {!formData.purchaseMode && (
              <p className="text-sm text-gray-400 italic">
                Select a purchase mode above to see pricing fields.
              </p>
            )}
          </SectionCard>
          </StaggerItem>

          {/* --- Email notifications opt-in --- */}
          {/*
            Default-on toggle that controls whether the dealer gets a
            Resend email when the buyer accepts or declines this offer.
            Can be flipped later from the offer detail edit panel.
          */}
          <StaggerItem>
          <SectionCard
            icon={<Mail className="size-4" />}
            title="Email Notifications"
            description="Stay in the loop when the buyer responds."
          >
            <button
              type="button"
              onClick={() =>
                updateField(
                  "emailNotificationsEnabled",
                  !formData.emailNotificationsEnabled
                )
              }
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all cursor-pointer",
                formData.emailNotificationsEnabled
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
              )}
              aria-pressed={formData.emailNotificationsEnabled}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-all",
                  formData.emailNotificationsEnabled
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-gray-300 bg-white"
                )}
              >
                {formData.emailNotificationsEnabled && (
                  <Check className="size-3" />
                )}
              </div>
              <div className="flex-1">
                <div
                  className={cn(
                    "text-sm font-medium",
                    formData.emailNotificationsEnabled
                      ? "text-blue-800"
                      : "text-gray-700"
                  )}
                >
                  Email me when this offer&apos;s status changes
                </div>
                <div className="mt-0.5 text-xs text-gray-500">
                  We&apos;ll send a quick email to your account address when
                  the buyer accepts or declines this offer. You can change
                  this any time from the offer page.
                </div>
              </div>
            </button>
          </SectionCard>
          </StaggerItem>

          {/* --- Validation / submit error --- */}
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{submitError}</p>
            </div>
          )}

          {/* --- Submit button --- */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-8">
            <Button
              asChild
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 w-full sm:w-auto"
            >
              <Link href={`/requests/${requestUuid}`}>Cancel</Link>
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 w-full sm:w-auto px-8 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="size-4 mr-2" />
                  Submit Offer
                </>
              )}
            </Button>
          </div>
        </StaggerContainer>
      </div>
      </FadeIn>
    </main>
  );
}
