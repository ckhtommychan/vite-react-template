import {
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Calendar,
	Clock,
	Mail,
	MessageCircle,
} from "lucide-react";
import { useEffect } from "react";
import { blogPosts, getBlogPost } from "./blogPosts";
import "./App.css";

type BlogPageProps = {
	slug?: string;
	email: string;
	whatsappLink: string;
};

const blogFooterLinks = [
	{ href: "/", label: "首頁" },
	{ href: "/blog", label: "所有文章" },
	{ href: "/#course", label: "Manus AI 工作坊" },
	{ href: "https://redpen.idh.asia", label: "RedPen", external: true },
];

const legalLinks = [
	{ href: "/terms", label: "服務條款" },
	{ href: "/privacy-policy", label: "隱私政策" },
	{ href: "/refund-policy", label: "退款政策" },
];

function setPageMeta(title: string, description: string) {
	document.title = title;
	const descriptionTag = document.querySelector('meta[name="description"]');
	descriptionTag?.setAttribute("content", description);
}

function BlogHeader({ current }: { current: "index" | "article" }) {
	return (
		<header className="blog-topbar">
			<div className="wrap blog-topbar-inner">
				<a className="brand" href="/" aria-label="IDH 首頁">
					<span className="brand-mark" aria-hidden="true">
						IDH
					</span>
					<span className="brand-text">
						<span className="brand-name">IDH</span>
						<span className="brand-sub">香港 AI 教育與產品</span>
					</span>
				</a>
				<nav className="blog-topnav" aria-label="文章導覽">
					<a href="/blog" aria-current={current === "index" ? "page" : undefined}>
						IDH Journal
					</a>
					<a href="/#course">AI 工作坊</a>
					<a className="blog-topnav-cta" href="/#contact">
						聯絡我們
						<ArrowUpRight size={15} aria-hidden="true" />
					</a>
				</nav>
			</div>
		</header>
	);
}

function BlogFooter({ email }: { email: string }) {
	return (
		<footer className="blog-footer">
			<div className="wrap blog-footer-inner">
				<div className="blog-footer-brand">
					<a className="brand" href="/" aria-label="IDH 首頁">
						<span className="brand-mark" aria-hidden="true">
							IDH
						</span>
						<span className="brand-text">
							<span className="brand-name">IDH</span>
							<span className="brand-sub">香港 AI 教育與產品</span>
						</span>
					</a>
					<p>實戰筆記、工作流拆解，以及我們自己在用的 AI 做法。</p>
				</div>
				<div className="blog-footer-links">
					{blogFooterLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							target={link.external ? "_blank" : undefined}
							rel={link.external ? "noreferrer" : undefined}
						>
							{link.label}
						</a>
					))}
				</div>
				<div className="blog-footer-contact">
					<a href={`mailto:${email}`}>
						<Mail size={15} aria-hidden="true" />
						{email}
					</a>
					<span>香港 · 觀塘</span>
				</div>
			</div>
			<div className="wrap blog-footer-bottom">
				<span>© {new Date().getFullYear()} Alliance Asia Hong Kong Limited</span>
				<div>
					{legalLinks.map((link) => (
						<a key={link.href} href={link.href}>
							{link.label}
						</a>
					))}
				</div>
			</div>
		</footer>
	);
}

function PostMeta({ post }: { post: (typeof blogPosts)[number] }) {
	return (
		<div className="post-meta">
			<span className="post-tag">{post.category}</span>
			<span>
				<Calendar size={14} aria-hidden="true" />
				{post.dateLabel}
			</span>
			<span>
				<Clock size={14} aria-hidden="true" />
				{post.readingTime}
			</span>
		</div>
	);
}

function WorkshopCta({ whatsappLink }: { whatsappLink: string }) {
	return (
		<div className="article-cta">
			<div>
				<span className="kicker">想親手走一次完整流程？</span>
				<h2>Manus AI 一日工作坊</h2>
				<p>
					兩小時小班實戰，限額六人。由整理資料、建立大綱到完成一份可用嘅工作成果，落堂就可以帶回自己的工作。
				</p>
			</div>
			<a className="btn btn-primary" href={whatsappLink} target="_blank" rel="noreferrer">
				<MessageCircle size={17} aria-hidden="true" />
				WhatsApp 查詢
			</a>
		</div>
	);
}

function BlogIndex({ email }: { email: string }) {
	useEffect(() => {
		setPageMeta(
			"IDH Journal｜AI 實戰筆記",
			"IDH Journal 分享 AI 實戰筆記、工作流拆解與香港團隊的實際做法，幫你把 AI 用進日常工作。",
		);
	}, []);

	const [featured, ...rest] = blogPosts;

	return (
		<>
			<BlogHeader current="index" />
			<main className="blog-index">
				<div className="wrap">
					<header className="blog-index-head">
						<span className="kicker">IDH Journal</span>
						<h1>AI 實戰筆記</h1>
						<p>
							我們把課堂和專案裡真正用過的方法寫下來。沒有神奇指令，只有可以照著做、再按自己工作調整的流程。
						</p>
					</header>

					{featured && (
						<article className="blog-featured">
							<a className="blog-featured-cover" href={`/blog/${featured.slug}`}>
								<img src={featured.coverImage} alt={featured.coverAlt} width={1200} height={750} />
							</a>
							<div className="blog-featured-body">
								<PostMeta post={featured} />
								<h2>
									<a href={`/blog/${featured.slug}`}>{featured.title}</a>
								</h2>
								<p>{featured.excerpt}</p>
								<a className="post-link" href={`/blog/${featured.slug}`}>
									閱讀文章
									<ArrowRight size={17} aria-hidden="true" />
								</a>
							</div>
						</article>
					)}

					{rest.length > 0 && (
						<div className="blog-grid">
							{rest.map((post) => (
								<article className="blog-card" key={post.slug}>
									<a className="blog-card-cover" href={`/blog/${post.slug}`}>
										<img src={post.coverImage} alt={post.coverAlt} loading="lazy" />
									</a>
									<PostMeta post={post} />
									<h2>
										<a href={`/blog/${post.slug}`}>{post.title}</a>
									</h2>
									<p>{post.excerpt}</p>
									<a className="post-link" href={`/blog/${post.slug}`}>
										閱讀文章
										<ArrowRight size={16} aria-hidden="true" />
									</a>
								</article>
							))}
						</div>
					)}

					<div className="blog-invite">
						<div>
							<span className="kicker">想看我們拆解哪個工作流程？</span>
							<h2>告訴我們你卡在哪裡。</h2>
							<p>簡報、研究、客戶提案、內容製作，都可以是下一篇的題目。</p>
						</div>
						<a className="btn btn-outline" href="mailto:info@idh.asia">
							提議題目
							<Mail size={17} aria-hidden="true" />
						</a>
					</div>
				</div>
			</main>
			<BlogFooter email={email} />
		</>
	);
}

function BlogArticle({
	slug,
	email,
	whatsappLink,
}: Pick<BlogPageProps, "slug" | "email" | "whatsappLink">) {
	const post = getBlogPost(slug);

	useEffect(() => {
		if (post) {
			setPageMeta(`${post.title}｜IDH Journal`, post.excerpt);
		}
	}, [post]);

	if (!post) {
		return <BlogNotFound email={email} />;
	}

	return (
		<>
			<BlogHeader current="article" />
			<main className="article-page">
				<header className="article-header">
					<div className="wrap article-header-inner">
						<a className="article-back" href="/blog">
							<ArrowLeft size={17} aria-hidden="true" />
							所有文章
						</a>
						<PostMeta post={post} />
						<h1>{post.title}</h1>
						<p className="article-deck">{post.excerpt}</p>
						<div className="article-byline">
							<span>IDH 編輯部</span>
							<span>分享我們在課堂與專案中實際使用的方法</span>
						</div>
					</div>
				</header>

				<div className="wrap">
					<figure className="article-cover">
						<img src={post.coverImage} alt={post.coverAlt} width={1200} height={750} />
						<figcaption>{post.coverAlt}</figcaption>
					</figure>

					<div className="article-layout">
						<aside className="article-aside">
							<h2>本文內容</h2>
							<nav aria-label="文章目錄">
								{post.toc.map((item) => (
									<a key={item.id} href={`#${item.id}`}>
										{item.label}
									</a>
								))}
							</nav>
							<div className="article-aside-cta">
								<span>想直接上手？</span>
								<p>兩小時小班實戰，帶你完成一份真正用得著的工作成果。</p>
								<a href={whatsappLink} target="_blank" rel="noreferrer">
									<MessageCircle size={16} aria-hidden="true" />
									查詢工作坊
								</a>
							</div>
						</aside>

						<article className="article-prose">
							{post.content}
							{post.generatedByAI && (
								<p className="article-disclosure">
									本文由 IDH Journal 自動編輯流程整理，資料及連結以文末來源為準。
								</p>
							)}
							{post.sources && post.sources.length > 0 && (
								<section className="article-sources" aria-labelledby="article-sources-heading">
									<h2 id="article-sources-heading">資料來源</h2>
									<ul>
										{post.sources.map((source) => (
											<li key={source.url}>
												<a href={source.url} target="_blank" rel="noreferrer">
													{source.title}
													<ArrowUpRight size={14} aria-hidden="true" />
												</a>
											</li>
										))}
									</ul>
								</section>
							)}
							<WorkshopCta whatsappLink={whatsappLink} />
						</article>
					</div>
				</div>
			</main>
			<BlogFooter email={email} />
		</>
	);
}

function BlogNotFound({ email }: { email: string }) {
	useEffect(() => {
		setPageMeta("找不到文章｜IDH Journal", "這篇文章可能已經移動或不存在。");
	}, []);

	return (
		<>
			<BlogHeader current="article" />
			<main className="blog-not-found">
				<div className="wrap">
					<span className="kicker">404 · IDH Journal</span>
					<h1>找不到這篇文章</h1>
					<p>文章可能已經移動，或者網址輸入有誤。</p>
					<a className="btn btn-primary" href="/blog">
						返回所有文章
						<ArrowRight size={17} aria-hidden="true" />
					</a>
				</div>
			</main>
			<BlogFooter email={email} />
		</>
	);
}

function BlogPage({ slug, email, whatsappLink }: BlogPageProps) {
	if (slug) {
		return <BlogArticle slug={slug} email={email} whatsappLink={whatsappLink} />;
	}

	return <BlogIndex email={email} />;
}

export default BlogPage;
