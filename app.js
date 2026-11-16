const $ = (id) => document.getElementById(id);
const LANG_COLORS = { TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572a5", "C#": "#178600", PHP: "#4f5d95", HTML: "#e34c26", CSS: "#563d7c" };

// Build elements with textContent so repo descriptions can't inject HTML.
function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter(Boolean));
  return node;
}

const prettify = (name) => CONFIG.titles[name] || name.replace(/[-_]+/g, " ").replace(/\b[a-z]/g, (c) => c.toUpperCase());

function card({ name, description, demo, language, badge }) {
  const lang = language && el("span", { className: "lang", textContent: language });
  if (lang) lang.style.setProperty("--dot", LANG_COLORS[language] || "#9a9ab0");
  const node = el("article", { className: "card" }, [
    el("div", { className: "card-top" }, [
      lang || el("span"),
      demo ? el("span", { className: "live", textContent: "LIVE" }) : badge && el("span", { className: "badge", textContent: badge }),
    ]),
    el("h4", { textContent: name }),
    el("p", { textContent: description || "" }),
    demo
      ? el("a", { href: demo, target: "_blank", rel: "noopener", className: "btn primary", textContent: "▶ Try it live" })
      : el("div", { className: "soon", textContent: "Live demo coming soon" }),
  ]);
  node.addEventListener("pointermove", (e) => {
    const r = node.getBoundingClientRect();
    node.style.setProperty("--x", `${e.clientX - r.left}px`);
    node.style.setProperty("--y", `${e.clientY - r.top}px`);
  });
  return node;
}

// Header + contact
document.title = `${CONFIG.name} · Portfolio`;
$("name").textContent = CONFIG.name;
$("tagline").textContent = CONFIG.tagline;
$("footer-name").textContent = CONFIG.name;
$("year").textContent = new Date().getFullYear();
const links = [
  { label: "GitHub", url: `https://github.com/${CONFIG.github}` },
  CONFIG.email && { label: "Email", url: `mailto:${CONFIG.email}` },
  ...CONFIG.links,
].filter(Boolean);
$("links").append(...links.map((l) => el("a", { href: l.url, className: "btn", textContent: l.label })));

// Upcoming projects from config
if (CONFIG.upcoming.length) {
  $("upcoming").append(...CONFIG.upcoming.map((p) => card({ ...p, demo: p.url, language: p.tags?.[0], badge: p.status })));
} else {
  $("upcoming-section").hidden = true;
}

function stat(value, label) {
  return el("div", {}, [el("dt", { textContent: label }), el("dd", { textContent: value })]);
}

// GitHub repos. shortcut: unauthenticated API allows 60 requests/hour per visitor IP, fine for a portfolio.
fetch(`https://api.github.com/users/${encodeURIComponent(CONFIG.github)}/repos?sort=updated&per_page=100`)
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((repos) => {
    const shown = repos
      .filter((r) => !r.fork && !r.archived && !CONFIG.hideRepos.includes(r.name))
      .sort((a, b) => !!b.homepage - !!a.homepage); // live demos first
    $("status").hidden = shown.length > 0;
    $("status").textContent = "No public projects yet.";

    $("stats").append(
      stat(shown.length, "Projects"),
      stat(shown.filter((r) => r.homepage).length, "Live demos"),
      stat(new Set(shown.map((r) => r.language).filter(Boolean)).size, "Languages"),
    );

    const categoryOf = (name) =>
      Object.keys(CONFIG.categories).find((c) => CONFIG.categories[c].includes(name)) || "Other";
    const groups = {};
    for (const c of [...Object.keys(CONFIG.categories), "Other"]) groups[c] = [];
    for (const r of shown) groups[categoryOf(r.name)].push(r);

    const sections = [];
    for (const [category, list] of Object.entries(groups)) {
      if (!list.length) continue;
      const section = el("div", {}, [
        el("h3", { className: "category", textContent: category }),
        el("div", { className: "grid" }, list.map((r) => card({
          name: prettify(r.name), description: r.description, demo: r.homepage, language: r.language,
        }))),
      ]);
      section.dataset.category = category;
      sections.push(section);
    }
    $("repos").append(...sections);

    // Category filter chips
    const chips = ["All", ...sections.map((s) => s.dataset.category)].map((c) => {
      const count = c === "All" ? shown.length : groups[c].length;
      const chip = el("button", { type: "button", className: "chip", textContent: c }, [el("span", { textContent: count })]);
      chip.setAttribute("aria-pressed", c === "All");
      chip.onclick = () => {
        chips.forEach((x) => x.setAttribute("aria-pressed", x === chip));
        sections.forEach((s) => (s.hidden = c !== "All" && s.dataset.category !== c));
      };
      return chip;
    });
    if (sections.length > 1) $("filters").append(...chips);
  })
  .catch(() => {
    $("status").replaceChildren("Couldn't load projects right now. ",
      el("a", { href: `https://github.com/${CONFIG.github}?tab=repositories`, textContent: "See them on GitHub →" }));
  });
