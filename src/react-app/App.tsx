import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
	ArrowRight,
	Check,
	ChevronDown,
	Grape,
	Mail,
	MapPin,
	Menu,
	Phone,
	Plus,
	ShieldCheck,
	ShoppingBag,
	Truck,
	Wine,
	X,
} from "lucide-react";
import "./App.css";

const values = [
	{ icon: Grape, title: "Native grapes", text: "Furmint, Hárslevelű, Kékfrankos" },
	{ icon: Wine, title: "Cellar direct", text: "Small lots, chosen at the estate" },
	{ icon: Truck, title: "Free HK delivery", text: "On orders over HK$800" },
	{ icon: ShieldCheck, title: "Provenance kept", text: "Estate and vintage documented" },
];

const regions = [
	{
		name: "Tokaj",
		tag: "Sweet and dry whites",
		blurb:
			"Volcanic hills where Furmint and Hárslevelű turn noble rot into the world's first protected sweet wine.",
		foot: "UNESCO heritage since 2002",
		image: "/images/region-tokaj.jpg",
	},
	{
		name: "Villány",
		tag: "Full-bodied reds",
		blurb:
			"Hungary's warmest red region, with loess and limestone soils built for Cabernet Franc and Portugieser.",
		foot: "South of the country, near the Croatian border",
		image: "/images/region-villany.jpg",
	},
	{
		name: "Eger",
		tag: "Bikavér blends",
		blurb:
			"Cool northern hills above a maze of carved cellars, producing the spicy, layered Bull's Blood blends.",
		foot: "Cellars carved since the 1500s",
		image: "/images/region-eger.jpg",
	},
];

const moreRegions = [
	{ name: "Szekszárd", note: "Spicy Kékfrankos and Bikavér" },
	{ name: "Balaton", note: "Fresh Olaszrizling by the lake" },
	{ name: "Sopron", note: "Crisp Kékfrankos on the Austrian border" },
];

const wines = [
	{
		name: "Tokaji Aszú 5 Puttonyos",
		region: "Tokaj",
		style: "Sweet white · 2018",
		note: "Apricot, honey and acacia blossom, cut by a bright citrus acid line.",
		price: "HK$680",
		image: "/images/wine-tokaji-aszu.jpg",
		badge: "Icon",
	},
	{
		name: "Egri Bikavér Superior",
		region: "Eger",
		style: "Dry red · 2019",
		note: "Black cherry and dried herbs over the smoky minerality of volcanic soil.",
		price: "HK$420",
		image: "/images/wine-egri-bikaver.jpg",
		badge: "Blend",
	},
	{
		name: "Tokaji Discovery Case",
		region: "Tokaj",
		style: "Three bottles · mixed",
		note: "Dry Furmint, Szamorodni and Aszú, packed as an introduction to the region.",
		price: "HK$980",
		image: "/images/collection-tokaji.jpg",
		badge: "Case",
	},
];

const navLinks = [
	{ href: "#regions", label: "Regions" },
	{ href: "#wines", label: "Wines" },
	{ href: "#cellar", label: "Cellar" },
	{ href: "#visit", label: "Visit" },
];

function App() {
	const [cartCount, setCartCount] = useState(0);
	const [added, setAdded] = useState<string | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		if (added === null) return;
		const timer = window.setTimeout(() => setAdded(null), 2000);
		return () => window.clearTimeout(timer);
	}, [added]);

	function addToCart(name: string) {
		setCartCount((count) => count + 1);
		setAdded(name);
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
					<a className="brand" href="#top" aria-label="BORHÁZ home">
						<span className="brand-mark" aria-hidden="true">
							<Wine size={20} strokeWidth={1.8} />
						</span>
						<span className="brand-text">
							<span className="brand-name">BORHÁZ</span>
							<span className="brand-sub">Wines of Hungary</span>
						</span>
					</a>

					<nav className="nav" aria-label="Main">
						{navLinks.map((link) => (
							<a key={link.href} href={link.href}>
								{link.label}
							</a>
						))}
					</nav>

					<div className="header-actions">
						<button
							type="button"
							className="cart-btn"
							aria-label={`Shopping case, ${cartCount} items`}
						>
							<ShoppingBag size={19} strokeWidth={1.8} />
							{cartCount > 0 && <span className="cart-count">{cartCount}</span>}
						</button>
						<button
							type="button"
							className="menu-btn"
							aria-expanded={menuOpen}
							aria-label={menuOpen ? "Close menu" : "Open menu"}
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
							src="/images/hero-tokaj-vineyard.jpg"
							alt="Terraced vineyards above the village of Tokaj in north-east Hungary"
						/>
					</div>
					<div className="wrap hero-inner">
						<span className="eyebrow">Tokaj · Eger · Villány</span>
						<h1>Hungarian wine, straight from the cellar.</h1>
						<p className="hero-lede">
							We work with growers across Hungary's historic wine regions and ship
							small parcels to Hong Kong. Native grapes, old cellars, no middle layer.
						</p>
						<div className="hero-actions">
							<a className="btn btn-primary" href="#wines">
								Shop the collection
								<ArrowRight size={18} />
							</a>
							<a className="btn btn-ghost" href="#regions">
								Explore the regions
							</a>
						</div>
						<div className="hero-stats">
							<div className="stat">
								<strong>22</strong>
								<span>Wine regions</span>
							</div>
							<div className="stat">
								<strong>1,000+</strong>
								<span>Years of winemaking</span>
							</div>
							<div className="stat">
								<strong>UNESCO</strong>
								<span>Protected Tokaj landscape</span>
							</div>
						</div>
						<a className="scroll-cue" href="#regions">
							<ChevronDown size={16} />
							Scroll
						</a>
					</div>
				</section>

				<section className="value-band" aria-label="Why buy from us">
					<div className="wrap value-grid">
						{values.map((item) => (
							<div className="value-item" key={item.title}>
								<span className="value-icon" aria-hidden="true">
									<item.icon size={22} strokeWidth={1.7} />
								</span>
								<div>
									<strong>{item.title}</strong>
									<p>{item.text}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="section" id="regions">
					<div className="wrap">
						<div className="section-head">
							<span className="kicker">Terroir</span>
							<h2 className="section-title">Three regions worth knowing by name</h2>
							<p className="section-lede">
								Hungary has twenty-two wine regions, from volcanic hills in the
								north-east to warm loess plateaus in the south. These three cover most
								of what we import.
							</p>
						</div>

						<div className="regions-grid">
							{regions.map((region) => (
								<article className="region-card" key={region.name}>
									<div className="region-media">
										<img src={region.image} alt={`${region.name} wine landscape`} />
									</div>
									<div className="region-body">
										<span className="region-tag">{region.tag}</span>
										<h3>{region.name}</h3>
										<p>{region.blurb}</p>
										<div className="region-foot">
											<span>{region.foot}</span>
										</div>
									</div>
								</article>
							))}
						</div>

						<div className="more-regions">
							{moreRegions.map((region) => (
								<div className="more-region" key={region.name}>
									<MapPin size={20} strokeWidth={1.7} aria-hidden="true" />
									<div>
										<h4>{region.name}</h4>
										<p>{region.note}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="section section-alt" id="wines">
					<div className="wrap">
						<div className="section-head-row">
							<div className="section-head">
								<span className="kicker">The collection</span>
								<h2 className="section-title">Bottles in stock this week</h2>
								<p className="section-lede">
									A short list, rotated with each shipment. Every wine is tasted
									before it goes on this page.
								</p>
							</div>
							<a className="btn btn-dark" href="#visit">
								Join the list
								<ArrowRight size={18} />
							</a>
						</div>

						<div className="wines-grid">
							{wines.map((wine) => (
								<article className="wine-card" key={wine.name}>
									<div className="wine-media">
										<span className="wine-badge">{wine.badge}</span>
										<img src={wine.image} alt={wine.name} />
									</div>
									<div className="wine-body">
										<span className="wine-meta">
											{wine.region} · {wine.style}
										</span>
										<h3>{wine.name}</h3>
										<p className="wine-note">{wine.note}</p>
										<div className="wine-foot">
											<span className="wine-price">{wine.price}</span>
											<button
												type="button"
												className="add-btn"
												onClick={() => addToCart(wine.name)}
											>
												{added === wine.name ? (
													<>
														<Check size={16} />
														Added
													</>
												) : (
													<>
														<Plus size={16} />
														Add
													</>
												)}
											</button>
										</div>
									</div>
								</article>
							))}
						</div>
					</div>
				</section>

				<section className="section" id="cellar">
					<div className="wrap story">
						<div className="story-media">
							<img
								src="/images/cellar-esztergom.jpg"
								alt="A long arched brick wine cellar lined with barrels"
							/>
							<div className="story-badge">
								<strong>1872</strong>
								<span>First vintage</span>
							</div>
						</div>
						<div className="story-body">
							<span className="kicker">The cellar</span>
							<h2>Four generations of buying the same way</h2>
							<p>
								BORHÁZ started as a family cellar in Eger and still buys barrel by
								barrel. We taste at the estate, take small allocations, and keep the
								paperwork so you can trace every bottle back to its vineyard.
							</p>
							<ul className="check-list">
								<li>
									<Check size={18} aria-hidden="true" />
									Allocations bought directly from growers, never through brokers
								</li>
								<li>
									<Check size={18} aria-hidden="true" />
									Cool-chain shipping from Budapest to Hong Kong
								</li>
								<li>
									<Check size={18} aria-hidden="true" />
									Tasting notes written in our cellar, not copied from a catalogue
								</li>
							</ul>
						</div>
					</div>
				</section>

				<section className="section visit" id="visit">
					<div className="wrap visit-grid">
						<div>
							<span className="kicker">Visit and taste</span>
							<h2>Come by the cellar, or let the list come to you</h2>
							<p>
								Our Hong Kong tasting room opens Thursday to Sunday, and we pour six
								wines by the glass. Bring a group and we will open something older.
							</p>
							<ul className="visit-details">
								<li>
									<MapPin size={20} strokeWidth={1.7} aria-hidden="true" />
									G/F, 12 Eastern Street, Sai Ying Pun, Hong Kong
								</li>
								<li>
									<Phone size={20} strokeWidth={1.7} aria-hidden="true" />
									+852 2555 0188
								</li>
								<li>
									<Mail size={20} strokeWidth={1.7} aria-hidden="true" />
									cellar@borhaz.hk
								</li>
							</ul>
						</div>

						<div className="signup">
							<h3>Get the shipment list first</h3>
							<p>
								One email per shipment. New arrivals, cellar tastings and nothing
								else.
							</p>
							<form className="form" onSubmit={handleSubscribe}>
								<input
									className="input"
									type="email"
									name="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									placeholder="you@example.com"
									aria-label="Email address"
									required
								/>
								<button className="btn btn-primary" type="submit" disabled={status === "sending"}>
									{status === "sending" ? "Sending" : "Subscribe"}
								</button>
							</form>
							{status === "done" && (
								<p className="form-msg" role="status">
									Thanks. You are on the list for the next shipment.
								</p>
							)}
							{status === "error" && (
								<p className="form-msg is-error" role="alert">
									That email did not go through. Please try again.
								</p>
							)}
						</div>
					</div>
				</section>
			</main>

			<footer className="site-footer">
				<div className="wrap">
					<div className="footer-grid">
						<div className="footer-brand">
							<a className="brand" href="#top" aria-label="BORHÁZ home">
								<span className="brand-mark" aria-hidden="true">
									<Wine size={20} strokeWidth={1.8} />
								</span>
								<span className="brand-text">
									<span className="brand-name">BORHÁZ</span>
									<span className="brand-sub">Wines of Hungary</span>
								</span>
							</a>
							<p>
								Small-lot Hungarian wine imported to Hong Kong, bought at the estate
								and shipped cold from Budapest.
							</p>
						</div>
						<div className="footer-col">
							<h4>Shop</h4>
							<ul>
								<li>
									<a href="#wines">Current collection</a>
								</li>
								<li>
									<a href="#regions">Regions</a>
								</li>
								<li>
									<a href="#visit">Tastings</a>
								</li>
							</ul>
						</div>
						<div className="footer-col">
							<h4>Contact</h4>
							<ul>
								<li>
									<a href="mailto:cellar@borhaz.hk">cellar@borhaz.hk</a>
								</li>
								<li>
									<a href="tel:+85225550188">+852 2555 0188</a>
								</li>
								<li>Sai Ying Pun, Hong Kong</li>
							</ul>
						</div>
					</div>

					<p className="credits">
						Photography from Wikimedia Commons: Jerzy Kociatkiewicz, Balázs Rafael,
						takato marui, Yozh, Jacquesverlaeken, Igor Vizner and Elin, used under CC
						BY-SA and CC BY licences.
					</p>
					<div className="footer-bottom">
						<span>© {new Date().getFullYear()} BORHÁZ. Please drink responsibly.</span>
						<span>Hong Kong · Hungary</span>
					</div>
				</div>
			</footer>

			{added && (
				<div className="toast" role="status">
					<Check size={18} />
					{added} added to your case
				</div>
			)}
		</div>
	);
}

export default App;
