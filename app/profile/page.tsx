"use client";

/**
 * Profile page — lets the authenticated user view and manage their profile.
 *
 * Sections:
 *   1. Account Info        — Email (read-only), user type, auth provider badge.
 *   2. Personal Info       — Phone, city, state (editable, saved via PATCH /api/profile/).
 *   3. Business Info       — (Dealers only) Business name, contact, address, website,
 *                            dealer license number, and logo upload.
 *   4. Change Password     — Available only for email-authenticated users.
 *                            OAuth-only users (e.g. Google) see a disabled state
 *                            with a message directing them to their provider.
 *
 * Auth provider detection uses the Supabase User object's
 * `app_metadata.providers` array. If it includes "email", the user can
 * change their password here. Otherwise the section is disabled.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  getUserProfile,
  updateUserProfile,
  uploadBusinessLogo,
  deleteBusinessLogo,
  submitVerificationRequest,
  upgradeToDealer,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import type { UserProfileResponse } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Shield,
  Lock,
  Info,
  Building2,
  Globe,
  Camera,
  Trash2,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- US State Options (matching backend US_STATE_CHOICES) ---
const US_STATES = [
  { value: "", label: "Select state" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

/* Human-readable labels for the required verification fields so the
   verification card can tell the dealer exactly which fields are missing. */
const VERIFICATION_FIELD_LABELS: Record<string, string> = {
  business_name: "Business Name",
  business_phone: "Business Phone",
  dealer_license_number: "Dealer License Number",
  address_line_1: "Street Address",
  city: "City",
  state: "State",
  zip_code: "ZIP Code",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // --- Profile data state ---
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // --- Editable personal info fields ---
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Editable business info fields (dealers only) ---
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessZipCode, setBusinessZipCode] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [dealerLicenseNumber, setDealerLicenseNumber] = useState("");
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  // --- Business logo state ---
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDeletingLogo, setIsDeletingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- Password change state ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- Verification state (dealers only) ---
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  // --- Account upgrade state (buyers only) ---
  const [isUpgrading, setIsUpgrading] = useState(false);

  // --- Determine auth provider from Supabase user metadata ---
  // If the user's providers array includes "email", they can change their
  // password here. If they only have OAuth providers (google, etc.), the
  // password section is disabled.
  const authProviders: string[] =
    (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const hasEmailAuth = authProviders.includes("email");

  // Whether the current user is a dealer (controls business section visibility)
  const isDealer = profile?.user_type === "dealer";

  /**
   * Build a human-readable label for the user's auth provider(s).
   * e.g. "Email", "Google", "Email & Google"
   */
  const authProviderLabel = authProviders
    .map((provider) => provider.charAt(0).toUpperCase() + provider.slice(1))
    .join(" & ") || "Unknown";

  // --- Redirect if not authenticated ---
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/profile");
    }
  }, [authLoading, user, router]);

  // --- Fetch the user's profile from the backend ---
  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      const data = await getUserProfile();
      setProfile(data);

      // Pre-fill editable personal info fields with current values
      setPhoneNumber(data.phone_number || "");
      setCity(data.city || "");
      setState(data.state || "");

      // Pre-fill business fields if the user is a dealer with existing data
      if (data.user_type === "dealer" && data.business) {
        setBusinessName(data.business.business_name || "");
        setBusinessPhone(data.business.business_phone || "");
        setBusinessEmail(data.business.business_email || "");
        setAddressLine1(data.business.address_line_1 || "");
        setAddressLine2(data.business.address_line_2 || "");
        setBusinessCity(data.business.city || "");
        setBusinessState(data.business.state || "");
        setBusinessZipCode(data.business.zip_code || "");
        setBusinessWebsite(data.business.website || "");
        setDealerLicenseNumber(data.business.dealer_license_number || "");
      }
    } catch {
      setProfileError("Failed to load your profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  // --- Handle saving personal info ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const updatedProfile = await updateUserProfile({
        phone_number: phoneNumber,
        city,
        state,
      });
      setProfile(updatedProfile);
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update your profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Handle saving business info (dealers only) ---
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation: business name is required
    if (!businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }

    setIsSavingBusiness(true);

    try {
      const updatedProfile = await updateUserProfile({
        business: {
          business_name: businessName.trim(),
          business_phone: businessPhone,
          business_email: businessEmail,
          address_line_1: addressLine1,
          address_line_2: addressLine2,
          city: businessCity,
          state: businessState,
          zip_code: businessZipCode,
          website: businessWebsite,
          dealer_license_number: dealerLicenseNumber,
        },
      });
      setProfile(updatedProfile);
      toast.success("Business information updated successfully.");
    } catch {
      toast.error("Failed to update business information. Please try again.");
    } finally {
      setIsSavingBusiness(false);
    }
  };

  // --- Handle business logo upload ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation for image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, etc.).");
      return;
    }

    // Limit file size to 5MB
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Logo file must be under 5 MB.");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const updatedProfile = await uploadBusinessLogo(file);
      setProfile(updatedProfile);
      toast.success("Business logo uploaded successfully.");
    } catch {
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setIsUploadingLogo(false);
      // Reset file input so the same file can be re-selected if needed
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // --- Handle business logo deletion ---
  const handleDeleteLogo = async () => {
    setIsDeletingLogo(true);
    try {
      const updatedProfile = await deleteBusinessLogo();
      setProfile(updatedProfile);
      toast.success("Business logo removed.");
    } catch {
      toast.error("Failed to remove logo. Please try again.");
    } finally {
      setIsDeletingLogo(false);
    }
  };

  // --- Handle password change via Supabase ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    // Supabase requires at least 6 characters
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);

    // Use Supabase's updateUser to change the password directly.
    // This works because the user already has an active session.
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setIsChangingPassword(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    // Clear form and show success
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed successfully.");
  };

  /**
   * Handle the "Request Verification" button click. Submits a verification
   * request to the backend, then re-fetches the profile to update the
   * verification status and field completeness indicators.
   */
  const handleRequestVerification = async () => {
    setIsSubmittingVerification(true);
    try {
      const result = await submitVerificationRequest();
      if (result.verified) {
        toast.success("Your account has been verified!");
        // Re-fetch profile to get updated verified status + field info
        await fetchProfile();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit verification request.";
      toast.error(message);
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  /**
   * Handle the "Upgrade to Dealer" confirmation. Calls the backend to switch
   * the user's account type from buyer to dealer, then re-fetches the profile
   * so the dealer-specific sections (business info, verification) appear.
   */
  const handleUpgradeToDealer = async () => {
    setIsUpgrading(true);
    try {
      await upgradeToDealer();
      toast.success("Your account has been upgraded to a dealer account!");
      // Re-fetch the profile to get the new user_type and dealer fields
      await fetchProfile();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to upgrade account. Please try again.";
      toast.error(message);
    } finally {
      setIsUpgrading(false);
    }
  };

  // Derive the current logo URL from the profile state
  const currentLogoUrl = profile?.business?.business_logo || "";

  // --- Loading state ---
  if (authLoading || profileLoading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-gray-500">Loading profile...</p>
        </div>
      </main>
    );
  }

  // --- Error loading profile ---
  if (profileError || !profile) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Building2 className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Could not load profile
            </CardTitle>
            <CardDescription>
              {profileError ?? "Something went wrong."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchProfile} className="w-full">
              Try again
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* --- Page Header --- */}
      <FadeIn direction="none" duration={0.3}>
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <UserCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Profile
            </h1>
            <p className="text-sm text-gray-500">
              Manage your account settings and personal information.
            </p>
          </div>
        </div>
      </div>
      </FadeIn>

      {/* --- Profile Sections --- */}
      <StaggerContainer className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8" delay={0.1}>
        {/* ---- Section 1: Account Info (read-only) ---- */}
        <StaggerItem>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details. These are managed by your authentication
              provider and cannot be changed here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <p className="text-sm font-medium text-gray-900">
                {profile.email}
              </p>
            </div>

            <Separator />

            {/* User Type */}
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">Account Type</Label>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {profile.user_type === "dealer" ? "Dealer" : "Buyer"}
                </span>

                {/* Subtle upgrade link — only shown for buyers */}
                {!isDealer && (
                  <>
                    <span className="text-gray-300">·</span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          disabled={isUpgrading}
                          className="text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {isUpgrading ? "Upgrading…" : "Switch to a dealer account"}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Upgrade to Dealer Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently upgrade your account to a dealer
                            account. You&apos;ll gain access to inventory management,
                            the ability to send offers, and dealer verification.
                            This change cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleUpgradeToDealer}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Upgrade to Dealer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Auth Provider */}
            <div className="space-y-1">
              <Label className="text-sm text-gray-500">
                Sign-in Method
              </Label>
              <p className="text-sm font-medium text-gray-900">
                {authProviderLabel}
              </p>
            </div>
          </CardContent>
        </Card>
        </StaggerItem>

        {/* ---- Section 2: Personal Info (editable) ---- */}
        <StaggerItem>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your contact details and location. This information helps
              us connect you with local matches.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* --- Info banner: personal info is shared on accepted matches --- */}
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-900">
                  This information is shared when you accept a match
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  When you accept an offer, your contact details are shared with
                  the other party so you can coordinate directly. Make sure your
                  phone number is up to date so they can reach you.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              {/* City & State (side by side on larger screens) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="e.g. Austin"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={state || undefined}
                    onValueChange={(value) => setState(value === "__none__" ? "" : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Select state</SelectItem>
                      {US_STATES.filter((s) => s.value !== "").map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Save button */}
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="w-full sm:w-auto"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </StaggerItem>

        {/* ---- Verification Status Card (dealers only) ----
             Shows one of three states:
             1. Verified — green card with checkmark badge.
             2. Not verified, fields complete — blue card with "Request Verification" CTA.
             3. Not verified, fields incomplete — amber card listing missing fields.

             MUST CHANGE LATER: Add handling for "pending" and "denied" verification
             request states once admin review is implemented. Currently the MVP
             auto-approves, so these states never appear. */}
        {isDealer && (
          <StaggerItem>
            {profile.verified ? (
              /* --- State 1: Verified --- */
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                        <BadgeCheck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-green-800">
                          Verified Dealer
                        </h3>
                        <p className="mt-0.5 text-sm text-green-700">
                          Verification builds trust and increases the likelihood of
                          your offers being accepted. Keep your business details up
                          to date to maintain your verified status.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : profile.verification_fields_complete ? (
              /* --- State 2: Not verified, but all fields are complete --- */
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-800">
                          Get Verified
                        </h3>
                        <p className="mt-0.5 text-sm text-blue-700">
                          Your business details are complete. Request verification
                          to build trust with buyers and increase the chances of
                          your offers being accepted.
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleRequestVerification}
                      disabled={isSubmittingVerification}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shrink-0 self-start sm:self-center"
                    >
                      {isSubmittingVerification ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        <>
                          <BadgeCheck className="mr-1.5 h-4 w-4" />
                          Request Verification
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* --- State 3: Not verified, missing fields --- */
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                      <ShieldAlert className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-amber-800">
                        Complete Your Profile to Get Verified
                      </h3>
                      <p className="mt-0.5 text-sm text-amber-700">
                        Verified dealers build trust and get more offers accepted.
                        Fill in the following business fields below to become
                        eligible:
                      </p>
                      <ul className="mt-2 space-y-0.5">
                        {(profile.verification_missing_fields ?? []).map(
                          (field) => (
                            <li
                              key={field}
                              className="flex items-center gap-1.5 text-sm text-amber-700"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                              {VERIFICATION_FIELD_LABELS[field] || field}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </StaggerItem>
        )}

        {/* ---- Section 3: Business Info (dealers only) ---- */}
        {isDealer && (
          <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                Business Information
              </CardTitle>
              <CardDescription>
                Your dealership details are shown to buyers when you send offers.
                Keep this information accurate and up to date to build trust and maintain verification status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* --- Business Logo Section --- */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Business Logo</Label>
                <div className="flex items-center gap-5">
                  {/* Logo preview or placeholder */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    {currentLogoUrl ? (
                      <Image
                        src={currentLogoUrl}
                        alt="Business logo"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload / remove buttons */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logoUpload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-3.5 w-3.5" />
                          {currentLogoUrl ? "Change Logo" : "Upload Logo"}
                        </>
                      )}
                    </Button>

                    {/* Show remove button only when a logo exists */}
                    {currentLogoUrl && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isDeletingLogo}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            {isDeletingLogo ? (
                              <>
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                Removing...
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Remove Logo
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Business Logo</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove your business logo?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteLogo}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Recommended: square image, at least 200x200px. Max 5 MB.
                </p>
              </div>

              <Separator />

              {/* --- Business Details Form --- */}
              <form onSubmit={handleSaveBusiness} className="space-y-4">
                {/* Business Name (required) */}
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    Business Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="e.g. Austin Auto Group"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>

                {/* Dealer License Number */}
                <div className="space-y-2">
                  <Label htmlFor="dealerLicenseNumber" className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-gray-400" />
                    Dealer License Number
                  </Label>
                  <Input
                    id="dealerLicenseNumber"
                    type="text"
                    placeholder="e.g. DL-123456"
                    value={dealerLicenseNumber}
                    onChange={(e) => setDealerLicenseNumber(e.target.value)}
                    className="max-w-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Your state-issued dealer license number helps build trust with buyers.
                  </p>
                </div>

                <Separator />

                {/* --- Contact Information --- */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Contact Information</p>
                  <p className="text-xs text-gray-500">
                    How buyers can reach your business directly.
                  </p>
                </div>

                {/* Business Phone & Email (side by side) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessPhone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      Business Phone
                    </Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      placeholder="(555) 987-6543"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessEmail" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      Business Email
                    </Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      placeholder="sales@yourdealership.com"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="businessWebsite" className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-gray-400" />
                    Website
                  </Label>
                  <Input
                    id="businessWebsite"
                    type="url"
                    placeholder="https://www.yourdealership.com"
                    value={businessWebsite}
                    onChange={(e) => setBusinessWebsite(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <Separator />

                {/* --- Business Address --- */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Business Address</p>
                  <p className="text-xs text-gray-500">
                    Your dealership&apos;s physical location.
                  </p>
                </div>

                {/* Address Line 1 */}
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    type="text"
                    placeholder="123 Main Street"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </div>

                {/* Address Line 2 */}
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    type="text"
                    placeholder="Suite 100"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>

                {/* City, State, Zip (responsive grid) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="businessCity">City</Label>
                    <Input
                      id="businessCity"
                      type="text"
                      placeholder="e.g. Austin"
                      value={businessCity}
                      onChange={(e) => setBusinessCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessState">State</Label>
                    <Select
                      value={businessState || undefined}
                      onValueChange={(value) => setBusinessState(value === "__none__" ? "" : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Select state</SelectItem>
                        {US_STATES.filter((s) => s.value !== "").map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessZipCode">Zip Code</Label>
                    <Input
                      id="businessZipCode"
                      type="text"
                      placeholder="78701"
                      value={businessZipCode}
                      onChange={(e) => setBusinessZipCode(e.target.value)}
                    />
                  </div>
                </div>

                {/* Save button */}
                <Button
                  type="submit"
                  disabled={isSavingBusiness}
                  className="w-full sm:w-auto"
                >
                  {isSavingBusiness ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Business Info"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          </StaggerItem>
        )}

        {/* ---- Section 4: Change Password ---- */}
        <StaggerItem>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-blue-600" />
              Change Password
            </CardTitle>
            <CardDescription>
              {hasEmailAuth
                ? "Update your account password. You will remain signed in after the change."
                : "Password management is not available for your sign-in method."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* --- OAuth-only users: show info banner and disabled state --- */}
            {!hasEmailAuth ? (
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Signed in with {authProviderLabel}
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    Your account uses {authProviderLabel} for authentication.
                    To change your password, please visit your{" "}
                    <span className="font-medium">{authProviderLabel}</span>{" "}
                    account settings and manage your password there.
                  </p>
                </div>
              </div>
            ) : (
              /* --- Email users: show password change form --- */
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="max-w-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Minimum 6 characters.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="max-w-sm"
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        </StaggerItem>
      </StaggerContainer>
    </main>
  );
}
