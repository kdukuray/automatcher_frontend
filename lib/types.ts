/* ── Auth / User Profile ─────────────────────────────── */

/** Business details returned by the profile endpoint (for dealers). */
export interface BusinessResponse {
  business_name: string;
  business_phone: string;
  business_email: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  website: string;
  dealer_license_number: string;
  description: string;
  business_logo: string;
}

/** User profile data returned by GET /api/profile/. */
export interface UserProfileResponse {
  email: string;
  user_type: "buyer" | "dealer";
  phone_number: string;
  city: string;
  state: string;
  verified: boolean;
  supabase_uuid: string;
  business?: BusinessResponse | null;
  /** Whether all required verification fields are filled (dealers only). */
  verification_fields_complete?: boolean;
  /** List of required verification field names that are still empty (dealers only). */
  verification_missing_fields?: string[];
}

/* ── Verification ──────────────────────────────────── */

/** Response from GET /api/profile/verify/ — dealer verification status. */
export interface VerificationStatusResponse {
  verified: boolean;
  fieldsComplete: boolean;
  missingFields: string[];
  latestRequest?: {
    id: number;
    status: "pending" | "approved" | "denied";
    createdAt: string;
    reviewedAt: string | null;
    adminNotes: string;
  } | null;
}

/** Response from POST /api/profile/verify/ — submit verification request. */
export interface SubmitVerificationResponse {
  verified: boolean;
  alreadyVerified?: boolean;
  detail: string;
  missingFields?: string[];
  latestRequest?: {
    id: number;
    status: "pending" | "approved" | "denied";
    createdAt: string;
    reviewedAt: string | null;
    adminNotes: string;
  } | null;
}

/** Payload sent to PATCH /api/profile/ for updating profile fields.
 *  Note: user_type is set at signup and cannot be changed. */
export interface UpdateProfilePayload {
  phone_number?: string;
  city?: string;
  state?: string;
  /** Nested business data — only used by dealer accounts. */
  business?: UpdateBusinessPayload;
}

/** Nested payload for updating business information (dealers only).
 *  Sent inside UpdateProfilePayload under the "business" key. */
export interface UpdateBusinessPayload {
  business_name: string;
  business_phone?: string;
  business_email?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  website?: string;
  dealer_license_number?: string;
}

/* ── Shared types ─────────────────────────────────── */

export interface Make {
  slug: string;
  name: string;
}

export interface Model {
  slug: string;
  name: string;
  /** Whether this model is currently in production.
   *  Used to group models into "Current" vs "Other" in dropdowns. */
  current: boolean;
}

/** Known trim level for a vehicle model (e.g. LX, EX, Sport).
 *  Used as suggestion options in the trim dropdown — users can also
 *  choose "Other" to enter a custom trim via free text. */
export interface Trim {
  slug: string;
  name: string;
}

/* ── Vehicle Request ─────────────────────────────── */

/** Payload sent to the backend when creating a new vehicle request. */
export interface VehicleRequestPayload {
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
  /** If true, the buyer receives an email whenever a dealer sends them
   *  a new offer on this request. Opt-in defaults to true on creation
   *  and can be toggled in edit mode. */
  emailNotificationsEnabled: boolean;
}

/** Response returned after successfully creating a vehicle request. */
export interface VehicleRequestResponse {
  uuid: string;
}

/** Lightweight item returned by the list endpoint, used for dashboard cards. */
export interface VehicleRequestListItem {
  uuid: string;
  active: boolean;
  createdAt: string;
  makeName: string;
  modelName: string;
  yearMin: number;
  yearMax: number;
  purchaseMode: string;
  maxBudget: string;
  maxMonthlyPayment: string;
  searchRadius: string;
  zipCode: string;
  /** City resolved from the zip code (e.g. "Los Angeles"). Empty if unknown. */
  cityName: string;
  /** Two-letter state abbreviation resolved from the zip code (e.g. "CA"). Empty if unknown. */
  stateName: string;
  /** True when the current user has at least one unseen notification tied to this request.
   *  Drives the dot indicator on dashboard cards. */
  hasUnseenNotification?: boolean;
}

/* ── Vehicle Request Detail ─────────────────── */

/** The vehicle target (car specs) nested inside a detail response. */
export interface VehicleTargetDetail {
  make: string;
  makeName: string;
  model: string;
  modelName: string;
  yearMin: number;
  yearMax: number;
  maxMileage: number | null;
  bodyStyle: string;
  drivetrain: string;
  fuelType: string;
  transmission: string;
  trim: string;
  titleStatus: string;
  exteriorColor: string;
  interiorColor: string;
}

/** Full detail response returned by GET /api/requests/:uuid/.
 *  Includes `isOwner` so the frontend knows whether the current user
 *  owns this request (controls edit vs read-only UI). */
export interface VehicleRequestDetail {
  uuid: string;
  active: boolean;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
  purchaseMode: string;
  maxBudget: string;
  maxMonthlyPayment: string;
  downPayment: string;
  creditRange: string;
  zipCode: string;
  /** City resolved from the zip code (e.g. "Los Angeles"). Empty if unknown. */
  cityName: string;
  /** Two-letter state abbreviation resolved from the zip code (e.g. "CA"). Empty if unknown. */
  stateName: string;
  searchRadius: string;
  notes: string;
  features: string[];
  /** Whether the buyer has opted in to new-offer email notifications on
   *  this request. Shown as a checkbox in the edit panel. */
  emailNotificationsEnabled: boolean;
  target: VehicleTargetDetail;
}

/* ── Browse / Public Request List ────────────────── */

/** Lightweight item returned by the public browse endpoint for each active request. */
export interface BrowseRequestItem {
  uuid: string;
  createdAt: string;
  makeName: string;
  modelName: string;
  yearMin: number;
  yearMax: number;
  bodyStyle: string;
  purchaseMode: string;
  maxBudget: string;
  zipCode: string;
  /** City resolved from the zip code (e.g. "Los Angeles"). Empty if unknown. */
  cityName: string;
  /** Two-letter state abbreviation resolved from the zip code (e.g. "CA"). Empty if unknown. */
  stateName: string;
  searchRadius: string;
}

/** Generic paginated response wrapper used by all paginated list endpoints.
 *  The `results` array contains page items typed by the generic parameter. */
export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

/** Paginated response wrapper returned by GET /api/requests/browse/. */
export type PaginatedBrowseResponse = PaginatedResponse<BrowseRequestItem>;

/* ── Images ──────────────────────────────────────── */

/** A single uploaded image associated with an offer or inventory vehicle. */
export interface UploadedImage {
  id: number;
  url: string;
  sortOrder: number;
}

/* ── Offers ──────────────────────────────────────── */

/** Lightweight item returned by the dealer offers list endpoint. */
export interface DealerOfferListItem {
  uuid: string;
  status: string;
  createdAt: string;
  makeName: string;
  modelName: string;
  year: number;
  offeredPrice: string;
  offeredMonthlyPayment: string;
  purchaseMode: string;
  requestUuid: string;
  requestMakeName: string;
  requestModelName: string;
  /** True when the current user has at least one unseen notification tied to this offer.
   *  Drives the dot indicator on dashboard cards. */
  hasUnseenNotification?: boolean;
}

/** Full detail response for a dealer offer. */
export interface DealerOfferDetail {
  uuid: string;
  status: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  makeName: string;
  makeSlug: string;
  modelName: string;
  modelSlug: string;
  year: number;
  mileage: number | null;
  bodyStyle: string;
  drivetrain: string;
  fuelType: string;
  transmission: string;
  trim: string;
  titleStatus: string;
  exteriorColor: string;
  interiorColor: string;
  purchaseMode: string;
  offeredPrice: string;
  offeredMonthlyPayment: string;
  offeredDownPayment: string;
  features: string[];
  matchScore: number | null;
  /** Whether the dealer (sender) has opted in to status-change emails
   *  (accepted / declined). Shown as a checkbox in the edit panel. */
  emailNotificationsEnabled: boolean;
  requestUuid: string;
  requestMakeName: string;
  requestModelName: string;
  requestYearMin: number;
  requestYearMax: number;
  images: UploadedImage[];
}

/** Unified offer detail response returned by GET /api/offers/:uuid/.
 *  Extends DealerOfferDetail with a viewerRole field so the frontend
 *  knows whether the viewer is the sender or receiver, plus optional
 *  dealer info fields (for receivers) and accepter contact info (for
 *  senders viewing an accepted offer). */
export interface OfferDetail extends DealerOfferDetail {
  viewerRole: "sender" | "receiver";
  /** Dealer business info — only present when viewerRole is "receiver".
   *  All values are sourced from the dealer's Business record, not their
   *  personal profile. */
  dealerName?: string;
  dealerPhone?: string;
  dealerEmail?: string;
  dealerCity?: string;
  dealerState?: string;
  /** Full URL to the dealer's uploaded business logo (empty string if none). */
  dealerLogo?: string;
  /** Whether the dealer who sent this offer is verified by AutoMatcher.
   *  Only present when viewerRole is "receiver". */
  dealerVerified?: boolean;
  /** Accepter contact info — only present when viewerRole is "sender"
   *  and the offer status is "accepted". This is the request owner's
   *  contact information, shared so the dealer can reach out. */
  accepterEmail?: string;
  accepterPhone?: string;
  accepterCity?: string;
  accepterState?: string;
}

/** An offer as seen on the request detail page (returned by GET /api/requests/:uuid/offers/). */
export interface RequestOfferItem {
  uuid: string;
  status: string;
  createdAt: string;
  makeName: string;
  modelName: string;
  year: number;
  trim: string;
  mileage: number | null;
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
  matchScore: number | null;
  imageCount: number;
  /** Dealer business info — sourced from the Business record. */
  dealerName: string;
  dealerPhone: string;
  dealerEmail: string;
  dealerCity: string;
  dealerState: string;
  /** Full URL to the dealer's uploaded business logo (empty string if none). */
  dealerLogo: string;
  /** Whether the dealer who sent this offer is verified by AutoMatcher. */
  dealerVerified: boolean;
}

/** Lightweight item returned by the received offers endpoint for the dashboard.
 *  Represents an offer someone else made on one of the current user's requests. */
export interface ReceivedOfferListItem {
  uuid: string;
  status: string;
  createdAt: string;
  makeName: string;
  modelName: string;
  year: number;
  offeredPrice: string;
  offeredMonthlyPayment: string;
  purchaseMode: string;
  matchScore: number | null;
  requestUuid: string;
  requestMakeName: string;
  requestModelName: string;
  requestYearMin: number;
  requestYearMax: number;
  /** Dealer business info — sourced from the Business record. */
  dealerName: string;
  dealerPhone: string;
  dealerEmail: string;
  dealerCity: string;
  dealerState: string;
  /** Full URL to the dealer's uploaded business logo (empty string if none). */
  dealerLogo: string;
  /** Whether the dealer who sent this offer is verified by AutoMatcher. */
  dealerVerified: boolean;
  /** True when the current user has at least one unseen notification tied to this offer.
   *  Drives the dot indicator on dashboard cards. */
  hasUnseenNotification?: boolean;
}

/** Payload sent to the backend when creating a new offer. */
export interface OfferPayload {
  inventoryVehicleUuid?: string;
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
  /** If true, the dealer (sender) receives an email when the buyer
   *  accepts or declines this offer. Defaults to true on creation
   *  and can be toggled in edit mode. */
  emailNotificationsEnabled: boolean;
}

/** Response returned after successfully creating an offer. */
export interface OfferResponse {
  uuid: string;
}

/* ── Inventory (Updated) ─────────────────────────── */

/** A single inventory vehicle belonging to the current dealer. */
export interface InventoryVehicleListItem {
  uuid: string;
  active: boolean;
  makeName: string;
  makeSlug: string;
  modelName: string;
  modelSlug: string;
  year: number;
  mileage: number | null;
  bodyStyle: string;
  drivetrain: string;
  fuelType: string;
  transmission: string;
  trim: string;
  titleStatus: string;
  exteriorColor: string;
  interiorColor: string;
  listPrice: string;
  notes: string;
  features: string[];
  imageCount: number;
}

/** Full detail response for an inventory vehicle. */
export interface InventoryVehicleDetail {
  uuid: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  makeName: string;
  makeSlug: string;
  modelName: string;
  modelSlug: string;
  year: number;
  mileage: number | null;
  bodyStyle: string;
  drivetrain: string;
  fuelType: string;
  transmission: string;
  trim: string;
  titleStatus: string;
  exteriorColor: string;
  interiorColor: string;
  listPrice: string;
  notes: string;
  features: string[];
  images: UploadedImage[];
}

/* ── Contact Messages ─────────────────────────────── */

/** Payload sent to POST /api/contact/ when submitting a contact form message. */
export interface ContactMessagePayload {
  email: string;
  title?: string;
  content: string;
}

/** Response returned after successfully submitting a contact message. */
export interface ContactMessageResponse {
  id: number;
  email: string;
  title: string;
  content: string;
  createdAt: string;
}

/* ── Notifications ──────────────────────────────────── */

/** Unseen notification counts bucketed by dashboard tab.
 *  Returned by GET /api/notifications/counts/ and used to render
 *  badge numbers on tab buttons in both BuyerDashboard and DealerDashboard. */
export interface NotificationCounts {
  /** Unseen notifications for offers the user *sent* (accepted/declined by the buyer). */
  offersSent: number;
  /** Unseen notifications for offers received on the user's own requests
   *  (new offer, withdrawn, or updated by the dealer). */
  offersReceived: number;
  /** Unseen notifications for the user's own requests being deactivated. */
  myRequests: number;
  /** Per-status breakdown of unseen notifications for the "Offers Sent" tab.
   *  Keys are offer statuses (e.g. "accepted", "declined"). Used to render
   *  badge counts on individual status filter pills. */
  offersSentByStatus: Record<string, number>;
  /** Per-status breakdown of unseen notifications for the "Offers Received" tab.
   *  Keys are offer statuses (e.g. "active", "withdrawn"). */
  offersReceivedByStatus: Record<string, number>;
}

/** Payload for POST /api/notifications/mark-seen/. Provide exactly one field. */
export interface MarkSeenPayload {
  offerUuid?: string;
  requestUuid?: string;
}

/** Payload sent to the backend when creating or updating an inventory vehicle. */
export interface InventoryVehiclePayload {
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
  listPrice: string;
  notes: string;
  features: string[];
}
