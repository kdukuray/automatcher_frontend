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
  Camera,
  DollarSign,
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
  updateInventoryVehicle,
  uploadInventoryVehicleImages,
  deleteInventoryVehicleImage,
} from "@/lib/api";
import type {
  Make,
  Model,
  Trim,
  InventoryVehicleDetail,
  InventoryVehiclePayload,
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

interface EditFormData extends InventoryVehiclePayload {
  // Payload already has all the fields we need
}

/** Convert an InventoryVehicleDetail into the editable form shape. */
function detailToEditForm(detail: InventoryVehicleDetail): EditFormData {
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
    listPrice: detail.listPrice,
    notes: detail.notes,
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

/* ── Component props ────────────────────────────── */

interface InventoryDetailTabProps {
  /** The full detail object for this inventory vehicle. */
  detail: InventoryVehicleDetail;
  /** Callback to update the detail object after a successful save. */
  onDetailUpdated: (updated: InventoryVehicleDetail) => void;
}

/* ── Main component ─────────────────────────────── */

/**
 * InventoryDetailTab – Renders the detail/edit view for a single inventory vehicle.
 *
 * Displays all vehicle sections in view mode, with an Edit button to toggle
 * into inline editing. On save, calls the API and notifies the parent via
 * onDetailUpdated.
 */
export default function InventoryDetailTab({
  detail,
  onDetailUpdated,
}: InventoryDetailTabProps) {
  const vehicleId = detail.uuid;

  /* ── Edit state ─────────────────────────── */
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── Image upload state ─────────────────── */
  const [uploading, setUploading] = useState(false);

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
      const payload: InventoryVehiclePayload = { ...editForm };
      const updated = await updateInventoryVehicle(vehicleId, payload);
      onDetailUpdated(updated);
      setEditing(false);
      setEditForm(null);
      toast.success("Changes saved successfully!");
    } catch (err) {
      console.error("Failed to update inventory vehicle:", err);
      toast.error("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Image upload/delete handlers ─────── */

  /** Upload new images and update the parent detail with the refreshed image list. */
  const handleImageUpload = async (files: File[]) => {
    if (uploading) return;
    setUploading(true);
    try {
      const updatedImages = await uploadInventoryVehicleImages(vehicleId, files);
      // Merge the new images into the existing detail
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
      setUploading(false);
    }
  };

  /** Delete a single image and update the parent detail with the refreshed image list. */
  const handleImageDelete = async (imageId: number) => {
    try {
      const updatedImages = await deleteInventoryVehicleImage(vehicleId, imageId);
      onDetailUpdated({ ...detail, images: updatedImages });
      toast.success("Photo removed.");
    } catch (err) {
      console.error("Failed to delete image:", err);
      toast.error("Failed to remove photo. Please try again.");
    }
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* Edit / Cancel / Save bar */}
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

      {/* ── PHOTOS ──────────────────────────────── */}
      <Section icon={sectionIcons.photos} title="Photos" editing={editing}>
        <ImageGallery
          images={detail.images ?? []}
          editing={editing}
          uploading={uploading}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
        />
      </Section>

      {/* ── VEHICLE IDENTITY ─────────────────────── */}
      <Section icon={sectionIcons.car} title="Vehicle Identity" editing={editing}>
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
      <Section icon={sectionIcons.specs} title="Vehicle Specs" editing={editing}>
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

      {/* ── PRICING & FEATURES ───────────────────────── */}
      <Section icon={sectionIcons.pricing} title="Pricing" editing={editing}>
        {editing && editForm ? (
          <div>
            <Label>List Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                className={cn(inputStyles, "pl-7")}
                placeholder="e.g. 25000"
                value={editForm.listPrice}
                onChange={(e) =>
                  updateField("listPrice", e.target.value.replace(/[^0-9]/g, ""))
                }
              />
            </div>
          </div>
        ) : (
          <>
            {detail.listPrice && (
              <DetailRow label="List Price" value={formatCurrency(detail.listPrice)} />
            )}
          </>
        )}
      </Section>

      {/* ── EXTRAS ───────────────────────────── */}
      <Section icon={sectionIcons.extras} title="Features & Notes" editing={editing}>
        {editing && editForm ? (
          <div className="space-y-5">
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
            <div>
              <Label>Additional Notes</Label>
              <textarea
                className={cn(inputStyles, "min-h-[100px] resize-y")}
                placeholder="Any additional details about this vehicle..."
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
