import type {
  ContactMessagePayload,
  ContactMessageResponse,
  DealerOfferDetail,
  DealerOfferListItem,
  InventoryVehicleDetail,
  InventoryVehicleListItem,
  InventoryVehiclePayload,
  Make,
  MarkSeenPayload,
  Model,
  NotificationCounts,
  OfferDetail,
  OfferPayload,
  OfferResponse,
  PaginatedBrowseResponse,
  PaginatedResponse,
  ReceivedOfferListItem,
  RequestOfferItem,
  SubmitVerificationResponse,
  Trim,
  UpdateProfilePayload,
  UploadedImage,
  UserProfileResponse,
  VerificationStatusResponse,
  VehicleRequestPayload,
  VehicleRequestResponse,
  VehicleRequestDetail,
  VehicleRequestListItem,
} from "./types";
import { supabase } from "./supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Auth Helpers ────────────────────────────────────── */

/**
 * Build HTTP headers that include the Supabase JWT for authenticated
 * requests to the Django backend.
 *
 * Calls supabase.auth.getSession() which returns the cached session
 * (no network call). The Supabase SDK auto-refreshes expired tokens.
 * If no session exists, returns headers without an Authorization token
 * so unauthenticated endpoints still work.
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Attach the JWT if the user is logged in
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  } else {
    // Debug: log when no session is found so we can trace auth issues
    console.warn(
      "[getAuthHeaders] No Supabase session/access_token available.",
      "Session object:",
      session
    );
  }

  return headers;
}

/**
 * Build HTTP headers for multipart/form-data requests (file uploads).
 * Omits Content-Type so the browser sets the correct boundary automatically.
 */
async function getAuthHeadersMultipart(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return headers;
}

/**
 * Get the current user's Supabase UUID (the "sub" claim in the JWT).
 * Makes a network call to Supabase to validate the user.
 * Returns undefined if not logged in.
 */
export async function getSupabaseUuid(): Promise<string | undefined> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return undefined;
  }
  return user.id;
}

/* ── HTTP Helpers ────────────────────────────────────── */

/**
 * Extract a human-readable error message from a failed API response.
 * Tries to parse the JSON body for an "error" field; falls back to
 * the HTTP status text if the body isn't parseable.
 */
async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.error && typeof body.error === "string") {
      return body.error;
    }
  } catch {
    // Response body wasn't JSON — fall through to default
  }
  return `API error ${res.status}: ${res.statusText}`;
}

/**
 * Authenticated GET request to the Django API.
 * Automatically includes the Supabase JWT in the Authorization header.
 */
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: await getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/**
 * Authenticated POST request to the Django API.
 * Automatically includes the Supabase JWT in the Authorization header.
 */
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/**
 * Authenticated PUT request to the Django API.
 * Automatically includes the Supabase JWT in the Authorization header.
 */
async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: await getAuthHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/**
 * Authenticated PATCH request to the Django API.
 * Automatically includes the Supabase JWT in the Authorization header.
 */
async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(body),
    credentials: "include",
  });
  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/* ── Profile Endpoints ───────────────────────────────── */

/** Fetch the authenticated user's profile data from Django.
 *  Calls: GET /api/profile/ → get_user_profile */
export function getUserProfile(): Promise<UserProfileResponse> {
  return get<UserProfileResponse>("/api/profile/");
}

/** Update the authenticated user's profile (phone, city, state) and
 *  optionally business info (dealers only, nested under "business").
 *  Note: user_type is set at signup and cannot be changed.
 *  Calls: PATCH /api/profile/ → get_user_profile (PATCH handler) */
export function updateUserProfile(
  payload: UpdateProfilePayload
): Promise<UserProfileResponse> {
  return patch<UserProfileResponse>("/api/profile/", payload);
}

/** Upload a business logo image for the current dealer.
 *  Sends multipart/form-data with the file under the "logo" key.
 *  Calls: POST /api/profile/business-logo/ → update_business_logo */
export async function uploadBusinessLogo(
  file: File
): Promise<UserProfileResponse> {
  const formData = new FormData();
  formData.append("logo", file);

  const res = await fetch(`${API_BASE}/api/profile/business-logo/`, {
    method: "POST",
    headers: await getAuthHeadersMultipart(),
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      (errorData as { detail?: string }).detail ??
        `API error ${res.status}: ${res.statusText}`
    );
  }
  return res.json() as Promise<UserProfileResponse>;
}

/** Remove the current business logo for the current dealer.
 *  Calls: DELETE /api/profile/business-logo/ → update_business_logo */
export async function deleteBusinessLogo(): Promise<UserProfileResponse> {
  const res = await fetch(`${API_BASE}/api/profile/business-logo/`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<UserProfileResponse>;
}

/* ── Dealer Verification ─────────────────────────────── */

/** Fetch the dealer's current verification status and latest request info.
 *  Calls: GET /api/profile/verify/ → dealer_verification */
export function getVerificationStatus(): Promise<VerificationStatusResponse> {
  return get<VerificationStatusResponse>("/api/profile/verify/");
}

/** Submit a verification request for the current dealer.
 *  For the MVP this auto-approves if all required fields are present.
 *  Calls: POST /api/profile/verify/ → dealer_verification */
export function submitVerificationRequest(): Promise<SubmitVerificationResponse> {
  return post<SubmitVerificationResponse>("/api/profile/verify/", {});
}

/* ── Account Upgrade ─────────────────────────────────── */

/** Upgrade the current buyer account to a dealer account.
 *  This is a one-way, irreversible operation.
 *  Calls: POST /api/profile/upgrade-to-dealer/ → upgrade_to_dealer */
export function upgradeToDealer(): Promise<UserProfileResponse> {
  return post<UserProfileResponse>("/api/profile/upgrade-to-dealer/", {});
}

/* ── Makes & Models ──────────────────────────────────── */

/** Fetch all vehicle makes the backend knows about.
 *  Calls: GET /api/makes/ → list_makes */
export function fetchMakes(): Promise<Make[]> {
  return get<Make[]>("/api/makes/");
}

/** Fetch every model that belongs to the given make slug.
 *  Calls: GET /api/makes/:slug/models/ → list_models_for_make */
export function fetchModelsForMake(makeSlug: string): Promise<Model[]> {
  return get<Model[]>(`/api/makes/${makeSlug}/models/`);
}

/** Fetch known trim levels for a specific make + model combination.
 *  Used to populate trim dropdowns — the user can also choose "Other"
 *  for free-text entry since the actual trim field is a CharField.
 *  Calls: GET /api/makes/:makeSlug/models/:modelSlug/trims/ → list_trims_for_model */
export function fetchTrimsForModel(
  makeSlug: string,
  modelSlug: string
): Promise<Trim[]> {
  return get<Trim[]>(`/api/makes/${makeSlug}/models/${modelSlug}/trims/`);
}

/* ── Vehicle Requests ────────────────────────────────── */

/** Fetch a paginated, filterable list of vehicle requests for the current user (dashboard).
 *  Supports server-side search (by make/model name) and status filtering (active/inactive).
 *  Calls: GET /api/requests/?page=N&page_size=N&search=X&status=Y → vehicle_request_list */
export function listVehicleRequests(
  page: number = 1,
  pageSize: number = 12,
  search?: string,
  status?: string
): Promise<PaginatedResponse<VehicleRequestListItem>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search) params.append("search", search);
  if (status && status !== "all") params.append("status", status);
  return get<PaginatedResponse<VehicleRequestListItem>>(
    `/api/requests/?${params.toString()}`
  );
}

/** Create a new vehicle request (with associated vehicle target).
 *  Calls: POST /api/requests/ → vehicle_request_list */
export function createVehicleRequest(
  payload: VehicleRequestPayload
): Promise<VehicleRequestResponse> {
  return post<VehicleRequestResponse>("/api/requests/", payload);
}

/** Fetch the full details of a single vehicle request.
 *  Calls: GET /api/requests/:uuid/ → vehicle_request_detail */
export function getVehicleRequestDetail(
  requestUuid: string
): Promise<VehicleRequestDetail> {
  return get<VehicleRequestDetail>(`/api/requests/${requestUuid}/`);
}

/** Update an existing vehicle request (request + target + features).
 *  Calls: PUT /api/requests/:uuid/ → vehicle_request_detail */
export function updateVehicleRequest(
  requestUuid: string,
  payload: VehicleRequestPayload
): Promise<VehicleRequestDetail> {
  return put<VehicleRequestDetail>(`/api/requests/${requestUuid}/`, payload);
}

/** Toggle the active status of a vehicle request.
 *  Calls: PATCH /api/requests/:uuid/ → vehicle_request_detail */
export function toggleVehicleRequestActive(
  requestUuid: string,
  active: boolean
): Promise<VehicleRequestDetail> {
  return patch<VehicleRequestDetail>(`/api/requests/${requestUuid}/`, { active });
}

/** Fetch a paginated, filterable list of all active vehicle requests on the platform.
 *  Supports server-side search (by make/model name), body style, purchase mode,
 *  and location (zip + radius in miles) filtering.
 *  Calls: GET /api/requests/browse/?page=N&page_size=N&search=X&body_style=Y&purchase_mode=Z&zip=W&radius=R → list_all_active_requests */
export function listAllActiveRequests(
  page: number = 1,
  pageSize: number = 12,
  search?: string,
  bodyStyle?: string,
  purchaseMode?: string,
  zip?: string,
  radius?: string
): Promise<PaginatedBrowseResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search) params.append("search", search);
  if (bodyStyle && bodyStyle !== "all") params.append("body_style", bodyStyle);
  if (purchaseMode && purchaseMode !== "all") params.append("purchase_mode", purchaseMode);
  if (zip) params.append("zip", zip);
  if (radius) params.append("radius", radius);
  return get<PaginatedBrowseResponse>(
    `/api/requests/browse/?${params.toString()}`
  );
}

/* ── Inventory ───────────────────────────────────────── */

/** Fetch a paginated, filterable list of inventory vehicles for the current user (dealer).
 *  Supports server-side search (by make/model name) and status filtering (active/inactive/all).
 *  Calls: GET /api/inventory/?page=N&page_size=N&search=X&status=Y → list_inventory_vehicles */
export function listInventoryVehicles(
  page: number = 1,
  pageSize: number = 12,
  search?: string,
  status?: string
): Promise<PaginatedResponse<InventoryVehicleListItem>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search) params.append("search", search);
  if (status && status !== "all") params.append("status", status);
  return get<PaginatedResponse<InventoryVehicleListItem>>(
    `/api/inventory/?${params.toString()}`
  );
}

/** Create a new inventory vehicle.
 *  Calls: POST /api/inventory/ → list_inventory_vehicles */
export function createInventoryVehicle(
  payload: InventoryVehiclePayload
): Promise<{ uuid: string }> {
  return post<{ uuid: string }>("/api/inventory/", payload);
}

/** Fetch the full details of a single inventory vehicle.
 *  Calls: GET /api/inventory/:uuid/ → inventory_vehicle_detail */
export function getInventoryVehicleDetail(
  vehicleUuid: string
): Promise<InventoryVehicleDetail> {
  return get<InventoryVehicleDetail>(`/api/inventory/${vehicleUuid}/`);
}

/** Update an existing inventory vehicle.
 *  Calls: PUT /api/inventory/:uuid/ → inventory_vehicle_detail */
export function updateInventoryVehicle(
  vehicleUuid: string,
  payload: InventoryVehiclePayload
): Promise<InventoryVehicleDetail> {
  return put<InventoryVehicleDetail>(`/api/inventory/${vehicleUuid}/`, payload);
}

/** Toggle the active status of an inventory vehicle.
 *  Calls: PATCH /api/inventory/:uuid/ → inventory_vehicle_detail */
export function toggleInventoryVehicleActive(
  vehicleUuid: string,
  active: boolean
): Promise<InventoryVehicleDetail> {
  return patch<InventoryVehicleDetail>(`/api/inventory/${vehicleUuid}/`, {
    active,
  });
}

/* ── Offers ──────────────────────────────────────────── */

/** Fetch a paginated, filterable list of offers made by the current user (dealer).
 *  Supports server-side search (by make/model name) and status filtering (active/withdrawn/etc).
 *  Calls: GET /api/offers/?page=N&page_size=N&search=X&status=Y → list_dealer_offers */
export function listDealerOffers(
  page: number = 1,
  pageSize: number = 12,
  search?: string,
  status?: string
): Promise<PaginatedResponse<DealerOfferListItem>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search) params.append("search", search);
  if (status && status !== "all") params.append("status", status);
  return get<PaginatedResponse<DealerOfferListItem>>(
    `/api/offers/?${params.toString()}`
  );
}

/** Fetch a paginated, filterable list of offers received on the current user's vehicle requests.
 *  Works for both buyers and dealers who have created requests.
 *  Supports server-side search (by make/model/dealer name) and status filtering (active/withdrawn/etc).
 *  Calls: GET /api/offers/received/?page=N&page_size=N&search=X&status=Y → list_received_offers */
export function listReceivedOffers(
  page: number = 1,
  pageSize: number = 12,
  search?: string,
  status?: string
): Promise<PaginatedResponse<ReceivedOfferListItem>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search) params.append("search", search);
  if (status && status !== "all") params.append("status", status);
  return get<PaginatedResponse<ReceivedOfferListItem>>(
    `/api/offers/received/?${params.toString()}`
  );
}

/** Fetch the full details of a single offer made by the dealer.
 *  Calls: GET /api/offers/:uuid/ → offer_detail
 *  @deprecated Use getOfferDetail instead for role-aware responses. */
export function getDealerOfferDetail(
  offerUuid: string
): Promise<DealerOfferDetail> {
  return get<DealerOfferDetail>(`/api/offers/${offerUuid}/`);
}

/** Update an existing offer (sender only).
 *  Calls: PUT /api/offers/:uuid/ → offer_detail */
export function updateDealerOffer(
  offerUuid: string,
  payload: OfferPayload
): Promise<OfferDetail> {
  return put<OfferDetail>(`/api/offers/${offerUuid}/`, payload);
}

/** Withdraw an offer (change status to "withdrawn", sender only).
 *  Calls: PATCH /api/offers/:uuid/ → offer_detail */
export function withdrawDealerOffer(
  offerUuid: string
): Promise<OfferDetail> {
  return patch<OfferDetail>(`/api/offers/${offerUuid}/`, {
    status: "withdrawn",
  });
}

/** Fetch the full details of a single offer (role-aware).
 *  Returns viewerRole ("sender" or "receiver") so the frontend can render
 *  the appropriate UI. Receivers also get dealer info fields.
 *  Calls: GET /api/offers/:uuid/ → offer_detail */
export function getOfferDetail(offerUuid: string): Promise<OfferDetail> {
  return get<OfferDetail>(`/api/offers/${offerUuid}/`);
}

/** Accept an offer as the request owner (receiver).
 *  Also automatically declines all other active offers on the same request.
 *  Calls: POST /api/offers/:uuid/accept/ → accept_offer */
export function acceptOffer(offerUuid: string): Promise<OfferDetail> {
  return post<OfferDetail>(`/api/offers/${offerUuid}/accept/`, {});
}

/** Decline an offer as the request owner (receiver).
 *  Calls: POST /api/offers/:uuid/decline/ → decline_offer */
export function declineOffer(offerUuid: string): Promise<OfferDetail> {
  return post<OfferDetail>(`/api/offers/${offerUuid}/decline/`, {});
}

/** Fetch a paginated list of offers for a given vehicle request.
 *  Owners (buyers) see all active offers; dealers see only their own.
 *  Calls: GET /api/requests/:uuid/offers/?page=N&page_size=N → request_offers */
export function listRequestOffers(
  requestUuid: string,
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedResponse<RequestOfferItem>> {
  return get<PaginatedResponse<RequestOfferItem>>(
    `/api/requests/${requestUuid}/offers/?page=${page}&page_size=${pageSize}`
  );
}

/** Create a new offer against a vehicle request.
 *  Calls: POST /api/requests/:uuid/offers/ → request_offers */
export function createOffer(
  requestUuid: string,
  payload: OfferPayload
): Promise<OfferResponse> {
  return post<OfferResponse>(`/api/requests/${requestUuid}/offers/`, payload);
}

/* ── Inventory Vehicle Images ────────────────────────── */

/** Upload one or more images for an inventory vehicle.
 *  Sends multipart/form-data with file(s) under the "images" key.
 *  Calls: POST /api/inventory/:uuid/images/ → inventory_vehicle_images */
export async function uploadInventoryVehicleImages(
  vehicleUuid: string,
  files: File[]
): Promise<UploadedImage[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const res = await fetch(`${API_BASE}/api/inventory/${vehicleUuid}/images/`, {
    method: "POST",
    headers: await getAuthHeadersMultipart(),
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string }).error ??
        `API error ${res.status}: ${res.statusText}`
    );
  }
  return res.json() as Promise<UploadedImage[]>;
}

/** Delete a single image from an inventory vehicle.
 *  Calls: DELETE /api/inventory/:uuid/images/?image_id=X → inventory_vehicle_images */
export async function deleteInventoryVehicleImage(
  vehicleUuid: string,
  imageId: number
): Promise<UploadedImage[]> {
  const res = await fetch(
    `${API_BASE}/api/inventory/${vehicleUuid}/images/?image_id=${imageId}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
      credentials: "include",
    }
  );
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<UploadedImage[]>;
}

/* ── Offer Images ────────────────────────────────────── */

/** Upload one or more images for an offer.
 *  Sends multipart/form-data with file(s) under the "images" key.
 *  Calls: POST /api/offers/:uuid/images/ → offer_images */
export async function uploadOfferImages(
  offerUuid: string,
  files: File[]
): Promise<UploadedImage[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const res = await fetch(`${API_BASE}/api/offers/${offerUuid}/images/`, {
    method: "POST",
    headers: await getAuthHeadersMultipart(),
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string }).error ??
        `API error ${res.status}: ${res.statusText}`
    );
  }
  return res.json() as Promise<UploadedImage[]>;
}

/** Delete a single image from an offer.
 *  Calls: DELETE /api/offers/:uuid/images/?image_id=X → offer_images */
export async function deleteOfferImage(
  offerUuid: string,
  imageId: number
): Promise<UploadedImage[]> {
  const res = await fetch(
    `${API_BASE}/api/offers/${offerUuid}/images/?image_id=${imageId}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
      credentials: "include",
    }
  );
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<UploadedImage[]>;
}

/* ── Contact Messages ────────────────────────────────── */

/** Submit a contact message through the public contact form.
 *  This endpoint is unauthenticated — no login required.
 *  Calls: POST /api/contact/ → submit_contact_message */
export function submitContactMessage(
  payload: ContactMessagePayload
): Promise<ContactMessageResponse> {
  return post<ContactMessageResponse>("/api/contact/", payload);
}

/* ── Notifications ───────────────────────────────────── */

/** Fetch unseen notification counts grouped by dashboard tab.
 *  Used on dashboard mount to render badge numbers on tab buttons.
 *  Calls: GET /api/notifications/counts/ → get_notification_counts */
export function getNotificationCounts(): Promise<NotificationCounts> {
  return get<NotificationCounts>("/api/notifications/counts/");
}

/** Mark all unseen notifications for the current user linked to a specific
 *  offer or request as seen. Called as a fire-and-forget side effect when
 *  the user visits a detail page.
 *  Calls: POST /api/notifications/mark-seen/ → mark_notifications_seen */
export function markNotificationsSeen(
  payload: MarkSeenPayload
): Promise<{ marked: number }> {
  return post<{ marked: number }>("/api/notifications/mark-seen/", payload);
}
