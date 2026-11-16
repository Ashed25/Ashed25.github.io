const $ = (id) => document.getElementById(id);

// Build elements with textContent so repo descriptions can't inject HTML.
function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter(Boolean));
  return node;
}

const button = (href, text, cls) => el("a", { href, className: cls, target: "_blank", rel: "noopener", textContent: text });

function card({ name, description, url, homepage, tags = [], badge, meta = [] }) {
  return el("article", { className: "card" }, [
    el("h4", { textContent: name }),
    el("p", { textContent: description || "No description yet." }),
    el("div", { className: "meta" }, [
      badge && el("span", { className: "badge", textContent: badge }),
      ...tags.map((t) => el("span", { className: "tag", textContent: t })),
      ...meta.map((m) => el("span", { textContent: m })),
    ]),
    (homepage || url) && el("div", { className: "actions" }, [
      homepage && button(homepage, "Try it live", "btn primary"),
      url && button(url, "Source", "btn"),
    ]),
  ]);
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
$("links").append(...links.map((l) => el("a", { href: l.url, textContent: l.label })));

// Upcoming projects from config
if (CONFIG.upcoming.length) {
  $("upcoming").append(...CONFIG.upcoming.map((p) => card({ ...p, badge: p.status })));
} else {
  $("upcoming-section").hidden = true;
}

// GitHub repos. shortcut: unauthenticated API allows 60 requests/hour per visitor IP, fine for a portfolio.
fetch(`https://api.github.com/users/${encodeURIComponent(CONFIG.github)}/repos?sort=updated&per_page=100`)
  .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  .then((repos) => {
    const shown = repos.filter((r) => !r.fork && !r.archived && !CONFIG.hideRepos.includes(r.name));
    $("status").hidden = shown.length > 0;
    $("status").textContent = "No public projects yet.";
    const categoryOf = (name) =>
      Object.keys(CONFIG.categories).find((c) => CONFIG.categories[c].includes(name)) || "Other";
    const groups = {};
    for (const c of [...Object.keys(CONFIG.categories), "Other"]) groups[c] = [];
    for (const r of shown) groups[categoryOf(r.name)].push(r);
    for (const [category, list] of Object.entries(groups)) {
      if (!list.length) continue;
      $("repos").append(el("h3", { className: "category", textContent: category }),
        el("div", { className: "grid" }, list.map((r) => card({
          name: r.name,
          description: r.description,
          url: r.html_url,
          homepage: r.homepage,
          tags: r.language ? [r.language] : [],
          meta: [r.stargazers_count ? `★ ${r.stargazers_count}` : "", `Updated ${new Date(r.pushed_at).toLocaleDateString()}`].filter(Boolean),
        }))));
    }
  })
  .catch(() => {
    $("status").replaceChildren("Couldn't load projects right now. ",
      el("a", { href: `https://github.com/${CONFIG.github}?tab=repositories`, textContent: "See them on GitHub →" }));
  });
