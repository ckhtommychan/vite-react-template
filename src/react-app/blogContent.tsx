export type GeneratedBlock =
	| { type: "lede"; text: string }
	| { type: "p"; text: string }
	| { type: "h2"; text: string; id?: string }
	| { type: "h3"; text: string }
	| { type: "ul"; items: string[] }
	| { type: "checklist"; items: string[] }
	| { type: "note"; text: string }
	| { type: "prompt"; label?: string; text: string };

export type GeneratedSource = {
	title: string;
	url: string;
};

export type GeneratedBlogPost = {
	date: string;
	title: string;
	slug: string;
	category: string;
	excerpt: string;
	readingTime: string;
	coverImage: string;
	coverAlt: string;
	generatedByAI?: boolean;
	sources?: GeneratedSource[];
	blocks: GeneratedBlock[];
};

export function renderPostBlocks(blocks: GeneratedBlock[]) {
	return (
		<>
			{blocks.map((block, index) => {
				if (block.type === "lede") {
					return (
						<p className="article-lede" key={index}>
							{block.text}
						</p>
					);
				}

				if (block.type === "p") {
					return <p key={index}>{block.text}</p>;
				}

				if (block.type === "h2") {
					return (
						<h2 id={block.id} key={index}>
							{block.text}
						</h2>
					);
				}

				if (block.type === "h3") {
					return <h3 key={index}>{block.text}</h3>;
				}

				if (block.type === "ul") {
					return (
						<ul className="article-list" key={index}>
							{block.items.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					);
				}

				if (block.type === "checklist") {
					return (
						<ul className="article-checklist" key={index}>
							{block.items.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					);
				}

				if (block.type === "note") {
					return (
						<div className="article-note" key={index}>
							{block.text}
						</div>
					);
				}

				return (
					<div className="article-prompt" key={index}>
						<span>{block.label || "指令範例"}</span>
						<pre>
							<code>{block.text}</code>
						</pre>
					</div>
				);
			})}
		</>
	);
}
