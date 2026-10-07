import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
	ArrowRight,
	ArrowUpRight,
	Building2,
	Calendar,
	Calculator,
	Check,
	ChevronDown,
	Clock,
	Copy,
	Download,
	FileText,
	Globe,
	GraduationCap,
	Layers,
	MapPin,
	Menu,
	MessageCircle,
	MonitorSmartphone,
	Palette,
	Scale,
	Send,
	Sparkles,
	Users,
	X,
} from "lucide-react";
import "./App.css";

const WHATSAPP_NUMBER = "85294828587";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
	"你好，我想報名 Manus AI 一日工作坊，想了解下一班仲有冇位。",
)}`;
const VENUE = "九龍觀塘巧明街 95 號 世達中心 18 樓 F 室";
// 中環課室預計即將開幕，現時所有課堂仍在觀塘課室進行
const VENUE_CENTRAL = "香港中環（選址進行中，開幕後公布詳細地址）";

const locations = [
	{
		icon: MapPin,
		name: "觀塘課室",
		area: "九龍東",
		status: "現正開班",
		tone: "open",
		address: VENUE,
		note: "現時所有課堂均在此進行。位於觀塘商貿區，鄰近觀塘港鐵站。",
		image: "/images/classroom-kwun-tong.jpg",
		imageAlt: "香港工商區街道與高樓，行人熙來攘往",
	},
	{
		icon: Building2,
		name: "中環課室",
		area: "香港島",
		status: "即將開幕",
		tone: "new",
		address: VENUE_CENTRAL,
		note: "中環核心地段，港鐵中環站步行可達。預計即將開放，開幕後會在此公布地址與首班日期。",
		image: "/images/classroom-central.jpg",
		imageAlt: "香港島商業區夜景，電車路軌與高樓燈光",
	},
	{
		icon: Sparkles,
		name: "更多地點",
		area: "籌備中",
		status: "陸續開放",
		tone: "soon",
		address: "新界及港島其他地區的課室正在籌備中",
		note: "想第一時間知道新課室與新班期，可以留低電郵或者直接 WhatsApp 我們。",
		image: "/images/classroom-more.jpg",
		imageAlt: "維多利亞港兩岸的城市天際線全景",
	},
];

const upcomingCourses = [
	{
		icon: Calculator,
		title: "AI+ 會計",
		text: "用 AI 整理單據、對帳與報表，把重複工序自動化，將時間留給判斷。",
		image: "/images/aiplus-accounting.jpg",
		imageAlt: "桌面上的計算機、財務報表與筆記型電腦",
	},
	{
		icon: Scale,
		title: "AI+ 法律",
		text: "合約條款比對、風險點標示與案例檢索，讓 AI 先做第一輪整理。",
		image: "/images/aiplus-legal.jpg",
		imageAlt: "手持天秤的正義女神雕像",
	},
	{
		icon: Palette,
		title: "AI+ 設計",
		text: "由概念草圖到成稿素材，用 AI 加快提案與版本迭代。",
		image: "/images/aiplus-design.jpg",
		imageAlt: "設計師桌面上的色票、繪圖板與筆記型電腦",
	},
];

const highlights = [
	{
		icon: Users,
		title: "小班教學（限額 6 人）",
		text: "導師可以逐個跟進，唔會坐足兩小時都未郁過手。",
	},
	{
		icon: MonitorSmartphone,
		title: "全程實戰操作",
		text: "請自備手提電腦，課堂以實戰為主，邊學邊做。",
	},
	{
		icon: GraduationCap,
		title: "零基礎可參加",
		text: "中小企老闆、管理層、行政人員到初學者都跟得上。",
	},
	{
		icon: Sparkles,
		title: "優惠價 HK$600",
		text: "兩小時掌握 AI Agent 點樣改變你嘅工作模式。",
	},
];

const courseDetails = [
	{ icon: Calendar, label: "開班日期", value: "10月6、20、27日（星期二）" },
	{ icon: Clock, label: "時間", value: "下午 3:00 – 5:00" },
	{ icon: Users, label: "名額", value: "小班教學（限額 6 人）" },
	{ icon: GraduationCap, label: "講者", value: "Peter So、Aiden Lam" },
];

const usages = [
	{
		title: "學識寫 Prompt",
		text: "讓 AI 更準確完成你的要求，唔再問十次都唔中。",
	},
	{
		title: "用 AI 快速製作專業簡報（PPT）",
		text: "由大綱到內容一次過搞定，提升簡報效率與質素。",
	},
	{
		title: "用 AI 生成圖片內容",
		text: "快速製作海報、社交媒體素材，唔需要設計底子。",
	},
];

const audiences = [
	"中小企老闆／創業人士",
	"管理層及行政人員",
	"想提升工作效率人士",
	"想學 AI 的初學者",
];

const redpenFeatures = [
	{ icon: FileText, text: "AI 生成可編輯大綱" },
	{ icon: Palette, text: "逐頁配圖與參考圖風格對齊" },
	{ icon: Sparkles, text: "AI 文案撰寫" },
	{ icon: Globe, text: "支援 10 種輸出語言" },
	{ icon: Layers, text: "完成後一鍵打包下載" },
	{ icon: Download, text: "內建點數制，用量一目了然" },
];

const navLinks = [
	{ href: "#course", label: "課程" },
	{ href: "#upcoming", label: "AI+ 系列" },
	{ href: "#locations", label: "課室地點" },
	{ href: "#redpen", label: "RedPen" },
	{ href: "#about", label: "關於 IDH" },
	{ href: "#contact", label: "聯絡我們" },
];

function App() {
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(false), 2000);
		return () => window.clearTimeout(timer);
	}, [copied]);

	async function copyVenue() {
		try {
			await navigator.clipboard.writeText(VENUE);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	}

	async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!email.trim()) return;

		setStatus("sending");
		try {
			const response = await fetch("/api/subscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			if (!response.ok) throw new Error("Subscription failed");
			setStatus("done");
			setEmail("");
		} catch {
			setStatus("error");
		}
	}

	return (
		<div className="page">
			<header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
				<div className="wrap header-inner">
					<a className="brand" href="#top" aria-label="IDH 首頁">
						<span className="brand-mark" aria-hidden="true">
							IDH
						</span>
						<span className="brand-text">
							<span className="brand-name">IDH</span>
							<span className="brand-sub">香港 AI 教育與產品</span>
						</span>
					</a>

					<nav className="nav" aria-label="主要導覽">
						{navLinks.map((link) => (
							<a key={link.href} href={link.href}>
								{link.label}
							</a>
						))}
					</nav>

					<div className="header-actions">
						<a
							className="btn btn-primary btn-sm"
							href={WHATSAPP_LINK}
							target="_blank"
							rel="noreferrer"
						>
							<MessageCircle size={17} />
							立即報名
						</a>
						<button
							type="button"
							className="menu-btn"
							aria-expanded={menuOpen}
							aria-label={menuOpen ? "關閉選單" : "開啟選單"}
							onClick={() => setMenuOpen((open) => !open)}
						>
							{menuOpen ? <X size={20} /> : <Menu size={20} />}
						</button>
					</div>
				</div>

				<div className={`mobile-nav${menuOpen ? " is-open" : ""}`}>
					{navLinks.map((link) => (
						<a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
							{link.label}
						</a>
					))}
				</div>
			</header>

			<main id="top">
				<section className="hero">
					<div className="hero-media">
						<img
							src="/images/hero-kwun-tong.jpg"
							alt="觀塘海濱夜景，鄰近 IDH 課室所在的觀塘商貿區"
						/>
					</div>
					<div className="wrap hero-inner">
						<span className="eyebrow">IDH · 香港 AI 教育與產品</span>
						<h1>
							用 AI 不只是提問，
							<br />
							<strong>而是真正幫你完成工作。</strong>
						</h1>
						<p className="hero-lede">
							IDH 是香港的 AI 教育與產品團隊。我們開辦小班實戰工作坊，教你在日常工作用 AI
							完成研究、簡報與內容製作；同時親手開發 AI 工具，最新推出的是 RedPen。
						</p>
						<div className="hero-actions">
							<a
								className="btn btn-amber"
								href={WHATSAPP_LINK}
								target="_blank"
								rel="noreferrer"
							>
								<MessageCircle size={18} />
								報名 Manus AI 工作坊
							</a>
							<a className="btn btn-ghost" href="#redpen">
								了解 RedPen
								<ArrowRight size={18} />
							</a>
						</div>
						<ul className="hero-points">
							<li>
								<Check size={16} aria-hidden="true" />
								小班教學，限額 6 人
							</li>
							<li>
								<Check size={16} aria-hidden="true" />
								2 小時實戰操作
							</li>
							<li>
								<Check size={16} aria-hidden="true" />
								零基礎可參加
							</li>
						</ul>
						<a className="scroll-cue" href="#course">
							<ChevronDown size={16} />
							睇課程詳情
						</a>
					</div>
				</section>

				<section className="highlights" aria-label="IDH 特點">
					<div className="wrap">
						<div className="highlight-grid">
							{highlights.map((item) => (
								<div className="highlight" key={item.title}>
									<span className="highlight-icon" aria-hidden="true">
										<item.icon size={20} />
									</span>
									<div>
										<strong>{item.title}</strong>
										<p>{item.text}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="section" id="course">
					<div className="wrap">
						<div className="course-grid">
							<div className="poster">
								<img
									src="/images/idh-academy-manus.jpg"
									alt="IDH Academy Manus AI 一日工作坊課程海報"
									width={1000}
									height={1413}
								/>
							</div>

							<div>
								<span className="kicker">IDH ACADEMY · AI 教育</span>
								<h2 className="course-title">Manus AI 一日工作坊</h2>
								<p className="course-sub">
									學識利用 Manus 自動完成研究、簡報、資料整理及工作流程，提升工作效率。
								</p>
								<p className="course-text">
									兩小時內，你會由「識用 AI」進到「用 AI 幫你工作」。課堂以實戰操作為主，唔講空泛理論，落堂就可以直接用返自己嘅工作。
								</p>

								<dl className="detail-grid">
									{courseDetails.map((item) => (
										<div className="detail" key={item.label}>
											<item.icon size={19} aria-hidden="true" />
											<div>
												<dt>{item.label}</dt>
												<dd>{item.value}</dd>
											</div>
										</div>
									))}
									<div className="detail">
										<MapPin size={19} aria-hidden="true" />
										<div>
											<dt>地點</dt>
											<dd>觀塘課室（中環課室即將開幕）</dd>
										</div>
									</div>
								</dl>

								<div className="price-row">
									<span className="price">
										<strong>HK$600</strong>
										<span>/ 一位（優惠價）</span>
									</span>
									<a
										className="btn btn-primary"
										href={WHATSAPP_LINK}
										target="_blank"
										rel="noreferrer"
									>
										<MessageCircle size={18} />
										WhatsApp 報名
									</a>
									<button type="button" className="btn btn-outline" onClick={copyVenue}>
										<Copy size={17} />
										複製地址
									</button>
								</div>
								<p className="info-note">
									名額有限，先到先得。中環課室即將開幕，屆時會增設中環班。請自備手提電腦參與課堂。付款可用 FPS
									轉數快，付款後截圖 WhatsApp 傳送到 9482 8587。
								</p>
							</div>
						</div>

						<div className="info-cards">
							<div className="info-card">
								<h3>落堂後立即用得著的 3 大 AI 用法</h3>
								<ol className="usage-list">
									{usages.map((item, index) => (
										<li key={item.title}>
											<span className="usage-num">{index + 1}</span>
											<div>
												<strong>{item.title}</strong>
												<p>{item.text}</p>
											</div>
										</li>
									))}
								</ol>
							</div>
							<div className="info-card">
								<h3>適合對象</h3>
								<ul className="tags">
									{audiences.map((item) => (
										<li className="tag" key={item}>
											{item}
										</li>
									))}
								</ul>
								<p className="info-note">
									零基礎可參加。我們會由最基本開始，逐步帶你完成一個真實的工作任務。
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="section section-white" id="locations">
					<div className="wrap">
						<div className="section-head">
							<span className="kicker">課室地點</span>
							<h2 className="section-title">觀塘課室現正開班，中環課室即將開幕</h2>
							<p className="section-lede">
								現時所有課堂都在觀塘課室進行。中環課室預計即將開放，新界及港島其他地區的新課室亦在籌備當中，一有消息就會在這裡公布。
							</p>
						</div>

						<div className="location-grid">
							{locations.map((item) => (
								<article className="location-card" key={item.name}>
									<div className="location-cover">
										<img
											src={item.image}
											alt={item.imageAlt}
											width={1200}
											height={750}
											loading="lazy"
										/>
										<span className={`location-badge is-${item.tone}`}>
											{item.status}
										</span>
									</div>
									<div className="location-body">
										<span className="location-icon" aria-hidden="true">
											<item.icon size={20} />
										</span>
										<h3>{item.name}</h3>
										<span className="location-area">{item.area}</span>
										<p className="location-address">{item.address}</p>
										<p className="location-note">{item.note}</p>
									</div>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="section upcoming-section" id="upcoming">
					<div className="wrap">
						<div className="section-head">
							<span className="kicker">AI+ 系列 · 即將推出</span>
							<h2 className="section-title">把同一套 AI 實戰方法，帶到你的專業</h2>
							<p className="section-lede">
								除了 Manus AI 工作坊，我們正籌備一系列「AI+」課程，用你行業真實的工作場景做練習。以下主題的課綱與開班日期仍在籌備中。
							</p>
						</div>

						<div className="upcoming-grid">
							{upcomingCourses.map((course) => (
								<article className="upcoming-card" key={course.title}>
									<div className="upcoming-cover">
										<img
											src={course.image}
											alt={course.imageAlt}
											width={800}
											height={500}
											loading="lazy"
										/>
										<span className="upcoming-badge">即將推出</span>
									</div>
									<div className="upcoming-body">
										<span className="upcoming-icon" aria-hidden="true">
											<course.icon size={22} />
										</span>
										<h3>{course.title}</h3>
										<p>{course.text}</p>
									</div>
								</article>
							))}
						</div>

						<div className="waitlist-strip">
							<div>
								<h3>想優先收到開班通知？</h3>
								<p>
									留低電郵，或者直接 WhatsApp 我們講低你有興趣的主題，新班一出就第一時間通知你。
								</p>
							</div>
							<a className="btn btn-outline" href="#contact">
								開課通知
								<ArrowRight size={17} />
							</a>
						</div>
					</div>
				</section>

				<section className="section section-white" id="redpen">
					<div className="wrap">
						<div className="project-grid">
							<div>
								<span className="project-badge">
									<Sparkles size={14} />
									最新推出
								</span>
								<h2 className="project-name">RedPen</h2>
								<p className="project-tagline">把一個主題，變成整組可發佈的圖文</p>
								<p className="project-text">
									RedPen 是為小紅書與社群內容打造的 AI 創作工作台。輸入主題與頁數，AI
									會生成可編輯大綱與逐頁配圖，支援參考圖風格、AI 文案與 10 種輸出語言，完成後一鍵打包下載。
								</p>

								<ul className="feature-list">
									{redpenFeatures.map((feature) => (
										<li key={feature.text}>
											<feature.icon size={17} aria-hidden="true" />
											{feature.text}
										</li>
									))}
								</ul>

								<p className="stack-note">
									由 IDH 自家開發，AI 能力透過 OpenRouter 串接多種文字與圖片模型（GPT、Claude、Gemini、DALL·E、Flux），一個工作台搞掂大綱、文案與配圖。
								</p>

								<div className="contact-row">
									<a
										className="btn btn-primary"
										href="https://redpen.idh.asia"
										target="_blank"
										rel="noreferrer"
									>
										前往 redpen.idh.asia
										<ArrowUpRight size={18} />
									</a>
								</div>
							</div>

							<div className="browser-frame">
								<div className="browser-bar">
									<span className="browser-dot" />
									<span className="browser-dot" />
									<span className="browser-dot" />
									<span className="browser-url">redpen.idh.asia</span>
								</div>
								<img
									src="/images/redpen-ui.jpg"
									alt="RedPen 創作工作台介面，顯示大綱步驟與逐頁配圖"
									width={1140}
									height={920}
								/>
							</div>
						</div>

						<div className="more-projects">
							<div>
								<h3>更多項目開發中</h3>
								<p>
									我們會在這裡陸續公開新產品。想第一時間知道，可以留低電郵或者直接 WhatsApp
									我們。
								</p>
							</div>
							<a className="btn btn-outline" href="#contact">
								聯絡我們
								<ArrowRight size={17} />
							</a>
						</div>
					</div>
				</section>

				<section className="about" id="about">
					<div className="about-media">
						<img src="/images/hong-kong-harbour.jpg" alt="香港維多利亞港夜景" />
					</div>
					<div className="wrap about-grid">
						<div>
							<span className="kicker" style={{ color: "#9dc0ff" }}>
								關於 IDH
							</span>
							<h2>香港團隊，做 AI 教育，也做自己的產品</h2>
							<p>
								我們在觀塘有課室（中環課室即將開幕），也有一隊開發團隊。除了開班教 AI，我們日常就用同一套
								AI 流程做自己的產品，所以課堂上教的，都是我們自己在用的做法。
							</p>
							<p>
								我們相信 AI 的價值不在於「問得好唔好」，而在於能否真正幫你完成工作。無論你是來上課，還是使用我們的產品，目標都一樣。
							</p>
						</div>
						<div className="about-stats">
							<div className="about-stat">
								<strong>6 人</strong>
								<span>每班限額</span>
							</div>
							<div className="about-stat">
								<strong>2 小時</strong>
								<span>工作坊時長</span>
							</div>
							<div className="about-stat">
								<strong>HK$600</strong>
								<span>課程優惠價</span>
							</div>
							<div className="about-stat">
								<strong>觀塘</strong>
								<span>課室現正開班</span>
							</div>
						</div>
					</div>
				</section>

				<section className="section section-white" id="contact">
					<div className="wrap contact-grid">
						<div>
							<span className="kicker">聯絡我們</span>
							<h2 className="section-title">想報名，或者想知多啲？</h2>
							<p className="section-lede">
								直接 WhatsApp 我們最快。想夾時間、問課程內容、或者想了解 RedPen
								都可以，我們會親自回覆。
							</p>

							<ul className="contact-list">
								<li>
									<MessageCircle size={20} aria-hidden="true" />
									<div>
										<strong>WhatsApp</strong>
										<a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
											9482 8587
										</a>
									</div>
								</li>
								<li>
									<MapPin size={20} aria-hidden="true" />
									<div>
										<strong>上課地點</strong>
										<div className="contact-venues">
											<span>觀塘課室：{VENUE}</span>
											<span>中環課室：即將開幕</span>
										</div>
									</div>
								</li>
								<li>
									<Send size={20} aria-hidden="true" />
									<div>
										<strong>產品</strong>
										<a href="https://redpen.idh.asia" target="_blank" rel="noreferrer">
											redpen.idh.asia
										</a>
									</div>
								</li>
							</ul>
						</div>

						<div className="signup">
							<h3>收到下一班開課通知</h3>
							<p>
								留低電郵，有新班或新產品我們會第一時間通知你。只會在有消息時寄出，不會濫發。
							</p>
							<form className="form" onSubmit={handleSubscribe}>
								<input
									className="input"
									type="email"
									name="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									placeholder="you@example.com"
									aria-label="電郵地址"
									required
								/>
								<button
									className="btn btn-primary"
									type="submit"
									disabled={status === "sending"}
								>
									{status === "sending" ? "傳送中" : "通知我"}
								</button>
							</form>
							{status === "done" && (
								<p className="form-msg" role="status">
									已收到你的電郵，有新消息會通知你。
								</p>
							)}
							{status === "error" && (
								<p className="form-msg is-error" role="alert">
									電郵傳送失敗，請再試一次或直接 WhatsApp 我們。
								</p>
							)}
							<p className="fps-box">
								課程費用可用 <strong>FPS 轉數快 9482 8587</strong>
								付款。付款後截圖 WhatsApp 傳送，我們會確認你的名額。
							</p>
						</div>
					</div>
				</section>
			</main>

			<footer className="site-footer">
				<div className="wrap">
					<div className="footer-grid">
						<div className="footer-brand">
							<a className="brand" href="#top" aria-label="IDH 首頁">
								<span className="brand-mark" aria-hidden="true">
									IDH
								</span>
								<span className="brand-text">
									<span className="brand-name">IDH</span>
									<span className="brand-sub">香港 AI 教育與產品</span>
								</span>
							</a>
							<p>
								香港 AI 教育與產品團隊。開辦實戰導向的 AI 工作坊，同時自家開發 AI
								工具，最新產品是 RedPen。
							</p>
						</div>
						<div className="footer-col">
							<h4>課程</h4>
							<ul>
								<li>
									<a href="#course">Manus AI 一日工作坊</a>
								</li>
								<li>
									<a href="#upcoming">AI+ 系列（即將推出）</a>
								</li>
								<li>
									<a href="#locations">課室地點：觀塘（中環即將開幕）</a>
								</li>
								<li>
									<a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
										WhatsApp 報名
									</a>
								</li>
								<li>
									<a href="#contact">開課通知</a>
								</li>
							</ul>
						</div>
						<div className="footer-col">
							<h4>產品</h4>
							<ul>
								<li>
									<a href="https://redpen.idh.asia" target="_blank" rel="noreferrer">
										RedPen 創作工作台
									</a>
								</li>
								<li>
									<a href="#redpen">RedPen 功能</a>
								</li>
								<li>
									<a href="#about">關於 IDH</a>
								</li>
							</ul>
						</div>
					</div>

					<p className="credits">
						本頁圖片：IDH Academy 課程海報、RedPen 產品截圖、Unsplash 課程與香港照片（Jakub
						Żerdzicki、Tingey Injury Law Firm、Theme Photos、Lau For Ning、Lai Man Nung、Nataliia
						Miazina），以及 Wikimedia Commons 香港照片（Mk2010、ken93110，CC BY-SA／CC0）。
					</p>
					<div className="footer-bottom">
						<span>© {new Date().getFullYear()} IDH. 保留所有權利。</span>
						<span>香港 · 觀塘（中環即將開幕）</span>
					</div>
				</div>
			</footer>

			{copied && (
				<div className="toast" role="status">
					<Check size={18} />
					地址已複製
				</div>
			)}
		</div>
	);
}

export default App;
