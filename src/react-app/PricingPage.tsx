import { useEffect, useState } from "react";
import { ArrowRight, Check, CreditCard, Landmark, ShieldCheck } from "lucide-react";
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
import type { BillingCycle, Order, PlansResponse, Product } from "./billingApi";

const PLAN_ORDER = ["starter", "growth", "business"];

const STRIPE_STATUS_LABELS: Record<string, string> = {
	requires_payment: "等待信用卡付款",
	processing: "付款處理中",
	paid: "已付款",
	paid_activation_failed: "已付款，開通待處理",
	expired: "付款連結已過期",
	failed: "信用卡付款失敗",
	cancelled: "已取消信用卡付款",
};

export default function PricingPage() {
	const [data, setData] = useState<PlansResponse | null>(null);
	const [cycle, setCycle] = useState<BillingCycle>("monthly");
	const [user, setUser] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [busyProduct, setBusyProduct] = useState<string | null>(null);
	const [order, setOrder] = useState<Order | null>(null);
	const [uploading, setUploading] = useState(false);
	const [stripeBusy, setStripeBusy] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		let active = true;
		getPlans()
			.then((result) => {
				if (active) setData(result);
			})
			.catch((err: unknown) => {
				if (active) setError(err instanceof Error ? err.message : "未能載入方案");
			})
			.finally(() => {
				if (active) setLoading(false);
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
				if (result.order.kind === "course") {
					window.location.replace(`/course?checkout=cancelled&order_id=${orderId}`);
					return;
				}
				setOrder(result.order);
				setNotice("已取消信用卡付款。你可以再試信用卡，或改用 FPS。");
				window.history.replaceState({}, "", "/pricing");
			} catch (err) {
				if (active) setError(err instanceof Error ? err.message : "未能讀取訂單");
			}
		})();
		return () => {
			active = false;
		};
	}, [user]);

	function scrollToPayment() {
		window.setTimeout(() => {
			document.getElementById("payment")?.scrollIntoView({ behavior: "smooth", block: "start" });
		}, 60);
	}

	async function beginStripe(currentOrder: Order, knownToken?: string) {
		setStripeBusy(true);
		setError(null);
		try {
			let currentUser = user;
			if (!currentUser) currentUser = await signInWithGoogle();
			const token = knownToken ?? (await currentUser.getIdToken());
			const result = await startStripeCheckout(token, currentOrder.id);
			if (result.url) {
				window.location.assign(result.url);
				return;
			}
			if (result.paid) {
				const refreshed = await getOrder(token, currentOrder.id);
				setOrder(refreshed.order);
				setNotice("付款已收到，正在為你開通。");
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
		if (!user) return;
		setStripeBusy(true);
		setError(null);
		try {
			const token = await user.getIdToken();
			const result = await switchOrderToFps(token, currentOrder.id);
			setOrder(result.order);
			setNotice("已改用 FPS 付款。請按下方資料轉帳並上載收據。");
			scrollToPayment();
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能改用 FPS");
		} finally {
			setStripeBusy(false);
		}
	}

	const plans = [...(data?.plans ?? [])].sort(
		(a, b) => PLAN_ORDER.indexOf(a.code) - PLAN_ORDER.indexOf(b.code),
	);
	const products = data?.products ?? [];
	const creditProducts = products.filter((product) => product.kind === "credits");
	const trialProduct = products.find((product) => product.kind === "trial");

	function planProduct(planCode: string, billingCycle: BillingCycle): Product | undefined {
		return products.find(
			(product) =>
				product.kind === "subscription" &&
				product.plan_code === planCode &&
				product.billing_cycle === billingCycle,
		);
	}

	async function startOrder(productCode: string) {
		setBusyProduct(productCode);
		setError(null);
		setNotice(null);
		try {
			let currentUser = user;
			if (!currentUser) currentUser = await signInWithGoogle();
			const token = await currentUser.getIdToken();
			const result = await createOrder(token, productCode);
			setOrder(result.order);
			setNotice(
				result.duplicate
					? "已找回你尚未付款的訂單。請選擇信用卡或 FPS 付款。"
					: "訂單已建立，請選擇信用卡或 FPS 付款。",
			);
			scrollToPayment();
		} catch (err) {
			setError(err instanceof Error ? err.message : "未能建立訂單");
		} finally {
			setBusyProduct(null);
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
			setNotice("收據已上載，等候人手審批，一般需 1 個工作天。");
		} catch (err) {
			setError(err instanceof Error ? err.message : "收據上載失敗");
		} finally {
			setUploading(false);
		}
	}

	const instructions = order?.payment_instructions ?? data?.payment;
	const isStripeOrder = order?.payment_method === "stripe" && order.status !== "approved";
	const stripeStatus = order?.stripe_payment_status ?? "requires_payment";

	return (
		<ServiceShell active="pricing">
			<div className="service-wrap">
				<section className="service-hero">
					<p className="service-eyebrow">RedPen 香港定價</p>
					<h1>
						每月固定額度，<strong>唔使逐張圖計</strong>。
					</h1>
					<p className="service-lede">
						每篇文章固定 3 頁大綱及 3 張圖片。方案按月或按年預付，不自動續期；
						額外圖片重生成或加開文章可用 Credits 補購。
					</p>
					<div className="service-actions">
						<a className="btn btn-primary" href="https://redpen.idh.asia" target="_blank" rel="noreferrer">
							前往 RedPen 開始創作
							<ArrowRight size={17} aria-hidden="true" />
						</a>
						<a className="btn btn-outline" href="/account">
							查看我的訂閱
						</a>
					</div>
					{!firebaseConfigured && (
						<p className="notice is-error">
							此環境未設定 Firebase，暫時只能瀏覽方案，未能登入購買。
						</p>
					)}
					{notice && <p className="notice is-ok">{notice}</p>}
					{error && <p className="notice is-error">{error}</p>}
				</section>

				<section aria-labelledby="plans-heading">
					<div className="section-head">
						<div>
							<h2 id="plans-heading">月費與年費方案</h2>
							<p>年費一次過預付 12 個月，平均每月較平；所有方案均包含 3 頁大綱及每篇 3 張圖片。</p>
						</div>
						<div className="billing-toggle" role="group" aria-label="收費週期">
							<button type="button" aria-pressed={cycle === "monthly"} onClick={() => setCycle("monthly")}>
								月費
							</button>
							<button type="button" aria-pressed={cycle === "annual"} onClick={() => setCycle("annual")}>
								年費
							</button>
						</div>
					</div>

					{loading ? (
						<p className="service-note">載入方案中…</p>
					) : (
						<div className="plan-grid">
							{plans.map((plan) => {
								const product = planProduct(plan.code, cycle);
								const price = cycle === "annual" ? plan.annual_price_hkd : plan.monthly_price_hkd;
								const featured = plan.code === "growth";
								return (
									<article key={plan.code} className={`plan-card${featured ? " is-featured" : ""}`}>
										<div className="plan-card-head">
											<div>
												<h3>{plan.name_zh}</h3>
												<p className="plan-en">{plan.name_en}</p>
											</div>
											{featured && <span className="plan-flag">最受歡迎</span>}
										</div>
										<div className="plan-price">
											<strong>{formatHkd(price)}</strong>
											<span>{cycle === "annual" ? "/ 年" : "/ 月"}</span>
										</div>
										<ul className="plan-features">
											<li>
												<Check size={15} aria-hidden="true" />
												每月 {plan.monthly_posts} 篇，每篇 3 張圖片
											</li>
											{plan.features
												.filter((feature) => !feature.includes("每月") && !feature.includes("每篇 3 張圖片"))
												.map((feature) => (
													<li key={feature}>
														<Check size={15} aria-hidden="true" />
														{feature}
													</li>
												))}
										</ul>
										<button
											type="button"
											className={featured ? "btn btn-primary" : "btn btn-outline"}
											disabled={!product || busyProduct !== null}
											onClick={() => product && startOrder(product.code)}
										>
											{busyProduct === product?.code ? "建立訂單中…" : `選擇${plan.name_zh}`}
										</button>
									</article>
								);
							})}
						</div>
					)}
				</section>

				<section className="trial-strip" aria-labelledby="trial-heading">
					<h2 id="trial-heading">第一次用？HK$29 試一篇</h2>
					<p>
						每帳戶限購一次，30 日內有效，包含 1 篇完整內容、3 頁大綱及 3 張圖片。
							HK$29 不可重生成；48 小時內升級任何月費或年費方案，會從方案價扣減 HK$29。
					</p>
					<div className="service-actions">
						<button
							type="button"
							className="btn btn-amber"
							disabled={!trialProduct || busyProduct !== null}
							onClick={() => trialProduct && startOrder(trialProduct.code)}
						>
							{busyProduct === trialProduct?.code ? "建立訂單中…" : "購買試用"}
						</button>
					</div>
				</section>

				<section className="credit-panel" aria-labelledby="credits-heading">
					<div className="section-head">
						<div>
							<h2 id="credits-heading">Credits 加購</h2>
							<p>
								1 Credit 可重生成 1 張圖片；5 Credits 可加開 1 篇文章（包含大綱及 3 張圖片，不設免費重生成）。
							</p>
						</div>
						<CreditCard size={28} aria-hidden="true" />
					</div>
					<div className="credit-list">
						{creditProducts.map((product) => (
							<div key={product.code} className="credit-row">
								<div>
									<h3>{product.name_zh}</h3>
									<p>{product.metadata.summary ?? `${product.credits_amount} Credits`}</p>
								</div>
								<strong>{formatHkd(product.price_hkd)}</strong>
								<button
									type="button"
									className="btn btn-outline btn-sm"
									disabled={busyProduct !== null}
									onClick={() => startOrder(product.code)}
								>
									{busyProduct === product.code ? "建立中…" : "購買"}
								</button>
							</div>
						))}
					</div>
				</section>

				{order && (
					<section id="payment" className="payment-panel" aria-labelledby="payment-heading">
						<div className="section-head">
							<div>
								<h2 id="payment-heading">付款資料</h2>
								<p>
									訂單 {order.product_code} · {formatHkd(order.amount_hkd)} · 狀態：
									{order.status === "approved"
										? "已開通"
										: isStripeOrder
											? (STRIPE_STATUS_LABELS[stripeStatus] ?? stripeStatus)
											: "待付款"}
								</p>
							</div>
							<ShieldCheck size={28} aria-hidden="true" />
						</div>
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
									<span>Visa / Mastercard，付款後即時開通</span>
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
										<dd>{order.stripe_checkout_expires_at ? `有效至 ${formatDateTime(order.stripe_checkout_expires_at)}` : "可重新建立"}</dd>
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
										{stripeBusy ? "處理中…" : stripeStatus === "processing" ? "重新檢查付款" : "繼續信用卡付款"}
									</button>
								</div>
								<p className="service-note">
									信用卡由 Stripe 安全處理。付款後如未即時開通，可到帳戶頁重新整理。
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
										<dd>{instructions?.fps_number ?? "—"}</dd>
									</div>
									<div>
										<dt>收款名稱</dt>
										<dd>{instructions?.fps_name ?? "—"}</dd>
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
									<button type="button" className="btn btn-outline btn-sm" onClick={copyReference}>
										{copied ? "已複製參考編號" : "複製付款參考"}
									</button>
									<a className="btn btn-outline btn-sm" href="/account">
										稍後在帳戶上載收據
									</a>
								</div>
								<label className="field">
									<span>上載付款收據（JPG、PNG 或 PDF，最多 10 MB）</span>
									<input
										className="file-input"
										type="file"
										accept="image/jpeg,image/png,application/pdf"
										disabled={uploading || order.status === "approved"}
										onChange={(event) => {
											void handleReceipt(event.target.files?.[0] ?? null);
											event.target.value = "";
										}}
									/>
								</label>
								{uploading && <p className="service-note">上載中…</p>}
								{order.receipt && (
									<p className="notice is-ok">
										已收到收據：{order.receipt.original_name ?? order.receipt.mime_type}。我們會人手核對後開通。
									</p>
								)}
							</>
						)}
					</section>
				)}

				<section className="panel" style={{ marginTop: "2rem" }} aria-labelledby="faq-heading">
					<div className="panel-head">
						<h2 id="faq-heading">常見問題</h2>
					</div>
					<details>
						<summary>會自動續期嗎？</summary>
						<p className="service-note">
							不會。月費及年費都是一次過預付，到期前我們會在站內通知你；到期後有 3 日寬限期。
						</p>
					</details>
					<details>
						<summary>可以中途轉方案嗎？</summary>
						<p className="service-note">
							可以。轉方案會在下一期生效，不設按比例退款；本期未使用的文章不會結轉。
						</p>
					</details>
					<details>
						<summary>未用的文章可以留到下個月嗎？</summary>
						<p className="service-note">不可以。每月額度在該收費期內有效，未用部分不結轉。</p>
					</details>
					<details>
						<summary>付款後多久開通？</summary>
						<p className="service-note">上載收據後由人手核對，一般 1 個工作天內完成。開通後會收到站內通知。</p>
					</details>
				</section>
			</div>
		</ServiceShell>
	);
}
