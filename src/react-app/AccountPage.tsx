import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, LogOut, RefreshCw } from "lucide-react";
import type { User } from "firebase/auth";
import ServiceShell from "./ServiceShell";
import {
	firebaseConfigured,
	signInWithGoogle,
	signOutGoogle,
	watchAuth,
} from "./firebase";
import {
	cancelOrder,
	formatDate,
	formatDateTime,
	formatHkd,
	getAccount,
	getNotifications,
	getPlans,
	markNotificationRead,
	startStripeCheckout,
	switchOrderToFps,
	syncStripeCheckout,
	uploadReceipt,
} from "./billingApi";
import type {
	AccountResponse,
	Order,
	OrderStatus,
	PlansResponse,
	ServiceUpdate,
	SubscriptionStatus,
} from "./billingApi";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	pending_payment: "待付款",
	receipt_uploaded: "待審核",
	approved: "已開通",
	rejected: "已拒絕",
	cancelled: "已取消",
};

const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
	active: "生效中",
	grace: "寬限期",
	expired: "已到期",
	cancelled: "已取消",
};

const STRIPE_STATUS_LABELS: Record<string, string> = {
	requires_payment: "等待信用卡付款",
	processing: "付款處理中",
	paid: "已付款",
	paid_activation_failed: "已付款，開通待處理",
	expired: "付款連結已過期",
	failed: "信用卡付款失敗",
	cancelled: "已取消信用卡付款",
};

function statusTone(status: string): "ok" | "warn" | "bad" | "muted" {
	if (status === "approved" || status === "active") return "ok";
	if (status === "receipt_uploaded" || status === "grace" || status === "pending_payment") return "warn";
	if (status === "rejected" || status === "expired") return "bad";
	return "muted";
}

export default function AccountPage() {
	const [authReady, setAuthReady] = useState(!firebaseConfigured);
	const [user, setUser] = useState<User | null>(null);
	const [data, setData] = useState<AccountResponse | null>(null);
	const [notifications, setNotifications] = useState<ServiceUpdate[]>([]);
	const [plans, setPlans] = useState<PlansResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [uploadingId, setUploadingId] = useState<string | null>(null);
	const [stripeBusyId, setStripeBusyId] = useState<string | null>(null);
	const [cancelBusyId, setCancelBusyId] = useState<string | null>(null);
	const syncedSession = useRef<string | null>(null);

	useEffect(() => {
		const unsubscribe = watchAuth((nextUser) => {
			setUser(nextUser);
			setAuthReady(true);
		});
		return unsubscribe;
	}, []);

	const load = useCallback(async (currentUser: User) => {
		setLoading(true);
		setError(null);
		try {
			const token = await currentUser.getIdToken();
			const [account, notes, catalogue] = await Promise.all([
				getAccount(token),
				getNotifications(token),
				getPlans(),
			]);
			setData(account);
			setNotifications(notes.notifications);
			setPlans(catalogue);
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能載入帳戶資料");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!user) {
			setData(null);
			setNotifications([]);
			return;
		}
		const params = new URLSearchParams(window.location.search);
		const sessionId = params.get("session_id");
		if (
			params.get("checkout") === "success" &&
			sessionId &&
			syncedSession.current !== sessionId
		) {
			return;
		}
		void load(user);
	}, [user, load]);

	useEffect(() => {
		if (!user) return;
		const params = new URLSearchParams(window.location.search);
		if (params.get("checkout") !== "success") return;
		const sessionId = params.get("session_id");
		if (!sessionId || syncedSession.current === sessionId) return;
		syncedSession.current = sessionId;
		let active = true;
		(async () => {
			try {
				const token = await user.getIdToken();
				const result = await syncStripeCheckout(token, sessionId);
				if (!active) return;
				if (result.paid) {
					setNotice("付款已收到，訂閱及 Credits 已更新。");
				} else {
					setNotice("付款仍在處理中，稍後會自動更新。");
				}
				window.history.replaceState({}, "", "/account");
				await load(user);
			} catch (err) {
				if (!active) return;
				const message = err instanceof Error ? err.message : "未能確認信用卡付款";
				window.history.replaceState({}, "", "/account");
				await load(user);
				if (active) setError(message);
			}
		})();
		return () => {
			active = false;
		};
	}, [user, load]);

	async function handleSignIn() {
		setError(null);
		try {
			await signInWithGoogle();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Google 登入失敗");
		}
	}

	async function handleSignOut() {
		await signOutGoogle();
		setData(null);
		setNotifications([]);
	}

	async function handleReceipt(order: Order, file: File | null) {
		if (!file || !user) return;
		setUploadingId(order.id);
		setError(null);
		try {
			const token = await user.getIdToken();
			const result = await uploadReceipt(token, order.id, file);
			setData((previous) =>
				previous
					? {
							...previous,
							orders: previous.orders.map((item) =>
								item.id === order.id
									? { ...item, status: result.order_status, receipt: result.receipt }
									: item,
							),
						}
					: previous,
			);
			setNotice("收據已上載，等候人手審批。");
		} catch (err) {
			setError(err instanceof Error ? err.message : "收據上載失敗");
		} finally {
			setUploadingId(null);
		}
	}

	async function markRead(notification: ServiceUpdate) {
		if (!user || notification.read) return;
		try {
			const token = await user.getIdToken();
			await markNotificationRead(token, notification.id);
			setNotifications((previous) =>
				previous.map((item) => (item.id === notification.id ? { ...item, read: true } : item)),
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能標記通知");
		}
	}

	async function continueStripe(order: Order) {
		if (!user) return;
		setStripeBusyId(order.id);
		setError(null);
		try {
			const token = await user.getIdToken();
			const result = await startStripeCheckout(token, order.id);
			if (result.url) {
				window.location.assign(result.url);
				return;
			}
			if (result.paid) {
				setNotice("付款已收到，正在更新帳戶。");
				await load(user);
				return;
			}
			setNotice("付款仍在處理中，請稍後重新整理。");
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能繼續信用卡付款");
		} finally {
			setStripeBusyId(null);
		}
	}

	async function chooseFps(order: Order) {
		if (!user) return;
		setStripeBusyId(order.id);
		setError(null);
		try {
			const token = await user.getIdToken();
			const result = await switchOrderToFps(token, order.id);
			setData((previous) =>
				previous
					? {
							...previous,
							orders: previous.orders.map((item) => (item.id === order.id ? result.order : item)),
						}
					: previous,
			);
			setNotice("已改用 FPS。請按付款參考轉帳，再上載收據。");
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能改用 FPS");
		} finally {
			setStripeBusyId(null);
		}
	}

	function canCancelPending(order: Order): boolean {
		if (order.status !== "pending_payment") return false;
		const stripeStatus = order.stripe_payment_status ?? "";
		if (["paid", "paid_activation_failed", "processing"].includes(stripeStatus)) return false;
		return true;
	}

	async function handleCancelOrder(order: Order) {
		if (!user || !canCancelPending(order)) return;
		if (!window.confirm("確定取消此待付款訂單？取消後如需購買請重新下單。")) return;
		setCancelBusyId(order.id);
		setError(null);
		try {
			const token = await user.getIdToken();
			const result = await cancelOrder(token, order.id);
			setData((previous) =>
				previous
					? {
							...previous,
							orders: previous.orders.map((item) => (item.id === order.id ? result.order : item)),
						}
					: previous,
			);
			setNotice("訂單已取消。");
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能取消訂單");
		} finally {
			setCancelBusyId(null);
		}
	}

	if (!firebaseConfigured) {
		return (
			<ServiceShell active="account">
				<div className="service-wrap">
					<div className="signin-card">
						<p className="service-eyebrow">我的帳戶</p>
						<h1>登入功能尚未設定</h1>
						<p>
							此環境未設定 Firebase。請在部署時加入 VITE_FIREBASE_API_KEY、VITE_FIREBASE_AUTH_DOMAIN、
							VITE_FIREBASE_PROJECT_ID 及 VITE_FIREBASE_APP_ID。
						</p>
						<a className="btn btn-outline" href="/pricing">
							查看方案
						</a>
					</div>
				</div>
			</ServiceShell>
		);
	}

	if (!authReady) {
		return (
			<ServiceShell active="account">
				<div className="service-wrap">
					<p className="service-note">檢查登入狀態…</p>
				</div>
			</ServiceShell>
		);
	}

	if (!user) {
		return (
			<ServiceShell active="account">
				<div className="service-wrap">
					<div className="signin-card">
						<p className="service-eyebrow">我的帳戶</p>
						<h1>用 Google 登入</h1>
						<p>
							使用你平日登入 RedPen 的同一個 Google 帳戶，即可查看訂閱、每月文章額度、Credits、
							訂單與服務通知。
						</p>
						<button type="button" className="btn btn-primary" onClick={handleSignIn}>
							使用 Google 登入
						</button>
						{error && <p className="notice is-error">{error}</p>}
						<p className="service-note">
							還未選擇方案？<a href="/pricing">先查看定價</a>。
						</p>
					</div>
				</div>
			</ServiceShell>
		);
	}

	const account = data?.account;
	const period = account?.period;
	const subscription = account?.subscription;
	const trial = account?.trial;
	const credits = account?.credits;
	const postsPercent = period && period.posts_included > 0
		? Math.min(100, Math.round((period.posts_used / period.posts_included) * 100))
		: 0;
	const unread = notifications.filter((item) => !item.read).length;

	return (
		<ServiceShell active="account">
			<div className="service-wrap">
				<section className="service-hero">
					<p className="service-eyebrow">我的帳戶</p>
					<h1>{account?.display_name || user.displayName || user.email || "RedPen 帳戶"}</h1>
					<p className="service-lede">
						{user.email} · 這裡顯示的訂閱與用量與 RedPen 工作台同步。
					</p>
					<div className="service-actions">
						<a className="btn btn-primary" href="https://redpen.idh.asia" target="_blank" rel="noreferrer">
							開啟 RedPen
							<ArrowUpRight size={17} aria-hidden="true" />
						</a>
						<button type="button" className="btn btn-outline" disabled={loading} onClick={() => void load(user)}>
							<RefreshCw size={16} aria-hidden="true" />
							{loading ? "更新中…" : "重新整理"}
						</button>
						<button type="button" className="btn btn-outline btn-sm" onClick={handleSignOut}>
							<LogOut size={16} aria-hidden="true" />
							登出
						</button>
					</div>
					{notice && <p className="notice is-ok">{notice}</p>}
					{error && <p className="notice is-error">{error}</p>}
				</section>

				{loading && !data ? (
					<p className="service-note">載入帳戶資料…</p>
				) : !account ? (
					<div className="signin-card">
						<h2>暫時未能讀取帳戶</h2>
						<p>收費服務可能尚未完成設定。你仍可在 RedPen 繼續使用現有服務。</p>
						<button type="button" className="btn btn-outline" onClick={() => void load(user)}>
							再試一次
						</button>
					</div>
				) : (
					<div className="account-grid">
						<div>
							<section className="panel" aria-labelledby="subscription-heading">
								<div className="panel-head">
									<h2 id="subscription-heading">訂閱</h2>
									<span className="badge" data-tone={statusTone(subscription?.status ?? "expired")}>
										{subscription ? SUBSCRIPTION_STATUS_LABELS[subscription.status] : "未訂閱"}
									</span>
								</div>
								<dl className="stat-grid">
									<div className="stat">
										<dt>目前方案</dt>
										<dd>{account.plan.name_zh}</dd>
									</div>
									<div className="stat">
										<dt>收費週期</dt>
										<dd>{subscription ? (subscription.billing_cycle === "annual" ? "年費" : "月費") : "—"}</dd>
									</div>
									<div className="stat">
										<dt>本期文章</dt>
										<dd>{period ? `${period.posts_used} / ${period.posts_included}` : "—"}</dd>
									</div>
									<div className="stat">
										<dt>剩餘文章</dt>
										<dd>{period ? period.posts_remaining : "—"}</dd>
									</div>
								</dl>
								{period && (
									<div className="meter" role="img" aria-label={`本期已用 ${postsPercent}% 文章額度`}>
										<span style={{ width: `${postsPercent}%` }} />
									</div>
								)}
								<p className="service-note" style={{ marginTop: "0.75rem" }}>
									{period
										? `本期：${formatDate(period.period_start)} 至 ${formatDate(period.period_end)} · 保存 ${period.retention_days} 日`
										: "目前沒有生效中的收費期。"}
								</p>
								{subscription?.next_plan_code && (
									<p className="service-note">
										下期方案：{subscription.next_plan_code} / {subscription.next_billing_cycle ?? "monthly"}
									</p>
								)}
								{subscription?.cancel_at_period_end && (
									<p className="notice is-error">已安排本期完結後取消，不會自動續期。</p>
								)}
								{trial && (
									<p className="service-note">
										試用狀態：{trial.status} · 到期 {formatDateTime(trial.expires_at)}
										{trial.upgrade_discount_available ? " · 升級可扣 HK$29" : ""}
									</p>
								)}
								<div className="service-actions" style={{ marginTop: "0.85rem" }}>
									<a className="btn btn-outline btn-sm" href="/pricing">
										{account.plan.code === "none" ? "選擇方案" : "加購或轉方案"}
									</a>
								</div>
							</section>

							<section className="panel" aria-labelledby="credits-heading">
								<div className="panel-head">
									<h2 id="credits-heading">Credits</h2>
									<span className="service-note">1 Credit = 1 次圖片重生成</span>
								</div>
								<dl className="stat-grid">
									<div className="stat">
										<dt>可用</dt>
										<dd>{credits?.available ?? 0}</dd>
									</div>
									<div className="stat">
										<dt>凍結</dt>
										<dd>{credits?.held_balance ?? 0}</dd>
									</div>
									<div className="stat">
										<dt>購買</dt>
										<dd>{credits?.purchased_balance ?? 0}</dd>
									</div>
									<div className="stat">
										<dt>已用</dt>
										<dd>{credits?.total_used ?? 0}</dd>
									</div>
								</dl>
								<p className="service-note" style={{ marginTop: "0.6rem" }}>
									舊制點數已按 55:10 換算為 {credits?.legacy_balance ?? 0} Credits。
								</p>
							</section>
						</div>

						<div>
							<section className="panel" aria-labelledby="usage-heading">
								<div className="panel-head">
									<h2 id="usage-heading">最近用量</h2>
									<p>最新 10 篇</p>
								</div>
								{account.recent_usage.length === 0 ? (
									<p className="service-note">尚未有文章用量。</p>
								) : (
									<div className="usage-list">
										{account.recent_usage.map((usage) => (
											<article key={usage.id} className="usage-item">
												<strong>{usage.topic || usage.record_id}</strong>
												<span>
													{usage.source}
													{usage.plan_code ? ` / ${usage.plan_code}` : ""} · {usage.images_generated} 張圖片 · 保存至{" "}
													{formatDate(usage.retention_until)}
												</span>
												<span>
													免費重生成 {usage.regen_used} 次
													{usage.paid_regen_used > 0 ? ` · Credits 重生成 ${usage.paid_regen_used} 次` : ""}
												</span>
											</article>
										))}
									</div>
								)}
							</section>

							<section className="panel" aria-labelledby="orders-heading">
								<div className="panel-head">
									<h2 id="orders-heading">訂單與付款</h2>
									<p>{data?.orders.length ?? 0} 張</p>
								</div>
								{!data || data.orders.length === 0 ? (
									<p className="service-note">尚未有訂單。<a href="/pricing">查看方案</a>。</p>
								) : (
									<div className="order-list">
										{data.orders.map((order) => {
											const isStripeOrder = order.payment_method === "stripe" && order.status !== "approved";
											const stripeStatus = order.stripe_payment_status ?? "requires_payment";
											const showCancel = canCancelPending(order);
											const actionBusy =
												stripeBusyId === order.id ||
												uploadingId === order.id ||
												cancelBusyId === order.id;
											return (
											<article key={order.id} className="order-item">
												<div className="order-item-top">
													<strong>
														{plans?.products.find((product) => product.code === order.product_code)?.name_zh ??
															order.product_code}
													</strong>
													<span className="badge" data-tone={statusTone(order.status)}>
														{order.kind === "course" && order.status === "approved"
															? "已確認"
															: ORDER_STATUS_LABELS[order.status]}
													</span>
												</div>
												<p className="order-meta">
													{formatHkd(order.amount_hkd)} · 參考 {order.payment_reference} ·{" "}
													{order.payment_method === "stripe" ? "信用卡（Stripe）" : "FPS"} ·{" "}
													{formatDateTime(order.created_at)}
												</p>
												{order.rejection_reason && order.status === "rejected" && (
													<p className="notice is-error">拒絕原因：{order.rejection_reason}</p>
												)}
												{(order.status === "pending_payment" || order.status === "rejected") && (
													isStripeOrder ? (
														<>
															<p className="order-meta">
																Stripe：{STRIPE_STATUS_LABELS[stripeStatus] ?? stripeStatus}
																{order.stripe_checkout_expires_at
																	? ` · 連結有效至 ${formatDateTime(order.stripe_checkout_expires_at)}`
																	: ""}
															</p>
															{stripeStatus === "paid_activation_failed" && (
																<p className="notice is-error">
																	付款已收到，但自動開通未完成。請勿重複付款；我們會人手處理。
																</p>
															)}
															<div className="service-actions">
																<button
																	type="button"
																	className="btn btn-primary btn-sm"
																	disabled={
																		actionBusy ||
																		stripeStatus === "processing" ||
																		stripeStatus === "paid_activation_failed"
																	}
																	onClick={() => void continueStripe(order)}
																>
																	{stripeBusyId === order.id
																		? "處理中…"
																		: stripeStatus === "processing"
																			? "重新檢查付款"
																			: "繼續信用卡付款"}
																</button>
																<button
																	type="button"
																	className="btn btn-outline btn-sm"
																	disabled={actionBusy || stripeStatus === "processing"}
																	onClick={() => void chooseFps(order)}
																>
																	改用 FPS
																</button>
																{showCancel && (
																	<button
																		type="button"
																		className="btn btn-outline btn-sm"
																		disabled={actionBusy}
																		onClick={() => void handleCancelOrder(order)}
																	>
																		{cancelBusyId === order.id ? "取消中…" : "取消訂單"}
																	</button>
																)}
															</div>
														</>
													) : (
														<>
															{plans && order.status === "pending_payment" && (
																<p className="order-meta">
																	請以 FPS {plans.payment.fps_number} 轉帳，並在備註填上付款參考。
																</p>
															)}
															<label className="field">
																<span>上載收據（JPG、PNG 或 PDF）</span>
																<input
																	className="file-input"
																	type="file"
																	accept="image/jpeg,image/png,application/pdf"
																	disabled={actionBusy}
																	onChange={(event) => {
																		void handleReceipt(order, event.target.files?.[0] ?? null);
																		event.target.value = "";
																	}}
																/>
															</label>
															{uploadingId === order.id && <p className="service-note">上載中…</p>}
															{showCancel && (
																<div className="service-actions">
																	<button
																		type="button"
																		className="btn btn-outline btn-sm"
																		disabled={actionBusy}
																		onClick={() => void handleCancelOrder(order)}
																	>
																		{cancelBusyId === order.id ? "取消中…" : "取消訂單"}
																	</button>
																</div>
															)}
														</>
													)
												)}
												{order.status === "receipt_uploaded" && (
													<p className="service-note">收據已收到，等候人手審批。</p>
												)}
												{order.status === "approved" && (
													<p className="service-note">已於 {formatDateTime(order.approved_at)} 開通。</p>
												)}
												{order.status === "cancelled" && (
													<p className="service-note">此訂單已取消。</p>
												)}
											</article>
											);
										})}
									</div>
								)}
							</section>

							<section className="panel" aria-labelledby="notifications-heading">
								<div className="panel-head">
									<h2 id="notifications-heading">通知</h2>
									<p>{unread > 0 ? `${unread} 則未讀` : "全部已讀"}</p>
								</div>
								{notifications.length === 0 ? (
									<p className="service-note">暫時沒有通知。</p>
								) : (
									<div className="order-list">
										{notifications.map((item) => (
											<article key={item.id} className="order-item">
												<div className="order-item-top">
													<strong>{item.title}</strong>
													<span className="badge" data-tone={item.read ? "muted" : "warn"}>
														{item.read ? "已讀" : "未讀"}
													</span>
												</div>
												<p className="service-note" style={{ whiteSpace: "pre-line" }}>{item.body}</p>
												<p className="order-meta">{formatDateTime(item.published_at)}</p>
												<div className="service-actions">
													{item.link_url && (
														<a className="btn btn-outline btn-sm" href={item.link_url}>
															查看詳情
														</a>
													)}
													{!item.read && (
														<button type="button" className="btn btn-outline btn-sm" onClick={() => void markRead(item)}>
															標記已讀
														</button>
													)}
												</div>
											</article>
										))}
									</div>
								)}
							</section>
						</div>
					</div>
				)}
			</div>
		</ServiceShell>
	);
}
