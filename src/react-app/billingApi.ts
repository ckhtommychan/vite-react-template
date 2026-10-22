export type PlanCode = "starter" | "growth" | "business" | "trial" | "none";
export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "active" | "grace" | "expired" | "cancelled";
export type OrderStatus =
	| "pending_payment"
	| "receipt_uploaded"
	| "approved"
	| "rejected"
	| "cancelled";

export interface Plan {
	code: PlanCode;
	name_zh: string;
	name_en: string;
	monthly_price_hkd: number;
	annual_price_hkd: number;
	monthly_posts: number;
	images_per_post: number;
	included_regens: number;
	retention_days: number;
	features: string[];
	sort_order: number;
}

export interface Product {
	code: string;
	name_zh: string;
	kind: "subscription" | "credits" | "trial" | "course";
	plan_code: PlanCode | null;
	billing_cycle: BillingCycle | null;
	credits_amount: number;
	trial_posts: number;
	price_hkd: number;
	validity_days: number | null;
	metadata: { summary?: string };
	sort_order: number;
}

export interface PaymentDetails {
	method: string;
	fps_number: string;
	fps_name: string;
	bank_name: string;
	bank_account: string;
	note: string;
	stripe_enabled: boolean;
}

export interface PlansResponse {
	plans: Plan[];
	products: Product[];
	payment: PaymentDetails;
}

export interface PaymentInstructions extends PaymentDetails {
	reference: string;
}

export interface Receipt {
	original_name: string | null;
	mime_type: string;
	size_bytes: number;
	uploaded_at: string;
}

export interface Order {
	id: string;
	product_code: string;
	kind: "subscription" | "credits" | "trial" | "course";
	plan_code: PlanCode | null;
	billing_cycle: BillingCycle | null;
	list_price_hkd: number;
	discount_hkd: number;
	amount_hkd: number;
	credits_amount: number;
	trial_posts: number;
	status: OrderStatus;
	payment_method: string;
	stripe_payment_status: string | null;
	stripe_checkout_expires_at: string | null;
	payment_reference: string;
	customer_note: string | null;
	rejection_reason: string | null;
	trial_discount_applied: boolean;
	submitted_at: string | null;
	reviewed_at: string | null;
	approved_at: string | null;
	paid_at: string | null;
	created_at: string;
	updated_at: string;
	receipt: Receipt | null;
	payment_instructions?: PaymentInstructions;
}

export interface Subscription {
	id: string;
	status: SubscriptionStatus;
	billing_cycle: BillingCycle;
	current_period_start: string | null;
	current_period_end: string | null;
	next_plan_code: string | null;
	next_billing_cycle: BillingCycle | null;
	cancel_at_period_end: boolean;
	auto_renew: boolean;
}

export interface Period {
	id: string;
	plan_code: PlanCode;
	period_start: string;
	period_end: string;
	posts_included: number;
	posts_used: number;
	posts_remaining: number;
	images_per_post: number;
	included_regens: number;
	retention_days: number;
	status: string;
}

export interface Trial {
	id: string;
	status: "active" | "reserved" | "used" | "expired";
	expires_at: string;
	used_at: string | null;
	upgrade_discount_available: boolean;
}

export interface Credits {
	balance: number;
	available: number;
	legacy_balance: number;
	purchased_balance: number;
	grant_balance: number;
	held_balance: number;
	total_used: number;
}

export interface Usage {
	id: string;
	record_id: string;
	topic: string | null;
	source: "subscription" | "trial" | "credits";
	plan_code: PlanCode | null;
	state: string;
	images_generated: number;
	regen_included: number;
	regen_used: number;
	paid_regen_used: number;
	retention_until: string | null;
	created_at: string;
	completed_at: string | null;
}

export interface AccountSummary {
	ok: boolean;
	user_id: string;
	email: string | null;
	display_name: string | null;
	plan: Plan;
	subscription: Subscription | null;
	period: Period | null;
	trial: Trial | null;
	credits: Credits;
	recent_usage: Usage[];
	server_time: string;
}

export interface AccountResponse {
	account: AccountSummary;
	orders: Order[];
	unread_notifications: number;
}

export interface ServiceUpdate {
	id: string;
	kind: string;
	title: string;
	body: string;
	link_url: string | null;
	published_at: string;
	expires_at: string | null;
	read?: boolean;
}

export interface UpdatesResponse {
	updates: ServiceUpdate[];
}

export interface NotificationsResponse {
	notifications: ServiceUpdate[];
	unread: number;
}

const API_BASE = (import.meta.env.VITE_BILLING_API_URL || "https://billing.idh.asia").replace(
	/\/+$/,
	"",
);

export class BillingApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.name = "BillingApiError";
		this.status = status;
	}
}

async function request<T>(
	path: string,
	options: RequestInit = {},
	token?: string | null,
): Promise<T> {
	const headers = new Headers(options.headers);
	if (token) headers.set("Authorization", `Bearer ${token}`);
	if (options.body && !(options.body instanceof FormData)) {
		headers.set("Content-Type", "application/json");
	}
	const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
	const body = (await response.json().catch(() => ({}))) as { error?: string };
	if (!response.ok) {
		throw new BillingApiError(body.error || `請求失敗 (${response.status})`, response.status);
	}
	return body as T;
}

export function getPlans(): Promise<PlansResponse> {
	return request<PlansResponse>("/api/plans");
}

export function getUpdates(): Promise<UpdatesResponse> {
	return request<UpdatesResponse>("/api/updates");
}

export function getAccount(token: string): Promise<AccountResponse> {
	return request<AccountResponse>("/api/account", {}, token);
}

export function getOrder(token: string, orderId: string): Promise<{ order: Order }> {
	return request<{ order: Order }>(`/api/orders/${orderId}`, {}, token);
}

export interface StripeCheckoutResponse {
	url: string | null;
	session_id: string;
	paid?: boolean;
	reused?: boolean;
	expires_at?: string | null;
	order?: Order;
}

export function startStripeCheckout(
	token: string,
	orderId: string,
): Promise<StripeCheckoutResponse> {
	return request<StripeCheckoutResponse>(
		`/api/orders/${orderId}/checkout-session`,
		{ method: "POST" },
		token,
	);
}

export interface StripeSyncResponse {
	ok: boolean;
	paid: boolean;
	payment_status?: string;
	duplicate?: boolean;
	order?: Order;
	code?: string;
}

export function syncStripeCheckout(
	token: string,
	sessionId: string,
): Promise<StripeSyncResponse> {
	return request<StripeSyncResponse>(
		"/api/stripe/sync",
		{ method: "POST", body: JSON.stringify({ session_id: sessionId }) },
		token,
	);
}

export function switchOrderToFps(
	token: string,
	orderId: string,
): Promise<{ ok: boolean; order: Order }> {
	return request<{ ok: boolean; order: Order }>(
		`/api/orders/${orderId}/switch-to-fps`,
		{ method: "POST" },
		token,
	);
}

export function getNotifications(token: string): Promise<NotificationsResponse> {
	return request<NotificationsResponse>("/api/notifications", {}, token);
}

export function createOrder(
	token: string,
	productCode: string,
	customerNote = "",
): Promise<{ order: Order; duplicate: boolean }> {
	return request<{ order: Order; duplicate: boolean }>(
		"/api/orders",
		{
			method: "POST",
			body: JSON.stringify({ product_code: productCode, customer_note: customerNote }),
		},
		token,
	);
}

export function uploadReceipt(
	token: string,
	orderId: string,
	file: File,
): Promise<{ ok: boolean; receipt: Receipt; order_status: OrderStatus }> {
	const form = new FormData();
	form.append("file", file);
	return request<{ ok: boolean; receipt: Receipt; order_status: OrderStatus }>(
		`/api/orders/${orderId}/receipt`,
		{ method: "POST", body: form },
		token,
	);
}

export function markNotificationRead(token: string, notificationId: string): Promise<{ ok: boolean }> {
	return request<{ ok: boolean }>(
		`/api/notifications/${notificationId}/read`,
		{ method: "POST" },
		token,
	);
}

export function formatHkd(value: number): string {
	return new Intl.NumberFormat("zh-HK", {
		style: "currency",
		currency: "HKD",
		maximumFractionDigits: 0,
	}).format(value);
}

export function formatDateTime(value?: string | null): string {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString("zh-HK", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatDate(value?: string | null): string {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString("zh-HK", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
