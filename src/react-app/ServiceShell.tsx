import type { ReactNode } from "react";
import "./ServicePages.css";

export type ServiceNavKey = "pricing" | "course" | "updates" | "account";

const navItems: { key: ServiceNavKey; href: string; label: string }[] = [
	{ key: "pricing", href: "/pricing", label: "方案與價格" },
	{ key: "course", href: "/course", label: "Manus 課程" },
	{ key: "updates", href: "/updates", label: "服務更新" },
	{ key: "account", href: "/account", label: "我的帳戶" },
];

export default function ServiceShell({
	children,
	active,
}: {
	children: ReactNode;
	active?: ServiceNavKey;
}) {
	return (
		<div className="page service-page">
			<header className="site-header is-scrolled">
				<div className="wrap header-inner">
					<a className="brand" href="/" aria-label="IDH 首頁">
						<span className="brand-mark" aria-hidden="true">
							IDH
						</span>
						<span className="brand-text">
							<span className="brand-name">IDH</span>
							<span className="brand-sub">香港 AI 教育與產品</span>
						</span>
					</a>
					<nav className="service-nav" aria-label="帳戶導覽">
						{navItems.map((item) => (
							<a
								key={item.key}
								href={item.href}
								className={active === item.key ? "is-active" : undefined}
								aria-current={active === item.key ? "page" : undefined}
							>
								{item.label}
							</a>
						))}
					</nav>
					<div className="header-actions">
						<a
							className="btn btn-primary btn-sm"
							href="https://redpen.idh.asia"
							target="_blank"
							rel="noreferrer"
						>
							開始創作
						</a>
					</div>
				</div>
				<nav className="service-nav-mobile" aria-label="帳戶導覽（手機）">
					{navItems.map((item) => (
						<a
							key={item.key}
							href={item.href}
							className={active === item.key ? "is-active" : undefined}
							aria-current={active === item.key ? "page" : undefined}
						>
							{item.label}
						</a>
					))}
				</nav>
			</header>

			<main className="service-main">{children}</main>

			<footer className="service-footer">
				<div className="wrap service-footer-inner">
					<div>
						<strong>IDH</strong>
						<p>香港 AI 教育與產品團隊。RedPen 由 IDH 開發及營運。</p>
					</div>
					<div className="service-footer-links">
						<a href="/pricing">方案</a>
						<a href="/course">課程</a>
						<a href="/updates">更新</a>
						<a href="/account">帳戶</a>
						<a href="/terms">服務條款</a>
						<a href="/privacy-policy">隱私政策</a>
						<a href="/refund-policy">退款政策</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
