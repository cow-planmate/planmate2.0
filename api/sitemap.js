const SITE = "https://www.planmate.site";
const API = "https://api.planmate.site"; // TEMP-EXPERIMENT
const MAX_PAGES = 20; // shortcut: 소스당 글 1000개 상한(size 50 x 20쪽), 합계 5만 URL 을 넘으면 sitemap index 로 분할

const SOURCES = [
  ["/api/feed/posts?", (p) => `/travel/${p.id}`],
  ...["free", "qna", "mate"].map((c) => [`/api/community/posts?category=${c}&sort=latest&`, (p) => `/community/${c}/${p.id}`]),
];

export default async function handler(req, res) {
  const urls = [`${SITE}/`, `${SITE}/feed`, `${SITE}/community`];
  try {
    for (const [endpoint, toPath] of SOURCES) {
      for (let page = 0; page < MAX_PAGES; page++) {
        const r = await fetch(`${API}${endpoint}page=${page}&size=50`, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 planmate-seo" } });
        if (!r.ok) throw new Error(String(r.status));
        const d = await r.json();
        urls.push(...d.items.map((p) => `${SITE}${toPath(p)}`));
        if (page + 1 >= d.totalPages) break;
      }
    }
  } catch (e) {
    return res.status(502).send(`upstream error: ${e.cause?.code ?? e.message}`); // 반쪽짜리 sitemap 을 캐시하지 않는다
  }
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") + `\n</urlset>\n`,
  );
}
