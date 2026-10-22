import { useEffect, useState } from "react";
import ServiceShell from "./ServiceShell";
import { formatDate, getUpdates } from "./billingApi";
import type { ServiceUpdate } from "./billingApi";

export default function UpdatesPage() {
	const [updates, setUpdates] = useState<ServiceUpdate[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		getUpdates()
			.then((result) => {
				if (active) setUpdates(result.updates);
			})
			.catch((err: unknown) => {
				if (active) setError(err instanceof Error ? err.message : "未能載入更新");
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, []);

	return (
		<ServiceShell active="updates">
			<div className="service-wrap">
				<section className="service-hero">
					<p className="service-eyebrow">服務更新</p>
					<h1>
						收費、功能同維護，<strong>集中在這裡公布</strong>。
					</h1>
					<p className="service-lede">
						所有 RedPen 用戶都會在帳戶看到個人通知；公開更新亦會顯示於此頁。
					</p>
					<div className="service-actions">
						<a className="btn btn-outline" href="/account">
							查看我的通知
						</a>
						<a className="btn btn-outline" href="/pricing">
							查看方案
						</a>
					</div>
				</section>

				{loading ? (
					<p className="service-note">載入更新中…</p>
				) : error ? (
					<p className="notice is-error">{error}</p>
				) : updates.length === 0 ? (
					<div className="panel">
						<h2>暫時未有更新</h2>
						<p className="service-note">有新功能、價格或維護安排時，會在這裡公布。</p>
					</div>
				) : (
					<div className="timeline">
						{updates.map((item) => (
							<article key={item.id} className="timeline-item">
								<time dateTime={item.published_at}>{formatDate(item.published_at)}</time>
								<h2>{item.title}</h2>
								<p>{item.body}</p>
								{item.link_url && (
									<a href={item.link_url}>查看詳情</a>
								)}
							</article>
						))}
					</div>
				)}
			</div>
		</ServiceShell>
	);
}
