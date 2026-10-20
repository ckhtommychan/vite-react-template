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

const LAST_UPDATED = "2026 年 10 月 20 日";

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

function PolicyContent({
	kind,
	companyName,
	companyAddress,
	email,
	whatsappLink,
}: LegalPageProps) {
	if (kind === "terms") {
		return (
			<>
				<p>
					本服務條款（下稱「本條款」）適用於 {companyName}（下稱「IDH」或「本公司」）營運的
					idh.asia 網站、課程報名、付款及相關服務。你使用本網站或完成課程報名，即表示你已閱讀並同意本條款。
				</p>
				<p>
					如你不同意本條款，請停止使用本網站或相關服務。如你代表公司或其他機構報名，你確認你有權代表該機構接受本條款。
				</p>

				<h2>1. 服務提供者</h2>
				<p>
					本網站由 {companyName} 營運，提供 AI 教育課程、活動資訊及相關數碼產品資訊。通訊及上課地址為{" "}
					{companyAddress}；聯絡電郵為{" "}
					<a href={`mailto:${email}`}>{email}</a>。
				</p>

				<h2>2. 課程資料及名額</h2>
				<p>
					課程名稱、日期、時間、地點、導師、費用及名額以相關課程頁面或付款頁面所載資料為準。網站內容可能因場地、導師或其他安排而更新，我們會以合理方式通知已報名學員。
				</p>
				<p>
					課程名額以成功付款及 IDH 確認後方為保留。如名額已滿、重複付款或付款出現異常，IDH
					會聯絡你安排退款或轉班。除另有明確說明外，課程費用不包括學員的交通、設備、軟件訂閱或其他個人開支。
				</p>

				<h2>3. 報名、價格及付款</h2>
				<p>
					你須提供準確、完整及最新的報名資料。所有價格均以港幣（HK$）計算，並以結帳或付款頁面顯示為準。IDH
					可透過銀行轉帳、轉數快（FPS）或第三方付款服務供應商收取費用；可用付款方式以付款頁面顯示為準。
				</p>
				<p>
					如使用第三方付款服務，你亦須遵守該服務供應商的條款及政策。IDH 不會要求你透過 WhatsApp、電郵或其他非官方渠道提供完整信用卡號碼、CVV
					或網上銀行密碼。
				</p>

				<h2>4. 取消、改期及退款</h2>
				<p>
					課程取消、改期及退款安排載於<a href="/refund-policy">退款政策</a>。退款政策是本條款的一部分。你完成付款前應先閱讀並確認接受相關安排。
				</p>

				<h2>5. 學員責任及課堂規則</h2>
				<ul>
					<li>你應準時出席，並按課程要求自備手提電腦、軟件帳戶及其他所需設備。</li>
					<li>你不得在課堂或本網站作出違法、騷擾、歧視、威脅、欺詐或侵犯他人權利的行為。</li>
					<li>未經導師或 IDH 事前書面同意，不得錄影、錄音、直播、轉售或向第三方提供課程內容。</li>
					<li>你應自行備份工作成果，並妥善保管自己的帳戶、密碼及裝置。</li>
				</ul>
				<p>
					如學員嚴重違反課堂規則、危害他人安全或影響課堂進行，IDH 可要求該學員離開，並可在合理情況下拒絕退款。
				</p>

				<h2>6. 第三方工具及 AI 輸出</h2>
				<p>
					課程可能介紹 Manus、OpenRouter 或其他第三方 AI 工具。第三方工具的功能、收費、可用性及條款由相關供應商決定，IDH
					不保證第三方服務持續可用，亦不對第三方服務的中斷或資料處理安排負責。
				</p>
				<p>
					AI 生成的內容可能不準確、不完整或帶有偏見。你應自行核實事實、法律、財務、專業及商業資料，不應將 AI
					輸出視為專業意見。你須確保輸入及使用相關內容不會侵犯他人權利或違反適用法律。
				</p>

				<h2>7. 知識產權</h2>
				<p>
					本網站、課程教材、講義、示範、商標、文字、圖像、介面及其他由 IDH
					提供的內容，其知識產權由 IDH 或相關權利人擁有。除非獲得事前書面同意，你只可為個人學習目的使用課程內容，不得複製、改編、分發、公開傳播或作商業用途。
				</p>

				<h2>8. 責任限制</h2>
				<p>
					在法律允許的範圍內，IDH 不對因使用或無法使用本網站、第三方工具或課程內容而引致的間接、附帶或後果性損失負責，包括但不限於業務中斷、資料遺失或利潤損失。
				</p>
				<p>
					本條款不排除或限制 IDH 在法律上不得排除或限制的責任，包括因疏忽導致的人身傷亡責任，亦不影響香港適用法律賦予消費者的強制性權利。如你認為服務未符合適用法律要求，請先聯絡我們處理。
				</p>

				<h2>9. 不可抗力</h2>
				<p>
					如因火災、停電、網絡故障、惡劣天氣、公共衛生事件、政府措施或其他超出合理控制範圍的原因而未能提供服務，IDH
					會盡快通知你，並按實際情況安排改期、轉班或退款。
				</p>

				<h2>10. 條款更新</h2>
				<p>
					IDH 可因服務、法律或營運安排變更而更新本條款。更新後的條款會在本頁發布並列明最後更新日期；如變更對已報名學員有重大影響，我們會以合理方式通知。
				</p>

				<h2>11. 適用法律及聯絡</h2>
				<p>
					本條款受香港特別行政區法律管轄。如你對本條款有任何疑問，請透過以下方式聯絡我們：
				</p>
				<ContactDetails
					companyAddress={companyAddress}
					email={email}
					whatsappLink={whatsappLink}
				/>
			</>
		);
	}

	if (kind === "privacy") {
		return (
			<>
				<p>
					{companyName}（下稱「IDH」或「本公司」）重視你的個人資料私隱。本隱私政策說明我們如何收集、使用、保存、披露及保護你的個人資料，以及你根據《個人資料（私隱）條例》（香港法例第
					486 章）可享有的權利。我們的通訊及上課地址為 {companyAddress}。
				</p>

				<h2>1. 我們收集的資料</h2>
				<p>我們可能因你報名、付款、查詢、訂閱通知或使用本網站而收集以下資料：</p>
				<ul>
					<li>姓名、公司名稱、職位、電郵地址、電話或 WhatsApp 號碼。</li>
					<li>報名課程、上課日期、付款狀態、交易參考編號、退款及客服記錄。</li>
					<li>你主動提供的查詢內容、意見、課堂作品或與我們溝通的記錄。</li>
					<li>網站運作所需的技術資料，例如 IP 位址、瀏覽器類型、裝置資料、訪問時間及錯誤記錄。</li>
				</ul>
				<p>
					一般而言，我們不會直接收集或保存完整信用卡號碼、CVV 或網上銀行密碼。如你透過第三方付款服務付款，付款資料會由該服務供應商按其政策處理。
				</p>

				<h2>2. 收集資料的目的</h2>
				<ul>
					<li>處理課程報名、確認名額、收款、退款及提供收據或交易記錄。</li>
					<li>提供課堂安排、改期、場地、天氣或其他服務通知。</li>
					<li>回覆查詢、處理投訴、提供客戶支援及維持服務記錄。</li>
					<li>防範欺詐、濫用、未經授權交易及保障本網站和用戶安全。</li>
					<li>在你同意的情況下，向你發送課程開班、新產品及相關推廣資訊。</li>
					<li>遵守法律、會計、稅務及監管要求，並處理法律索賠或爭議。</li>
				</ul>

				<h2>3. 直接促銷</h2>
				<p>
					我們只會在取得你的同意後，使用你的電郵地址或電話號碼向你發送課程及產品推廣資訊。你可在訂閱表單選擇不接收，或隨時透過電郵{" "}
					<a href={`mailto:${email}`}>{email}</a> 或 WhatsApp 通知我們取消訂閱。取消訂閱不影響你已購買服務的必要通知。
				</p>

				<h2>4. 披露及資料處理者</h2>
				<p>
					我們不會出售你的個人資料。為提供服務，我們可能向下列類別的第三方披露或委託其處理必要資料：
				</p>
				<ul>
					<li>付款服務供應商及金融機構，用於處理付款、退款、核對交易及防範欺詐。</li>
					<li>網站託管、雲端、網絡、電郵及技術支援服務供應商。</li>
					<li>會計、審計、法律或保險專業顧問，以及依法律要求須向其披露資料的機構。</li>
					<li>在合併、收購、重組或轉讓業務時，按適用法律接收資料的相關方。</li>
				</ul>
				<p>
					部分服務供應商可能位於香港以外地區。我們會要求資料處理者採取適當的保密及安全措施，並只按我們的指示處理資料。
				</p>

				<h2>5. 資料保存</h2>
				<p>
					我們只會在達到收集目的所需期間內保存個人資料。一般而言，交易、付款、退款及相關會計記錄會保存至少
					7 年；課程及客服記錄會按實際需要保存，通常不超過 24
					個月；市場推廣資料會保存至你取消訂閱或提出刪除要求為止。如法律另有要求、正在處理爭議或索賠，保存期可能延長。
				</p>

				<h2>6. 資料安全</h2>
				<p>
					我們會採取合理的技術及管理措施保護個人資料，包括限制存取權限、使用受保護的雲端服務及避免在非必要情況下收集敏感資料。互聯網傳輸無法保證絕對安全；如發生可能影響你的資料外洩，我們會按適用法律及實際風險作出通知和補救。
				</p>

				<h2>7. 你的權利</h2>
				<p>
					根據《個人資料（私隱）條例》，你有權查閱及更正我們持有的你的個人資料。你可透過{" "}
					<a href={`mailto:${email}`}>{email}</a>{" "}
					提出要求。我們可能需要核實你的身份，並可按法律容許收取合理費用。你亦可要求停止接收直接促銷，或在不影響法律及合約責任的前提下要求刪除不再需要的資料。
				</p>
				<p>
					如你認為我們未有妥善處理你的個人資料，可聯絡我們；你亦可向香港個人資料私隱專員公署查詢或投訴。
				</p>

				<h2>8. 兒童及青少年</h2>
				<p>
					本網站及課程主要面向成年人。未滿 18
					歲人士應在父母或監護人同意及陪同下報名。如我們得悉在未經適當同意的情況下收集兒童個人資料，會採取合理步驟刪除。
				</p>

				<h2>9. Cookie 及網站記錄</h2>
				<p>
					本網站可能使用維持網站運作及安全所需的 Cookie 或類似技術，並由網站託管服務產生技術記錄。如我們日後加入分析或廣告
					Cookie，會在本政策更新相關用途及選擇方式。
				</p>

				<h2>10. 政策更新及聯絡</h2>
				<p>
					我們可能因法律、服務或資料處理安排變更而更新本政策，更新版本會在本頁發布。如你對本政策有疑問，請聯絡：
				</p>
				<ContactDetails
					companyAddress={companyAddress}
					email={email}
					whatsappLink={whatsappLink}
				/>
			</>
		);
	}

	return (
		<>
			<p>
				本退款政策由 {companyName}（下稱「IDH」或「本公司」）提供，適用於經 idh.asia
				報名及付款的 IDH 課程。此政策與<a href="/terms">服務條款</a>
				一併適用。我們的通訊及上課地址為 {companyAddress}。我們希望安排清晰，讓你在付款前了解取消、改期及退款方式。
			</p>

			<div className="legal-callout">
				<ShieldCheck size={22} aria-hidden="true" />
				<p>
					如因 IDH 取消課程或無法提供已付款的課堂，我們會安排全額退款，或在你同意的情況下安排轉班。
				</p>
			</div>

			<h2>1. 課程費用及付款確認</h2>
			<p>
				課程費用及可用付款方式以課程頁或付款頁顯示為準。名額只在付款成功並獲 IDH
				確認後保留。如你完成付款但未收到確認，請盡快以電郵或 WhatsApp 聯絡我們，並提供付款日期、金額及交易參考編號。
			</p>

			<h2>2. 由學員提出取消</h2>
			<ul>
				<li>
					<strong>開課前 7 日或以上：</strong>可獲全額退款。退款申請應在課程開始前至少 7
					個日曆日以書面提出。
				</li>
				<li>
					<strong>開課前少於 7 日：</strong>已繳費用一般不可退款。如你因突發疾病、緊急事故或其他特殊情況無法出席，可提供合理證明，我們會按實際情況考慮一次轉班安排。
				</li>
				<li>
					<strong>缺席或遲到：</strong>未通知而缺席，或未能完成已開始的課堂，一般不設退款。
				</li>
			</ul>
			<p>
				上述 7 日期限由課程開始時間起計。所有取消申請以我們收到書面通知的時間為準，請勿僅以口頭或社交平台留言視為正式申請。
			</p>

			<h2>3. 轉班安排</h2>
			<p>
				如你在開課前至少 3 個日曆日提出申請，我們可在名額許可下安排一次轉班。轉班須在原定課程日期起 3
				個月內使用，並以同等或較低價格的課程為限；如轉往價格較高課程，須補付差額。已使用一次轉班安排後，一般不設再次轉班或退款。
			</p>

			<h2>4. 由 IDH 取消或改期</h2>
			<p>
				如 IDH 因導師、場地、惡劣天氣、公共衛生事件、技術故障或其他不可控因素取消或改期，我們會盡快通知你，並提供以下其中一項安排：
			</p>
			<ul>
				<li>安排替代日期或同等工作坊；或</li>
				<li>如你未能出席替代安排，按你已繳但未使用之費用安排全額退款。</li>
			</ul>
			<p>
				如因八號或以上熱帶氣旋警告信號、黑色暴雨警告或政府公布的不適宜上課情況而改期，我們會另行通知替代安排，不會視為學員取消。
			</p>

			<h2>5. 重複付款、錯誤付款及未授權交易</h2>
			<p>
				如你重複付款、支付金額有誤或發現未授權交易，請立即聯絡我們。經核實後，合資格的重複或錯誤付款會退回原付款方式。如涉及銀行或付款服務供應商調查，處理時間可能較長。
			</p>

			<h2>6. 如何申請退款</h2>
			<p>請透過電郵或 WhatsApp 提交退款申請，並提供以下資料：</p>
			<ul>
				<li>報名姓名及聯絡電話或電郵。</li>
				<li>課程名稱、上課日期及訂單或交易參考編號。</li>
				<li>付款日期、金額及付款方式。</li>
				<li>退款原因，以及適用的支持文件（如需要）。</li>
			</ul>
			<ContactDetails
				companyAddress={companyAddress}
				email={email}
				whatsappLink={whatsappLink}
			/>

			<h2>7. 退款方式及處理時間</h2>
			<p>
				經批准的退款一般會退回原付款方式；如原付款方式不可用，我們會與你商議其他合理安排。我們會在批准退款後
				10 個營業日內安排退款，實際到帳時間視乎銀行或付款服務供應商而定，通常可能需額外 5 至 10
				個營業日。跨境付款或金融機構審查可能令處理時間延長。
			</p>
			<p>
				如以轉數快（FPS）付款，退款將按你提供的收款資料處理。你應確保資料準確；因資料錯誤而產生的銀行費用或損失，會在適用法律允許範圍內由你承擔。
			</p>

			<h2>8. 不可退款的情況</h2>
			<p>
				除法律另有規定或本政策另有說明外，以下情況一般不設退款：已完成的課程；已開始而學員自行中途離場的課程；因學員設備、網絡或第三方軟件問題而未能參與；以及學員嚴重違反課堂規則而被要求離開。
			</p>

			<h2>9. 消費者權利</h2>
			<p>
				本政策不排除或限制香港適用法律賦予消費者的強制性權利。如你對退款安排有疑問或爭議，請先聯絡我們；我們會以善意及合理方式處理。
			</p>

			<h2>10. 政策更新</h2>
			<p>
				我們可能因課程安排、付款方式或法律要求更新本政策。更新版本會在本頁發布，並列明最後更新日期。對已完成的交易，原則上適用交易時所顯示的政策，除非法律另有要求。
			</p>
		</>
	);
}

const pageMeta = {
	terms: {
		kicker: "法律文件",
		title: "服務條款",
		description: "IDH 網站、課程報名、付款及相關服務的使用條款。",
	},
	privacy: {
		kicker: "個人資料",
		title: "隱私政策",
		description: "了解 IDH 如何收集、使用、保存及保護你的個人資料。",
	},
	refund: {
		kicker: "付款與取消",
		title: "退款政策",
		description: "IDH 課程的付款確認、取消、轉班及退款安排。",
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
