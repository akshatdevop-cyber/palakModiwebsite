document.addEventListener("DOMContentLoaded", () => {

  /* ═══════════════════════════════════
     SCROLL REVEALS
     ═══════════════════════════════════ */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-up, .fade-in').forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), i * 120);
  });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ═══════════════════════════════════
     NAVBAR: glassmorphism + hide/show
     ═══════════════════════════════════ */
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScroll = 0;
    const scrollThreshold = 60;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      header.classList.toggle('scrolled', currentScroll > 30);

      if (currentScroll > scrollThreshold) {
        if (currentScroll > lastScroll + 5) {
          header.classList.add('nav-hidden');
        } else if (currentScroll < lastScroll - 5) {
          header.classList.remove('nav-hidden');
        }
      } else {
        header.classList.remove('nav-hidden');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  /* ═══════════════════════════════════
     MOBILE HAMBURGER
     ═══════════════════════════════════ */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ═══════════════════════════════════
     HERO BANNER CROSSFADE
     ═══════════════════════════════════ */
  const bannerImages = document.querySelectorAll('.banner-img');
  if (bannerImages.length > 0) {
    let currentBannerIndex = 0;
    setInterval(() => {
      bannerImages[currentBannerIndex].classList.remove('opacity-100');
      bannerImages[currentBannerIndex].classList.add('opacity-0');
      
      currentBannerIndex = (currentBannerIndex + 1) % bannerImages.length;
      
      bannerImages[currentBannerIndex].classList.remove('opacity-0');
      bannerImages[currentBannerIndex].classList.add('opacity-100');
    }, 4000);
  }

  /* ═══════════════════════════════════
     INTERACTIVE CANVAS (System Input)
     ═══════════════════════════════════ */
  const canvas = document.getElementById('system-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };
    window.addEventListener('resize', resize);
    resize();

    let drawing = false, pts = [];

    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      const cx = (e.clientX || e.touches?.[0]?.clientX) - r.left;
      const cy = (e.clientY || e.touches?.[0]?.clientY) - r.top;
      return { x: cx, y: cy };
    };

    const start = (e) => { drawing = true; pts = [pos(e)]; };
    const move = (e) => {
      if (!drawing) return;
      pts.push(pos(e));
      ctx.fillStyle = 'rgba(250,250,250,0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(Math.round(pts[i].x / 20) * 20, Math.round(pts[i].y / 20) * 20);
      }
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      ctx.stroke();
      const lp = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#666';
      ctx.fill();
    };
    const end = () => { drawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
  }

  /* ═══════════════════════════════════
     PREMIUM LIGHTBOX (Grid Images)
     ═══════════════════════════════════ */
  const initLightbox = () => {
    // ── State ──────────────────────────────────────────────────────────────
    let galleryList = [];   // array of { src, title, desc } for current tab
    let currentIdx  = 0;

    // ── Build DOM ──────────────────────────────────────────────────────────
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';

    const lightboxContent = document.createElement('div');
    lightboxContent.className = 'lightbox-content';

    const lightboxInfo = document.createElement('div');
    lightboxInfo.className = 'lightbox-info';
    const lightboxTitle = document.createElement('h3');
    const lightboxDesc  = document.createElement('p');
    lightboxInfo.appendChild(lightboxTitle);
    lightboxInfo.appendChild(lightboxDesc);

    const lightboxImageWrapper = document.createElement('div');
    lightboxImageWrapper.className = 'lightbox-image-wrapper';
    const lightboxImg = document.createElement('img');
    lightboxImg.style.transition = 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    lightboxImageWrapper.appendChild(lightboxImg);

    lightboxContent.appendChild(lightboxInfo);
    lightboxContent.appendChild(lightboxImageWrapper);
    lightbox.appendChild(lightboxContent);

    // ── Close button ───────────────────────────────────────────────────────
    const lightboxClose = document.createElement('button');
    lightboxClose.className = 'lightbox-close';
    lightboxClose.setAttribute('aria-label', 'Close lightbox');
    lightboxClose.innerHTML = '&times;';
    lightboxClose.style.cssText = 'position:absolute;top:1rem;right:1.5rem;background:none;border:none;color:rgba(255,255,255,0.6);font-size:2.5rem;cursor:pointer;z-index:100000;transition:color 0.3s,transform 0.3s;line-height:1;outline:none;';
    lightboxClose.addEventListener('mouseover', () => { lightboxClose.style.color = '#fff'; lightboxClose.style.transform = 'scale(1.1)'; });
    lightboxClose.addEventListener('mouseout',  () => { lightboxClose.style.color = 'rgba(255,255,255,0.6)'; lightboxClose.style.transform = 'scale(1)'; });
    lightboxClose.addEventListener('click', e => { e.stopPropagation(); closeLightbox(); });
    lightbox.appendChild(lightboxClose);

    // ── Prev / Next arrow buttons ──────────────────────────────────────────
    const arrowCSS = `
      position:absolute;top:50%;transform:translateY(-50%);
      background:none;border:none;cursor:pointer;
      color:rgba(255,255,255,0.45);
      font-size:2rem;line-height:1;
      padding:0.75rem 1.1rem;
      transition:color 0.25s,transform 0.25s;
      z-index:100000;outline:none;
      user-select:none;-webkit-user-select:none;
    `;

    const prevBtn = document.createElement('button');
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.innerHTML = '&#8592;';   // ←
    prevBtn.style.cssText = arrowCSS + 'left:0.5rem;';

    const nextBtn = document.createElement('button');
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.innerHTML = '&#8594;';   // →
    nextBtn.style.cssText = arrowCSS + 'right:0.5rem;';

    [prevBtn, nextBtn].forEach(btn => {
      btn.addEventListener('mouseover', () => { btn.style.color = '#fff'; btn.style.transform = 'translateY(-50%) scale(1.15)'; });
      btn.addEventListener('mouseout',  () => { btn.style.color = 'rgba(255,255,255,0.45)'; btn.style.transform = 'translateY(-50%) scale(1)'; });
    });

    prevBtn.addEventListener('click', e => { e.stopPropagation(); navigateTo(currentIdx - 1); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); navigateTo(currentIdx + 1); });

    lightbox.appendChild(prevBtn);
    lightbox.appendChild(nextBtn);

    // ── Image counter ──────────────────────────────────────────────────────
    const counter = document.createElement('div');
    counter.style.cssText = `
      position:absolute;bottom:1.25rem;left:50%;transform:translateX(-50%);
      color:rgba(255,255,255,0.45);
      font-family:'Inter',sans-serif;font-size:0.7rem;letter-spacing:0.2em;
      text-transform:uppercase;white-space:nowrap;
      pointer-events:none;z-index:100000;
      transition:opacity 0.3s;
    `;
    lightbox.appendChild(counter);

    document.body.appendChild(lightbox);

    // ── Helpers ────────────────────────────────────────────────────────────
    const updateCounter = () => {
      const n = galleryList.length;
      counter.textContent = n > 1 ? `${currentIdx + 1} / ${n}` : '';
      prevBtn.style.opacity = n > 1 ? '1' : '0';
      nextBtn.style.opacity = n > 1 ? '1' : '0';
    };

    const preloadAdjacent = idx => {
      const n = galleryList.length;
      [-1, 1].forEach(d => {
        const i = (idx + d + n) % n;
        const img = new Image();
        img.src = galleryList[i].src;
      });
    };

    const showImage = (idx, instant = false) => {
      const entry = galleryList[idx];
      if (!entry) return;

      if (instant) {
        lightboxImg.src = entry.src;
        lightboxTitle.textContent = entry.title;
        lightboxDesc.textContent  = entry.desc;
        updateInfoLayout(entry);
        updateCounter();
        return;
      }

      // Crossfade: fade out → swap src → fade in
      lightboxImg.style.opacity   = '0';
      lightboxImg.style.transform = 'scale(0.97)';

      setTimeout(() => {
        lightboxImg.src = entry.src;
        lightboxTitle.textContent = entry.title;
        lightboxDesc.textContent  = entry.desc;
        updateInfoLayout(entry);
        updateCounter();

        // Trigger reflow then fade back in
        requestAnimationFrame(() => {
          lightboxImg.style.opacity   = '1';
          lightboxImg.style.transform = 'scale(1)';
        });
      }, 200);

      preloadAdjacent(idx);
    };

    const updateInfoLayout = entry => {
      if (!entry.title && !entry.desc) {
        lightboxInfo.style.display = 'none';
        lightboxImageWrapper.style.flex = '0 0 100%';
      } else {
        lightboxInfo.style.display = '';
        lightboxImageWrapper.style.flex = '';
      }
    };

    // Circular navigation
    const navigateTo = idx => {
      const n = galleryList.length;
      currentIdx = ((idx % n) + n) % n;
      showImage(currentIdx);
    };

    const openLightbox = (images, startIdx) => {
      galleryList = images;
      currentIdx  = startIdx;
      showImage(currentIdx, true /* instant on first open */);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      preloadAdjacent(currentIdx);
    };

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!lightbox.classList.contains('active')) {
          lightboxImg.src = '';
          lightboxTitle.textContent = '';
          lightboxDesc.textContent  = '';
          lightboxInfo.style.display = '';
          lightboxImageWrapper.style.flex = '';
          galleryList = [];
        }
      }, 500);
    };

    // ── Wire up grid images ────────────────────────────────────────────────
    // Build per-tab image arrays so clicking any image opens its own set
    const tabContents = document.querySelectorAll('.tab-content');

    tabContents.forEach(tab => {
      // Collect eligible images within this tab
      const eligible = [...tab.querySelectorAll('img')].filter(
        img => !img.closest('.collage-card') && !img.hasAttribute('data-no-lightbox')
      );

      const images = eligible.map(img => ({
        src:   img.getAttribute('data-large') || img.src,
        title: img.getAttribute('data-title') || '',
        desc:  img.getAttribute('data-desc')  || '',
      }));

      eligible.forEach((img, i) => {
        img.addEventListener('dragstart', e => e.preventDefault());
        img.addEventListener('click', () => openLightbox(images, i));
      });
    });

    // ── Interactions ───────────────────────────────────────────────────────
    // Close on backdrop click (not on image or info)
    lightbox.addEventListener('click', e => {
      const clickedNav = e.target.closest('button');
      if (!clickedNav && e.target !== lightboxImg && !lightboxInfo.contains(e.target)) {
        closeLightbox();
      }
    });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape')     { closeLightbox(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); navigateTo(currentIdx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigateTo(currentIdx + 1); }
    });

    // Touch / swipe
    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
      if (!lightbox.classList.contains('active')) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only fire if horizontal swipe is dominant and large enough
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        dx < 0 ? navigateTo(currentIdx + 1) : navigateTo(currentIdx - 1);
      }
    }, { passive: true });
  };

  initLightbox();

});
