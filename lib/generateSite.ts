import type { PortfolioData, Skill } from "./portfolio"

// One generator for everything: the live preview iframe, the ZIP download and the
// Netlify deploy all use this HTML, so what the user previews is what gets published.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

/** Only http(s)/mailto links survive; bare domains get https://. Blocks javascript: etc. */
export function safeUrl(raw: string, { allowDataImage = false } = {}): string {
  const url = raw.trim()
  if (!url) return ""
  if (allowDataImage && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(url)) return url
  if (/^mailto:/i.test(url)) return url
  if (/^https?:\/\//i.test(url)) {
    try {
      return new URL(url).toString()
    } catch {
      return ""
    }
  }
  if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(url)) return `https://${url}`
  return ""
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?"

function groupSkills(skills: Skill[]) {
  const groups = new Map<string, Skill[]>()
  for (const s of skills) {
    if (!s.name.trim()) continue
    const key = s.category.trim() || "Other"
    groups.set(key, [...(groups.get(key) || []), s])
  }
  return [...groups.entries()]
}

const ICONS = {
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.3 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 5h18v14H3z"/><path fill="none" stroke="currentColor" stroke-width="2" d="m3 6 9 7 9-7"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
}

// Google Fonts rejects the whole request if any weight is missing, so only ask for ones every font has.
const FONT_URL = (font: string) =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, "+")}:wght@${
    font === "Space Mono" ? "400;700" : "400;500;600;700"
  }&display=swap`

function css(d: PortfolioData) {
  const t = d.theme
  const mono = /Mono/.test(t.font)
  return `
:root{--p:${t.primaryColor};--s:${t.secondaryColor};--bg:${t.backgroundColor};--fg:${t.textColor};
--muted:color-mix(in srgb,var(--fg) 72%,var(--bg));--card:color-mix(in srgb,var(--fg) 5%,var(--bg));
--line:color-mix(in srgb,var(--fg) 14%,var(--bg));--radius:16px}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:'${t.font}',${mono ? "ui-monospace,monospace" : "system-ui,-apple-system,sans-serif"};background:var(--bg);color:var(--fg);line-height:1.6;overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit}
img{max-width:100%;display:block}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
#fx{position:fixed;inset:0;z-index:0;pointer-events:none}
main,header,footer{position:relative;z-index:1}
.nav{position:sticky;top:0;z-index:10;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);background:color-mix(in srgb,var(--bg) 78%,transparent);border-bottom:1px solid var(--line)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:64px;gap:16px}
.logo{font-weight:800;text-decoration:none;letter-spacing:.02em}
.nav ul{display:flex;gap:22px;list-style:none;font-size:.92rem}
.nav ul a{text-decoration:none;color:var(--muted)}
.nav ul a:hover{color:var(--p)}
section{padding:96px 0}
.hero{min-height:calc(100vh - 64px);display:flex;align-items:center;padding:64px 0}
.hero .wrap{display:flex;flex-direction:column;align-items:center;text-align:center}
.avatar{width:148px;height:148px;border-radius:50%;overflow:hidden;display:grid;place-items:center;font-size:52px;font-weight:800;color:#fff;
background:linear-gradient(135deg,var(--p),var(--s));box-shadow:0 0 0 6px color-mix(in srgb,var(--p) 18%,transparent),0 20px 60px -20px var(--p);margin-bottom:28px}
.avatar img{width:100%;height:100%;object-fit:cover}
h1{font-size:clamp(2.4rem,7vw,4.4rem);line-height:1.08;font-weight:800;letter-spacing:-.02em}
.grad{background:linear-gradient(90deg,var(--p),var(--s));-webkit-background-clip:text;background-clip:text;color:transparent}
.role{font-size:clamp(1.1rem,2.6vw,1.45rem);color:var(--p);font-weight:600;margin-top:12px}
.loc{display:inline-flex;gap:6px;align-items:center;color:var(--muted);font-size:.95rem;margin-top:10px}
.loc svg,.btn svg{width:18px;height:18px}
.bio{max-width:640px;color:var(--muted);font-size:1.1rem;margin-top:22px;white-space:pre-line}
.ctas{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:34px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:600;text-decoration:none;border:2px solid var(--p);color:var(--p);transition:transform .2s,box-shadow .2s,background .2s}
.btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px -10px var(--p)}
.btn.primary{background:linear-gradient(135deg,var(--p),var(--s));border-color:transparent;color:#fff}
.title{font-size:clamp(1.9rem,4.5vw,2.8rem);font-weight:800;margin-bottom:44px;text-align:center;letter-spacing:-.01em}
.projects{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column;transition:transform .3s,border-color .3s,box-shadow .3s}
.card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--p) 55%,var(--line));box-shadow:0 24px 50px -24px color-mix(in srgb,var(--p) 60%,transparent)}
.thumb{aspect-ratio:16/10;background:linear-gradient(135deg,var(--p),var(--s));display:grid;place-items:center;color:#fff;font-size:2.2rem;font-weight:800;overflow:hidden}
.thumb img{width:100%;height:100%;object-fit:cover}
.card .body{padding:22px;display:flex;flex-direction:column;gap:12px;flex:1}
.card h3{font-size:1.25rem;font-weight:700}
.card p{color:var(--muted);font-size:.97rem;white-space:pre-line}
.tags{display:flex;flex-wrap:wrap;gap:6px}
.tag{font-size:.78rem;font-weight:600;padding:4px 10px;border-radius:999px;color:var(--p);background:color-mix(in srgb,var(--p) 13%,transparent);border:1px solid color-mix(in srgb,var(--p) 30%,transparent)}
.links{display:flex;gap:10px;margin-top:auto;padding-top:6px}
.links .btn{padding:8px 16px;font-size:.88rem}
.skills{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.group{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:24px}
.group h3{font-size:.85rem;text-transform:uppercase;letter-spacing:.12em;color:var(--s);margin-bottom:18px}
.skill{margin-bottom:16px}.skill:last-child{margin-bottom:0}
.skill .row{display:flex;justify-content:space-between;font-size:.95rem;margin-bottom:6px;font-weight:500}
.skill .row span:last-child{color:var(--muted)}
.bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden}
.bar i{display:block;height:100%;width:var(--w);border-radius:inherit;background:linear-gradient(90deg,var(--p),var(--s));transition:width 1.2s cubic-bezier(.65,0,.35,1)}
.anim .bar i{width:0}.anim .in .bar i{width:var(--w)}
.contact{text-align:center}
.contact p{color:var(--muted);max-width:520px;margin:-24px auto 30px}
footer{padding:36px 0;text-align:center;color:var(--muted);font-size:.88rem;border-top:1px solid var(--line)}
.reveal{transition:opacity .8s ease,transform .8s ease}
.anim .reveal{opacity:0;transform:translateY(28px)}
.anim .reveal.in{opacity:1;transform:none}
@media (max-width:720px){.nav ul{display:none}section{padding:72px 0}.avatar{width:120px;height:120px;font-size:42px}.projects{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}.anim .reveal{opacity:1;transform:none}.anim .bar i{width:var(--w)}#fx{display:none}}

/* ---- layout: minimal ---- */
.l-minimal .hero .wrap{align-items:flex-start;text-align:left}
.l-minimal .ctas{justify-content:flex-start}
.l-minimal .avatar{width:96px;height:96px;font-size:34px;box-shadow:none}
.l-minimal .grad{background:none;color:var(--fg)}
.l-minimal .title{text-align:left;font-size:1.05rem;text-transform:uppercase;letter-spacing:.18em;color:var(--p);font-weight:700}
.l-minimal .card,.l-minimal .group{border-radius:8px;box-shadow:none}
.l-minimal .card:hover{transform:none;box-shadow:none}
.l-minimal .btn.primary{background:var(--fg);color:var(--bg)}
.l-minimal .contact{text-align:left}.l-minimal .contact p{margin-left:0}.l-minimal .contact .ctas{justify-content:flex-start}

/* ---- layout: brutalist ---- */
.l-brutalist{--radius:0}
.l-brutalist .nav{background:var(--bg);border-bottom:3px solid var(--fg)}
.l-brutalist h1,.l-brutalist .title{text-transform:uppercase;letter-spacing:-.03em}
.l-brutalist .grad{background:none;color:var(--fg);-webkit-text-stroke:0}
.l-brutalist .avatar{border-radius:0;border:3px solid var(--fg);box-shadow:8px 8px 0 var(--p)}
.l-brutalist .card,.l-brutalist .group{border:3px solid var(--fg);box-shadow:8px 8px 0 var(--fg);background:var(--bg)}
.l-brutalist .card:hover{transform:translate(-3px,-3px);box-shadow:11px 11px 0 var(--p)}
.l-brutalist .btn{border-radius:0;border:3px solid var(--fg);color:var(--fg);box-shadow:4px 4px 0 var(--fg)}
.l-brutalist .btn.primary{background:var(--p);color:var(--bg)}
.l-brutalist .btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--fg)}
.l-brutalist .tag{border-radius:0;border:2px solid var(--fg);color:var(--fg);background:var(--s)}
.l-brutalist .bar{border-radius:0;border:2px solid var(--fg);height:14px;background:transparent}
.l-brutalist .bar i{border-radius:0;background:var(--p)}
.l-brutalist .thumb{border-bottom:3px solid var(--fg)}

/* ---- layout: neon ---- */
.l-neon h1,.l-neon .title{text-transform:uppercase;letter-spacing:.14em}
.l-neon h1{text-shadow:0 0 18px color-mix(in srgb,var(--p) 70%,transparent),0 0 60px color-mix(in srgb,var(--s) 45%,transparent)}
.l-neon .grad{background-size:200% auto;animation:shine 4s linear infinite}
.l-neon .role{letter-spacing:.3em;text-transform:uppercase;font-size:clamp(.9rem,2vw,1.1rem);color:var(--s);text-shadow:0 0 12px var(--s)}
.l-neon .card,.l-neon .group{background:color-mix(in srgb,var(--bg) 70%,transparent);backdrop-filter:blur(8px);border-color:color-mix(in srgb,var(--p) 35%,transparent);box-shadow:0 0 24px -8px color-mix(in srgb,var(--p) 50%,transparent)}
.l-neon .btn.primary{box-shadow:0 0 24px color-mix(in srgb,var(--p) 60%,transparent)}
.l-neon .bar i{box-shadow:0 0 12px var(--p)}
@keyframes shine{to{background-position:200% center}}

/* ---- layout: terminal ---- */
.l-terminal{--radius:4px}
.l-terminal .hero .wrap{align-items:flex-start;text-align:left}
.l-terminal .ctas{justify-content:flex-start}
.l-terminal .avatar{border-radius:4px;width:110px;height:110px;font-size:36px;box-shadow:none;border:1px solid var(--p)}
.l-terminal .grad{background:none;color:var(--fg)}
.l-terminal h1::before{content:"> ";color:var(--s)}
.l-terminal h1::after{content:"_";animation:blink 1s steps(1) infinite;color:var(--p)}
.l-terminal .title{text-align:left;font-size:1.3rem}
.l-terminal .title::before{content:"$ cat ./";color:var(--s);font-weight:400}
.l-terminal .card,.l-terminal .group{border-style:dashed;border-color:color-mix(in srgb,var(--p) 45%,transparent);background:transparent}
.l-terminal .btn{border-radius:4px}
.l-terminal .btn.primary{background:var(--p);color:var(--bg)}
.l-terminal .contact{text-align:left}.l-terminal .contact p{margin-left:0}.l-terminal .contact .ctas{justify-content:flex-start}
.l-terminal::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:20;background:repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0,rgba(0,0,0,.12) 1px,transparent 1px,transparent 3px)}
@keyframes blink{50%{opacity:0}}
`
}

function script(d: PortfolioData) {
  const effect = !d.animations ? "none" : d.theme.layout === "neon" ? "stars" : d.theme.layout === "grid" ? "particles" : "none"
  return `
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (el) { e.preventDefault(); el.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); }
    });
  });
  if (document.body.classList.contains('anim') && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold: 0.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }
  ${
    d.soundEffects
      ? `var ac; function blip(f){ try { ac = ac || new (window.AudioContext||window.webkitAudioContext)(); if (ac.state==='suspended') return;
      var o=ac.createOscillator(), g=ac.createGain(); o.type='sine'; o.frequency.value=f; g.gain.setValueAtTime(.04,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.12); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime+.13);} catch(e){} }
  window.addEventListener('pointerdown', function(){ try { ac = ac || new (window.AudioContext||window.webkitAudioContext)(); ac.resume(); } catch(e){} }, {once:true});
  document.querySelectorAll('.btn,.card').forEach(function(el){ el.addEventListener('mouseenter', function(){ blip(el.classList.contains('btn')?880:520); }); });`
      : ""
  }
  var mode = ${JSON.stringify(effect)};
  if (mode === 'none' || reduce) return;
  var c = document.getElementById('fx'); if (!c) return;
  var x = c.getContext('2d'), w, h, dpr = Math.min(window.devicePixelRatio || 1, 2), pts = [];
  var P = ${JSON.stringify(d.theme.primaryColor)}, S = ${JSON.stringify(d.theme.secondaryColor)};
  function size(){ w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr; c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px'; }
  size(); addEventListener('resize', size);
  var n = mode === 'stars' ? 260 : Math.min(70, Math.round(innerWidth / 18));
  for (var i = 0; i < n; i++) pts.push(mode === 'stars'
    ? {x:(Math.random()-.5)*w, y:(Math.random()-.5)*h, z:Math.random()*w, c:Math.random()<.5?P:S}
    : {x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.4*dpr, vy:(Math.random()-.5)*.4*dpr});
  var running = true;
  document.addEventListener('visibilitychange', function(){ running = !document.hidden; if (running) requestAnimationFrame(frame); });
  function frame(){
    if (!running) return;
    x.clearRect(0,0,w,h);
    if (mode === 'stars') {
      for (var i=0;i<pts.length;i++){ var p=pts[i]; p.z -= 6*dpr; if (p.z<=1){ p.z=w; p.x=(Math.random()-.5)*w; p.y=(Math.random()-.5)*h; }
        var k=(w*.5)/p.z, sx=p.x*k+w/2, sy=p.y*k+h/2, r=Math.max(.4,(1-p.z/w)*2.6*dpr);
        x.globalAlpha=Math.min(1,(1-p.z/w)*1.4); x.fillStyle=p.c; x.beginPath(); x.arc(sx,sy,r,0,6.283); x.fill(); }
    } else {
      x.fillStyle=P;
      for (var i=0;i<pts.length;i++){ var p=pts[i]; p.x+=p.vx; p.y+=p.vy; if(p.x<0||p.x>w)p.vx*=-1; if(p.y<0||p.y>h)p.vy*=-1;
        x.globalAlpha=.55; x.beginPath(); x.arc(p.x,p.y,1.8*dpr,0,6.283); x.fill();
        for (var j=i+1;j<pts.length;j++){ var q=pts[j], dx=p.x-q.x, dy=p.y-q.y, dd=dx*dx+dy*dy, m=140*dpr;
          if (dd<m*m){ x.globalAlpha=(1-Math.sqrt(dd)/m)*.22; x.strokeStyle=P; x.lineWidth=dpr; x.beginPath(); x.moveTo(p.x,p.y); x.lineTo(q.x,q.y); x.stroke(); } } }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();`
}

export function generateSiteHTML(d: PortfolioData): string {
  const name = d.name.trim() || "Your Name"
  const title = d.title.trim()
  const pageTitle = title ? `${name} | ${title}` : name
  const description = (d.bio.trim() || `${name}${title ? `, ${title}` : ""}. Portfolio of projects and skills.`).slice(0, 160)
  const email = d.email.trim()
  const github = safeUrl(d.github)
  const linkedin = safeUrl(d.linkedin)
  const website = safeUrl(d.website)
  const avatar = safeUrl(d.profilePicture, { allowDataImage: true })
  const projects = d.projects.filter((p) => p.title.trim() || p.description.trim())
  const skillGroups = groupSkills(d.skills)

  const socialButtons = [
    email && `<a class="btn primary" href="mailto:${esc(email)}">${ICONS.mail}Contact me</a>`,
    github && `<a class="btn" href="${esc(github)}" target="_blank" rel="noopener">${ICONS.github}GitHub</a>`,
    linkedin && `<a class="btn" href="${esc(linkedin)}" target="_blank" rel="noopener">${ICONS.linkedin}LinkedIn</a>`,
    website && `<a class="btn" href="${esc(website)}" target="_blank" rel="noopener">${ICONS.link}Website</a>`,
  ]
    .filter(Boolean)
    .join("")

  const projectCards = projects
    .map((p) => {
      const img = safeUrl(p.image, { allowDataImage: true })
      const live = safeUrl(p.liveUrl)
      const code = safeUrl(p.githubUrl)
      return `<article class="card reveal">
  <div class="thumb">${img ? `<img src="${esc(img)}" alt="${esc(p.title)}" loading="lazy">` : esc(initials(p.title))}</div>
  <div class="body">
    <h3>${esc(p.title)}</h3>
    ${p.description.trim() ? `<p>${esc(p.description.trim())}</p>` : ""}
    ${p.technologies.length ? `<div class="tags">${p.technologies.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
    ${
      live || code
        ? `<div class="links">${live ? `<a class="btn primary" href="${esc(live)}" target="_blank" rel="noopener">${ICONS.link}Live</a>` : ""}${
            code ? `<a class="btn" href="${esc(code)}" target="_blank" rel="noopener">${ICONS.github}Code</a>` : ""
          }</div>`
        : ""
    }
  </div>
</article>`
    })
    .join("\n")

  const skillsHTML = skillGroups
    .map(
      ([cat, list]) => `<div class="group reveal"><h3>${esc(cat)}</h3>${list
        .map(
          (s) =>
            `<div class="skill"><div class="row"><span>${esc(s.name)}</span><span>${s.level}%</span></div><div class="bar"><i style="--w:${s.level}%"></i></div></div>`,
        )
        .join("")}</div>`,
    )
    .join("\n")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: title || undefined,
    email: email ? `mailto:${email}` : undefined,
    sameAs: [github, linkedin, website].filter(Boolean),
  }

  const navLinks = [
    projects.length && `<li><a href="#projects">Projects</a></li>`,
    skillGroups.length && `<li><a href="#skills">Skills</a></li>`,
    `<li><a href="#contact">Contact</a></li>`,
  ]
    .filter(Boolean)
    .join("")

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(description)}">
${avatar && !avatar.startsWith("data:") ? `<meta property="og:image" content="${esc(avatar)}">` : ""}
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="${esc(d.theme.backgroundColor)}">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${d.theme.primaryColor}"/><text x="32" y="42" font-size="28" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#fff">${esc(initials(name))}</text></svg>`,
  )}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(FONT_URL(d.theme.font))}">
<style>${css(d)}</style>
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>
</head>
<body class="l-${d.theme.layout}${d.animations ? " anim" : ""}">
<canvas id="fx" aria-hidden="true"></canvas>
<header class="nav"><div class="wrap"><a class="logo grad" href="#top">${esc(name)}</a><nav aria-label="Sections"><ul>${navLinks}</ul></nav></div></header>
<main id="top">
<section class="hero"><div class="wrap reveal">
  <div class="avatar">${avatar ? `<img src="${esc(avatar)}" alt="${esc(name)}">` : esc(initials(name))}</div>
  <h1><span class="grad">${esc(name)}</span></h1>
  ${title ? `<p class="role">${esc(title)}</p>` : ""}
  ${d.location.trim() ? `<p class="loc">${ICONS.pin}${esc(d.location.trim())}</p>` : ""}
  ${d.bio.trim() ? `<p class="bio">${esc(d.bio.trim())}</p>` : ""}
  ${socialButtons ? `<div class="ctas">${socialButtons}</div>` : ""}
</div></section>
${projects.length ? `<section id="projects"><div class="wrap"><h2 class="title reveal"><span class="grad">Projects</span></h2><div class="projects">\n${projectCards}\n</div></div></section>` : ""}
${skillGroups.length ? `<section id="skills"><div class="wrap"><h2 class="title reveal"><span class="grad">Skills</span></h2><div class="skills">\n${skillsHTML}\n</div></div></section>` : ""}
<section id="contact" class="contact"><div class="wrap reveal">
  <h2 class="title"><span class="grad">Get in touch</span></h2>
  <p>Have a project, role or idea in mind? I'd love to hear about it.</p>
  ${socialButtons ? `<div class="ctas">${socialButtons}</div>` : ""}
</div></section>
</main>
<footer><div class="wrap">&copy; ${new Date().getFullYear()} ${esc(name)}</div></footer>
<script>${script(d)}</script>
</body>
</html>`
}

export function generateSiteFiles(d: PortfolioData): Record<string, string> {
  const name = d.name.trim() || "Portfolio"
  return {
    "index.html": generateSiteHTML(d),
    "README.md": `# ${name}: portfolio website

A single static page with no build step and no dependencies.

- Open \`index.html\` in a browser to view it.
- Deploy by uploading this folder to any static host: Netlify (drag and drop at app.netlify.com/drop),
  Vercel, GitHub Pages or Cloudflare Pages.
`,
  }
}
