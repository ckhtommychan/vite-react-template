import { useEffect, useRef, useState } from "react";
import {
	ArrowLeft,
	Calendar,
	Check,
	ChevronDown,
	Clock,
	Copy,
	CreditCard,
	GraduationCap,
	Landmark,
	MapPin,
	MessageCircle,
	ShieldCheck,
	Users,
} from "lucide-react";
import type { User } from "firebase/auth";
import ServiceShell from "./ServiceShell";
import { firebaseConfigured, signInWithGoogle, watchAuth } from "./firebase";
import {
	createOrder,
	formatDateTime,
	formatHkd,
	getOrder,
	getPlans,
	startStripeCheckout,
	switchOrderToFps,
	uploadReceipt,
} from "./billingApi";
import type { Order, PlansResponse } from "./billingApi";

const COURSE_PRODUCT_CODE = "course_manus_600";
const COURSE_FALLBACK_PRICE = 600;
const COURSE_NAME = "Manus AI 一日工作坊";
const VENUE = "九龍觀塘巧明街 95 號 世達中心 18 樓 F 室";
const WHATSAPP_LINK = `https://wa.me/85294828587?text=${encodeURIComponent(
	"你好，我想查詢 Manus AI 一日工作坊。",
)}`;

const STRIPE_STATUS_LABELS: Record<string, string> = {
	requires_payment: "等待信用卡付款",
	processing: "付款處理中",
	paid: "已付款",
	paid_activation_failed: "已付款，開通待處理",
	expired: "付款連結已過期",
	failed: "信用卡付款失敗",
	cancelled: "已取消信用卡付款",
};

const courseDetails = [
	{ icon: Calendar, label: "開班日期", value: "10月6、20、27日（星期二）" },
	{ icon: Clock, label: "時間", value: "下午 3:00 至 5:00" },
	{ icon: Users, label: "名額", value: "小班教學（限額 6 人）" },
	{ icon: GraduationCap, label: "講者", value: "Peter So、Aiden Lam" },
];

const faqItems = [
	{
		q: "付款後何時確認？",
		a: "信用卡付款即時確認；FPS 上載收據後由人手核對，一般 1 個工作天內完成，並以電郵或 WhatsApp 通知你。",
	},
	{
		q: "可以轉班或退款嗎？",
		a: "如需改期，請盡早 WhatsApp 9482 8587 與我們聯絡。退款安排請參閱退款政策。",
	},
	{
		q: "需要帶甚麼？",
		a: "請自備手提電腦，課堂以實戰操作為主。學費已包括兩小時面授實戰。",
	},
];

export default function CoursePage() {
	const [data, setData] = useState<PlansResponse | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [note, setNote] = useState("");
	const [order, setOrder] = useState<Order | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [stripeBusy, setStripeBusy] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [copied, setCopied] = useState(false);
	const [paymentFlash, setPaymentFlash] = useState(false);
	const [showDock, setShowDock] = useState(false);
	const paymentRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		let active = true;
		getPlans()
			.then((result) => {
				if (active) setData(result);
			})
			.catch((err: unknown) => {
				if (active) setError(err instanceof Error ? err.message : "未能載入課程資料");
			});
		const unsubscribe = watchAuth((nextUser) => setUser(nextUser));
		return () => {
			active = false;
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(false), 2000);
		return () => window.clearTimeout(timer);
	}, [copied]);

	useEffect(() => {
		if (!user) return;
		const params = new URLSearchParams(window.location.search);
		if (params.get("checkout") !== "cancelled") return;
		const orderId = params.get("order_id");
		if (!orderId) return;
		let active = true;
		(async () => {
			try {
				const token = await user.getIdToken();
				const result = await getOrder(token, orderId);
				if (!active) return;
				setOrder(result.order);
				setNotice("已取消信用卡付款。你可以再試信用卡，或改用 FPS。");
				window.history.replaceState({}, "", "/course");
				scrollToPayment(true);
			} catch (err) {
				if (active) setError(err instanceof Error ? err.message : "未能讀取訂單");
			}
		})();
		return () => {
			active = false;
		};
	}, [user]);

	useEffect(() => {
		if (!order) {
			setShowDock(false);
			return;
		}
		const node = paymentRef.current;
		if (!node || typeof IntersectionObserver === "undefined") {
			setShowDock(true);
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				setShowDock(!entry.isIntersecting);
			},
			{ root: null, threshold: 0.35, rootMargin: "-72px 0px 0px 0px" },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [order]);

	const product = data?.products.find(
		(item) => item.kind === "course" && item.code === COURSE_PRODUCT_CODE,
	);
	const price = product?.price_hkd ?? COURSE_FALLBACK_PRICE;
	const instructions = order?.payment_instructions ?? data?.payment;
	const isPaid = order?.status === "approved";
	const isStripeOrder = order?.payment_method === "stripe" && !isPaid;
	const stripeStatus = order?.stripe_payment_status ?? "requires_payment";
	const checkoutStep: 1 | 2 | 3 = !order ? 1 : isPaid ? 3 : 2;
	const orderNeedsPayment =
		!!order &&
		!isPaid &&
		(order.status === "pending_payment" ||
			order.status === "rejected" ||
			(isStripeOrder && stripeStatus !== "paid"));

	function scrollToPayment(flash = true) {
		window.setTimeout(() => {
			document.getElementById("course-payment")?.scrollIntoView({ behavior: "smooth", block: "start" });
			if (flash) {
				setPaymentFlash(true);
				window.setTimeout(() => setPaymentFlash(false), 1600);
			}
		}, 60);
	}

	async function startOrder() {
		if (busy) return;
		setBusy(true);
		setError(null);
		setNotice(null);
		try {
			let currentUser = user;
			if (!currentUser) currentUser = await signInWithGoogle();
			setUser(currentUser);
			const token = await currentUser.getIdToken();
			const result = await createOrder(token, COURSE_PRODUCT_CODE, note.trim());
			setOrder(result.order);
			setNotice(
				result.duplicate
					? "已找回你尚未付款的報名。請選擇信用卡或 FPS 付款。"
					: "報名訂單已建立，請選擇信用卡或 FPS 付款。",
			);
			scrollToPayment(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能建立報名訂單");
		} finally {
			setBusy(false);
		}
	}

	async function beginStripe(currentOrder: Order) {
		if (stripeBusy) return;
		setStripeBusy(true);
		setError(null);
		try {
			let currentUser = user;
			if (!currentUser) currentUser = await signInWithGoogle();
			setUser(currentUser);
			const token = await currentUser.getIdToken();
			const result = await startStripeCheckout(token, currentOrder.id);
			if (result.url) {
				window.location.assign(result.url);
				return;
			}
			if (result.paid) {
				const refreshed = await getOrder(token, currentOrder.id);
				setOrder(refreshed.order);
				setNotice("付款已收到，正在為你確認班期。");
				return;
			}
			setNotice("信用卡付款暫時未能開始，請改用 FPS。");
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能開始信用卡付款");
			setNotice("信用卡付款未能開始，可改用 FPS 付款。");
		} finally {
			setStripeBusy(false);
		}
	}

	async function chooseFps(currentOrder: Order) {
		if (!user || stripeBusy) return;
		setStripeBusy(true);
		setError(null);
		try {
			const token = await user.getIdToken();
			const result = await switchOrderToFps(token, currentOrder.id);
			setOrder(result.order);
			setNotice("已改用 FPS 付款。請按下方資料轉帳並上載收據。");
			scrollToPayment(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能改用 FPS");
		} finally {
			setStripeBusy(false);
		}
	}

	async function copyReference() {
		if (!order) return;
		try {
			await navigator.clipboard.writeText(order.payment_reference);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	}

	async function handleReceipt(file: File | null) {
		if (!file || !order || !user) return;
		setUploading(true);
		setError(null);
		try {
			const token = await user.getIdToken();
			const result = await uploadReceipt(token, order.id, file);
			setOrder({ ...order, status: result.order_status, receipt: result.receipt });
			setNotice("收據已上載，等候人手核對。確認後會以電郵或 WhatsApp 通知你。");
		} catch (err) {
			setError(err instanceof Error ? err.message : "收據上載失敗");
		} finally {
			setUploading(false);
		}
	}

	return (
		<ServiceShell active="course">
			<div className={`service-wrap course-flow${order ? " has-order" : ""}`}>
				<section className="course-hero">
					<p className="service-eyebrow">IDH Academy · AI 教育</p>
					<h1>{COURSE_NAME}</h1>
					<p className="course-lede">
						兩小時小班實戰。用 Google 登入建立訂單，可選信用卡即時付款，或 FPS 轉帳後上載收據。
					</p>
					<nav className="course-steps" aria-label="報名流程">
						<ol>
							<li className={checkoutStep >= 1 ? "is-done" : ""} data-active={checkoutStep === 1}>
								<span className="course-step-num">1</span>
								<span className="course-step-label">填資料</span>
							</li>
							<li className={checkoutStep >= 2 ? "is-done" : ""} data-active={checkoutStep === 2}>
								<span className="course-step-num">2</span>
								<span className="course-step-label">付款</span>
							</li>
							<li className={checkoutStep >= 3 ? "is-done" : ""} data-active={checkoutStep === 3}>
								<span className="course-step-num">3</span>
								<span className="course-step-label">確認</span>
							</li>
						</ol>
					</nav>
					<div className="course-hero-actions">
						<a className="btn btn-outline btn-sm" href="/#course">
							<ArrowLeft size={16} aria-hidden="true" />
							返回課程詳情
						</a>
						<a className="btn btn-outline btn-sm" href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
							<MessageCircle size={16} aria-hidden="true" />
							WhatsApp 查詢
						</a>
					</div>
					{!firebaseConfigured && (
						<p className="notice is-error">
							此環境未設定 Firebase，暫時未能登入報名，請直接 WhatsApp 我們。
						</p>
					)}
					{(notice || error) && (
						<div className="course-alerts" role="status">
							{notice && <p className="notice is-ok">{notice}</p>}
							{error && <p className="notice is-error">{error}</p>}
						</div>
					)}
				</section>

				<section className="course-offer" aria-labelledby="course-offer-heading">
					<div className="course-offer-copy">
						<p className="course-kicker">學費</p>
						<h2 id="course-offer-heading">
							<strong>{formatHkd(price)}</strong>
							<span> / 一位（優惠價）</span>
						</h2>
						<p>小班教學，名額有限，以完成付款為準。如想報班期已滿，我們會聯絡你安排下一班。</p>
					</div>
					{!order && (
						<button
							type="button"
							className="btn btn-primary"
							disabled={busy || !firebaseConfigured}
							onClick={() => {
								document.getElementById("course-payment")?.scrollIntoView({ behavior: "smooth", block: "start" });
							}}
						>
							立即報名
						</button>
					)}
					{order && orderNeedsPayment && (
						<button type="button" className="btn btn-primary" onClick={() => scrollToPayment(true)}>
							前往付款
						</button>
					)}
				</section>

				<section className="course-details" aria-labelledby="course-info-heading">
					<div className="course-section-head">
						<h2 id="course-info-heading">課程資料</h2>
						<p>學費已包括兩小時面授實戰，請自備手提電腦。</p>
					</div>
					<div className="course-detail-grid">
						{courseDetails.map((item) => {
							const Icon = item.icon;
							return (
								<article key={item.label} className="course-detail-card">
									<Icon size={20} aria-hidden="true" />
									<div>
										<h3>{item.label}</h3>
										<p>{item.value}</p>
									</div>
								</article>
							);
						})}
						<article className="course-detail-card course-detail-venue">
							<MapPin size={20} aria-hidden="true" />
							<div>
								<h3>地點</h3>
								<p>{VENUE}</p>
							</div>
						</article>
					</div>
				</section>

				<section
					id="course-payment"
					ref={paymentRef}
					className={`course-payment-panel${paymentFlash ? " is-flash" : ""}`}
					aria-labelledby="course-payment-heading"
				>
					<div className="course-payment-head">
						<div>
							<p className="course-kicker">{order ? "步驟 2 · 付款" : "步驟 1 · 報名"}</p>
							<h2 id="course-payment-heading">{order ? "選擇付款方式" : "報名及付款"}</h2>
							<p>
								{order
									? `訂單 ${order.product_code} · ${formatHkd(order.amount_hkd)} · 狀態：${
											isPaid
												? "已付款"
												: isStripeOrder
													? (STRIPE_STATUS_LABELS[stripeStatus] ?? stripeStatus)
													: "待付款"
										}`
									: `${formatHkd(price)} · 一位 · 信用卡或 FPS`}
							</p>
						</div>
						<ShieldCheck size={28} aria-hidden="true" />
					</div>

					{!order ? (
						<>
							<label className="field course-note-field">
								<span>姓名、聯絡電話及想報班期（選填）</span>
								<textarea
									className="course-textarea"
									rows={3}
									value={note}
									maxLength={500}
									onChange={(event) => setNote(event.target.value)}
									placeholder="例如：陳大文 / 9123 4567 / 10月27日"
								/>
							</label>
							<div className="service-actions">
								<button
									type="button"
									className="btn btn-primary"
									disabled={busy || !firebaseConfigured}
									onClick={() => void startOrder()}
								>
									<CreditCard size={17} aria-hidden="true" />
									{busy ? "建立訂單中…" : user ? "建立報名訂單" : "以 Google 登入並報名"}
								</button>
								<a className="btn btn-outline" href="/account">
									查看我的報名
								</a>
							</div>
							<p className="service-note">
								建立訂單後可選信用卡（Stripe）即時付款，或 FPS 轉數快轉帳後上載收據。
							</p>
						</>
					) : (
						<>
							{(order.status === "pending_payment" || order.status === "rejected") && (
								<div className="payment-choice" role="group" aria-label="付款方式">
									<button
										type="button"
										className={`payment-choice-card${order.payment_method === "stripe" ? " is-selected" : ""}`}
										disabled={stripeBusy || data?.payment.stripe_enabled !== true}
										onClick={() => void beginStripe(order)}
									>
										<CreditCard size={22} aria-hidden="true" />
										<strong>信用卡（Stripe）</strong>
										<span>Visa / Mastercard，付款後即時確認</span>
									</button>
									<button
										type="button"
										className={`payment-choice-card${order.payment_method !== "stripe" ? " is-selected" : ""}`}
										disabled={stripeBusy}
										onClick={() => void chooseFps(order)}
									>
										<Landmark size={22} aria-hidden="true" />
										<strong>FPS 轉數快</strong>
										<span>轉帳後上載收據，人手核對</span>
									</button>
								</div>
							)}
							{isStripeOrder ? (
								<>
									<dl className="payment-grid">
										<div>
											<dt>付款參考</dt>
											<dd>{order.payment_reference}</dd>
										</div>
										<div>
											<dt>金額</dt>
											<dd>{formatHkd(order.amount_hkd)}</dd>
										</div>
										<div>
											<dt>付款方式</dt>
											<dd>信用卡（Stripe）</dd>
										</div>
										<div>
											<dt>付款連結</dt>
											<dd>
												{order.stripe_checkout_expires_at
													? `有效至 ${formatDateTime(order.stripe_checkout_expires_at)}`
													: "可重新建立"}
											</dd>
										</div>
									</dl>
									{stripeStatus === "paid_activation_failed" && (
										<p className="notice is-error">
											付款已收到，但自動開通未完成。請勿重複付款；我們會人手處理。
										</p>
									)}
									{stripeStatus === "processing" && (
										<p className="notice">付款正在處理中，請稍後重新檢查。</p>
									)}
									<div className="service-actions">
										<button
											type="button"
											className="btn btn-primary"
											disabled={stripeBusy || stripeStatus === "paid_activation_failed"}
											onClick={() => void beginStripe(order)}
										>
											{stripeBusy
												? "處理中…"
												: stripeStatus === "processing"
													? "重新檢查付款"
													: "繼續信用卡付款"}
										</button>
									</div>
									<p className="service-note">
										信用卡由 Stripe 安全處理。付款後會自動確認，毋須上載收據。
									</p>
								</>
							) : (
								<>
									<dl className="payment-grid">
										<div>
											<dt>付款參考</dt>
											<dd>{order.payment_reference}</dd>
										</div>
										<div>
											<dt>金額</dt>
											<dd>{formatHkd(order.amount_hkd)}</dd>
										</div>
										<div>
											<dt>FPS 轉數快</dt>
											<dd>{instructions?.fps_number ?? "未提供"}</dd>
										</div>
										<div>
											<dt>收款名稱</dt>
											<dd>{instructions?.fps_name ?? "未提供"}</dd>
										</div>
										{instructions?.bank_name && (
											<div>
												<dt>銀行</dt>
												<dd>{instructions.bank_name}</dd>
											</div>
										)}
										{instructions?.bank_account && (
											<div>
												<dt>銀行戶口</dt>
												<dd>{instructions.bank_account}</dd>
											</div>
										)}
									</dl>
									<div className="service-actions">
										<button type="button" className="btn btn-outline btn-sm" onClick={() => void copyReference()}>
											<Copy size={16} aria-hidden="true" />
											{copied ? "已複製參考編號" : "複製付款參考"}
										</button>
										<a className="btn btn-outline btn-sm" href="/account">
											稍後在帳戶上載收據
										</a>
									</div>
									{!isPaid && (
										<label className="field">
											<span>上載付款收據（JPG、PNG 或 PDF，最多 10 MB）</span>
											<input
												className="file-input"
												type="file"
												accept="image/jpeg,image/png,application/pdf"
												disabled={uploading}
												onChange={(event) => {
													void handleReceipt(event.target.files?.[0] ?? null);
													event.target.value = "";
												}}
											/>
										</label>
									)}
									{uploading && <p className="service-note">上載中…</p>}
									{order.receipt && (
										<p className="notice is-ok">
											已收到收據：{order.receipt.original_name ?? order.receipt.mime_type}
											。我們會人手核對後確認班期。
										</p>
									)}
								</>
							)}
							{isPaid && (
								<p className="notice is-ok course-paid-notice">
									<Check size={16} aria-hidden="true" /> 付款已確認，我們會盡快聯絡你確認課堂安排。
								</p>
							)}
						</>
					)}
				</section>

				<section className="course-faq" aria-labelledby="course-faq-heading">
					<div className="course-faq-head">
						<h2 id="course-faq-heading">報名須知</h2>
						<p>確認時間、轉班退款與上課準備。</p>
					</div>
					<div className="course-faq-list">
						{faqItems.map((item) => (
							<details key={item.q} className="course-faq-item">
								<summary>
									<span>{item.q}</span>
									<ChevronDown size={18} aria-hidden="true" className="course-faq-chevron" />
								</summary>
								<div className="course-faq-answer">
									<p>
										{item.q === "可以轉班或退款嗎？" ? (
											<>
												如需改期，請盡早 WhatsApp 9482 8587 與我們聯絡。退款安排請參閱
												<a href="/refund-policy">退款政策</a>。
											</>
										) : (
											item.a
										)}
									</p>
								</div>
							</details>
						))}
					</div>
					<p className="course-legal">
						付款即表示你同意<a href="/terms">服務條款</a>及<a href="/refund-policy">退款政策</a>
						；個人資料處理方式請參閱<a href="/privacy-policy">隱私政策</a>。
						<span>
							<ShieldCheck size={15} aria-hidden="true" /> 收據只供人手核對付款，不會公開展示。
						</span>
					</p>
				</section>
			</div>

			{order && orderNeedsPayment && showDock && (
				<div className="course-payment-dock" role="complementary" aria-label="未完成付款">
					<div className="course-payment-dock-inner">
						<div>
							<strong>報名待付款</strong>
							<span>
								{order.product_code} · {formatHkd(order.amount_hkd)}
							</span>
						</div>
						<button type="button" className="btn btn-primary btn-sm" onClick={() => scrollToPayment(true)}>
							完成付款
						</button>
					</div>
				</div>
			)}
		</ServiceShell>
	);
}
