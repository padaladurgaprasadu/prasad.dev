/* ============================================================
   PRASAD.DEV — Portfolio Script
   Author : Padala Durga Prasadu
   Version: 4.0 — Direct LeetCode GraphQL API (no cold start)
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
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ---- 4. LEETCODE LIVE DASHBOARD ---- */
(function () {

  const USER    = 'PadalaDurgaPrasad';
  const PROFILE = 'https://leetcode.com/u/' + USER + '/';
  const wrap    = document.getElementById('lcWrap');
  if (!wrap) return;

  /* CORS proxies — tried in order until one works */
  const PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
  ];
  const LC_GQL = 'https://leetcode.com/graphql';

  /* GraphQL queries */
  const Q_STATS = JSON.stringify({
    query: `query($u:String!){matchedUser(username:$u){submitStats{acSubmissionNum{difficulty count}} profile{ranking}}}`,
    variables: { u: USER }
  });
  const Q_CAL = JSON.stringify({
    query: `query($u:String!){matchedUser(username:$u){userCalendar{submissionCalendar}}}`,
    variables: { u: USER }
  });
  const Q_SKILLS = JSON.stringify({
    query: `query($u:String!){matchedUser(username:$u){tagProblemCounts{advanced{tagName problemsSolved} intermediate{tagName problemsSolved} fundamental{tagName problemsSolved}}}}`,
    variables: { u: USER }
  });

  async function gqlFetch(body, proxyIdx) {
    if (proxyIdx >= PROXIES.length) return null;
    try {
      const url = PROXIES[proxyIdx] + encodeURIComponent(LC_GQL);
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(9000)
      });
      if (!r.ok) throw new Error();
      const j = await r.json();
      if (j.errors) throw new Error();
      return j.data || null;
    } catch {
      return gqlFetch(body, proxyIdx + 1);
    }
  }

  async function gql(body) { return gqlFetch(body, 0); }

  /* Fallback — alfa REST API */
  const ALFA = 'https://alfa-leetcode-api.onrender.com';
  async function alfaGet(path) {
    try {
      const r = await fetch(ALFA + path, { signal: AbortSignal.timeout(65000) });
      return r.ok ? r.json() : null;
    } catch { return null; }
  }

  /* ── SVG Donut ── */
  function donut(easy, med, hard) {
    const total = easy + med + hard;
    const R = 52, cx = 66, cy = 66, sw = 6, C = 2 * Math.PI * R, gap = 0.013 * C;
    const eL = total > 0 ? (easy / total) * C - gap : 0;
    const mL = total > 0 ? (med  / total) * C - gap : 0;
    const hL = total > 0 ? (hard / total) * C - gap : 0;
    const base = C * 0.25;
    const arc = (col, len, off) => len > 0
      ? `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" stroke-linecap="round"/>`
      : '';
    return `<svg class="donut-svg" width="132" height="132" viewBox="0 0 132 132">
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="${sw}"/>
      ${arc('#3EC99A',eL,base)}${arc('#F5BE5A',mL,base+eL+gap)}${arc('#ED6A6A',hL,base+eL+mL+gap*2)}
      <text x="${cx}" y="${cy-6}" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="26" font-weight="300" fill="#E8E6DF">${total}</text>
      <text x="${cx}" y="${cy+13}" text-anchor="middle" font-family="DM Mono,monospace" font-size="7" letter-spacing="2" fill="#4A4846">SOLVED</text>
    </svg>`;
  }

  /* ── Heatmap ── */
  function heatmap(raw) {
    const cal = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : (raw || {});
    const NOW = Math.floor(Date.now() / 1000), DAY = 86400;
    const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days = Array.from({ length: 366 }, (_, i) => {
      const ts = Math.floor(NOW/DAY)*DAY - (365-i)*DAY, n = cal[ts]||0;
      return { ts, n, c: n>=7?4:n>=5?3:n>=3?2:n>=1?1:0 };
    });
    const weeks=[]; let w=[];
    days.forEach((d,i)=>{ w.push(d); if(w.length===7||i===days.length-1){weeks.push(w);w=[];} });
    const seen=new Set();
    const lbls=weeks.map(wk=>{ const dt=new Date(wk[0].ts*1000),k=dt.getFullYear()+'-'+dt.getMonth(); return !seen.has(k)?(seen.add(k),MO[dt.getMonth()]):''; });
    return `<div class="hm-months-row">${lbls.map(m=>`<span>${m}</span>`).join('')}</div>
<div class="hm-weeks-row">${weeks.map(wk=>`<div class="hm-week">${wk.map(d=>`<div class="hm-day" data-c="${d.c}" title="${d.n} submission${d.n!==1?'s':''}"></div>`).join('')}</div>`).join('')}</div>`;
  }

  /* ── Topic bars ── */
  function topicBars(groups) {
    if (!groups?.length) return `<p style="font-family:var(--mono);font-size:9px;color:var(--text3)">No topic data yet.</p>`;
    const map = new Map();
    groups.flatMap(g=>g.tags||[]).forEach(t=>{ if(!map.has(t.tagName)||map.get(t.tagName)<t.problemsSolved) map.set(t.tagName,t.problemsSolved); });
    const top=[...map.entries()].filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,12);
    const max=top[0]?.[1]||1;
    return top.map(([name,n])=>`<div class="tb-row"><span class="tb-lbl" title="${name}">${name}</span><div class="tb-track"><div class="tb-fill" style="width:0%" data-pct="${Math.round(n/max*100)}%"></div></div><span class="tb-n">${n}</span></div>`).join('');
  }

  /* ── Render ── */
  function render(s, calRaw, skillGroups) {
    const { easy=0, medium=0, hard=0, ranking=0, acceptance=0 } = s;
    wrap.innerHTML = `
<div class="lc-top">
  <div class="lc-stat easy"><span class="lc-stat-label">EASY SOLVED</span><span class="lc-stat-val">${easy}</span><span class="lc-stat-sub">problems</span></div>
  <div class="lc-stat medium"><span class="lc-stat-label">MEDIUM SOLVED</span><span class="lc-stat-val">${medium}</span><span class="lc-stat-sub">problems</span></div>
  <div class="lc-stat hard"><span class="lc-stat-label">HARD SOLVED</span><span class="lc-stat-val">${hard}</span><span class="lc-stat-sub">problems</span></div>
</div>
<div class="lc-mid">
  <div class="lc-card">
    <div class="lc-card-title">Problems by Difficulty</div>
    <div class="donut-wrap">
      ${donut(easy,medium,hard)}
      <div class="donut-legend">
        <div class="dl-row"><div class="dl-dot" style="background:var(--accent)"></div><span class="dl-lbl">Easy</span><span class="dl-val">${easy}</span></div>
        <div class="dl-row"><div class="dl-dot" style="background:var(--accent3)"></div><span class="dl-lbl">Medium</span><span class="dl-val">${medium}</span></div>
        <div class="dl-row"><div class="dl-dot" style="background:var(--accent4)"></div><span class="dl-lbl">Hard</span><span class="dl-val">${hard}</span></div>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
          <div class="dl-row"><span class="dl-lbl" style="color:var(--text3)">Global Rank</span><span class="dl-val">${ranking?'#'+ranking.toLocaleString():'—'}</span></div>
          <div class="dl-row" style="margin-top:6px"><span class="dl-lbl" style="color:var(--text3)">Acceptance</span><span class="dl-val">${acceptance?acceptance.toFixed(1)+'%':'—'}</span></div>
        </div>
      </div>
    </div>
  </div>
  <div class="lc-card">
    <div class="lc-card-title">Top Topics Covered</div>
    <div class="topic-bars">${topicBars(skillGroups)}</div>
  </div>
</div>
<div class="lc-bot">
  <div class="lc-card-title">Daily Activity — Last 12 Months</div>
  ${heatmap(calRaw)}
  <div class="hm-legend">
    <span>Less</span>
    <div class="hm-day"></div><div class="hm-day" data-c="1"></div>
    <div class="hm-day" data-c="2"></div><div class="hm-day" data-c="3"></div>
    <div class="hm-day" data-c="4"></div>
    <span>More</span>
  </div>
</div>`;
    requestAnimationFrame(()=>setTimeout(()=>document.querySelectorAll('.tb-fill[data-pct]').forEach(b=>{b.style.width=b.dataset.pct;}),100));
  }

  /* ── MAIN LOAD ── */
  async function load() {
    wrap.innerHTML = `<div class="lc-loading">⟳ &nbsp;Fetching live LeetCode stats...</div>`;

    /* === PATH 1: LeetCode GraphQL via CORS proxy (fast, ~2s) === */
    const [statsD, calD, skillD] = await Promise.all([
      gql(Q_STATS), gql(Q_CAL), gql(Q_SKILLS)
    ]);

    if (statsD?.matchedUser) {
      const sub    = statsD.matchedUser.submitStats?.acSubmissionNum || [];
      const easy   = sub.find(x=>x.difficulty==='Easy')?.count   || 0;
      const medium = sub.find(x=>x.difficulty==='Medium')?.count || 0;
      const hard   = sub.find(x=>x.difficulty==='Hard')?.count   || 0;
      const ranking    = statsD.matchedUser.profile?.ranking || 0;
      const calRaw     = calD?.matchedUser?.userCalendar?.submissionCalendar || '{}';
      const tc         = skillD?.matchedUser?.tagProblemCounts;
      const skillGrps  = tc ? [{tags:tc.advanced||[]},{tags:tc.intermediate||[]},{tags:tc.fundamental||[]}] : [];
      render({ easy, medium, hard, ranking, acceptance: 0 }, calRaw, skillGrps);
      return; /* done! */
    }

    /* === PATH 2: alfa-leetcode REST fallback (cold start ~30-60s) === */
    wrap.innerHTML = `<div class="lc-loading">⟳ &nbsp;Connecting... (first load may take ~30s)</div>`;
    const [solved, profile, calRest, skillRest] = await Promise.all([
      alfaGet('/'+USER+'/solved'),
      alfaGet('/'+USER),
      alfaGet('/'+USER+'/calendar'),
      alfaGet('/skillStats/'+USER),
    ]);

    if (!solved && !profile) {
      wrap.innerHTML = `<div class="lc-error">Could not load data. <a href="${PROFILE}" target="_blank" style="color:var(--accent)">View profile ↗</a><br><small style="color:var(--text3);font-family:var(--mono);font-size:9px">Refresh page to retry.</small></div>`;
      return;
    }

    const tc2   = skillRest?.data?.matchedUser?.tagProblemCounts;
    const grps2 = tc2 ? [{tags:tc2.advanced||[]},{tags:tc2.intermediate||[]},{tags:tc2.fundamental||[]}] : [];
    render(
      { easy:solved?.easySolved||0, medium:solved?.mediumSolved||0, hard:solved?.hardSolved||0,
        ranking:profile?.ranking||0, acceptance:profile?.acceptanceRate||0 },
      calRest?.submissionCalendar || {},
      grps2
    );
  }

  load();

})();
