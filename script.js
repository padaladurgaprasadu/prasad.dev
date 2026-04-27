/* ============================================================
   PRASAD.DEV — Portfolio Script
   Author : Padala Durga Prasadu
   Version: 3.0
   ============================================================ */
'use strict';

/* ---- 1. CURSOR ---- */
(function () {
  const dot = document.getElementById('cur');
  const ring = document.getElementById('cur-r');
  if (!dot || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
  });
  (function loop() {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ---- 2. NAV SCROLL ---- */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('sc', scrollY > 56), { passive: true });
})();

/* ---- 3. SCROLL REVEAL ---- */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---- 4. LEETCODE LIVE DASHBOARD ---- */
(function () {
  const USER    = 'DurgaPrasadu';
  const BASE    = 'https://alfa-leetcode-api.onrender.com';
  const PROFILE = `https://leetcode.com/u/${USER}/`;
  const wrap    = document.getElementById('lcWrap');
  if (!wrap) return;

  /* helpers */
  async function get(url) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
      return r.ok ? r.json() : null;
    } catch { return null; }
  }

  function donut(easy, med, hard) {
    const total = easy + med + hard;
    const R = 52, cx = 66, cy = 66, sw = 6, C = 2 * Math.PI * R;
    const gap = 0.013 * C;
    const eL = total > 0 ? (easy / total) * C - gap : 0;
    const mL = total > 0 ? (med  / total) * C - gap : 0;
    const hL = total > 0 ? (hard / total) * C - gap : 0;
    const base = C * 0.25;
    const arc = (col, len, off) => len > 0
      ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${col}" stroke-width="${sw}"
           stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" stroke-linecap="round"/>`
      : '';
    return `<svg class="donut-svg" width="132" height="132" viewBox="0 0 132 132">
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="${sw}"/>
      ${arc('#3EC99A', eL, base)}
      ${arc('#F5BE5A', mL, base + eL + gap)}
      ${arc('#ED6A6A', hL, base + eL + mL + gap * 2)}
      <text x="${cx}" y="${cy-6}" text-anchor="middle" font-family="Cormorant Garamond,serif"
        font-size="26" font-weight="300" fill="#E8E6DF">${total}</text>
      <text x="${cx}" y="${cy+13}" text-anchor="middle" font-family="DM Mono,monospace"
        font-size="7" letter-spacing="2" fill="#4A4846">SOLVED</text>
    </svg>`;
  }

  function heatmap(raw) {
    const cal = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : (raw || {});
    const NOW = Math.floor(Date.now() / 1000), DAY = 86400;
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days = Array.from({ length: 366 }, (_, i) => {
      const ts = Math.floor(NOW / DAY) * DAY - (365 - i) * DAY;
      const n  = cal[ts] || 0;
      return { ts, n, c: n >= 7 ? 4 : n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0 };
    });
    const weeks = []; let w = [];
    days.forEach((d, i) => { w.push(d); if (w.length === 7 || i === days.length - 1) { weeks.push(w); w = []; } });
    const seen = new Set();
    const mlabels = weeks.map(wk => {
      const dt = new Date(wk[0].ts * 1000);
      const k  = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (!seen.has(k)) { seen.add(k); return MONTHS[dt.getMonth()]; }
      return '';
    });
    return `<div class="hm-months-row">${mlabels.map(m => `<span>${m}</span>`).join('')}</div>
<div class="hm-weeks-row">${weeks.map(wk =>
  `<div class="hm-week">${wk.map(d =>
    `<div class="hm-day" data-c="${d.c}" title="${d.n} submission${d.n!==1?'s':''}"></div>`
  ).join('')}</div>`
).join('')}</div>`;
  }

  function topicBars(skillData) {
    if (!skillData?.length) return `<p style="font-family:var(--mono);font-size:9px;color:var(--text3)">No topic data yet.</p>`;
    const map = new Map();
    skillData.flatMap(g => g.tags || []).forEach(t => {
      if (!map.has(t.tagName) || map.get(t.tagName) < t.problemsSolved)
        map.set(t.tagName, t.problemsSolved);
    });
    const top = [...map.entries()].filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]).slice(0, 12);
    const max = top[0]?.[1] || 1;
    return top.map(([name, n]) =>
      `<div class="tb-row">
        <span class="tb-lbl" title="${name}">${name}</span>
        <div class="tb-track"><div class="tb-fill" style="width:0%" data-pct="${Math.round(n/max*100)}%"></div></div>
        <span class="tb-n">${n}</span>
      </div>`
    ).join('');
  }

  function render(stats, cal, skillData) {
    const { easySolved:e=0, mediumSolved:m=0, hardSolved:h=0, ranking:r=0, acceptanceRate:a=0 } = stats;
    wrap.innerHTML = `
<div class="lc-top">
  <div class="lc-stat easy">  <span class="lc-stat-label">EASY SOLVED</span>  <span class="lc-stat-val">${e}</span><span class="lc-stat-sub">problems</span></div>
  <div class="lc-stat medium"><span class="lc-stat-label">MEDIUM SOLVED</span><span class="lc-stat-val">${m}</span><span class="lc-stat-sub">problems</span></div>
  <div class="lc-stat hard">  <span class="lc-stat-label">HARD SOLVED</span>  <span class="lc-stat-val">${h}</span><span class="lc-stat-sub">problems</span></div>
</div>
<div class="lc-mid">
  <div class="lc-card">
    <div class="lc-card-title">Problems by Difficulty</div>
    <div class="donut-wrap">
      ${donut(e, m, h)}
      <div class="donut-legend">
        <div class="dl-row"><div class="dl-dot" style="background:var(--accent)"></div><span class="dl-lbl">Easy</span><span class="dl-val">${e}</span></div>
        <div class="dl-row"><div class="dl-dot" style="background:var(--accent3)"></div><span class="dl-lbl">Medium</span><span class="dl-val">${m}</span></div>
        <div class="dl-row"><div class="dl-dot" style="background:var(--accent4)"></div><span class="dl-lbl">Hard</span><span class="dl-val">${h}</span></div>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
          <div class="dl-row"><span class="dl-lbl" style="color:var(--text3)">Global Rank</span><span class="dl-val">${r ? '#'+r.toLocaleString() : '—'}</span></div>
          <div class="dl-row" style="margin-top:6px"><span class="dl-lbl" style="color:var(--text3)">Acceptance</span><span class="dl-val">${a ? a.toFixed(1)+'%' : '—'}</span></div>
        </div>
      </div>
    </div>
  </div>
  <div class="lc-card">
    <div class="lc-card-title">Top Topics Covered</div>
    <div class="topic-bars">${topicBars(skillData)}</div>
  </div>
</div>
<div class="lc-bot">
  <div class="lc-card-title">Daily Activity — Last 12 Months</div>
  ${heatmap(cal)}
  <div class="hm-legend">
    <span>Less</span>
    <div class="hm-day"></div><div class="hm-day" data-c="1"></div>
    <div class="hm-day" data-c="2"></div><div class="hm-day" data-c="3"></div>
    <div class="hm-day" data-c="4"></div>
    <span>More</span>
  </div>
</div>`;
    /* animate bars */
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll('.tb-fill[data-pct]').forEach(b => { b.style.width = b.dataset.pct; });
      }, 100);
    });
  }

  async function load() {
    wrap.innerHTML = `<div class="lc-loading">⟳ &nbsp;Fetching live LeetCode stats...</div>`;
    const [solved, profile, calData, skill] = await Promise.all([
      get(`${BASE}/${USER}/solved`),
      get(`${BASE}/${USER}`),
      get(`${BASE}/${USER}/calendar`),
      get(`${BASE}/skillStats/${USER}`),
    ]);
    if (!solved && !profile) {
      wrap.innerHTML = `<div class="lc-error">Could not load live data. <a href="${PROFILE}" target="_blank" style="color:var(--accent)">View profile ↗</a></div>`;
      return;
    }
    const tc = skill?.data?.matchedUser?.tagProblemCounts;
    render(
      { easySolved: solved?.easySolved, mediumSolved: solved?.mediumSolved, hardSolved: solved?.hardSolved,
        ranking: profile?.ranking, acceptanceRate: profile?.acceptanceRate },
      calData?.submissionCalendar || {},
      tc ? [{ tags: tc.advanced||[] }, { tags: tc.intermediate||[] }, { tags: tc.fundamental||[] }] : []
    );
  }

  load();
})();
