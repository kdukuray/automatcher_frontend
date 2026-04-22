"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Pencil,
  Send,
  Car,
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
import { fetchMakes, fetchModelsForMake, fetchTrimsForModel, createVehicleRequest } from "@/lib/api";
import type { Make, Model, Trim } from "@/lib/types";
import { useRequireAuth } from "@/lib/use-require-auth";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - 1990 + 1 },
  (_, i) => CURRENT_YEAR - i
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

const CREDIT_RANGES = [
  { value: "prefer_not", label: "Prefer not to say" },
  { value: "580_649", label: "580–649" },
  { value: "650_699", label: "650–699" },
  { value: "700_plus", label: "700+" },
];

const SEARCH_RADII = ["25", "50", "100", "250", "any"];
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

const STEPS = [
  { title: "Your Car", description: "What are you looking for?" },
  { title: "Your Budget", description: "How do you plan to pay?" },
  { title: "Your Location", description: "Where should we search?" },
  { title: "Vehicle Specs", description: "Any mechanical preferences?" },
  { title: "Extras", description: "Nice-to-have features" },
];

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface FormData {
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
  emailNotificationsEnabled: boolean;
}

const defaultFormData: FormData = {
  make: "",
  model: "any",
  yearMin: CURRENT_YEAR - 10,
  yearMax: CURRENT_YEAR,
  trim: "",
  bodyStyle: "any",
  exteriorColor: "",
  interiorColor: "",
  purchaseMode: "",
  maxBudget: "",
  maxMonthlyPayment: "",
  downPayment: "",
  creditRange: "prefer_not",
  zipCode: "",
  searchRadius: "any",
  maxMileage: "",
  drivetrain: "any",
  fuelType: "any",
  transmission: "any",
  titleStatus: "any",
  features: [],
  notes: "",
  // Opt-in defaults to true so buyers don't miss offers. They can uncheck
  // the "Email me when I get a new offer" checkbox in the Extras step.
  emailNotificationsEnabled: true,
};

/* ═══════════════════════════════════════════
   ANIMATION
   ═══════════════════════════════════════════ */

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 250 : -250,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -250 : 250,
    opacity: 0,
  }),
};

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
   STEP INDICATOR
   ═══════════════════════════════════════════ */

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="w-full">
      {/* Mobile: simple progress */}
      <div className="sm:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-700">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-500">
            {STEPS[currentStep].title}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-blue-100">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Desktop: full stepper */}
      <div className="hidden sm:flex items-center justify-between mb-8">
        {STEPS.map((step, idx) => (
          <div key={step.title} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                  idx < currentStep
                    ? "border-blue-600 bg-blue-600 text-white"
                    : idx === currentStep
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-400"
                )}
              >
                {idx < currentStep ? (
                  <Check className="size-5" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium whitespace-nowrap",
                  idx <= currentStep ? "text-blue-700" : "text-gray-400"
                )}
              >
                {step.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-3 -mt-5 transition-all duration-300",
                  idx < currentStep ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP PROP TYPES
   ═══════════════════════════════════════════ */

interface StepProps {
  data: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  makes?: Make[];
  models?: Model[];
  trims?: Trim[];
}

/* ═══════════════════════════════════════════
   STEP 1 — YOUR CAR
   ═══════════════════════════════════════════ */

function StepYourCar({ data, update, makes = [], models = [], trims = [] }: StepProps) {
  const [showDetails, setShowDetails] = useState(
    !!(data.trim || (data.bodyStyle && data.bodyStyle !== "any") || data.exteriorColor || data.interiorColor)
  );

  // Determine whether the current trim value is a known trim or a custom "Other" entry.
  // If the trim is non-empty and doesn't match any known trim name, show the custom input.
  const isCustomTrim = data.trim !== "" && !trims.some((t) => t.name === data.trim);

  // The dropdown value: "" for Any, the trim name for a known trim, or "__other__" for custom
  const trimDropdownValue = data.trim === "" ? "" : isCustomTrim ? "__other__" : data.trim;

  return (
    <div className="space-y-6">
      {/* Make — uses shadcn Select for consistent cross-browser styling */}
      <div>
        <Label required>Make</Label>
        <Select
          value={data.make || undefined}
          onValueChange={(value) => {
            update("make", value);
            update("model", "any");
            update("trim", "");
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select make…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Make</SelectItem>
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
          value={data.model}
          onValueChange={(value) => {
            update("model", value);
            update("trim", "");
          }}
          disabled={!data.make || data.make === "any"}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Model</SelectItem>
            {/* Group models into Current and Other (discontinued) */}
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

      {/* Year Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Year Min</Label>
          <Select
            value={String(data.yearMin)}
            onValueChange={(value) => {
              const val = Number(value);
              update("yearMin", val);
              if (val > data.yearMax) update("yearMax", val);
            }}
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
          <Label>Year Max</Label>
          <Select
            value={String(data.yearMax)}
            onValueChange={(value) => {
              const val = Number(value);
              update("yearMax", val);
              if (val < data.yearMin) update("yearMin", val);
            }}
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
      </div>

      {/* Max Mileage */}
      <div>
        <Label>Max Mileage</Label>
        <input
          type="text"
          inputMode="numeric"
          className={inputStyles}
          placeholder="e.g. 50000"
          value={data.maxMileage}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            update("maxMileage", val);
          }}
        />
      </div>

      {/* Collapsible Optional Details */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
      >
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-200",
            showDetails && "rotate-180"
          )}
        />
        Add details
      </button>

      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-5 pt-1 pb-1">
              {/* Trim — dropdown of known trims + "Other" for free text */}
              <div>
                <Label>Trim</Label>
                <Select
                  value={trimDropdownValue || undefined}
                  onValueChange={(value) => {
                    if (value === "__other__") {
                      // Switch to custom mode — clear trim so user types fresh
                      update("trim", " ");
                    } else if (value === "__any__") {
                      update("trim", "");
                    } else {
                      // Known trim name
                      update("trim", value);
                    }
                  }}
                  disabled={!data.model || data.model === "any"}
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
                {/* Show free-text input when "Other…" is selected */}
                {isCustomTrim && (
                  <input
                    type="text"
                    className={cn(inputStyles, "mt-2")}
                    placeholder="Enter trim (e.g. LX, EX, Limited)"
                    value={data.trim}
                    onChange={(e) => update("trim", e.target.value)}
                    autoFocus
                  />
                )}
              </div>

              {/* Body Style */}
              <div>
                <Label>Body Style</Label>
                <div className="flex flex-wrap gap-2">
                  <OptionButton
                    selected={data.bodyStyle === "any"}
                    onClick={() => update("bodyStyle", "any")}
                  >
                    Any
                  </OptionButton>
                  {BODY_STYLES.map((bs) => (
                    <OptionButton
                      key={bs.value}
                      selected={data.bodyStyle === bs.value}
                      onClick={() => update("bodyStyle", bs.value)}
                    >
                      {bs.label}
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Exterior Color */}
              <div>
                <Label>Exterior Color</Label>
                <Select
                  value={data.exteriorColor || undefined}
                  onValueChange={(value) => update("exteriorColor", value === "__any__" ? "" : value)}
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

              {/* Interior Color */}
              <div>
                <Label>Interior Color</Label>
                <Select
                  value={data.interiorColor || undefined}
                  onValueChange={(value) => update("interiorColor", value === "__any__" ? "" : value)}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 2 — YOUR BUDGET
   ═══════════════════════════════════════════ */

function StepYourBudget({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Purchase Mode */}
      <div>
        <Label required>Purchase Mode</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: "cash", label: "Cash" },
            { value: "finance", label: "Finance" },
            { value: "lease", label: "Lease" },
            { value: "not_sure", label: "Not Sure" },
          ].map((opt) => (
            <OptionButton
              key={opt.value}
              selected={data.purchaseMode === opt.value}
              onClick={() => update("purchaseMode", opt.value)}
              className="py-3"
            >
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Conditional fields */}
      <AnimatePresence mode="wait">
        {data.purchaseMode === "cash" && (
          <motion.div
            key="cash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <Label required>Max Out-the-Door Budget</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={cn(inputStyles, "pl-7")}
                  placeholder="e.g. 35000"
                  value={data.maxBudget}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    update("maxBudget", val);
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {data.purchaseMode === "finance" && (
          <motion.div
            key="finance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <Label required>Max Monthly Payment</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={cn(inputStyles, "pl-7")}
                  placeholder="e.g. 500"
                  value={data.maxMonthlyPayment}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    update("maxMonthlyPayment", val);
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
                  value={data.downPayment}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    update("downPayment", val);
                  }}
                />
              </div>
            </div>

            <div>
              <Label>Credit Range</Label>
              <div className="flex flex-wrap gap-2">
                {CREDIT_RANGES.map((cr) => (
                  <OptionButton
                    key={cr.value}
                    selected={data.creditRange === cr.value}
                    onClick={() => update("creditRange", cr.value)}
                  >
                    {cr.label}
                  </OptionButton>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {data.purchaseMode === "lease" && (
          <motion.div
            key="lease"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div>
              <Label required>Max Monthly Payment</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={cn(inputStyles, "pl-7")}
                  placeholder="e.g. 400"
                  value={data.maxMonthlyPayment}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    update("maxMonthlyPayment", val);
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {data.purchaseMode === "not_sure" && (
          <motion.div
            key="not_sure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-gray-500 bg-blue-50 rounded-lg p-4">
              No worries! We&apos;ll show you options across all purchase types.
              You can always refine later.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 3 — YOUR LOCATION
   ═══════════════════════════════════════════ */

function StepYourLocation({ data, update }: StepProps) {
  const isNationwide = data.searchRadius === "any";

  return (
    <div className="space-y-6">
      {/* Search Radius — shown first so selecting Nationwide can hide ZIP */}
      <div>
        <Label required>Search Radius</Label>
        <div className="flex flex-wrap gap-2">
          {SEARCH_RADII.map((r) => (
            <OptionButton
              key={r}
              selected={data.searchRadius === r}
              onClick={() => {
                update("searchRadius", r);
                /* Clear ZIP when switching to Nationwide since it's not needed */
                if (r === "any") update("zipCode", "");
              }}
              className="min-w-20"
            >
              {r === "any" ? "Nationwide" : `${r} mi`}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* ZIP Code — only required when a specific radius is selected */}
      {!isNationwide && (
        <div>
          <Label required>ZIP Code or City</Label>
          <input
            type="text"
            className={inputStyles}
            placeholder="e.g. 90210 or Los Angeles"
            value={data.zipCode}
            onChange={(e) => update("zipCode", e.target.value)}
          />
        </div>
      )}

      {/* Nationwide info hint */}
      {isNationwide && (
        <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-3 font-medium">
          We&apos;ll search dealerships across the entire country.
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 4 — VEHICLE SPECS
   ═══════════════════════════════════════════ */

function StepVehicleSpecs({ data, update }: StepProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-3 font-medium">
        This section is optional — skip if you&apos;re flexible.
      </p>

      {/* Drivetrain */}
      <div>
        <Label>Drivetrain</Label>
        <div className="flex flex-wrap gap-2">
          <OptionButton
            selected={data.drivetrain === "any"}
            onClick={() => update("drivetrain", "any")}
          >
            Any
          </OptionButton>
          {DRIVETRAINS.map((d) => (
            <OptionButton
              key={d}
              selected={data.drivetrain === d.toLowerCase()}
              onClick={() => update("drivetrain", d.toLowerCase())}
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
            selected={data.fuelType === "any"}
            onClick={() => update("fuelType", "any")}
          >
            Any
          </OptionButton>
          {FUEL_TYPES.map((f) => (
            <OptionButton
              key={f}
              selected={data.fuelType === f.toLowerCase()}
              onClick={() => update("fuelType", f.toLowerCase())}
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
            selected={data.transmission === "any"}
            onClick={() => update("transmission", "any")}
          >
            Any
          </OptionButton>
          {TRANSMISSIONS.map((t) => (
            <OptionButton
              key={t}
              selected={data.transmission === t.toLowerCase()}
              onClick={() => update("transmission", t.toLowerCase())}
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
            { value: "clean", label: "Clean Title Only" },
            { value: "rebuilt", label: "Rebuilt OK" },
          ].map((t) => (
            <OptionButton
              key={t.value}
              selected={data.titleStatus === t.value}
              onClick={() => update("titleStatus", t.value)}
            >
              {t.label}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   STEP 5 — EXTRAS
   ═══════════════════════════════════════════ */

function StepExtras({ data, update }: StepProps) {
  const toggleFeature = (feature: string) => {
    const current = data.features;
    if (current.includes(feature)) {
      update(
        "features",
        current.filter((f) => f !== feature)
      );
    } else {
      update("features", [...current, feature]);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-3 font-medium">
        This section is optional — skip if you don&apos;t have specific
        preferences.
      </p>

      {/* Features */}
      <div>
        <Label>Desired Features</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FEATURES_LIST.map((feature) => {
            const isSelected = data.features.includes(feature);
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

      {/* Notes */}
      <div>
        <Label>Additional Notes</Label>
        <textarea
          className={cn(inputStyles, "min-h-[100px] resize-y")}
          placeholder="Anything else we should know? Special requirements, preferences, timeline…"
          value={data.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      {/* Email notifications opt-in */}
      {/*
        Default-on checkbox that controls whether the buyer gets a Resend
        email every time a new offer arrives. Can be toggled later from
        the request detail page's edit mode.
      */}
      <div>
        <Label>Email Notifications</Label>
        <button
          type="button"
          onClick={() =>
            update("emailNotificationsEnabled", !data.emailNotificationsEnabled)
          }
          className={cn(
            "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all cursor-pointer",
            data.emailNotificationsEnabled
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
          )}
          aria-pressed={data.emailNotificationsEnabled}
        >
          <div
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-all",
              data.emailNotificationsEnabled
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-gray-300 bg-white"
            )}
          >
            {data.emailNotificationsEnabled && <Check className="size-3" />}
          </div>
          <div className="flex-1">
            <div
              className={cn(
                "text-sm font-medium",
                data.emailNotificationsEnabled ? "text-blue-800" : "text-gray-700"
              )}
            >
              Email me when I get a new offer
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              We&apos;ll send a quick email to your account address whenever a
              dealer sends an offer on this request. You can change this any
              time.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DISPLAY HELPERS (for Review)
   ═══════════════════════════════════════════ */

function getLabelForValue(
  value: string,
  list: { value: string; label: string }[]
): string {
  return list.find((i) => i.value === value)?.label || value || "—";
}

function displayValue(val: string | number | string[], fallback = "Any") {
  if (Array.isArray(val)) return val.length ? val.join(", ") : fallback;
  if (typeof val === "number") return String(val);
  return val || fallback;
}

/* ═══════════════════════════════════════════
   REVIEW PAGE
   ═══════════════════════════════════════════ */

function ReviewPage({
  data,
  onEdit,
  onFinalSubmit,
  submitting = false,
  makes = [],
  models = [],
}: {
  data: FormData;
  onEdit: (step: number) => void;
  onFinalSubmit: () => void;
  submitting?: boolean;
  makes?: Make[];
  models?: Model[];
}) {
  const makeLabel = data.make === "any"
    ? "Any Make"
    : makes.find((m) => m.slug === data.make)?.name ?? data.make;

  const modelLabel = data.model === "any"
    ? "Any"
    : models.find((m) => m.slug === data.model)?.name ?? data.model;

  const sections = [
    {
      step: 0,
      title: "Your Car",
      rows: [
        { label: "Make", value: makeLabel || "—" },
        { label: "Model", value: modelLabel },
        { label: "Year Range", value: `${data.yearMin} – ${data.yearMax}` },
        ...(data.trim ? [{ label: "Trim", value: data.trim }] : []),
        ...(data.bodyStyle !== "any"
          ? [
              {
                label: "Body Style",
                value: getLabelForValue(data.bodyStyle, BODY_STYLES),
              },
            ]
          : []),
        ...(data.exteriorColor
          ? [
              {
                label: "Exterior Color",
                value:
                  data.exteriorColor.charAt(0).toUpperCase() +
                  data.exteriorColor.slice(1),
              },
            ]
          : []),
        ...(data.interiorColor
          ? [
              {
                label: "Interior Color",
                value:
                  data.interiorColor.charAt(0).toUpperCase() +
                  data.interiorColor.slice(1),
              },
            ]
          : []),
        ...(data.maxMileage
          ? [
              {
                label: "Max Mileage",
                value: `${Number(data.maxMileage).toLocaleString()} mi`,
              },
            ]
          : []),
      ],
    },
    {
      step: 1,
      title: "Your Budget",
      rows: [
        {
          label: "Purchase Mode",
          value: getLabelForValue(data.purchaseMode, [
            { value: "cash", label: "Cash" },
            { value: "finance", label: "Finance" },
            { value: "lease", label: "Lease" },
            { value: "not_sure", label: "Not Sure" },
          ]),
        },
        ...(data.purchaseMode === "cash" && data.maxBudget
          ? [
              {
                label: "Max Budget",
                value: `$${Number(data.maxBudget).toLocaleString()}`,
              },
            ]
          : []),
        ...((data.purchaseMode === "finance" ||
          data.purchaseMode === "lease") &&
        data.maxMonthlyPayment
          ? [
              {
                label: "Max Monthly Payment",
                value: `$${Number(data.maxMonthlyPayment).toLocaleString()}/mo`,
              },
            ]
          : []),
        ...(data.purchaseMode === "finance" && data.downPayment
          ? [
              {
                label: "Down Payment",
                value: `$${Number(data.downPayment).toLocaleString()}`,
              },
            ]
          : []),
        ...(data.purchaseMode === "finance" &&
        data.creditRange !== "prefer_not"
          ? [
              {
                label: "Credit Range",
                value: getLabelForValue(data.creditRange, CREDIT_RANGES),
              },
            ]
          : []),
      ],
    },
    {
      step: 2,
      title: "Your Location",
      rows: [
        /* Only show ZIP row when a specific radius is selected */
        ...(data.searchRadius !== "any"
          ? [{ label: "ZIP / City", value: displayValue(data.zipCode) }]
          : []),
        {
          label: "Search Radius",
          value: data.searchRadius === "any" ? "Nationwide" : `${data.searchRadius} miles`,
        },
      ],
    },
    {
      step: 3,
      title: "Vehicle Specs",
      rows: [
        {
          label: "Drivetrain",
          value: data.drivetrain === "any" ? "Any" : data.drivetrain.toUpperCase(),
        },
        {
          label: "Fuel Type",
          value:
            data.fuelType === "any"
              ? "Any"
              : data.fuelType.charAt(0).toUpperCase() + data.fuelType.slice(1),
        },
        {
          label: "Transmission",
          value:
            data.transmission === "any"
              ? "Any"
              : data.transmission.charAt(0).toUpperCase() +
                data.transmission.slice(1),
        },
        ...(data.titleStatus !== "any"
          ? [
              {
                label: "Title Status",
                value: data.titleStatus === "clean" ? "Clean Only" : "Rebuilt OK",
              },
            ]
          : []),
      ],
    },
    {
      step: 4,
      title: "Extras",
      rows: [
        ...(data.features.length
          ? [{ label: "Features", value: data.features.join(", ") }]
          : []),
        ...(data.notes
          ? [{ label: "Notes", value: data.notes }]
          : []),
        {
          label: "Email Notifications",
          value: data.emailNotificationsEnabled
            ? "On — email me on new offers"
            : "Off — I'll check my dashboard",
        },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Check className="size-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Review Your Request</h2>
        </div>
        <p className="text-gray-500 text-sm">
          Double-check everything below, then submit when you&apos;re ready.
        </p>
      </div>

      {sections.map((section) => (
        <div
          key={section.step}
          className="rounded-xl border border-blue-100 bg-white overflow-hidden"
        >
          <div className="flex items-center justify-between bg-blue-50/70 px-5 py-3 border-b border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800">
              {section.title}
            </h3>
            <button
              type="button"
              onClick={() => onEdit(section.step)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          </div>
          <div className="px-5 py-4 space-y-2.5">
            {section.rows.map((row, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4",
                  row.label === "" ? "text-gray-400 italic text-sm" : ""
                )}
              >
                {row.label && (
                  <span className="text-sm text-gray-500 sm:w-44 shrink-0 font-medium">
                    {row.label}
                  </span>
                )}
                <span className="text-sm text-gray-900 wrap-break-word">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4 flex justify-center">
        <Button
          size="lg"
          onClick={onFinalSubmit}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 px-10 disabled:opacity-60"
        >
          <Send className="size-4 mr-2" />
          {submitting ? "Submitting…" : "Submit Request"}
        </Button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   VALIDATION
   ═══════════════════════════════════════════ */

function validateStep(step: number, data: FormData): boolean {
  switch (step) {
    case 0:
      return data.make !== "";
    case 1:
      if (!data.purchaseMode) return false;
      if (data.purchaseMode === "cash" && !data.maxBudget) return false;
      if (data.purchaseMode === "finance" && !data.maxMonthlyPayment)
        return false;
      if (data.purchaseMode === "lease" && !data.maxMonthlyPayment)
        return false;
      return true;
    case 2:
      /* ZIP is required unless the user chose Nationwide (searchRadius === "any") */
      if (data.searchRadius === "any") return true;
      return data.zipCode.trim() !== "" && data.searchRadius !== "";
    case 3:
    case 4:
      return true; // optional
    default:
      return true;
  }
}

/* ═══════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════ */

export default function CreateRequestPage() {
  const { isReady } = useRequireAuth();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [editFromReview, setEditFromReview] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Dynamic makes / models / trims from API ──
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [trims, setTrims] = useState<Trim[]>([]);

  // Fetch all makes on mount
  useEffect(() => {
    fetchMakes()
      .then(setMakes)
      .catch((err) => console.error("Failed to load makes:", err));
  }, []);

  // Fetch models whenever the selected make changes
  useEffect(() => {
    if (!formData.make || formData.make === "any") {
      setModels([]);
      return;
    }
    fetchModelsForMake(formData.make)
      .then(setModels)
      .catch((err) => console.error("Failed to load models:", err));
  }, [formData.make]);

  // Fetch known trims whenever the selected model changes
  useEffect(() => {
    if (!formData.make || formData.make === "any" || !formData.model || formData.model === "any") {
      setTrims([]);
      return;
    }
    fetchTrimsForModel(formData.make, formData.model)
      .then(setTrims)
      .catch((err) => console.error("Failed to load trims:", err));
  }, [formData.make, formData.model]);

  const containerRef = useRef<HTMLDivElement>(null);

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const scrollToTop = () => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goNext = () => {
    if (!validateStep(currentStep, formData)) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    scrollToTop();
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    scrollToTop();
  };

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    scrollToTop();
  };

  const handleSubmitToReview = () => {
    if (!validateStep(currentStep, formData)) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }
    setShowReview(true);
    setEditFromReview(false);
    scrollToTop();
  };

  const handleEditFromReview = (step: number) => {
    setShowReview(false);
    setEditFromReview(true);
    goToStep(step);
  };

  const handleBackToReview = () => {
    if (!validateStep(currentStep, formData)) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 600);
      return;
    }
    setShowReview(true);
    setEditFromReview(false);
    scrollToTop();
  };

  const router = useRouter();

  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await createVehicleRequest(formData);
      toast.success("Vehicle request created successfully!");
      router.push(`/requests/${result.uuid}`);
    } catch (err) {
      console.error("Failed to submit vehicle request:", err);
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const stepProps: StepProps = { data: formData, update: updateField, makes, models, trims };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepYourCar {...stepProps} />;
      case 1:
        return <StepYourBudget {...stepProps} />;
      case 2:
        return <StepYourLocation {...stepProps} />;
      case 3:
        return <StepVehicleSpecs {...stepProps} />;
      case 4:
        return <StepExtras {...stepProps} />;
      default:
        return null;
    }
  };

  const isValid = validateStep(currentStep, formData);
  const canSubmit = currentStep >= 3; // Steps 4 & 5 (idx 3 & 4) are skippable

  // Make sure we suppress hydration mismatch for the year (computed client-side)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Show a full-height loading state while auth resolves OR before the client
  // mounts. Returning a full-height <main> (instead of null) during the
  // pre-mount frame prevents the footer from briefly jumping to the top of the
  // viewport when navigating to this page — the container reserves the same
  // vertical space the real page will occupy.
  if (!isReady || !mounted)
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-linear-to-b from-blue-50/80 to-white">
      <div
        ref={containerRef}
        className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Car className="size-4" />
            New Request
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Create Your Car Request
          </h1>
          <p className="mt-2 text-gray-500 text-sm sm:text-base">
            Tell us what you&apos;re looking for and we&apos;ll match you with
            the right dealers.
          </p>
        </div>

        {showReview ? (
          <ReviewPage
            data={formData}
            onEdit={handleEditFromReview}
            onFinalSubmit={handleFinalSubmit}
            submitting={submitting}
            makes={makes}
            models={models}
          />
        ) : (
          <>
            {/* Step Indicator */}
            <StepIndicator
              currentStep={currentStep}
              totalSteps={STEPS.length}
            />

            {/* Form Card */}
            <div
              className={cn(
                "rounded-2xl border border-blue-100 bg-white p-5 sm:p-8 shadow-sm overflow-hidden",
                shakeError && "animate-shake"
              )}
            >
              {/* Step Title + Skip (for optional steps) */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {STEPS[currentStep].title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {STEPS[currentStep].description}
                  </p>
                </div>
                {/* Skip button — shown on optional steps (Vehicle Specs & Extras) unless editing from review */}
                {canSubmit && !editFromReview && (
                  <button
                    type="button"
                    onClick={() => {
                      /* On the last step, skip straight to review; otherwise advance one step */
                      if (currentStep === STEPS.length - 1) {
                        handleSubmitToReview();
                      } else {
                        goNext();
                      }
                    }}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors cursor-pointer shrink-0"
                  >
                    Skip
                    <ChevronRight className="size-4" />
                  </button>
                )}
              </div>

              {/* Animated Form Content */}
              <div className="relative min-h-[280px]">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Validation hint */}
              {!isValid && shakeError && (
                <p className="text-sm text-red-500 mt-4">
                  Please fill in all required fields before proceeding.
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 gap-3">
              <div>
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={goBack}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* "Back to Review" when editing from review */}
                {editFromReview && (
                  <Button
                    onClick={handleBackToReview}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Check className="size-4 mr-1" />
                    Back to Review
                  </Button>
                )}

                {/* Next button — on the last step, this goes to review */}
                {!editFromReview && (
                  currentStep < STEPS.length - 1 ? (
                    <Button
                      onClick={goNext}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      Next
                      <ChevronRight className="size-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitToReview}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      <Send className="size-4 mr-1" />
                      Submit
                    </Button>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
