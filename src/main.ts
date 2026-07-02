import './style.css';

// ── Typewriter title ──────────────────────────────────────────────────────────
function buildTitle(containerId: string, text: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;
  text.split('').forEach((ch, i) => {
    const span = document.createElement('span');
    span.textContent = ch === ' ' ? ' ' : ch;
    span.style.animationDelay = `${0.15 + i * 0.05}s`;
    container.appendChild(span);
  });
}
buildTitle('title', 'SALINA GIRI');

// ── Helpers ───────────────────────────────────────────────────────────────────
function scrollTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ── Reveal on scroll ──────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);
document.querySelectorAll<HTMLElement>('.reveal').forEach(el => revealObserver.observe(el));

// ── Tab bar — girl hops to the active section ─────────────────────────────────
const tabs     = Array.from(document.querySelectorAll<HTMLButtonElement>('.tab'));
const runner   = document.getElementById('runner') as HTMLDivElement;
const sections = tabs.map(t => document.getElementById(t.dataset['target'] ?? ''));
let current    = -1;

function placeRunner(index: number, withHop: boolean): void {
  const tab = tabs[index];
  if (!tab) return;
  runner.style.left = `${tab.offsetLeft + tab.offsetWidth / 2 - 20}px`;
  if (withHop) {
    runner.classList.remove('hop');
    void runner.offsetWidth;
    runner.classList.add('hop');
  }
}

function activateTab(index: number, withHop: boolean): void {
  if (index < 0 || index === current) return;
  current = index;
  tabs.forEach((t, k) => t.classList.toggle('active', k === index));
  placeRunner(index, withHop);
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => scrollTo(tab.dataset['target'] ?? ''));
});

const spyObserver = new IntersectionObserver(
  (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const i = sections.indexOf(entry.target as HTMLElement);
        if (i >= 0) activateTab(i, true);
      }
    });
  },
  { rootMargin: '-45% 0px -45% 0px' },
);
sections.forEach(s => { if (s) spyObserver.observe(s); });
window.addEventListener('load', () => activateTab(0, false));
window.addEventListener('resize', () => placeRunner(current < 0 ? 0 : current, false));

// ── C — Parallax clouds & sun ─────────────────────────────────────────────────
function initParallax(): void {
  type PEl = { el: HTMLElement; factor: number };
  const items: PEl[] = ([
    ['.c1', 0.07], ['.c2', 0.12], ['.c3', 0.05], ['.c4', 0.09], ['.sun', 0.04],
  ] as [string, number][])
    .map(([sel, f]) => ({ el: document.querySelector<HTMLElement>(sel)!, factor: f }))
    .filter(p => p.el);

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    items.forEach(({ el, factor }) => el.style.setProperty('translate', `0 ${y * factor}px`));
  }, { passive: true });
}
initParallax();

// ── A — Cursor ripple ─────────────────────────────────────────────────────────
function initCursorRipple(): void {
  const canvas = document.createElement('canvas');
  canvas.id = 'ripple-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d')!;
  interface Ripple { x: number; y: number; r: number; alpha: number; color: string; }
  const ripples: Ripple[] = [];
  const COLORS = ['rgba(255,184,210,', 'rgba(255,233,168,', 'rgba(174,224,255,', 'rgba(226,210,255,'];
  let lastX = -999; let lastY = -999;
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize, { passive: true });
  resize();
  window.addEventListener('mousemove', (e: MouseEvent) => {
    const dx = e.clientX - lastX; const dy = e.clientY - lastY;
    if (dx * dx + dy * dy > 400) {
      lastX = e.clientX; lastY = e.clientY;
      ripples.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 0.55, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    }
  }, { passive: true });
  (function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.r += 2.2; rip.alpha -= 0.014;
      if (rip.alpha <= 0) { ripples.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = rip.color + rip.alpha + ')'; ctx.lineWidth = 1.8; ctx.stroke();
    }
    requestAnimationFrame(animate);
  })();
}
initCursorRipple();

// ── B — Floating coins on click ───────────────────────────────────────────────
function initClickCoins(): void {
  const ITEMS = ['🪙', '⭐', '🌸', '✨', '💖', '🎮'];
  let idx = 0;
  document.addEventListener('click', (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button, .tab, .quest, .item, .menu a, .mg-overlay')) return;
    const el = document.createElement('span');
    el.textContent = ITEMS[idx % ITEMS.length]; idx++;
    el.className = 'float-coin';
    el.style.left = `${e.clientX}px`; el.style.top = `${e.clientY}px`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
  });
}
initClickCoins();

// ── D — Scroll XP bar ─────────────────────────────────────────────────────────
function initXPBar(): void {
  const fill  = document.getElementById('xp-fill')  as HTMLElement;
  const label = document.getElementById('xp-label') as HTMLElement;
  const track = fill.parentElement as HTMLElement;
  let currentLevel = 1;
  window.addEventListener('scroll', () => {
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
    fill.style.width = `${progress * 100}%`;
    track.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    const level = Math.min(Math.floor(progress * 5) + 1, 5);
    if (level !== currentLevel) {
      currentLevel = level;
      label.textContent = `LV.${level}`;
      label.classList.remove('xp-levelup');
      void label.offsetWidth;
      label.classList.add('xp-levelup');
      label.addEventListener('animationend', () => label.classList.remove('xp-levelup'), { once: true });
    }
  }, { passive: true });
}
initXPBar();

// ── F — Achievement toasts ────────────────────────────────────────────────────
function initAchievements(): void {
  const UNLOCKS: Record<string, string> = {
    player: 'PLAYER 1 unlocked!', inventory: 'Inventory opened!',
    experience: 'Quest cleared!', quests: 'Quest log unlocked!', save: 'Save point reached!',
  };
  const seen = new Set<string>();
  function showToast(text: string): void {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `<span class="achievement-icon" aria-hidden="true">🏆</span><div class="achievement-body"><span class="achievement-title">UNLOCKED</span><span class="achievement-name">${text}</span></div>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('achievement-toast--in')));
    setTimeout(() => {
      toast.classList.remove('achievement-toast--in');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2600);
  }
  const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      if (entry.isIntersecting && UNLOCKS[id] && !seen.has(id)) {
        seen.add(id); setTimeout(() => showToast(UNLOCKS[id]), 350);
      }
    });
  }, { threshold: 0.3 });
  Object.keys(UNLOCKS).forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
}
initAchievements();

// ── G — Hover +XP pop ────────────────────────────────────────────────────────
function initXPPops(): void {
  function attachPop(selector: string, xpText: string): void {
    document.querySelectorAll<HTMLElement>(selector).forEach(el => {
      el.addEventListener('mouseenter', () => {
        const rect = el.getBoundingClientRect();
        const pop  = document.createElement('span');
        pop.className = 'xp-pop'; pop.textContent = xpText;
        pop.style.left = `${rect.left + rect.width / 2}px`;
        pop.style.top  = `${rect.top - 8}px`;
        document.body.appendChild(pop);
        pop.addEventListener('animationend', () => pop.remove(), { once: true });
      });
    });
  }
  attachPop('.item',  '+10 XP');
  attachPop('.quest', '+25 XP');
}
initXPPops();

// ── 2 — Mini-game: Coin Collect Sprint ───────────────────────────────────────
interface GameCoin { x: number; y: number; vy: number; alive: boolean; label: string; color: string; }
interface Particle { x: number; y: number; vy: number; alpha: number; label: string; color: string; }

const COIN_POOL: { label: string; color: string }[] = [
  { label: 'TypeScript',  color: '#AEE0FF' },
  { label: 'React',       color: '#FFB8D2' },
  { label: 'Java',        color: '#FFE9A8' },
  { label: 'Azure ☁️',   color: '#AEE0FF' },
  { label: 'ESP32',       color: '#C7F0D8' },
  { label: 'Python',      color: '#FFE9A8' },
  { label: 'Docker',      color: '#C7F0D8' },
  { label: 'Node.js',     color: '#C7F0D8' },
  { label: 'Spring Boot', color: '#AEE0FF' },
  { label: 'PostgreSQL',  color: '#AEE0FF' },
  { label: 'Real Client', color: '#E2D2FF' },
  { label: 'HW → Cloud',  color: '#FFE9A8' },
  { label: 'Scrum',       color: '#E2D2FF' },
  { label: 'Linux',       color: '#C7F0D8' },
  { label: '🌸 Hire Me!', color: '#FFB8D2' },
];

function launchCoinGame(onDone: () => void): void {
  const section = document.getElementById('minigame') as HTMLElement;
  const wrap    = section.querySelector<HTMLElement>('.mg-wrap')!;
  const canvas  = section.querySelector<HTMLCanvasElement>('.mg-canvas')!;
  const ctx     = canvas.getContext('2d')!;
  const winEl   = section.querySelector<HTMLElement>('#mg-win')!;
  const subEl   = section.querySelector<HTMLElement>('#mg-sub')!;
  const numEl   = section.querySelector<HTMLElement>('#mg-num')!;
  const skipBtn = section.querySelector<HTMLButtonElement>('.mg-skip')!;

  // ── Constants ──
  const PW = 54, PH = 70;
  const COIN_R  = 18;
  const TARGET  = 15;
  const DURATION = 10;

  // ── State ──
  let playerX   = 0;
  let collected = 0;
  let timeLeft  = DURATION;
  let coinTimer = 0;
  let rafId     = 0;
  let lastTs    = 0;
  let active    = false;
  let finished  = false;
  const keys    = { left: false, right: false };
  let touchX: number | null = null;
  const coins: GameCoin[] = [];
  const particles: Particle[] = [];
  // shuffle pool so each game is different
  const pool = [...COIN_POOL].sort(() => Math.random() - 0.5);
  let poolIdx = 0;

  // ── Resize canvas to fit its container ──
  const resize = (): void => {
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
    playerX = canvas.width / 2 - PW / 2;
  };
  window.addEventListener('resize', resize, { passive: true });

  // ── Controls ──
  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left  = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  };
  const onKeyUp = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowLeft'  || e.key === 'a') keys.left  = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup',   onKeyUp);
  canvas.addEventListener('touchstart', (e: TouchEvent) => { touchX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener('touchmove',  (e: TouchEvent) => { touchX = e.touches[0].clientX; }, { passive: true });
  canvas.addEventListener('touchend',   () => { touchX = null; });

  // ── Draw: player character ──
  function drawPlayer(x: number, y: number): void {
    const cx = x + PW / 2;
    // hair body
    ctx.fillStyle = '#7a4a2b';
    ctx.beginPath(); ctx.ellipse(cx, y + PH * 0.32, PW * 0.48, PH * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    // face
    ctx.fillStyle = '#f6d2b8';
    ctx.beginPath(); ctx.arc(cx, y + PH * 0.28, PW * 0.3, 0, Math.PI * 2); ctx.fill();
    // fringe
    ctx.fillStyle = '#8a5532';
    ctx.beginPath(); ctx.ellipse(cx, y + PH * 0.15, PW * 0.33, PH * 0.1, 0, Math.PI, Math.PI * 2); ctx.fill();
    // eyes
    ctx.fillStyle = '#3b2a32';
    ctx.beginPath(); ctx.ellipse(cx - 7, y + PH * 0.26, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 7, y + PH * 0.26, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
    // eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 6, y + PH * 0.24, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 8, y + PH * 0.24, 1, 0, Math.PI * 2); ctx.fill();
    // blush
    ctx.fillStyle = 'rgba(255,179,200,.7)';
    ctx.beginPath(); ctx.arc(cx - 11, y + PH * 0.31, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 11, y + PH * 0.31, 3.5, 0, Math.PI * 2); ctx.fill();
    // smile
    ctx.strokeStyle = '#b06a78'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, y + PH * 0.31, 4.5, 0.1, Math.PI - 0.1); ctx.stroke();
    // dress
    ctx.fillStyle = '#ff9ec4';
    ctx.beginPath();
    ctx.moveTo(cx - PW * 0.22, y + PH * 0.52);
    ctx.lineTo(cx + PW * 0.22, y + PH * 0.52);
    ctx.lineTo(cx + PW * 0.42, y + PH);
    ctx.lineTo(cx - PW * 0.42, y + PH);
    ctx.closePath(); ctx.fill();
    // arms
    ctx.fillStyle = '#f6d2b8';
    ctx.beginPath(); ctx.roundRect(cx - PW * 0.44, y + PH * 0.52, PW * 0.14, PH * 0.3, 4); ctx.fill();
    ctx.beginPath(); ctx.roundRect(cx + PW * 0.3,  y + PH * 0.52, PW * 0.14, PH * 0.3, 4); ctx.fill();
  }

  // ── Draw: coin ──
  function drawCoin(x: number, y: number, color: string, label: string): void {
    ctx.fillStyle   = color;
    ctx.strokeStyle = '#5B4B6B';
    ctx.lineWidth   = 2.5;
    ctx.beginPath(); ctx.arc(x, y, COIN_R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, COIN_R * 0.55, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.arc(x - COIN_R * 0.3, y - COIN_R * 0.3, COIN_R * 0.22, 0, Math.PI * 2); ctx.fill();
    // label pill above the coin
    ctx.save();
    ctx.font = 'bold 10px Fredoka, system-ui';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(label).width;
    const ph = 16, pw = tw + 12, py = y - COIN_R - 12;
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.strokeStyle = '#5B4B6B'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(x - pw / 2, py - ph / 2, pw, ph, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5B4B6B';
    ctx.fillText(label, x, py);
    ctx.restore();
  }

  // ── Draw: collected skill pop-ups ──
  function drawParticles(): void {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = 'bold 13px Fredoka, system-ui';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(p.label).width;
      const ph = 22, pw = tw + 18;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#5B4B6B'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(p.x - pw / 2, p.y - ph / 2, pw, ph, 11); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#5B4B6B';
      ctx.fillText(p.label, p.x, p.y);
      ctx.restore();
    });
  }

  // ── Draw: HUD ──
  function drawHUD(): void {
    const w     = canvas.width;
    const barW  = Math.min(w - 48, 480);
    const barX  = (w - barW) / 2;
    const barY  = 62;
    const barH  = 16;
    const pct   = Math.max(timeLeft / DURATION, 0);
    // track
    ctx.fillStyle   = 'rgba(255,255,255,.75)';
    ctx.strokeStyle = '#5B4B6B'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 8); ctx.fill(); ctx.stroke();
    // fill — goes pink → butter → mint as time runs low
    const fillColor = pct > 0.5 ? '#FFB8D2' : pct > 0.25 ? '#FFE9A8' : '#C7F0D8';
    ctx.fillStyle = fillColor;
    ctx.beginPath(); ctx.roundRect(barX + 2, barY + 2, (barW - 4) * pct, barH - 4, 6); ctx.fill();
    // labels
    ctx.fillStyle = '#5B4B6B';
    ctx.font = '600 14px Fredoka, system-ui';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`SKILLS  ${collected} / ${TARGET}`, barX, barY + barH + 18);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.ceil(Math.max(timeLeft, 0))}s`, barX + barW, barY + barH + 18);
    // ground line
    const gy = canvas.height - 18;
    ctx.strokeStyle = '#FFB8D2'; ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Game logic ──
  function spawnCoin(): void {
    const entry = pool[poolIdx % pool.length];
    poolIdx++;
    coins.push({
      x: COIN_R + Math.random() * (canvas.width - COIN_R * 2),
      y: -COIN_R,
      vy: 2.8 + Math.random() * 2.2,
      alive: true,
      label: entry.label,
      color: entry.color,
    });
  }

  function hitTest(c: GameCoin): boolean {
    const py = canvas.height - PH - 20;
    const nearX = Math.max(playerX, Math.min(c.x, playerX + PW));
    const nearY = Math.max(py,      Math.min(c.y, py + PH));
    const dx = c.x - nearX, dy = c.y - nearY;
    return dx * dx + dy * dy < COIN_R * COIN_R;
  }

  function gameLoop(ts: number): void {
    if (!active) return;
    const dt = Math.min((ts - lastTs) / 1000, 0.05);
    lastTs = ts;

    // move player
    if (keys.left)  playerX -= 420 * dt;
    if (keys.right) playerX += 420 * dt;
    if (touchX !== null) playerX += (touchX - PW / 2 - playerX) * 0.18;
    playerX = Math.max(0, Math.min(canvas.width - PW, playerX));

    // coins
    coinTimer += dt;
    if (coinTimer > 0.62) { spawnCoin(); coinTimer = 0; }
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.y += c.vy * 60 * dt;
      if (hitTest(c)) {
        c.alive = false; collected++;
        particles.push({ x: c.x, y: c.y - 20, vy: -52, alpha: 1, label: c.label, color: c.color });
      }
      if (!c.alive || c.y > canvas.height + 30) coins.splice(i, 1);
    }

    // timer
    timeLeft -= dt;
    if (timeLeft <= 0 || collected >= TARGET) { endGame(); return; }

    // update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y += p.vy * dt; p.alpha -= 0.028;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    coins.forEach(c => drawCoin(c.x, c.y, c.color, c.label));
    drawParticles();
    drawPlayer(playerX, canvas.height - PH - 20);
    drawHUD();

    rafId = requestAnimationFrame(gameLoop);
  }

  function endGame(): void {
    if (finished) return;
    finished = true; active = false;
    cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    subEl.textContent = collected >= TARGET
      ? `Full stack unlocked — ready to hire! 🌸`
      : `${collected} skills collected — not bad! 💖`;
    winEl.classList.add('mg-win--in');
    setTimeout(dismiss, 2400);
  }

  function dismiss(): void {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup',   onKeyUp);
    window.removeEventListener('resize',  resize);
    section.style.transition = 'opacity .45s ease';
    section.style.opacity = '0';
    setTimeout(() => {
      section.hidden = true;
      section.style.opacity = '';
      section.style.transition = '';
      // reset for potential replay
      winEl.classList.remove('mg-win--in');
      numEl.classList.remove('mg-count-num--in');
      numEl.textContent = '';
      coins.length = 0;
      particles.length = 0;
      onDone();
    }, 500);
  }

  skipBtn.addEventListener('click', () => { cancelAnimationFrame(rafId); finished = true; active = false; dismiss(); });

  // ── Countdown then GO ──
  function countdown(n: number): void {
    numEl.textContent = n > 0 ? `${n}` : 'GO!';
    numEl.classList.remove('mg-count-num--in');
    void numEl.offsetWidth;
    numEl.classList.add('mg-count-num--in');
    if (n > 0) {
      setTimeout(() => countdown(n - 1), 900);
    } else {
      setTimeout(() => {
        numEl.classList.remove('mg-count-num--in');
        active  = true;
        lastTs  = performance.now();
        rafId   = requestAnimationFrame(gameLoop);
      }, 700);
    }
  }

  // Show the section in the page, scroll to it, then start countdown
  section.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    resize();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => countdown(3), 800);
  }));
}

// ── PRESS START → mini-game → scroll to player ────────────────────────────────
document.getElementById('start')?.addEventListener('click', () => {
  launchCoinGame(() => scrollTo('player'));
});
