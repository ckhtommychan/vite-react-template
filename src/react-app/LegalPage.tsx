import {
	ArrowLeft,
	ArrowUpRight,
	CheckCircle2,
	Mail,
	MapPin,
	MessageCircle,
	ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";

export type LegalPageKind = "terms" | "privacy" | "refund";

type LegalPageProps = {
	kind: LegalPageKind;
	companyName: string;
	companyAddress: string;
	email: string;
	whatsappLink: string;
};

const LAST_UPDATED = "2026 年 10 月 21 日";

const legalLinks = [
	{ href: "/terms", label: "服務條款" },
	{ href: "/privacy-policy", label: "隱私政策" },
	{ href: "/refund-policy", label: "退款政策" },
];

function ContactDetails({
	companyAddress,
	email,
	whatsappLink,
}: Pick<LegalPageProps, "companyAddress" | "email" | "whatsappLink">) {
	return (
		<ul className="legal-contact-list">
			<li>
				<MapPin size={18} aria-hidden="true" />
				<span>{companyAddress}</span>
			</li>
			<li>
				<Mail size={18} aria-hidden="true" />
				<a href={`mailto:${email}`}>{email}</a>
			</li>
			<li>
				<MessageCircle size={18} aria-hidden="true" />
				<a href={whatsappLink} target="_blank" rel="noreferrer">
					WhatsApp 9482 8587
				</a>
			</li>
		</ul>
	);
}

function TermsContent({
	companyName,
	companyAddress,
	email,
	whatsappLink,
}: LegalPageProps) {
	return (
		<>
			<p>
				本服務條款（下稱「本條款」）適用於 {companyName}（下稱「IDH」或「本公司」）營運的
				idh.asia 網站、RedPen AI 內容生成服務、訂閱方案、體驗方案、Credits、付款及相關服務。
				你使用本網站、登入帳戶或購買服務，即表示你已閱讀並同意本條款。
			</p>
			<p>
				如你不同意本條款，請停止使用相關服務。如你代表公司或其他機構使用服務，你確認你有權代表該機構接受本條款。
			</p>

			<h2>1. 服務提供者</h2>
			<p>
				本網站及 RedPen 服務由 {companyName} 營運。通訊地址為 {companyAddress}；聯絡電郵為{" "}
				<a href={`mailto:${email}`}>{email}</a>。
			</p>

			<h2>2. 帳戶及 Google 登入</h2>
			<p>
				idh.asia 使用 Google 帳戶及 Firebase Authentication 作為登入服務。你授權我們讀取 Firebase
				提供的帳戶識別碼（UID）、電郵地址及顯示名稱，以建立及識別你的 IDH／RedPen 帳戶。
			</p>
			<ul>
				<li>你應提供及保持準確的帳戶資料，並妥善保管 Google 帳戶及裝置。</li>
				<li>你不得轉讓、出售或與他人共用帳戶，亦不得以他人身份登入。</li>
				<li>如你發現未經授權使用，請立即通知我們並按 Google 建議保護帳戶。</li>
			</ul>

			<h2>3. 方案及每月額度</h2>
			<p>
				所有方案均以每月固定文章額度計，每篇文章包括 3 頁大綱及 3 張圖片。價格以港幣（HK$）計算，並以付款頁面顯示為準。
			</p>
			<ul>
				<li>
					<strong>Starter：</strong>HK$188／月或 HK$1,888／年；每月 8 篇；每篇 0 次免費重生成；內容保存 90 日。
				</li>
				<li>
					<strong>Growth：</strong>HK$388／月或 HK$3,888／年；每月 20 篇；每篇 3 次免費重生成；內容保存 365 日。
				</li>
				<li>
					<strong>Business：</strong>HK$548／月或 HK$5,488／年；每月 30 篇；每篇 3 次免費重生成；內容保存 730 日。
				</li>
				<li>
					<strong>未訂閱：</strong>每月 0 篇；未訂閱帳戶的內容保存 7 日。
				</li>
			</ul>
			<p>
				年費方案為一次過預付 12 個月。每月額度只在相關收費期內有效，未使用的文章不結轉至下一期。
			</p>

			<h2>4. HK$29 體驗方案</h2>
			<ul>
				<li>每個 Firebase UID 只可購買一次，提供 1 篇完整內容，包括 3 頁大綱及 3 張圖片。</li>
				<li>體驗額度須於開通後 30 日內使用，不包含圖片重生成。</li>
				<li>於開通後 48 小時內升級任何月費或年費方案，可扣減 HK$29。</li>
				<li>體驗方案不可退款，亦不可兌換現金或轉讓。</li>
			</ul>

			<h2>5. Credits</h2>
			<ul>
				<li>10 Credits：HK$40；30 Credits：HK$120；100 Credits：HK$400。</li>
				<li>1 Credit 可兌換 1 次圖片重生成。</li>
				<li>5 Credits 可兌換 1 篇額外文章，包括 3 頁大綱及 3 張圖片，不包含免費重生成。</li>
				<li>Credits 屬預付服務額度，不可兌換現金、不可轉讓，亦不獲利息。</li>
				<li>Credits 只可用於本服務指定的功能；實際扣除以系統記錄為準。</li>
			</ul>

			<h2>6. 訂單、付款及開通</h2>
			<p>
				現階段支援轉數快（FPS）或銀行轉帳。你須按付款頁顯示的金額及付款參考編號付款，並上載
				JPG、PNG 或 PDF 收據（每個檔案最多 10 MB）。訂單須經人手核對，一般於 1 個工作天內處理。
			</p>
			<ul>
				<li>付款完成不代表服務已即時開通；只有經我們確認的訂單方會生效。</li>
				<li>如收據不清晰、金額不符或付款參考錯誤，我們可要求補交資料或拒絕該訂單。</li>
				<li>請勿透過 WhatsApp、電郵或其他非官方渠道提供完整信用卡號碼、CVV 或網上銀行密碼。</li>
			</ul>

			<h2>7. 收費期、續期及轉方案</h2>
			<ul>
				<li>月費及年費均為一次過預付，不會自動續期或自動扣款。</li>
				<li>收費期屆滿後設 3 日寬限期；寬限期後，新文章生成及相關方案功能會暫停。</li>
				<li>轉方案會在下一收費期生效，不設按比例退款或差額回贈。</li>
				<li>本期未使用的文章額度不會結轉至下一期。</li>
			</ul>

			<h2>8. 你的內容及 AI 輸出</h2>
			<p>
				你須確保輸入內容、參考圖片及指令合法，且不會侵犯他人知識產權、私隱或其他權利。AI
				生成的內容可能不準確、不完整或帶有偏見；你應自行核實事實、法律、財務、專業及商業資料，不應將輸出視為專業意見。
			</p>
			<p>
				你不得使用本服務製作違法、欺詐、騷擾、歧視、惡意冒充、侵犯他人權利或危害他人安全的內容。我們可按合理理由限制或終止相關使用。
			</p>

			<h2>9. 第三方服務</h2>
			<p>
				本服務可能使用 Google、Firebase、Supabase、AI 模型供應商、圖片生成服務或其他第三方工具。第三方服務的功能、收費、可用性及條款由相關供應商決定；我們不保證第三方服務持續可用。
			</p>

			<h2>10. 知識產權</h2>
			<p>
				本網站、軟件、商標、介面、設計及由 IDH 提供的內容，其知識產權由 IDH 或相關權利人擁有。除非獲得事前書面同意，你不得複製、改編、分發、公開傳播或作商業用途使用本服務的軟件或非你所有的內容。
			</p>

			<h2>11. 服務可用性及責任限制</h2>
			<p>
				我們會以合理努力維持服務穩定，但不保證服務完全無錯誤、不中斷或符合你的特定目的。如因維護、網絡、第三方服務、停電、自然災害或其他超出合理控制範圍的原因而中斷，我們會按實際情況盡快處理。
			</p>
			<p>
				在法律允許的範圍內，IDH 不對間接、附帶或後果性損失負責，包括業務中斷、資料遺失或利潤損失。本條款不排除或限制香港法律不得排除或限制的責任，亦不影響消費者的強制性權利。
			</p>

			<h2>12. 暫停及終止</h2>
			<p>
				如你嚴重違反本條款、涉及欺詐、未經授權交易、濫用服務或危害他人，我們可暫停或終止你的帳戶及相關服務。法律允許範圍內，已使用的服務及已消耗的額度一般不會恢復。
			</p>

			<h2>13. 條款更新、適用法律及聯絡</h2>
			<p>
				我們可因服務、法律或營運安排變更而更新本條款，更新版本會在本頁發布並列明最後更新日期。本條款受香港特別行政區法律管轄。如你對本條款有任何疑問，請聯絡：
			</p>
			<ContactDetails
				companyAddress={companyAddress}
				email={email}
				whatsappLink={whatsappLink}
			/>
		</>
	);
}

function PrivacyContent({
	companyName,
	companyAddress,
	email,
	whatsappLink,
}: LegalPageProps) {
	return (
		<>
			<p>
				{companyName}（下稱「IDH」或「本公司」）重視你的個人資料私隱。本隱私政策說明我們如何收集、使用、保存、披露及保護你的個人資料，以及你根據《個人資料（私隱）條例》（香港法例第
				486 章）可享有的權利。我們的通訊地址為 {companyAddress}。
			</p>

			<h2>1. 我們收集的資料</h2>
			<p>我們可能因你登入、購買服務、付款、查詢或使用 RedPen 而收集以下資料：</p>
			<ul>
				<li>Google／Firebase 帳戶識別碼（UID）、電郵地址、顯示名稱及登入狀態。</li>
				<li>訂閱方案、收費期、文章額度、Trial、Credits 餘額、訂單、付款狀態及交易參考編號。</li>
				<li>你上載的付款收據、付款參考、退款及客服記錄。</li>
				<li>RedPen 生成記錄、文章主題、圖片數量、重生成次數、保存期限及用量資料。</li>
				<li>你主動提供的查詢內容、意見或與我們溝通的記錄。</li>
				<li>網站運作所需的技術資料，例如 IP 位址、瀏覽器類型、裝置資料、訪問時間及錯誤記錄。</li>
			</ul>
			<p>
				一般而言，我們不會直接收集或保存完整信用卡號碼、CVV 或網上銀行密碼。如你透過第三方付款服務付款，付款資料會由該服務供應商按其政策處理。
			</p>

			<h2>2. 收集資料的目的</h2>
			<ul>
				<li>建立及管理你的 IDH／RedPen 帳戶，識別登入身份及提供服務。</li>
				<li>處理訂單、收款、收據審核、開通方案、分配文章額度及管理 Credits。</li>
				<li>顯示訂閱狀態、用量、保存期限、付款記錄及服務通知。</li>
				<li>回覆查詢、處理投訴、提供客戶支援及維持服務記錄。</li>
				<li>防範欺詐、濫用、未經授權交易及保障本網站和用戶安全。</li>
				<li>在你同意的情況下，向你發送課程開班、新產品及相關推廣資訊。</li>
				<li>遵守法律、會計、稅務及監管要求，並處理法律索賠或爭議。</li>
			</ul>

			<h2>3. 付款收據及存取控制</h2>
			<p>
				你上載的付款收據會存放於私人 Storage Bucket，只供你及經授權的 IDH 管理人員按審核需要存取。我們會以短暫有效的簽署連結查看收據，不會將收據設為公開檔案。
			</p>

			<h2>4. 直接促銷</h2>
			<p>
				我們只會在取得你的同意後，使用你的電郵地址或電話號碼向你發送課程及產品推廣資訊。你可在訂閱表單選擇不接收，或隨時透過電郵{" "}
				<a href={`mailto:${email}`}>{email}</a> 或 WhatsApp 通知我們取消訂閱。取消訂閱不影響你已購買服務的必要通知。
			</p>

			<h2>5. 披露及資料處理者</h2>
			<p>我們不會出售你的個人資料。為提供服務，我們可能向下列類別的第三方披露或委託其處理必要資料：</p>
			<ul>
				<li>Google／Firebase，用於登入及身份驗證。</li>
				<li>Supabase 或其他雲端資料庫及 Storage 供應商，用於保存帳戶、訂單、用量及收據。</li>
				<li>付款服務供應商及金融機構，用於處理付款、退款、核對交易及防範欺詐。</li>
				<li>AI 模型、圖片生成、網站託管、網絡、電郵及技術支援服務供應商。</li>
				<li>會計、審計、法律或保險專業顧問，以及依法律要求須向其披露資料的機構。</li>
				<li>在合併、收購、重組或轉讓業務時，按適用法律接收資料的相關方。</li>
			</ul>
			<p>
				部分服務供應商可能位於香港以外地區。我們會要求資料處理者採取適當的保密及安全措施，並只按我們的指示處理資料。
			</p>

			<h2>6. 資料保存</h2>
			<p>
				我們只會在達到收集目的所需期間內保存個人資料。一般而言，交易、付款、退款及相關會計記錄會保存至少
				7 年；生成內容及用量會按你所屬方案的保存期限處理；帳戶及客服記錄會按實際需要保存。如法律另有要求、正在處理爭議或索賠，保存期可能延長。
			</p>

			<h2>7. 資料安全</h2>
			<p>
				我們會採取合理的技術及管理措施保護個人資料，包括限制存取權限、使用受保護的雲端服務、私人收據儲存及避免在非必要情況下收集敏感資料。互聯網傳輸無法保證絕對安全；如發生可能影響你的資料外洩，我們會按適用法律及實際風險作出通知和補救。
			</p>

			<h2>8. 你的權利</h2>
			<p>
				根據《個人資料（私隱）條例》，你有權查閱及更正我們持有的你的個人資料。你可透過{" "}
				<a href={`mailto:${email}`}>{email}</a>{" "}
				提出要求。我們可能需要核實你的身份，並可按法律容許收取合理費用。你亦可要求停止接收直接促銷，或在不影響法律及合約責任的前提下要求刪除不再需要的資料。
			</p>
			<p>
				如你認為我們未有妥善處理你的個人資料，可聯絡我們；你亦可向香港個人資料私隱專員公署查詢或投訴。
			</p>

			<h2>9. 兒童及青少年</h2>
			<p>
				本網站及服務主要面向成年人。未滿 18 歲人士應在父母或監護人同意及陪同下使用收費服務。如我們得悉在未經適當同意的情況下收集兒童個人資料，會採取合理步驟刪除。
			</p>

			<h2>10. Cookie、政策更新及聯絡</h2>
			<p>
				本網站可能使用維持登入、運作及安全所需的 Cookie 或類似技術，並由網站託管服務產生技術記錄。如我們日後加入分析或廣告
				Cookie，會在本政策更新相關用途及選擇方式。我們可能因法律、服務或資料處理安排變更而更新本政策，更新版本會在本頁發布。
			</p>
			<ContactDetails
				companyAddress={companyAddress}
				email={email}
				whatsappLink={whatsappLink}
			/>
		</>
	);
}

function RefundContent({
	companyName,
	companyAddress,
	email,
	whatsappLink,
}: LegalPageProps) {
	return (
		<>
			<p>
				本退款政策由 {companyName}（下稱「IDH」或「本公司」）提供，適用於經 idh.asia
				購買的 RedPen 訂閱、HK$29 體驗方案及 Credits。此政策與
				<a href="/terms">服務條款</a>一併適用。我們的通訊地址為 {companyAddress}。
			</p>

			<div className="legal-callout">
				<ShieldCheck size={22} aria-hidden="true" />
				<p>
					<strong>法律覆核提示：</strong>訂閱及 Credits 的個別退款、冷靜期及特殊情況安排仍待法律覆核。正式收費前會更新本頁；在此之前，請於付款前向我們查詢。以下條文不限制香港法律賦予消費者的強制性權利。
				</p>
			</div>

			<h2>1. 付款確認及開通</h2>
			<p>
				所有訂單須經人手核對收據後方可開通。如你已完成付款但未收到確認，請盡快以電郵或 WhatsApp
				聯絡我們，並提供付款日期、金額、付款參考編號及收據。
			</p>

			<h2>2. 重複付款、錯誤付款及未授權交易</h2>
			<p>
				如你重複付款、支付金額有誤或發現未授權交易，請立即聯絡我們。經核實後，合資格的重複或錯誤付款會安排更正或退回相關款項。如涉及銀行或付款服務供應商調查，處理時間可能較長。
			</p>

			<h2>3. HK$29 體驗方案</h2>
			<p>
				體驗方案一經付款及開通，即不可退款、不可兌換現金或轉讓。於開通後 48 小時內升級任何月費或年費方案，可按已確認規則扣減
				HK$29。
			</p>

			<h2>4. 訂閱方案及 Credits</h2>
			<p>
				月費、年費及 Credits 屬預付服務。由於相關退款、冷靜期及已使用額度的處理安排仍在法律覆核中，本頁現階段不就個別情況作出承諾。我們會按適用法律、交易資料及實際情況處理每宗申請，並在正式收費前公布更新版本。
			</p>
			<p>
				如你認為收費有誤、服務未按確認內容開通，或你因特殊情況需要申請退款，請先聯絡我們。我們會以善意及合理方式處理，並保留香港法律賦予你的強制性權利。
			</p>

			<h2>5. 如何申請退款</h2>
			<p>請透過電郵或 WhatsApp 提交申請，並提供以下資料：</p>
			<ul>
				<li>帳戶姓名及 Google 登入電郵。</li>
				<li>產品名稱、方案或 Credits 數量。</li>
				<li>訂單編號、付款參考編號、付款日期及金額。</li>
				<li>退款原因，以及適用的支持文件（如需要）。</li>
			</ul>
			<ContactDetails
				companyAddress={companyAddress}
				email={email}
				whatsappLink={whatsappLink}
			/>

			<h2>6. 退款方式及處理時間</h2>
			<p>
				經批准的退款一般會退回原付款方式；如原付款方式不可用，我們會與你商議其他合理安排。實際到帳時間視乎銀行或付款服務供應商而定。如以轉數快（FPS）付款，退款將按你提供的收款資料處理；你應確保資料準確。
			</p>

			<h2>7. 消費者權利及政策更新</h2>
			<p>
				本政策不排除或限制香港適用法律賦予消費者的強制性權利。我們可能因法律、付款方式或服務安排更新本政策；更新版本會在本頁發布，並列明最後更新日期。
			</p>
		</>
	);
}

function PolicyContent(props: LegalPageProps) {
	if (props.kind === "terms") return <TermsContent {...props} />;
	if (props.kind === "privacy") return <PrivacyContent {...props} />;
	return <RefundContent {...props} />;
}

const pageMeta = {
	terms: {
		kicker: "法律文件",
		title: "服務條款",
		description: "RedPen 訂閱、體驗方案、Credits、付款及帳戶使用條款。",
	},
	privacy: {
		kicker: "個人資料",
		title: "隱私政策",
		description: "了解 IDH 如何處理登入、訂閱、付款收據及用量資料。",
	},
	refund: {
		kicker: "付款與退款",
		title: "退款政策",
		description: "RedPen 訂閱、體驗方案及 Credits 的付款與退款安排。",
	},
} satisfies Record<LegalPageKind, { kicker: string; title: string; description: string }>;

export default function LegalPage(props: LegalPageProps) {
	const meta = pageMeta[props.kind];

	useEffect(() => {
		document.title = `${meta.title}｜IDH`;
	}, [meta.title]);

	return (
		<div className="legal-page">
			<header className="legal-header">
				<div className="wrap legal-header-inner">
					<a className="brand" href="/" aria-label="返回 IDH 首頁">
						<span className="brand-mark" aria-hidden="true">
							IDH
						</span>
						<span className="brand-text">
							<span className="brand-name">IDH</span>
							<span className="brand-sub">香港 AI 教育與產品</span>
						</span>
					</a>
					<a className="legal-back" href="/">
						<ArrowLeft size={17} />
						返回首頁
					</a>
				</div>
			</header>

			<main className="legal-main">
				<div className="wrap legal-layout">
					<aside className="legal-aside">
						<span className="kicker">{meta.kicker}</span>
						<h1>{meta.title}</h1>
						<p>{meta.description}</p>
						<div className="legal-meta">
							<CheckCircle2 size={17} aria-hidden="true" />
							<span>最後更新：{LAST_UPDATED}</span>
						</div>
						<nav className="legal-nav" aria-label="法律文件">
							{legalLinks.map((link) => (
								<a
									key={link.href}
									href={link.href}
									aria-current={link.href === window.location.pathname ? "page" : undefined}
								>
									{link.label}
									<ArrowUpRight size={15} aria-hidden="true" />
								</a>
							))}
						</nav>
					</aside>

					<article className="legal-document">
						<PolicyContent {...props} />
					</article>
				</div>
			</main>

			<footer className="legal-footer">
				<div className="wrap legal-footer-inner">
					<p>
						© {new Date().getFullYear()} {props.companyName}. 保留所有權利。
					</p>
					<div>
						{legalLinks.map((link) => (
							<a key={link.href} href={link.href}>
								{link.label}
							</a>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}
