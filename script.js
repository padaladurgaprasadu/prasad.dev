/* ============================================================
   PRASAD.DEV — Portfolio Script
   Author: Padala Durga Prasadu
   ============================================================ */

'use strict';

/* ============================================================
   1. CUSTOM CURSOR
   ============================================================ */
(function initCursor() {
  const dot  = document.getElementById('cur');
  const ring = document.getElementById('cur-r');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  // Hover expand on interactive elements
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  (function loop() {
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ============================================================
   2. NAV SCROLL EFFECT
   ============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('sc', window.scrollY > 60);
  }, { passive: true });
})();

/* ============================================================
   3. SCROLL REVEAL
   ============================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        io.unobserve(e.target); // fire once
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ============================================================
   4. LEETCODE LIVE DASHBOARD
   ============================================================ */
(function initLeetCode() {

  const LC_USER   = 'DurgaPrasadu';
  const API_BASE  = 'https://alfa-leetcode-api.onrender.com';
  const PROFILE_URL = `https://leetcode.com/u/${LC_USER}/`;

  const wrap = document.getElementById('lcWrap');
  if (!wrap) return;

  /* ---------- helpers ---------- */

  function buildDonut(easy, medium, hard) {
    const solved = easy + medium + hard;
    const R = 54, cx = 68, cy = 68, sw = 7;
    const C = 2 * Math.PI * R;
    const gap = 0.012 * C;

    const eLen = solved > 0 ? (easy   / solved) * C - gap : 0;
    const mLen = solved > 0 ? (medium / solved) * C - gap : 0;
    const hLen = solved > 0 ? (hard   / solved) * C - gap : 0;

    const baseOff = C * 0.25;
    const eOff = baseOff;
    const mOff = baseOff + eLen + gap;
    const hOff = mOff   + mLen + gap;

    function arc(color, len, offset) {
      if (len <= 0) return '';
      return `<circle cx="${cx}" cy="${cy}" r="${R}"
        fill="none" stroke="${color}" stroke-width="${sw}"
        stroke-dasharray="${len} ${C - len}"
        stroke-dashoffset="${-offset}"
        stroke-linecap="round"/>`;
    }

    return `
<svg class="donut-svg" width="136" height="136" viewBox="0 0 136 136">
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none"
    stroke="rgba(255,255,255,.05)" stroke-width="${sw}"/>
  ${arc('#4ECFA0', eLen, eOff)}
  ${arc('#F7C46A', mLen, mOff)}
  ${arc('#F07070', hLen, hOff)}
  <text x="${cx}" y="${cy - 7}" text-anchor="middle"
    font-family="Cormorant Garamond,serif"
    font-size="28" font-weight="300" fill="#EAE8E2">${solved}</text>
  <text x="${cx}" y="${cy + 14}" text-anchor="middle"
    font-family="DM Mono,monospace"
    font-size="8" letter-spacing="1.5" fill="#525050">SOLVED</text>
</svg>`;
  }

  function buildHeatmap(calendarRaw) {
    const cal = typeof calendarRaw === 'string'
      ? (() => { try { return JSON.parse(calendarRaw); } catch { return {}; } })()
      : (calendarRaw || {});

    const NOW_SEC  = Math.floor(Date.now() / 1000);
    const DAY_SEC  = 86400;
    const DAYS     = 365;
    const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Build 365-day array (oldest → newest)
    const days = [];
    for (let i = DAYS; i >= 0; i--) {
      const ts    = Math.floor(NOW_SEC / DAY_SEC) * DAY_SEC - i * DAY_SEC;
      const count = cal[ts] || 0;
      let c = 0;
      if (count >= 1) c = 1;
      if (count >= 3) c = 2;
      if (count >= 5) c = 3;
      if (count >= 7) c = 4;
      days.push({ ts, c, count });
    }

    // Group into weeks
    const weeks = [];
    let week    = [];
    days.forEach((d, i) => {
      week.push(d);
      if (week.length === 7 || i === days.length - 1) {
        weeks.push(week);
        week = [];
      }
    });

    // Month label row
    const seenMonths = new Set();
    const monthLabels = weeks.map(w => {
      const dt  = new Date(w[0].ts * 1000);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (!seenMonths.has(key)) { seenMonths.add(key); return MONTHS[dt.getMonth()]; }
      return '';
    });

    const monthsHTML = monthLabels
      .map(m => `<span>${m}</span>`)
      .join('');

    const weeksHTML = weeks
      .map(w => `<div class="hm-week">${
        w.map(d =>
          `<div class="hm-day" data-c="${d.c}" title="${d.count} submission${d.count !== 1 ? 's' : ''}"></div>`
        ).join('')
      }</div>`)
      .join('');

    return `
<div class="hm-months-row">${monthsHTML}</div>
<div class="hm-weeks-row">${weeksHTML}</div>`;
  }

  function buildTopicBars(skillData) {
    if (!skillData || !skillData.length) {
      return `<p style="font-family:var(--mono);font-size:10px;color:var(--text3)">No topic data available.</p>`;
    }

    // Flatten all tags, prefer Advanced > Intermediate > Fundamental
    const allTags = skillData
      .flatMap(g => g.tags || [])
      .filter(t => t.problemsSolved > 0);

    // Deduplicate by tagName, keep highest count
    const map = new Map();
    allTags.forEach(t => {
      if (!map.has(t.tagName) || map.get(t.tagName) < t.problemsSolved) {
        map.set(t.tagName, t.problemsSolved);
      }
    });

    const top   = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
    const max   = top[0]?.[1] || 1;

    return top.map(([name, count]) => {
      const pct = Math.round((count / max) * 100);
      return `
<div class="tb-row">
  <span class="tb-lbl" title="${name}">${name}</span>
  <div class="tb-track"><div class="tb-fill" style="width:0%" data-pct="${pct}%"></div></div>
  <span class="tb-n">${count}</span>
</div>`;
    }).join('');
  }

  function animateBars() {
    document.querySelectorAll('.tb-fill[data-pct]').forEach(bar => {
      const pct = bar.getAttribute('data-pct');
      // slight delay so CSS transition fires
      requestAnimationFrame(() => {
        setTimeout(() => { bar.style.width = pct; }, 80);
      });
    });
  }

  /* ---------- render ---------- */

  function render(stats, calendarRaw, skillData) {
    const { easySolved = 0, mediumSolved = 0, hardSolved = 0,
            ranking = 0, acceptanceRate = 0 } = stats;

    const donut     = buildDonut(easySolved, mediumSolved, hardSolved);
    const heatmap   = buildHeatmap(calendarRaw);
    const topicBars = buildTopicBars(skillData);

    wrap.innerHTML = `
<!-- ---- STAT ROW ---- -->
<div class="lc-top">
  <div class="lc-stat easy">
    <span class="lc-stat-label">EASY SOLVED</span>
    <span class="lc-stat-val">${easySolved}</span>
    <span class="lc-stat-sub">problems</span>
  </div>
  <div class="lc-stat medium">
    <span class="lc-stat-label">MEDIUM SOLVED</span>
    <span class="lc-stat-val">${mediumSolved}</span>
    <span class="lc-stat-sub">problems</span>
  </div>
  <div class="lc-stat hard">
    <span class="lc-stat-label">HARD SOLVED</span>
    <span class="lc-stat-val">${hardSolved}</span>
    <span class="lc-stat-sub">problems</span>
  </div>
</div>

<!-- ---- MID CARDS ---- -->
<div class="lc-mid">
  <div class="lc-card">
    <div class="lc-card-title">Problems by Difficulty</div>
    <div class="donut-wrap">
      ${donut}
      <div class="donut-legend">
        <div class="dl-row">
          <div class="dl-dot" style="background:var(--accent)"></div>
          <span class="dl-lbl">Easy</span>
          <span class="dl-val">${easySolved}</span>
        </div>
        <div class="dl-row">
          <div class="dl-dot" style="background:var(--accent3)"></div>
          <span class="dl-lbl">Medium</span>
          <span class="dl-val">${mediumSolved}</span>
        </div>
        <div class="dl-row">
          <div class="dl-dot" style="background:var(--accent4)"></div>
          <span class="dl-lbl">Hard</span>
          <span class="dl-val">${hardSolved}</span>
        </div>
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
          <div class="dl-row">
            <span class="dl-lbl" style="color:var(--text3)">Global Rank</span>
            <span class="dl-val">${ranking ? '#' + ranking.toLocaleString() : '—'}</span>
          </div>
          <div class="dl-row" style="margin-top:7px">
            <span class="dl-lbl" style="color:var(--text3)">Acceptance</span>
            <span class="dl-val">${acceptanceRate ? acceptanceRate.toFixed(1) + '%' : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="lc-card">
    <div class="lc-card-title">Top Topics Covered</div>
    <div class="topic-bars">${topicBars}</div>
  </div>
</div>

<!-- ---- HEATMAP ---- -->
<div class="lc-bot">
  <div class="lc-card-title">Daily Submission Activity — Last 12 Months</div>
  ${heatmap}
  <div class="hm-legend">
    <span>Less</span>
    <div class="hm-day"></div>
    <div class="hm-day" data-c="1"></div>
    <div class="hm-day" data-c="2"></div>
    <div class="hm-day" data-c="3"></div>
    <div class="hm-day" data-c="4"></div>
    <span>More</span>
  </div>
</div>`;

    animateBars();
  }

  /* ---------- fetch ---------- */

  async function safeFetch(url) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function loadLeetCode() {
    wrap.innerHTML = `<div class="lc-loading">⟳ &nbsp;Fetching live LeetCode stats...</div>`;

    const [solvedData, profileData, calData, skillData] = await Promise.all([
      safeFetch(`${API_BASE}/${LC_USER}/solved`),
      safeFetch(`${API_BASE}/${LC_USER}`),
      safeFetch(`${API_BASE}/${LC_USER}/calendar`),
      safeFetch(`${API_BASE}/skillStats/${LC_USER}`),
    ]);

    if (!solvedData && !profileData) {
      wrap.innerHTML = `
<div class="lc-error">
  Could not load live LeetCode data.
  <a href="${PROFILE_URL}" target="_blank" rel="noopener"
     style="color:var(--accent);margin-left:8px">
    View profile directly ↗
  </a>
</div>`;
      return;
    }

    const stats = {
      easySolved:     solvedData?.easySolved    || 0,
      mediumSolved:   solvedData?.mediumSolved  || 0,
      hardSolved:     solvedData?.hardSolved    || 0,
      ranking:        profileData?.ranking      || 0,
      acceptanceRate: profileData?.acceptanceRate || 0,
    };

    const calendar = calData?.submissionCalendar || {};

    // Normalise skillStats shape
    const tagCounts  = skillData?.data?.matchedUser?.tagProblemCounts;
    const skillArray = tagCounts ? [
      { tagName: 'Advanced',     tags: tagCounts.advanced     || [] },
      { tagName: 'Intermediate', tags: tagCounts.intermediate || [] },
      { tagName: 'Fundamental',  tags: tagCounts.fundamental  || [] },
    ] : [];

    render(stats, calendar, skillArray);
  }

  loadLeetCode();

})();
