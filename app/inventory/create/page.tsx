"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Loader2,
  Car,
  Check,
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
  createInventoryVehicle,
} from "@/lib/api";
import type { Make, Model, Trim, InventoryVehiclePayload } from "@/lib/types";
import { useRequireAuth } from "@/lib/use-require-auth";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";

/* ── Constants ───────────────────────────────────── */

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

/* ── Small reusable components ───────────────────── */

const inputStyles =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-5 py-5 space-y-5">{children}</div>
    </div>
  );
}

/**
 * CreateInventoryPage – Form for adding a new vehicle to dealer's inventory.
 *
 * Single-page form with all fields, simpler than the multi-step request creation.
 */
export default function CreateInventoryPage() {
  const { isReady } = useRequireAuth();
  const router = useRouter();

  // --- Makes, Models & Trims ---
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [trims, setTrims] = useState<Trim[]>([]);

  // --- Form state ---
  const [formData, setFormData] = useState<InventoryVehiclePayload>({
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
    listPrice: "",
    notes: "",
    features: [],
  });

  // --- Submission state ---
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- Fetch makes on mount ---
  useEffect(() => {
    fetchMakes()
      .then(setMakes)
      .catch((err) => console.error("Failed to load makes:", err));
  }, []);

  // --- Fetch models when make changes ---
  useEffect(() => {
    if (!formData.make || formData.make === "any") {
      setModels([]);
      return;
    }
    fetchModelsForMake(formData.make)
      .then(setModels)
      .catch((err) => console.error("Failed to load models:", err));
  }, [formData.make]);

  // --- Fetch known trims when model changes ---
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

  if (!isReady)
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );

  const updateField = <K extends keyof InventoryVehiclePayload>(
    key: K,
    value: InventoryVehiclePayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (feature: string) => {
    const current = formData.features;
    if (current.includes(feature)) {
      updateField("features", current.filter((f) => f !== feature));
    } else {
      updateField("features", [...current, feature]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = await createInventoryVehicle(formData);
      toast.success("Vehicle added to inventory!");
      // Redirect to the detail page for the newly created vehicle
      router.push(`/inventory/${result.uuid}`);
    } catch (err) {
      console.error("Failed to create inventory vehicle:", err);
      toast.error("Failed to create vehicle. Please check the form and try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white">
      <FadeIn direction="up" duration={0.4}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* --- Header --- */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Add Vehicle to Inventory
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Fill out the form below to add a new vehicle to your inventory.
          </p>
        </div>

        {/* --- Error banner --- */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <StaggerContainer className="space-y-6" delay={0.05}>
          {/* ── Vehicle Identity ─────────────────── */}
          <StaggerItem>
          <Section title="Vehicle Identity">
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
                value={formData.model || undefined}
                onValueChange={(value) => {
                  updateField("model", value);
                  updateField("trim", "");
                }}
                disabled={!formData.make}
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
                  placeholder="e.g. 35000"
                  value={formData.mileage}
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
                  placeholder="Enter trim (e.g. LX, EX, Limited)"
                  value={formData.trim}
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
                    selected={formData.bodyStyle === bs.value}
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
                  value={formData.exteriorColor || undefined}
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
                  value={formData.interiorColor || undefined}
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
          </Section>
          </StaggerItem>

          {/* ── Vehicle Specs ────────────────────── */}
          <StaggerItem>
          <Section title="Vehicle Specs">
            <div>
              <Label>Drivetrain</Label>
              <div className="flex flex-wrap gap-2">
                {DRIVETRAINS.map((d) => (
                  <OptionButton
                    key={d.value}
                    selected={formData.drivetrain === d.value}
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
                    selected={formData.fuelType === f.value}
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
                    selected={formData.transmission === tr.value}
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
                    selected={formData.titleStatus === ts.value}
                    onClick={() => updateField("titleStatus", ts.value)}
                  >
                    {ts.label}
                  </OptionButton>
                ))}
              </div>
            </div>
          </Section>
          </StaggerItem>

          {/* ── Pricing & Features ───────────────── */}
          <StaggerItem>
          <Section title="Pricing & Features">
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
                  value={formData.listPrice}
                  onChange={(e) =>
                    updateField("listPrice", e.target.value.replace(/[^0-9]/g, ""))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Features</Label>
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
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
              />
            </div>
          </Section>
          </StaggerItem>
          </StaggerContainer>

          {/* ── Submit buttons ───────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full sm:w-auto border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Adding Vehicle…
                </>
              ) : (
                <>
                  <Save className="size-4 mr-1" />
                  Add to Inventory
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      </FadeIn>
    </main>
  );
}
