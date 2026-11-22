// 봇(카카오/페이스북/구글 등) 전용: SPA 껍데기 대신 글별 OG 태그가 든 HTML을 돌려준다. vercel.json 의 UA rewrite 로만 들어온다.
const SITE = "https://www.planmate.site";
const API = process.env.VITE_API_URL || "https://api.planmate.site";
const DEFAULT_IMAGE = `${SITE}/og-default.png`;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const UPSTREAM_UA = { "User-Agent": "Mozilla/5.0 (compatible; planmate-seo)" };

function page(res, { title, desc, url, image, type, h1, meta, body, noindex, maxAge }) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", `public, s-maxage=${maxAge}, stale-while-revalidate=86400`);
  res.status(200).send(`<!doctype html>
<html lang="ko"><head><meta charset="UTF-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ""}<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="planMate">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
</head><body>
<h1>${esc(h1)}</h1>
<p>${esc(meta)}</p>
<p>${esc(body)}</p>
</body></html>`);
}

// 공유 일정(/complete?id=): 링크를 아는 사람이 이미 볼 수 있는 공개 API 데이터만 쓴다. 공유가 꺼졌거나 실패하면 기본 미리보기.
async function sharedPlan(res, planId) {
  const url = `${SITE}/complete?id=${planId}`;
  const fallback = () => page(res, { title: "planMate : 동시협업 여행플래너", desc: "친구들과 여행 일정을 함께 만드는 실시간 협업 플래너", url: `${SITE}/`, image: DEFAULT_IMAGE, type: "website", h1: "planMate", meta: "", body: "", noindex: true, maxAge: 60 });
  let r;
  try {
    r = await fetch(`${API}/api/plan/${planId}/complete`, { headers: UPSTREAM_UA });
  } catch {
    return res.status(502).send("upstream error");
  }
  if (r.status >= 500) return res.status(502).send("upstream error");
  if (!r.ok) return fallback();

  const { planFrame: f, timetables = [], placeBlocks = [] } = await r.json();
  const blocks = [...placeBlocks].sort((a, b) => String(a.blockStartTime).localeCompare(String(b.blockStartTime)));
  const names = [...new Set(blocks.map((b) => b.placeName).filter(Boolean))];
  const days = timetables.length;
  const place = f.destinationName || f.planName;
  const title = `${f.planName} ${days ? `${days}일 ` : ""}여행 일정 | planMate`;
  const desc = names.length ? `${names.slice(0, 5).join(" · ")}${names.length > 5 ? ` 외 ${names.length - 5}곳` : ""} — 친구와 함께 보고 수정하세요.` : `${place} 여행 일정을 친구와 함께 보고 수정하세요.`;
  const image = blocks.find((b) => b.placeThumbnailUrl)?.placeThumbnailUrl || DEFAULT_IMAGE;
  page(res, { title, desc, url, image, type: "website", h1: f.planName, meta: place, body: names.join(", "), noindex: true, maxAge: 300 });
}

export default async function handler(req, res) {
  const plan = String(req.query.plan ?? "");
  if (plan) {
    if (!/^[0-9a-f-]{36}$/i.test(plan)) return res.status(404).send("not found");
    return sharedPlan(res, plan);
  }

  const id = String(req.query.id ?? "");
  if (!/^\d+$/.test(id)) return res.status(404).send("not found");
  // category 없음 = 여행 기록(/travel/:id), 있음 = 커뮤니티 글(/community/:category/:id)
  const category = req.query.category ? String(req.query.category) : "";
  if (category && !["free", "qna", "mate"].includes(category)) return res.status(404).send("not found");
  const path = category ? `/community/${category}/${id}` : `/travel/${id}`;

  let r;
  try {
    r = await fetch(`${API}/api/${category ? "community" : "feed"}/posts/${id}`, { headers: UPSTREAM_UA });
  } catch {
    return res.status(502).send("upstream error");
  }
  if (r.status === 404) return res.status(404).send("not found");
  if (!r.ok) return res.status(502).send("upstream error"); // 일시 장애는 캐시되지 않게 5xx

  const p = await r.json();
  if (category && p.category !== category) return res.status(404).send("not found"); // 같은 글이 다른 URL 로 중복 색인되지 않게
  const body = String(p.contentText ?? "").replace(/\s+/g, " ").trim();
  const meta = [p.region, p.durationDays ? `${p.durationDays}일` : null, ...(p.tags ?? [])].filter(Boolean).join(" · ");
  page(res, {
    title: `${p.title} | planMate`,
    desc: body.slice(0, 150) || "planMate에서 친구들과 함께 여행 일정을 만들어보세요.",
    url: `${SITE}${path}`,
    image: p.image || DEFAULT_IMAGE,
    type: "article",
    h1: p.title,
    meta,
    body: body.slice(0, 2000),
    maxAge: 3600,
  });
}
