'use strict';

/* ── LOADER ── */
(function() {
  const loader = document.getElementById('loader');
  const fill = loader.querySelector('.loader__fill');
  const n = loader.querySelector('.loader__n');
  const dash = loader.querySelector('.loader__dash');
  const martin = loader.querySelector('.loader__martin');

  // Animate logo letters in
  setTimeout(() => {
    n.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    n.style.opacity = '1'; n.style.transform = 'translateY(0)';
  }, 100);
  setTimeout(() => {
    dash.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    dash.style.opacity = '1'; dash.style.transform = 'translateY(0)';
  }, 250);
  setTimeout(() => {
    martin.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    martin.style.opacity = '1'; martin.style.transform = 'translateY(0)';
  }, 400);

  // Fill progress bar
  setTimeout(() => { fill.style.width = '100%'; }, 200);

  // Hide loader with expanding square transition
  let dismissed = false;
  function dismissLoader() {
    if (dismissed) return;
    dismissed = true;

    const square = loader.querySelector('.loader__square');

    // Step 1: Stop the spin animation and set the transition on the element directly
    loader.classList.add('loader--expanding');
    if (square) {
      // Snapshot current rotation then freeze it at 0
      square.style.transform = 'rotate(0deg) scale(1)';
      square.style.transition = 'none';
    }

    // Step 2: Force a reflow so the browser acknowledges the starting state
    void loader.offsetWidth;

    // Step 3: Apply the long transition THEN trigger the grow
    if (square) {
      square.style.transition = 'transform 1.1s cubic-bezier(0.76, 0, 0.24, 1)';
    }

    // Step 4: Another frame to let transition register before we change transform
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        loader.classList.add('loader--grow');
      });
    });

    // Step 5: Reveal site after expansion completes (match transition duration)
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initHeroAnimations();
    }, 1200);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(dismissLoader, 900);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(dismissLoader, 900));
    window.addEventListener('load', () => setTimeout(dismissLoader, 900));
    // Fallback: dismiss after max 1.8s
    setTimeout(dismissLoader, 1800);
  }

  // Prevent scroll during initial load, release after 1.8s max
  document.body.style.overflow = 'hidden';
  setTimeout(() => { document.body.style.overflow = ''; }, 1800);
})();

/* ── HERO ANIMATIONS ── */
function initHeroAnimations() {
  const hero = document.getElementById('hero');
  if (hero) hero.classList.add('hero--loaded');
}

/* ── CUSTOM CURSOR ── */
(function() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.innerWidth <= 768) return;
  const ring = cursor.querySelector('.cursor__ring');
  const dot = cursor.querySelector('.cursor__dot');

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let hasMoved = false;

  cursor.style.opacity = '0';
  cursor.style.transition = 'opacity 0.3s ease';

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    if (!hasMoved) {
      ringX = mouseX;
      ringY = mouseY;
      cursor.style.opacity = '1';
      hasMoved = true;
    }
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .project-card, .service-card, .horiz-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ── NAV SCROLL BEHAVIOR ── */
(function() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();

/* ── MOBILE MENU ── */
(function() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const links = menu.querySelectorAll('.mobile-menu__link');

  hamburger.addEventListener('click', () => {
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
})();

/* ── HERO EDITORIAL TRIPTYCH INTERACTION ── */
(function() {
  const cards = document.querySelectorAll('.hero-card');
  const triptych = document.getElementById('heroTriptych');
  const sideNum = document.getElementById('heroSideNum');
  if (!cards.length || !triptych) return;

  let activeIndex = 0;
  let cycleTimer = null;
  let isPaused = false;
  const DURATION = 6500; // 6.5s per project

  function updateSideIndex(index) {
    if (!sideNum) return;
    sideNum.style.transition = 'opacity 0.25s ease';
    sideNum.style.opacity = '0';
    setTimeout(() => {
      sideNum.textContent = `0${index + 1} / 0${cards.length}`;
      sideNum.style.opacity = '1';
    }, 250);
  }

  function setActiveCard(index, restartTimer = true) {
    cards.forEach((card, i) => {
      const fill = card.querySelector('.hero-card__progress-fill');
      if (i === index) {
        card.classList.add('hero-card--active');
        if (fill) {
          fill.style.transition = 'none';
          fill.style.width = '0%';
          void fill.offsetWidth; // Force reflow
          fill.style.transition = `width ${DURATION}ms linear`;
          fill.style.width = '100%';
        }
      } else {
        card.classList.remove('hero-card--active');
        if (fill) {
          fill.style.transition = 'none';
          fill.style.width = '0%';
        }
      }
    });
    activeIndex = index;
    updateSideIndex(index);

    if (restartTimer && !isPaused) {
      startCycle();
    }
  }

  function nextCard() {
    const nextIdx = (activeIndex + 1) % cards.length;
    setActiveCard(nextIdx, true);
  }

  function startCycle() {
    clearTimeout(cycleTimer);
    cycleTimer = setTimeout(nextCard, DURATION);
  }

  function pauseCycle() {
    isPaused = true;
    clearTimeout(cycleTimer);
    const activeFill = cards[activeIndex]?.querySelector('.hero-card__progress-fill');
    if (activeFill) {
      const computedWidth = window.getComputedStyle(activeFill).width;
      activeFill.style.transition = 'none';
      activeFill.style.width = computedWidth;
    }
  }

  function resumeCycle() {
    isPaused = false;
    setActiveCard(activeIndex, true);
  }

  cards.forEach((card, i) => {
    // Hover on desktop expands card immediately
    card.addEventListener('mouseenter', () => {
      pauseCycle();
      setActiveCard(i, false);
    });

    // Click / touch activates card
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      pauseCycle();
      setActiveCard(i, false);
    });

    // Keyboard accessibility
    card.addEventListener('focus', () => {
      pauseCycle();
      setActiveCard(i, false);
    });
  });

  triptych.addEventListener('mouseleave', () => {
    resumeCycle();
  });

  // Cursor hover state for hero cards
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    card.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Start initial auto-cycle after initial entrance animation
  setTimeout(() => {
    setActiveCard(0, true);
  }, 900);
})();

/* ── HERO CARD 3D MAGNETIC TILT ── */
(function() {
  if (window.innerWidth <= 900) return;
  const cards = document.querySelectorAll('.hero-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2); // -1 → 1
      const dy = (e.clientY - cy) / (rect.height / 2); // -1 → 1
      const maxTilt = 5; // degrees
      card.style.setProperty('--ry',  `${ dx * maxTilt}deg`);
      card.style.setProperty('--rx',  `${-dy * maxTilt}deg`);
      card.style.setProperty('--scale', '1.012');
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--ry',  '0deg');
      card.style.setProperty('--rx',  '0deg');
      card.style.setProperty('--scale', '1');
    });
  });
})();

/* ── LAZY IMAGES ── */
(function() {
  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => obs.observe(img));
})();

/* ── SCROLL REVEAL ── */
(function() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => obs.observe(el));
})();

/* ── STATS COUNTER ── */
(function() {
  const statNums = document.querySelectorAll('.stat__num');
  if (!statNums.length) return;

  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const start = Date.now();

        function tick() {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => obs.observe(el));
})();

/* ── HORIZONTAL DRAG SCROLL ── */
(function() {
  const track = document.getElementById('horizScroll');
  if (!track) return;

  let isDown = false, startX, scrollLeft;

  track.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });

  track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = 'grab'; });
  track.addEventListener('mouseup', () => { isDown = false; track.style.cursor = 'grab'; });

  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });
})();

/* ── PARALLAX IMAGE BREAK ── */
(function() {
  const breakImg = document.querySelector('.image-break__img');
  if (!breakImg || window.innerWidth <= 768) return;

  function onScroll() {
    const rect = breakImg.closest('.image-break').getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const viewCenter = window.innerHeight / 2;
    const offset = (center - viewCenter) * 0.12;
    breakImg.style.transform = 'scale(1.1) translateY(' + offset + 'px)';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ── CONTACT FORM ── */
(function() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = 'Hvala! Javićemo vam se uskoro. <span class="btn__arrow">&#10003;</span>';
    btn.disabled = true;
    btn.style.background = '#4a7c59';

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
      btn.style.background = '';
      form.reset();
    }, 4000);
  });
})();

/* ── ARCHETA DISCIPLINE FILTER ── */
(function() {
  const pills = document.querySelectorAll('.disc-pill');
  const cards = document.querySelectorAll('.project-card');
  if (!pills.length || !cards.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.category || '';
        if (filter === 'all' || cat.includes(filter)) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });
})();

/* ── SMOOTH ANCHOR SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
