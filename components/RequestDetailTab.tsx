"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Save,
  X,
  Check,
  Car,
  DollarSign,
  MapPin,
  Settings2,
  Sparkles,
  Loader2,
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
  fetchMakes,
  fetchModelsForMake,
  fetchTrimsForModel,
  updateVehicleRequest,
} from "@/lib/api";
import type {
  Make,
  Model,
  Trim,
  VehicleRequestDetail,
  VehicleRequestPayload,
} from "@/lib/types";

/* ═══════════════════════════════════════════
   CONSTANTS (mirror create page)
   ═══════════════════════════════════════════ */

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
  "Black", "White", "Silver", "Gray", "Red", "Blue",
  "Green", "Brown", "Beige", "Orange", "Yellow", "Gold",
];

const PURCHASE_MODES = [
  { value: "cash", label: "Cash" },
  { value: "finance", label: "Finance" },
  { value: "lease", label: "Lease" },
  { value: "not_sure", label: "Not Sure" },
];

const CREDIT_RANGES = [
  { value: "prefer_not", label: "Prefer not to say" },
  { value: "580_649", label: "580–649" },
  { value: "650_699", label: "650–699" },
  { value: "700_plus", label: "700+" },
];

const SEARCH_RADII = ["25", "50", "100", "250", "any"];

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
  { value: "clean", label: "Clean Title Only" },
  { value: "rebuilt", label: "Rebuilt OK" },
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

/* ═══════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
   ═══════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════
   DISPLAY HELPERS
   ═══════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════
   SECTION ICON MAP
   ═══════════════════════════════════════════ */

const sectionIcons: Record<string, React.ReactNode> = {
  car: <Car className="size-4" />,
  budget: <DollarSign className="size-4" />,
  location: <MapPin className="size-4" />,
  specs: <Settings2 className="size-4" />,
  extras: <Sparkles className="size-4" />,
};

/* ═══════════════════════════════════════════
   EDIT FORM FIELDS
   ═══════════════════════════════════════════ */

interface EditFormData {
  make: string;
  model: string;
  yearMin: number;
  yearMax: number;
  trim: string;
  bodyStyle: string;
  exteriorColor: string;
  interiorColor: string;
  purchaseMode: string;
  maxBudget: string;
  maxMonthlyPayment: string;
  downPayment: string;
  creditRange: string;
  zipCode: string;
  searchRadius: string;
  maxMileage: string;
  drivetrain: string;
  fuelType: string;
  transmission: string;
  titleStatus: string;
  features: string[];
  notes: string;
}

/** Convert a VehicleRequestDetail into the editable form shape. */
function detailToEditForm(detail: VehicleRequestDetail): EditFormData {
  return {
    make: detail.target.make || "any",
    model: detail.target.model || "any",
    yearMin: detail.target.yearMin,
    yearMax: detail.target.yearMax,
    trim: detail.target.trim,
    bodyStyle: detail.target.bodyStyle,
    exteriorColor: detail.target.exteriorColor,
    interiorColor: detail.target.interiorColor,
    purchaseMode: detail.purchaseMode,
    maxBudget: detail.maxBudget,
    maxMonthlyPayment: detail.maxMonthlyPayment,
    downPayment: detail.downPayment,
    creditRange: detail.creditRange,
    zipCode: detail.zipCode,
    searchRadius: detail.searchRadius || "any",
    maxMileage: detail.target.maxMileage != null ? String(detail.target.maxMileage) : "",
    drivetrain: detail.target.drivetrain,
    fuelType: detail.target.fuelType,
    transmission: detail.target.transmission,
    titleStatus: detail.target.titleStatus,
    features: [...detail.features],
    notes: detail.notes,
  };
}

/* ═══════════════════════════════════════════
   DETAIL ROW (view mode)
   ═══════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════
   SECTION WRAPPER
   ═══════════════════════════════════════════ */

function Section({
  icon,
  title,
  editing,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  editing: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      className="rounded-xl border border-blue-100 bg-white overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-2 bg-blue-50/70 px-5 py-3 border-b border-blue-100">
        <span className="text-blue-600">{icon}</span>
        <h3 className="text-sm font-semibold text-blue-800">{title}</h3>
        {editing && (
          <span className="ml-auto text-xs font-medium text-blue-500 bg-blue-100 rounded-full px-2 py-0.5">
            Editing
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENT PROPS
   ═══════════════════════════════════════════ */

interface RequestDetailTabProps {
  /** The full detail object for this request. */
  detail: VehicleRequestDetail;
  /** Callback to update the detail object after a successful save. */
  onDetailUpdated: (updated: VehicleRequestDetail) => void;
  /**
   * Whether the current viewer is the owner (creator) of this request.
   * When false, editing controls are hidden and the view is read-only.
   *
   * MUST CHANGE LATER: Once real authentication is in place, this prop
   * should be derived from the logged-in user instead of being passed in.
   */
  isOwner: boolean;
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

/**
 * RequestDetailTab – Renders the detail/edit view for a single vehicle request.
 *
 * Displays all request sections (Car, Budget, Location, Specs, Extras) in
 * view mode, with an Edit button to toggle into inline editing. On save,
 * calls the API and notifies the parent via onDetailUpdated.
 */
export default function RequestDetailTab({
  detail,
  onDetailUpdated,
  isOwner,
}: RequestDetailTabProps) {
  const requestId = detail.uuid;

  /* ── Edit state ─────────────────────────── */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── Makes / Models / Trims for edit dropdowns ──── */
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [trims, setTrims] = useState<Trim[]>([]);

  useEffect(() => {
    fetchMakes()
      .then(setMakes)
      .catch((err) => console.error("Failed to load makes:", err));
  }, []);

  const selectedMake = editForm?.make ?? detail.target.make ?? "";
  useEffect(() => {
    if (!selectedMake || selectedMake === "any") {
      setModels([]);
      return;
    }
    fetchModelsForMake(selectedMake)
      .then(setModels)
      .catch((err) => console.error("Failed to load models:", err));
  }, [selectedMake]);

  // Fetch known trims whenever the selected model changes
  const selectedModel = editForm?.model ?? detail.target.model ?? "";
  useEffect(() => {
    if (!selectedMake || selectedMake === "any" || !selectedModel || selectedModel === "any") {
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
      const payload: VehicleRequestPayload = { ...editForm };
      const updated = await updateVehicleRequest(requestId, payload);
      onDetailUpdated(updated);
      setEditing(false);
      setEditForm(null);
      toast.success("Changes saved successfully!");
    } catch (err) {
      console.error("Failed to update request:", err);
      toast.error("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Cancel editing if viewer switches away from owner mode ── */
  useEffect(() => {
    if (!isOwner && editing) {
      setEditing(false);
      setEditForm(null);
    }
  }, [isOwner, editing]);

  /* ── Derived display values ────────────── */
  const t = detail.target;
  const makeName = t.makeName || "Any";
  const modelName = t.modelName || "Any";

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* Edit / Cancel / Save bar — only shown to the request owner */}
      {isOwner && (
        <div className="flex items-center justify-end gap-3">
          {!editing ? (
            <Button
              onClick={startEditing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Pencil className="size-4 mr-1" />
              Edit
            </Button>
          ) : (
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
        </div>
      )}

      {/* ── YOUR CAR ─────────────────────────── */}
      <Section icon={sectionIcons.car} title="Your Car" editing={editing}>
        {editing && editForm ? (
          <div className="space-y-5">
            <div>
              <Label required>Make</Label>
              <Select
                value={editForm.make || undefined}
                onValueChange={(value) => {
                  updateField("make", value);
                  updateField("model", "any");
                  updateField("trim", "");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any Make" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Make</SelectItem>
                  {makes.map((m) => (
                    <SelectItem key={m.slug} value={m.slug}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Model</Label>
              <Select
                value={editForm.model}
                onValueChange={(value) => {
                  updateField("model", value);
                  updateField("trim", "");
                }}
                disabled={!editForm.make || editForm.make === "any"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Model</SelectItem>
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
                <Label>Year Min</Label>
                <Select
                  value={String(editForm.yearMin)}
                  onValueChange={(value) => {
                    const val = Number(value);
                    updateField("yearMin", val);
                    if (val > editForm.yearMax) updateField("yearMax", val);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year Max</Label>
                <Select
                  value={String(editForm.yearMax)}
                  onValueChange={(value) => {
                    const val = Number(value);
                    updateField("yearMax", val);
                    if (val < editForm.yearMin) updateField("yearMin", val);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  } else if (value === "__any__") {
                    updateField("trim", "");
                  } else {
                    updateField("trim", value);
                  }
                }}
                disabled={!editForm.model || editForm.model === "any"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any trim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any trim</SelectItem>
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
                  onValueChange={(value) => updateField("exteriorColor", value === "__any__" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Any color</SelectItem>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Interior Color</Label>
                <Select
                  value={editForm.interiorColor || undefined}
                  onValueChange={(value) => updateField("interiorColor", value === "__any__" ? "" : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Any color</SelectItem>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DetailRow label="Make" value={makeName} />
            <DetailRow label="Model" value={modelName} />
            <DetailRow label="Year Range" value={`${t.yearMin} – ${t.yearMax}`} />
            {t.trim && <DetailRow label="Trim" value={t.trim} />}
            <DetailRow label="Body Style" value={labelFor(t.bodyStyle, BODY_STYLES)} />
            <DetailRow
              label="Exterior Color"
              value={t.exteriorColor ? capitalize(t.exteriorColor) : "Any"}
            />
            <DetailRow
              label="Interior Color"
              value={t.interiorColor ? capitalize(t.interiorColor) : "Any"}
            />
          </>
        )}
      </Section>

      {/* ── YOUR BUDGET ──────────────────────── */}
      <Section icon={sectionIcons.budget} title="Your Budget" editing={editing}>
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
                <Label>Max Budget</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={cn(inputStyles, "pl-7")}
                    placeholder="e.g. 35000"
                    value={editForm.maxBudget}
                    onChange={(e) => updateField("maxBudget", e.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
              </div>
            )}
            {(editForm.purchaseMode === "finance" || editForm.purchaseMode === "lease") && (
              <div>
                <Label>Max Monthly Payment</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={cn(inputStyles, "pl-7")}
                    placeholder="e.g. 500"
                    value={editForm.maxMonthlyPayment}
                    onChange={(e) => updateField("maxMonthlyPayment", e.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>
              </div>
            )}
            {editForm.purchaseMode === "finance" && (
              <>
                <div>
                  <Label>Down Payment</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={cn(inputStyles, "pl-7")}
                      placeholder="Optional"
                      value={editForm.downPayment}
                      onChange={(e) => updateField("downPayment", e.target.value.replace(/[^0-9]/g, ""))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Credit Range</Label>
                  <div className="flex flex-wrap gap-2">
                    {CREDIT_RANGES.map((cr) => (
                      <OptionButton
                        key={cr.value}
                        selected={editForm.creditRange === cr.value}
                        onClick={() => updateField("creditRange", cr.value)}
                      >
                        {cr.label}
                      </OptionButton>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <DetailRow label="Purchase Mode" value={labelFor(detail.purchaseMode, PURCHASE_MODES)} />
            {detail.purchaseMode === "cash" && detail.maxBudget && (
              <DetailRow label="Max Budget" value={formatCurrency(detail.maxBudget)} />
            )}
            {(detail.purchaseMode === "finance" || detail.purchaseMode === "lease") && detail.maxMonthlyPayment && (
              <DetailRow label="Max Monthly" value={`${formatCurrency(detail.maxMonthlyPayment)}/mo`} />
            )}
            {detail.purchaseMode === "finance" && detail.downPayment && (
              <DetailRow label="Down Payment" value={formatCurrency(detail.downPayment)} />
            )}
            {detail.purchaseMode === "finance" && detail.creditRange !== "prefer_not" && (
              <DetailRow label="Credit Range" value={labelFor(detail.creditRange, CREDIT_RANGES)} />
            )}
          </>
        )}
      </Section>

      {/* ── YOUR LOCATION ────────────────────── */}
      <Section icon={sectionIcons.location} title="Your Location" editing={editing}>
        {editing && editForm ? (
          <div className="space-y-5">
            <div>
              <Label required>Search Radius</Label>
              <div className="flex flex-wrap gap-2">
                {SEARCH_RADII.map((r) => (
                  <OptionButton
                    key={r}
                    selected={editForm.searchRadius === r}
                    onClick={() => {
                      updateField("searchRadius", r);
                      /* Clear ZIP when switching to Nationwide */
                      if (r === "any") updateField("zipCode", "");
                    }}
                    className="min-w-20"
                  >
                    {r === "any" ? "Nationwide" : `${r} mi`}
                  </OptionButton>
                ))}
              </div>
            </div>
            {/* ZIP Code — only shown when a specific radius is selected */}
            {editForm.searchRadius !== "any" && (
              <div>
                <Label required>ZIP Code or City</Label>
                <input
                  type="text"
                  className={inputStyles}
                  placeholder="e.g. 90210"
                  value={editForm.zipCode}
                  onChange={(e) => updateField("zipCode", e.target.value)}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {detail.zipCode && (
              <DetailRow
                label="Location"
                value={
                  detail.cityName && detail.stateName
                    ? `${detail.cityName}, ${detail.stateName} ${detail.zipCode}`
                    : detail.zipCode
                }
              />
            )}
            <DetailRow
              label="Search Radius"
              value={detail.searchRadius ? `${Number(detail.searchRadius)} miles` : "Nationwide"}
            />
          </>
        )}
      </Section>

      {/* ── VEHICLE SPECS ────────────────────── */}
      <Section icon={sectionIcons.specs} title="Vehicle Specs" editing={editing}>
        {editing && editForm ? (
          <div className="space-y-5">
            <div>
              <Label>Max Mileage</Label>
              <input
                type="text"
                inputMode="numeric"
                className={inputStyles}
                placeholder="e.g. 50000"
                value={editForm.maxMileage}
                onChange={(e) => updateField("maxMileage", e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <div>
              <Label>Drivetrain</Label>
              <div className="flex flex-wrap gap-2">
                {DRIVETRAINS.map((d) => (
                  <OptionButton key={d.value} selected={editForm.drivetrain === d.value} onClick={() => updateField("drivetrain", d.value)}>
                    {d.label}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div>
              <Label>Fuel Type</Label>
              <div className="flex flex-wrap gap-2">
                {FUEL_TYPES.map((f) => (
                  <OptionButton key={f.value} selected={editForm.fuelType === f.value} onClick={() => updateField("fuelType", f.value)}>
                    {f.label}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div>
              <Label>Transmission</Label>
              <div className="flex flex-wrap gap-2">
                {TRANSMISSIONS.map((tr) => (
                  <OptionButton key={tr.value} selected={editForm.transmission === tr.value} onClick={() => updateField("transmission", tr.value)}>
                    {tr.label}
                  </OptionButton>
                ))}
              </div>
            </div>
            <div>
              <Label>Title Status</Label>
              <div className="flex flex-wrap gap-2">
                {TITLE_STATUSES.map((ts) => (
                  <OptionButton key={ts.value} selected={editForm.titleStatus === ts.value} onClick={() => updateField("titleStatus", ts.value)}>
                    {ts.label}
                  </OptionButton>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {t.maxMileage != null && (
              <DetailRow label="Max Mileage" value={`${t.maxMileage.toLocaleString()} mi`} />
            )}
            <DetailRow label="Drivetrain" value={labelFor(t.drivetrain, DRIVETRAINS)} />
            <DetailRow label="Fuel Type" value={labelFor(t.fuelType, FUEL_TYPES)} />
            <DetailRow label="Transmission" value={labelFor(t.transmission, TRANSMISSIONS)} />
            {t.titleStatus !== "any" && (
              <DetailRow label="Title Status" value={labelFor(t.titleStatus, TITLE_STATUSES)} />
            )}
          </>
        )}
      </Section>

      {/* ── EXTRAS ───────────────────────────── */}
      <Section icon={sectionIcons.extras} title="Extras" editing={editing}>
        {editing && editForm ? (
          <div className="space-y-5">
            <div>
              <Label>Desired Features</Label>
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
            <div>
              <Label>Additional Notes</Label>
              <textarea
                className={cn(inputStyles, "min-h-[100px] resize-y")}
                placeholder="Anything else we should know?"
                value={editForm.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            {detail.features.length > 0 ? (
              <DetailRow label="Features" value={detail.features.join(", ")} />
            ) : (
              <DetailRow label="Features" value="None specified" />
            )}
            <DetailRow label="Notes" value={detail.notes || "—"} />
          </>
        )}
      </Section>

      {/* Bottom save bar when editing (owner only) */}
      {isOwner && editing && (
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
