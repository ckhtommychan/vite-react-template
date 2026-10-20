import type { ReactNode } from "react";
import {
	renderPostBlocks,
	type GeneratedBlogPost,
	type GeneratedSource,
} from "./blogContent";

export type BlogTocItem = {
	id: string;
	label: string;
};

export type BlogPost = {
	slug: string;
	title: string;
	excerpt: string;
	category: string;
	date: string;
	dateLabel: string;
	readingTime: string;
	coverImage: string;
	coverAlt: string;
	toc: BlogTocItem[];
	content: ReactNode;
	sources?: GeneratedSource[];
	generatedByAI?: boolean;
};

const manualPosts: BlogPost[] = [
	{
		slug: "first-ai-workflow-hong-kong",
		title: "由一份簡報開始：香港上班族的第一個 AI 工作流",
		excerpt:
			"大部分人用 AI，係由打開對話框開始；真正做得成事的人，通常由「要交咩」開始。這篇用一份市場簡報做例子，拆解一個可以照跟的 AI 工作流。",
		category: "AI 工作流",
		date: "2026-10-20",
		dateLabel: "2026 年 10 月 20 日",
		readingTime: "8 分鐘閱讀",
		coverImage: "/images/aiplus-design.jpg",
		coverAlt: "設計師在桌面使用電腦與繪圖板，旁邊放著色票與畫筆",
		toc: [
			{ id: "deliverable", label: "先定義交付物" },
			{ id: "workflow", label: "把工作拆成四段" },
			{ id: "example", label: "市場簡報實例" },
			{ id: "mistakes", label: "四個常見錯誤" },
			{ id: "exercise", label: "20 分鐘練習" },
		],
		content: (
			<>
				<p className="article-lede">
					你有沒有試過，對著 AI 輸入一句「幫我做份簡報」，然後得到一堆看似完整、但其實唔敢直接交出去嘅內容？
					問題通常不在模型夠唔夠聰明，而在於我們把一件需要來回檢查的工作，當成了一次性的提問。
				</p>
				<p>
					AI 真正有用的地方，不是幫你生成最多文字，而是幫你把一個交付物拆成幾個可以檢查、可以修正的步驟。
					以下方法，是我們在課堂和日常專案中反覆使用的版本：由一份八頁的市場簡報開始，建立一個你下星期就能重複使用的工作流。
				</p>

				<h2 id="deliverable">1. 先定義交付物，不是先找工具</h2>
				<p>
					很多人的第一步是「邊個 AI 最好用？」。但在選工具之前，更值得先寫清楚：這份文件要交給誰、用來做甚麼決定、何時要交、做成甚麼格式。
					這些條件會直接改變你需要的資料、結構和語氣。
				</p>
				<p>
					例如，不要寫「幫我做市場分析」，而是寫成這樣：
				</p>
				<div className="article-note">
					<strong>交付物定義：</strong>
					下星期三前，為管理層準備一份八頁的市場簡報，比較三個主要競爭對手，說明我們的定價位置，最後提出一個明確建議。
				</div>
				<p>
					這句話包含了對象、用途、格式、期限和成功標準。它同時也是一條很好的 AI 指令，因為它告訴 AI「完成」是甚麼樣子。
					如果你不能用人話講清楚交付物，AI 也不可能替你猜得準。
				</p>

				<h2 id="workflow">2. 把工作拆成四段，而不是一個巨型指令</h2>
				<p>
					一份簡報可以拆成四個階段。每個階段只交一件事給 AI，完成後由你檢查，再進入下一步。
					這樣做看似慢一點，但因為少了來回重寫，整體通常更快，而且質素穩定得多。
				</p>
				<h3>第一段：整理材料，找出資料缺口</h3>
				<p>
					先把你手上的報告、網站資料、銷售數字或訪談筆記交給 AI，請它列出「要完成這份簡報，還欠哪些資料」。
					這一步不要急著生成內容。先知道缺少甚麼，比之後發現論點沒有根據好得多。
				</p>
				<h3>第二段：建立結構，只選一個大綱</h3>
				<p>
					請 AI 根據同一批材料提出兩個不同角度的大綱，例如「以市場機會為主軸」和「以競爭風險為主軸」。
					你從中選一個，再告訴它為甚麼選這個。大綱一旦定下來，後面的內容就不容易偏離。
				</p>
				<h3>第三段：逐頁生成，而不是一次過寫完</h3>
				<p>
					每次只要求 AI 寫一頁，並指定字數、要點數量和必須引用的資料。這樣你可以在每一頁發現問題時立即修正，
					不會等到十六頁寫完才發現整個方向錯了。
				</p>
				<h3>第四段：反向檢查，讓 AI 找出自己的弱點</h3>
				<p>
					內容完成後，不要只問「有冇問題」。可以要求 AI 做一次反向檢查：列出最弱的三個論點、最可能被管理層質疑的數字，
					以及需要補充來源的地方。這一步往往比再生成一次更有價值。
				</p>

				<h2 id="example">3. 一份市場簡報的實戰例子</h2>
				<p>
					以下是一條可以直接改用的起始指令。重點不是背誦字眼，而是把角色、任務、輸出格式和限制分開寫清楚。
				</p>
				<div className="article-prompt">
					<span>指令範例</span>
					<pre>
						<code>{`角色：你是我公司的市場分析員。
任務：根據我提供的三份資料，整理三個競爭對手的比較。
輸出：八頁簡報大綱，每頁一句標題、三個要點，以及需要引用的資料來源。
限制：
1. 不要自行補充我沒有提供的數字。
2. 不確定的地方標記「待確認」，不要猜。
3. 用香港書面語，語氣直接，避免空泛形容詞。`}</code>
					</pre>
				</div>
				<p>
					接著，不要馬上叫它寫全文。先叫它列出「資料缺口」，再叫它出兩個大綱。選定大綱後，逐頁寫。
					最後，要求它用管理層的角度反問自己：這份簡報說服了甚麼？有哪個數字站不住腳？如果只能保留三頁，應該保留哪三頁？
				</p>
				<p>
					這個流程可以套用到很多工作：客戶提案、活動計劃書、內部匯報、產品需求文件，甚至是求職面試準備。
					交付物不同，拆法不同，但原則一樣：先定義完成，再分段生成，最後由人做判斷。
				</p>

				<h2 id="mistakes">4. 四個最常見的錯誤</h2>
				<ul className="article-list">
					<li>
						<strong>用一句指令完成整個專案。</strong>
						指令越短，AI 越需要猜。猜得越多，你之後要改的地方也越多。
					</li>
					<li>
						<strong>沒有提供原始材料。</strong>
						如果你只給結論，AI 只能根據一般常識補位。把來源交給它，並要求它標明哪一句來自哪份資料。
					</li>
					<li>
						<strong>把流暢的句子當成事實。</strong>
						AI 很擅長寫出聽起來合理的內容。數字、日期、法規、引述和競爭對手資料，仍然要由人核對。
					</li>
					<li>
						<strong>把機密資料直接貼上公開工具。</strong>
						客戶名單、合約、個人資料和未公開財務數字，都可能受公司政策和《個人資料（私隱）條例》約束。
						先確認工具和帳戶是否獲准使用，必要時去識別化或只提供摘要。
					</li>
				</ul>

				<h2 id="exercise">5. 今日就能做的 20 分鐘練習</h2>
				<p>
					不用等一個完美的專案。挑一件你今個星期本來就要交的文件，照以下步驟做一次：
				</p>
				<ul className="article-checklist">
					<li>用一句話寫清楚：交給誰、用來做甚麼決定、何時交、甚麼格式。</li>
					<li>列出你手上最重要的三份材料，並刪掉與這次決定無關的內容。</li>
					<li>叫 AI 只做一件事：列出資料缺口。</li>
					<li>叫 AI 提出兩個大綱，你選一個，並寫下選擇理由。</li>
					<li>只生成第一頁，然後檢查事實、語氣和邏輯。</li>
				</ul>
				<p>
					做完這一步，你已經不是在「玩 AI」，而是在建立一個可以重複使用的工作流。
					下一次遇到同類工作，你可以由同一個起點開始，而不是每次重新摸索。
				</p>
				<p>
					AI 不會自動令你變得更專業；它會放大你原本的判斷。交付物定義得越清楚，AI 越像一個可靠的同事。
					所以下一次，唔好由「幫我寫份簡報」開始，試吓由「這份簡報要說服誰、要對方做甚麼決定」開始。
				</p>
			</>
		),
	},
];

const generatedModules = import.meta.glob("../../content/posts/*.json", {
	eager: true,
	import: "default",
}) as Record<string, GeneratedBlogPost>;

function formatDateLabel(date: string) {
	const [year, month, day] = date.split("-");
	return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

function toBlogPost(post: GeneratedBlogPost): BlogPost {
	const toc = post.blocks
		.filter((block): block is Extract<GeneratedBlogPost["blocks"][number], { type: "h2" }> =>
			block.type === "h2",
		)
		.map((block) => ({
			id: block.id || "",
			label: block.text,
		}))
		.filter((item) => item.id);

	return {
		slug: post.slug,
		title: post.title,
		excerpt: post.excerpt,
		category: post.category,
		date: post.date,
		dateLabel: formatDateLabel(post.date),
		readingTime: post.readingTime,
		coverImage: post.coverImage,
		coverAlt: post.coverAlt,
		toc,
		content: renderPostBlocks(post.blocks),
		sources: post.sources,
		generatedByAI: post.generatedByAI,
	};
}

const generatedPosts = Object.values(generatedModules)
	.map(toBlogPost)
	.sort((a, b) => b.date.localeCompare(a.date));

export const blogPosts: BlogPost[] = [...generatedPosts, ...manualPosts].sort((a, b) =>
	b.date.localeCompare(a.date),
);

export const latestPost = blogPosts[0];

export function getBlogPost(slug: string | undefined) {
	return blogPosts.find((post) => post.slug === slug);
}
