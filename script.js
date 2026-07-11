// ---------------------------------------------------------------------
// Footer year
// ---------------------------------------------------------------------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------------------------------------------------------------------
// Mobile nav toggle
// ---------------------------------------------------------------------
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.getElementById('mobile-nav');

navToggle.addEventListener('click', () => {
  const open = mobileNav.hasAttribute('hidden') === false;
  if (open) {
    mobileNav.setAttribute('hidden', '');
    navToggle.setAttribute('aria-expanded', 'false');
  } else {
    mobileNav.removeAttribute('hidden');
    navToggle.setAttribute('aria-expanded', 'true');
  }
});

mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.setAttribute('hidden', '');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ---------------------------------------------------------------------
// Work filter (All / Web / Games)
// ---------------------------------------------------------------------
const filterButtons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.dataset.filter;
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.type === filter;
      card.classList.toggle('is-hidden', !show);
    });
  });
});

// ---------------------------------------------------------------------
// Copy email button
// ---------------------------------------------------------------------
const copyBtn = document.getElementById('copy-email');
if (copyBtn) {
  const originalLabel = copyBtn.textContent;
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = 'Copied — ' + email;
    } catch (err) {
      copyBtn.textContent = email;
    }
    setTimeout(() => { copyBtn.textContent = originalLabel; }, 2500);
  });
}

// ---------------------------------------------------------------------
// Hero toy: a small draggable "puck" bouncing in its arena
// (a quiet nod to SwingShot — quality-gated behind reduced-motion)
// ---------------------------------------------------------------------
const canvas = document.getElementById('puck-canvas');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const puck = {
    x: 60, y: 60, r: 16,
    vx: 1.6, vy: 1.1,
  };

  let dragging = false;
  let pointer = { x: 0, y: 0 };

  function getPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (e) => {
    const p = getPointer(e);
    const dist = Math.hypot(p.x - puck.x, p.y - puck.y);
    if (dist < puck.r * 2) {
      dragging = true;
      canvas.style.cursor = 'grabbing';
    }
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    pointer = getPointer(e);
  });
  window.addEventListener('pointerup', () => {
    if (dragging) {
      dragging = false;
      canvas.style.cursor = 'grab';
      puck.vx = (Math.random() - 0.5) * 4;
      puck.vy = (Math.random() - 0.5) * 4;
    }
  });

  function step() {
    if (dragging) {
      puck.x += (pointer.x - puck.x) * 0.35;
      puck.y += (pointer.y - puck.y) * 0.35;
    } else {
      puck.x += puck.vx;
      puck.y += puck.vy;

      if (puck.x - puck.r < 0) { puck.x = puck.r; puck.vx *= -1; }
      if (puck.x + puck.r > width) { puck.x = width - puck.r; puck.vx *= -1; }
      if (puck.y - puck.r < 0) { puck.y = puck.r; puck.vy *= -1; }
      if (puck.y + puck.r > height) { puck.y = height - puck.r; puck.vy *= -1; }
    }

    ctx.clearRect(0, 0, width, height);

    // faint grid, quiet arena backdrop
    ctx.strokeStyle = 'rgba(20,23,28,0.05)';
    ctx.lineWidth = 1;
    const step = 24;
    for (let x = step; x < width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = step; y < height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // puck
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2);
    ctx.fillStyle = '#2F5FD8';
    ctx.fill();

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
